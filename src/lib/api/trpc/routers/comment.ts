import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { commentCreateSchema, commentUpdateSchema } from "@/lib/validations/comment";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(commentCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          postId: input.postId,
          authorId: ctx.session.user.id,
          parentId: input.parentId,
        },
      });

      // Create notification for post author
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: { authorId: true },
      });

      if (post && post.authorId !== ctx.session.user.id) {
        await ctx.prisma.notification.create({
          data: {
            userId: post.authorId,
            type: "COMMENT",
            title: "New Comment",
            content: `Someone commented on your post`,
            link: `/post/${input.postId}`,
          },
        });
      }

      // If this is a reply, notify the parent comment author
      if (input.parentId) {
        const parentComment = await ctx.prisma.comment.findUnique({
          where: { id: input.parentId },
          select: { authorId: true },
        });

        if (parentComment && parentComment.authorId !== ctx.session.user.id) {
          await ctx.prisma.notification.create({
            data: {
              userId: parentComment.authorId,
              type: "COMMENT",
              title: "New Reply",
              content: `Someone replied to your comment`,
              link: `/post/${input.postId}`,
            },
          });
        }
      }

      return comment;
    }),

  update: protectedProcedure
    .input(commentUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify comment belongs to user
      const existingComment = await ctx.prisma.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existingComment.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this comment",
        });
      }

      return ctx.prisma.comment.update({
        where: { id: input.id },
        data: {
          content: input.content,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify comment belongs to user
      const existingComment = await ctx.prisma.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existingComment.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this comment",
        });
      }

      await ctx.prisma.comment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getForPost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { postId, limit, cursor } = input;

      const comments = await ctx.prisma.comment.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          postId,
          parentId: null, // Only get top-level comments
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: true,
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        comments,
        nextCursor,
      };
    }),

  getReplies: publicProcedure
    .input(
      z.object({
        commentId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { commentId, limit, cursor } = input;

      const replies = await ctx.prisma.comment.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          parentId: commentId,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: true,
          _count: {
            select: {
              reactions: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (replies.length > limit) {
        const nextItem = replies.pop();
        nextCursor = nextItem!.id;
      }

      return {
        replies,
        nextCursor,
      };
    }),

  toggleReaction: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        type: z.enum(["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId, type } = input;

      // Check if already reacted
      const existingReaction = await ctx.prisma.reaction.findFirst({
        where: {
          userId: ctx.session.user.id,
          commentId,
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
            commentId,
          },
        });
        
        return { type };
      }
    }),
});