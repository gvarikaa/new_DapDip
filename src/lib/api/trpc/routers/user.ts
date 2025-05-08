import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { userProfileSchema, userSettingsSchema } from "@/lib/validations/user";

// Default token amounts by plan
const DEFAULT_TOKENS = {
  FREE: 150,
  BASIC: 500,
  PRO: 2000,
  ENTERPRISE: 10000,
};

export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        settings: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const userSettings = await ctx.prisma.userSettings.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!userSettings) {
      // Return default settings when none exist
      return {
        id: '',
        userId: ctx.session.user.id,
        theme: 'system',
        primaryColor: '',
        secondaryColor: '',
        fontPreference: '',
        language: 'en',
        privacyLevel: 'PUBLIC',
        emailNotifications: true,
        pushNotifications: true,
        messageNotifications: true,
        animationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return userSettings;
  }),

  updateProfile: protectedProcedure
    .input(userProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if username is taken
      if (input.username) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { username: input.username },
        });

        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken",
          });
        }
      }

      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  updateSettings: protectedProcedure
    .input(userSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if settings exist
      const existingSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (existingSettings) {
        // Update settings
        return ctx.prisma.userSettings.update({
          where: { userId: ctx.session.user.id },
          data: input,
        });
      } else {
        // Create settings
        return ctx.prisma.userSettings.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
          },
        });
      }
    }),

  updateThemeSettings: protectedProcedure
    .input(z.object({
      theme: z.enum(["light", "dark", "dusk", "system"]).optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      fontPreference: z.string().optional(),
      animationsEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // First check if settings exist
      const existingSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (existingSettings) {
        // Update theme settings
        return ctx.prisma.userSettings.update({
          where: { userId: ctx.session.user.id },
          data: input,
        });
      } else {
        // Create settings with default values for required fields
        return ctx.prisma.userSettings.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            language: 'en',
            privacyLevel: 'PUBLIC',
            emailNotifications: true,
            pushNotifications: true,
            messageNotifications: true,
          },
        });
      }
    }),
    
  /**
   * Update AI plan for a user
   */
  updateAIPlan: protectedProcedure
    .input(z.object({
      plan: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { plan } = input;
      
      // Update user's AI plan
      const updatedSettings = await ctx.prisma.userSettings.update({
        where: { userId: ctx.session.user.id },
        data: {
          aiPlan: plan,
          aiTokensRemaining: DEFAULT_TOKENS[plan], // Reset tokens to the new plan's default
          aiTokensReset: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reset in 24 hours
        },
      });
      
      return updatedSettings;
    }),
  
  /**
   * Reset AI tokens for a user (for admin or scheduled tasks)
   */
  resetAITokens: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Get current user settings
      const userSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!userSettings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User settings not found",
        });
      }
      
      // Only reset if reset time has passed or not set
      const now = new Date();
      if (userSettings.aiTokensReset && userSettings.aiTokensReset > now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Tokens will reset at ${userSettings.aiTokensReset.toISOString()}`,
        });
      }
      
      // Calculate next reset time (24 hours for free, monthly for paid)
      const resetDate = new Date();
      
      if (userSettings.aiPlan === "FREE") {
        resetDate.setHours(resetDate.getHours() + 24); // Free plans reset daily
      } else {
        resetDate.setDate(resetDate.getDate() + 30); // Paid plans reset monthly
      }
      
      // Update tokens based on plan
      const updatedSettings = await ctx.prisma.userSettings.update({
        where: { userId: ctx.session.user.id },
        data: {
          aiTokensRemaining: DEFAULT_TOKENS[userSettings.aiPlan],
          aiTokensReset: resetDate,
        },
      });
      
      return updatedSettings;
    }),
    
  /**
   * Get AI token usage history
   */
  getTokenUsageHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(30),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      
      // Get token usage history
      const tokenUsage = await ctx.prisma.aITokenUsage.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });
      
      // Get aggregate stats
      const stats = await ctx.prisma.aITokenUsage.groupBy({
        by: ['feature'],
        where: {
          userId: ctx.session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        _sum: {
          amount: true,
        },
      });
      
      // Format stats
      const featureUsage = stats.reduce((acc, stat) => {
        acc[stat.feature] = stat._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        history: tokenUsage,
        stats: {
          featureUsage,
          totalUsage: Object.values(featureUsage).reduce((a, b) => a + b, 0),
        },
        nextCursor: tokenUsage.length === limit ? tokenUsage[tokenUsage.length - 1].id : null,
      };
    }),

  searchUsers: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { username: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: 10,
      });
    }),
});