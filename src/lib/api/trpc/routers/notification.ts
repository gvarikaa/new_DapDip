import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, unreadOnly } = input;
      const userId = ctx.session.user.id;

      const notifications = await ctx.prisma.notification.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          userId,
          ...(unreadOnly ? { read: false } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (notifications.length > limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem!.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;

      const notification = await ctx.prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot mark this notification as read",
        });
      }

      await ctx.prisma.notification.update({
        where: { id },
        data: {
          read: true,
        },
      });

      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    await ctx.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const count = await ctx.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return { count };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;

      const notification = await ctx.prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete this notification",
        });
      }

      await ctx.prisma.notification.delete({
        where: { id },
      });

      return { success: true };
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    await ctx.prisma.notification.deleteMany({
      where: {
        userId,
      },
    });

    return { success: true };
  }),
});