import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { 
  reelCreateSchema, 
  reelUpdateSchema, 
  reelCommentCreateSchema,
  reelViewSchema 
} from "@/lib/validations/reels";
import { rateLimit, rateLimitConfigs } from "@/lib/security/rate-limit";

/**
 * Router for reels-related operations
 */
export const reelRouter = createTRPCRouter({
  /**
   * Create a new reel
   */
  create: protectedProcedure
    .input(reelCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Apply rate limiting
      const rateLimitResult = rateLimit(ctx.req, rateLimitConfigs.content);
      if (rateLimitResult) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded for content creation",
        });
      }

      try {
        return ctx.prisma.reel.create({
          data: {
            videoUrl: input.videoUrl,
            thumbnailUrl: input.thumbnailUrl,
            description: input.description,
            duration: input.duration,
            aspectRatio: input.aspectRatio,
            audio: input.audio,
            privacyLevel: input.privacyLevel,
            tags: input.tags || [],
            authorId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error("Error creating reel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reel",
        });
      }
    }),

  /**
   * Update an existing reel
   */
  update: protectedProcedure
    .input(reelUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const reel = await ctx.prisma.reel.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!reel) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reel not found" });
      }

      if (reel.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own reels",
        });
      }

      return ctx.prisma.reel.update({
        where: { id },
        data: updateData,
      });
    }),

  /**
   * Delete a reel
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const reel = await ctx.prisma.reel.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!reel) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reel not found" });
      }

      if (reel.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own reels",
        });
      }

      await ctx.prisma.reel.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get a single reel by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const reel = await ctx.prisma.reel.findUnique({
        where: { id: input.id },
        include: {
          author: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      if (!reel) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reel not found" });
      }

      // Check if current user liked this reel
      let isLiked = false;
      if (ctx.session?.user) {
        const like = await ctx.prisma.reelLike.findUnique({
          where: {
            reelId_userId: {
              reelId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
        isLiked = !!like;
      }

      return { ...reel, isLiked };
    }),

  /**
   * Get an infinite feed of reels
   */
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(5),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const reels = await ctx.prisma.reel.findMany({
        take: limit + 1, // +1 to check if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          { createdAt: "desc" }, // Most recent first
        ],
        where: {
          // Show only public reels to non-logged in users
          privacyLevel: ctx.session?.user ? undefined : "PUBLIC",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (reels.length > limit) {
        const nextItem = reels.pop();
        nextCursor = nextItem?.id;
      }

      // Check which reels the current user has liked
      let likedReelIds: string[] = [];
      if (ctx.session?.user) {
        const likes = await ctx.prisma.reelLike.findMany({
          where: {
            userId: ctx.session.user.id,
            reelId: { in: reels.map((reel) => reel.id) },
          },
          select: { reelId: true },
        });
        likedReelIds = likes.map((like) => like.reelId);
      }

      // Add isLiked field to each reel
      const reelsWithLikeStatus = reels.map((reel) => ({
        ...reel,
        isLiked: likedReelIds.includes(reel.id),
      }));

      return {
        reels: reelsWithLikeStatus,
        nextCursor,
      };
    }),

  /**
   * Get reels by a specific user
   */
  getUserReels: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(20).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      // Determine privacy filter based on relationship
      let privacyFilter = undefined;
      
      if (ctx.session?.user) {
        if (ctx.session.user.id === userId) {
          // User can see all their own reels
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
            // Show public and friends reels
            privacyFilter = { in: ["PUBLIC", "FRIENDS"] };
          } else {
            // Only show public reels
            privacyFilter = { equals: "PUBLIC" };
          }
        }
      } else {
        // Not logged in, only show public reels
        privacyFilter = { equals: "PUBLIC" };
      }

      const reels = await ctx.prisma.reel.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          authorId: userId,
          ...(privacyFilter ? { privacyLevel: privacyFilter } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (reels.length > limit) {
        const nextItem = reels.pop();
        nextCursor = nextItem?.id;
      }

      return {
        reels,
        nextCursor,
      };
    }),

  /**
   * Toggle like on a reel
   */
  toggleLike: protectedProcedure
    .input(z.object({ reelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { reelId } = input;
      const userId = ctx.session.user.id;

      // Check if already liked
      const existingLike = await ctx.prisma.reelLike.findUnique({
        where: {
          reelId_userId: {
            reelId,
            userId,
          },
        },
      });

      if (existingLike) {
        // Unlike
        await ctx.prisma.reelLike.delete({
          where: {
            reelId_userId: {
              reelId,
              userId,
            },
          },
        });
        return { liked: false };
      } else {
        // Like
        await ctx.prisma.reelLike.create({
          data: {
            reelId,
            userId,
          },
        });

        // Create notification for the reel author
        const reel = await ctx.prisma.reel.findUnique({
          where: { id: reelId },
          select: { authorId: true },
        });

        if (reel && reel.authorId !== userId) {
          await ctx.prisma.notification.create({
            data: {
              userId: reel.authorId,
              type: "REEL_LIKE",
              title: "New Like",
              content: `Someone liked your reel`,
              link: `/reel/${reelId}`,
            },
          });
        }

        return { liked: true };
      }
    }),

  /**
   * Comment on a reel
   */
  comment: protectedProcedure
    .input(reelCommentCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { reelId, content, parentId } = input;
      const userId = ctx.session.user.id;

      const comment = await ctx.prisma.reelComment.create({
        data: {
          content,
          reelId,
          authorId: userId,
          parentId,
        },
        include: {
          author: true,
        },
      });

      // Create notification for reel author
      const reel = await ctx.prisma.reel.findUnique({
        where: { id: reelId },
        select: { authorId: true },
      });

      if (reel && reel.authorId !== userId) {
        await ctx.prisma.notification.create({
          data: {
            userId: reel.authorId,
            type: "REEL_COMMENT",
            title: "New Comment",
            content: `Someone commented on your reel`,
            link: `/reel/${reelId}`,
          },
        });
      }

      // If this is a reply, also notify the parent comment author
      if (parentId) {
        const parentComment = await ctx.prisma.reelComment.findUnique({
          where: { id: parentId },
          select: { authorId: true },
        });

        if (parentComment && parentComment.authorId !== userId) {
          await ctx.prisma.notification.create({
            data: {
              userId: parentComment.authorId,
              type: "COMMENT",
              title: "New Reply",
              content: `Someone replied to your comment`,
              link: `/reel/${reelId}`,
            },
          });
        }
      }

      return comment;
    }),

  /**
   * Get comments for a reel
   */
  getComments: publicProcedure
    .input(
      z.object({
        reelId: z.string(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { reelId, limit, cursor } = input;

      const comments = await ctx.prisma.reelComment.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          reelId,
          parentId: null, // Only get top-level comments
        },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        comments,
        nextCursor,
      };
    }),

  /**
   * Get comment replies
   */
  getCommentReplies: publicProcedure
    .input(
      z.object({
        commentId: z.string(),
        limit: z.number().min(1).max(20).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { commentId, limit, cursor } = input;

      const replies = await ctx.prisma.reelComment.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          parentId: commentId,
        },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (replies.length > limit) {
        const nextItem = replies.pop();
        nextCursor = nextItem?.id;
      }

      return {
        replies,
        nextCursor,
      };
    }),

  /**
   * Record a view of a reel
   */
  recordView: protectedProcedure
    .input(reelViewSchema)
    .mutation(async ({ ctx, input }) => {
      const { reelId, watchDuration, watchPercentage, completedView } = input;
      const userId = ctx.session.user.id;

      // Upsert to update existing view or create a new one
      return ctx.prisma.reelView.upsert({
        where: {
          reelId_userId: {
            reelId,
            userId,
          },
        },
        update: {
          watchDuration,
          watchPercentage,
          completedView,
        },
        create: {
          reelId,
          userId,
          watchDuration,
          watchPercentage,
          completedView,
        },
      });
    }),

  /**
   * Get trending reels
   */
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        timeframe: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, timeframe } = input;

      // Calculate the date range based on timeframe
      const now = new Date();
      let startDate: Date;
      switch (timeframe) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      // Query reels with likes, comments and views counts
      const reels = await ctx.prisma.reel.findMany({
        where: {
          createdAt: { gte: startDate },
          privacyLevel: "PUBLIC",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
        orderBy: [
          // Order by engagement metrics
          { likes: { _count: "desc" } },
          { views: { _count: "desc" } },
          { comments: { _count: "desc" } },
        ],
        take: limit,
      });

      return { reels };
    }),

  /**
   * Get reels by tag
   */
  getByTag: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        limit: z.number().min(1).max(20).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { tag, limit, cursor } = input;

      const reels = await ctx.prisma.reel.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          tags: { has: tag },
          privacyLevel: "PUBLIC",
        },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (reels.length > limit) {
        const nextItem = reels.pop();
        nextCursor = nextItem?.id;
      }

      return {
        reels,
        nextCursor,
      };
    }),

  /**
   * Save a reel
   */
  saveReel: protectedProcedure
    .input(z.object({ reelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { reelId } = input;
      const userId = ctx.session.user.id;

      // Check if already saved
      const existingSave = await ctx.prisma.savedReel.findUnique({
        where: {
          reelId_userId: {
            reelId,
            userId,
          },
        },
      });

      if (existingSave) {
        // Unsave
        await ctx.prisma.savedReel.delete({
          where: {
            reelId_userId: {
              reelId,
              userId,
            },
          },
        });
        return { saved: false };
      } else {
        // Save
        await ctx.prisma.savedReel.create({
          data: {
            reelId,
            userId,
          },
        });
        return { saved: true };
      }
    }),

  /**
   * Get saved reels for current user
   */
  getSavedReels: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userId = ctx.session.user.id;

      const savedReels = await ctx.prisma.savedReel.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          reel: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  views: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (savedReels.length > limit) {
        const nextItem = savedReels.pop();
        nextCursor = nextItem?.id;
      }

      // Transform to same format as other reel endpoints
      const reels = savedReels.map((saved) => ({
        ...saved.reel,
        isLiked: false, // We'll need to check this separately
        isSaved: true,
      }));

      // Check which reels the user has liked
      if (reels.length > 0) {
        const likes = await ctx.prisma.reelLike.findMany({
          where: {
            userId,
            reelId: { in: reels.map((reel) => reel.id) },
          },
          select: { reelId: true },
        });

        const likedReelIds = likes.map((like) => like.reelId);
        
        // Update isLiked status
        reels.forEach(reel => {
          if (likedReelIds.includes(reel.id)) {
            reel.isLiked = true;
          }
        });
      }

      return {
        reels,
        nextCursor,
      };
    }),
});