import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messageRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        content: z.string().min(1).max(2000),
        mediaUrl: z.string().url().optional(),
        mediaType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { receiverId, content, mediaUrl, mediaType } = input;
      const senderId = ctx.session.user.id;

      // Check if receiver exists
      const receiver = await ctx.prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Receiver not found",
        });
      }

      // Check if blocked
      const isBlocked = await ctx.prisma.follows.findFirst({
        where: {
          OR: [
            {
              followerId: receiverId,
              followingId: senderId,
              status: "BLOCKED",
            },
            {
              followerId: senderId,
              followingId: receiverId,
              status: "BLOCKED",
            },
          ],
        },
      });

      if (isBlocked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot send message to this user",
        });
      }

      // Create message
      const message = await ctx.prisma.message.create({
        data: {
          content,
          mediaUrl,
          mediaType,
          senderId,
          receiverId,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: receiverId,
          type: "MESSAGE",
          title: "New Message",
          content: "You have a new message",
          link: `/messages/${senderId}`,
        },
      });

      return message;
    }),

  getConversation: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;
      const currentUserId = ctx.session.user.id;

      const messages = await ctx.prisma.message.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          OR: [
            {
              senderId: currentUserId,
              receiverId: userId,
            },
            {
              senderId: userId,
              receiverId: currentUserId,
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }

      // Mark unread messages as read
      await ctx.prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: currentUserId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return {
        messages: messages.reverse(), // Return in chronological order
        nextCursor,
      };
    }),

  getConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userId = ctx.session.user.id;

      // Get the latest message with each user
      const latestMessages = await ctx.prisma.$queryRaw<
        Array<{
          id: string;
          otherUserId: string;
          createdAt: Date;
          unreadCount: number;
        }>
      >`
        WITH RankedMessages AS (
          SELECT 
            m.id,
            CASE 
              WHEN m."senderId" = ${userId} THEN m."receiverId"
              ELSE m."senderId"
            END as "otherUserId",
            m."createdAt",
            ROW_NUMBER() OVER (
              PARTITION BY 
                CASE 
                  WHEN m."senderId" = ${userId} THEN m."receiverId"
                  ELSE m."senderId"
                END
              ORDER BY m."createdAt" DESC
            ) as rn
          FROM "Message" m
          WHERE m."senderId" = ${userId} OR m."receiverId" = ${userId}
        ),
        UnreadCounts AS (
          SELECT 
            "senderId" as "otherUserId",
            COUNT(*) as "unreadCount"
          FROM "Message"
          WHERE "receiverId" = ${userId} AND "read" = false
          GROUP BY "senderId"
        )
        SELECT 
          rm.id,
          rm."otherUserId",
          rm."createdAt",
          COALESCE(uc."unreadCount", 0) as "unreadCount"
        FROM RankedMessages rm
        LEFT JOIN UnreadCounts uc ON rm."otherUserId" = uc."otherUserId"
        WHERE rm.rn = 1
        ORDER BY rm."createdAt" DESC
        LIMIT ${limit + 1}
        ${cursor ? `OFFSET ${cursor}` : ''}
      `;

      let nextCursor: typeof cursor = undefined;
      if (latestMessages.length > limit) {
        latestMessages.pop();
        nextCursor = (parseInt(cursor || "0") + limit).toString();
      }

      // Get the full messages and user details
      const conversationDetails = await Promise.all(
        latestMessages.map(async (msg) => {
          const message = await ctx.prisma.message.findUnique({
            where: { id: msg.id },
            include: {
              sender: true,
              receiver: true,
            },
          });

          const otherUser =
            message?.senderId === userId ? message.receiver : message?.sender;

          return {
            message,
            otherUser,
            unreadCount: msg.unreadCount,
          };
        })
      );

      return {
        conversations: conversationDetails,
        nextCursor,
      };
    }),

  markAsRead: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { messageId } = input;
      const userId = ctx.session.user.id;

      const message = await ctx.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }

      if (message.receiverId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot mark this message as read",
        });
      }

      await ctx.prisma.message.update({
        where: { id: messageId },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const count = await ctx.prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });

    return { count };
  }),
});