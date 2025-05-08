import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const followRouter = createTRPCRouter({
  followUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const currentUserId = ctx.session.user.id;

      // Can't follow yourself
      if (userId === currentUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }

      // Check if user exists
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if already following
      const existingFollow = await ctx.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });

      if (existingFollow) {
        if (existingFollow.status === "BLOCKED") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot follow this user",
          });
        }

        // If already following, unfollow
        await ctx.prisma.follows.delete({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId,
            },
          },
        });

        // If it was a mutual follow (friendship), also update the reverse status
        const reverseFollow = await ctx.prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: currentUserId,
            },
          },
        });

        if (reverseFollow && reverseFollow.status === "ACCEPTED") {
          // If they were following back, change status to PENDING
          await ctx.prisma.follows.update({
            where: {
              followerId_followingId: {
                followerId: userId,
                followingId: currentUserId,
              },
            },
            data: {
              status: "PENDING",
            },
          });
        }

        return { following: false };
      } else {
        // Create new follow
        await ctx.prisma.follows.create({
          data: {
            followerId: currentUserId,
            followingId: userId,
            status: "PENDING", // Default to pending
          },
        });

        // Check if they're already following the current user
        const reverseFollow = await ctx.prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: currentUserId,
            },
          },
        });

        if (reverseFollow) {
          // Update both to ACCEPTED if mutual
          await ctx.prisma.follows.updateMany({
            where: {
              OR: [
                {
                  followerId: currentUserId,
                  followingId: userId,
                },
                {
                  followerId: userId,
                  followingId: currentUserId,
                },
              ],
            },
            data: {
              status: "ACCEPTED",
            },
          });
        }

        // Create notification for the user being followed
        await ctx.prisma.notification.create({
          data: {
            userId,
            type: "FOLLOW",
            title: "New Follower",
            content: `You have a new follower`,
            link: `/profile/${currentUserId}`,
          },
        });

        return { following: true };
      }
    }),

  blockUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const currentUserId = ctx.session.user.id;

      // Can't block yourself
      if (userId === currentUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot block yourself",
        });
      }

      // Check if user exists
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if already following/blocked
      const existingFollow = await ctx.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });

      if (existingFollow) {
        if (existingFollow.status === "BLOCKED") {
          // If already blocked, unblock
          await ctx.prisma.follows.delete({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: userId,
              },
            },
          });
          return { blocked: false };
        } else {
          // Update to blocked
          await ctx.prisma.follows.update({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: userId,
              },
            },
            data: {
              status: "BLOCKED",
            },
          });
          return { blocked: true };
        }
      } else {
        // Create new blocked follow
        await ctx.prisma.follows.create({
          data: {
            followerId: currentUserId,
            followingId: userId,
            status: "BLOCKED",
          },
        });
        return { blocked: true };
      }
    }),

  getFollowers: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      // For public queries we only want to show accepted followers
      const statusFilter = ctx.session?.user.id === userId
        ? {} // User can see all their followers
        : { status: "ACCEPTED" }; // Others only see accepted followers

      const followers = await ctx.prisma.follows.findMany({
        take: limit + 1,
        cursor: cursor ? { followerId_followingId: JSON.parse(cursor) } : undefined,
        where: {
          followingId: userId,
          ...statusFilter,
        },
        include: {
          follower: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: string | undefined = undefined;
      if (followers.length > limit) {
        const nextItem = followers.pop();
        nextCursor = JSON.stringify({
          followerId: nextItem!.followerId,
          followingId: nextItem!.followingId,
        });
      }

      return {
        followers: followers.map(f => f.follower),
        nextCursor,
      };
    }),

  getFollowing: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      // For public queries we only want to show accepted following
      const statusFilter = ctx.session?.user.id === userId
        ? {} // User can see all they're following
        : { status: "ACCEPTED" }; // Others only see accepted following

      const following = await ctx.prisma.follows.findMany({
        take: limit + 1,
        cursor: cursor ? { followerId_followingId: JSON.parse(cursor) } : undefined,
        where: {
          followerId: userId,
          ...statusFilter,
        },
        include: {
          following: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: string | undefined = undefined;
      if (following.length > limit) {
        const nextItem = following.pop();
        nextCursor = JSON.stringify({
          followerId: nextItem!.followerId,
          followingId: nextItem!.followingId,
        });
      }

      return {
        following: following.map(f => f.following),
        nextCursor,
      };
    }),

  getFollowStatus: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const currentUserId = ctx.session.user.id;

      // Check if the current user is following target user
      const followingStatus = await ctx.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });

      // Check if target user is following current user
      const followerStatus = await ctx.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: currentUserId,
          },
        },
      });

      return {
        isFollowing: !!followingStatus && followingStatus.status !== "BLOCKED",
        isFollower: !!followerStatus && followerStatus.status !== "BLOCKED",
        isMutual: !!followingStatus && !!followerStatus && 
                  followingStatus.status === "ACCEPTED" &&
                  followerStatus.status === "ACCEPTED",
        isBlocked: !!followingStatus && followingStatus.status === "BLOCKED",
      };
    }),
});