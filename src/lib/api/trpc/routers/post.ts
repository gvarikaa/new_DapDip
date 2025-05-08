import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { postCreateSchema, postUpdateSchema } from "@/lib/validations/post";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { topicIds, ...postData } = input;

      const post = await ctx.prisma.post.create({
        data: {
          ...postData,
          authorId: ctx.session.user.id,
          // If topics provided, connect them
          topics: topicIds?.length
            ? {
                create: topicIds.map((topicId) => ({
                  topic: {
                    connect: { id: topicId },
                  },
                })),
              }
            : undefined,
        },
      });

      return post;
    }),

  update: protectedProcedure
    .input(postUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, topicIds, ...postData } = input;

      // Verify post belongs to user
      const existingPost = await ctx.prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!existingPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (existingPost.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this post",
        });
      }

      // Update the post
      const updatedPost = await ctx.prisma.post.update({
        where: { id },
        data: postData,
      });

      // If topics provided, update them
      if (topicIds?.length) {
        // First delete existing topic connections
        await ctx.prisma.postTopic.deleteMany({
          where: { postId: id },
        });

        // Then create new ones
        await ctx.prisma.postTopic.createMany({
          data: topicIds.map((topicId) => ({
            postId: id,
            topicId,
          })),
        });
      }

      return updatedPost;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify post belongs to user
      const existingPost = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (existingPost.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this post",
        });
      }

      await ctx.prisma.post.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          author: true,
          topics: {
            include: {
              topic: true,
            },
          },
          parent: {
            include: {
              author: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Track view if user is logged in and not author
      if (ctx.session?.user && ctx.session.user.id !== post.authorId) {
        // Upsert to avoid duplicate views
        await ctx.prisma.postView.upsert({
          where: {
            postId_userId: {
              postId: post.id,
              userId: ctx.session.user.id,
            },
          },
          update: {}, // No update needed
          create: {
            postId: post.id,
            userId: ctx.session.user.id,
          },
        });
      }

      return post;
    }),

  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1, // +1 to check if more exist
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          parentId: null, // Only get original posts, not shares
          privacyLevel: "PUBLIC", // Only public posts for non-logged in users
        },
        include: {
          author: true,
          topics: {
            include: {
              topic: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
              views: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  getUserPosts: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      // Determine privacy level based on relationship
      let privacyFilter = undefined;
      
      if (ctx.session?.user) {
        if (ctx.session.user.id === userId) {
          // User can see all their own posts
          privacyFilter = undefined;
        } else {
          // Check if they are friends
          const friendship = await ctx.prisma.follows.findFirst({
            where: {
              AND: [
                { followerId: ctx.session.user.id },
                { followingId: userId },
                { status: "ACCEPTED" },
              ],
            },
          });

          if (friendship) {
            // Show public and friends posts
            privacyFilter = { in: ["PUBLIC", "FRIENDS"] };
          } else {
            // Only show public posts
            privacyFilter = { equals: "PUBLIC" };
          }
        }
      } else {
        // Not logged in, only show public posts
        privacyFilter = { equals: "PUBLIC" };
      }

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          authorId: userId,
          ...(privacyFilter ? { privacyLevel: privacyFilter } : {}),
        },
        include: {
          author: true,
          topics: {
            include: {
              topic: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  savePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already saved
      const existingSave = await ctx.prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
      });

      if (existingSave) {
        // If already saved, we unsave it
        await ctx.prisma.savedPost.delete({
          where: {
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
        });

        return { saved: false };
      } else {
        // Otherwise save it
        await ctx.prisma.savedPost.create({
          data: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        });

        return { saved: true };
      }
    }),

  getSavedPosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const savedPosts = await ctx.prisma.savedPost.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          post: {
            include: {
              author: true,
              topics: {
                include: {
                  topic: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  reactions: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (savedPosts.length > limit) {
        const nextItem = savedPosts.pop();
        nextCursor = nextItem!.id;
      }

      // Transform the data to match other endpoints
      const posts = savedPosts.map((savedPost) => savedPost.post);

      return {
        posts,
        nextCursor,
      };
    }),

  toggleReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        type: z.enum(["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId, type } = input;

      // Check if already reacted
      const existingReaction = await ctx.prisma.reaction.findFirst({
        where: {
          userId: ctx.session.user.id,
          postId,
        },
      });

      if (existingReaction) {
        if (existingReaction.type === type) {
          // If same reaction type, remove it
          await ctx.prisma.reaction.delete({
            where: {
              id: existingReaction.id,
            },
          });
          
          return { type: null };
        } else {
          // If different reaction type, update it
          await ctx.prisma.reaction.update({
            where: {
              id: existingReaction.id,
            },
            data: {
              type,
            },
          });
          
          return { type };
        }
      } else {
        // Create new reaction
        await ctx.prisma.reaction.create({
          data: {
            type,
            userId: ctx.session.user.id,
            postId,
          },
        });
        
        return { type };
      }
    }),
});