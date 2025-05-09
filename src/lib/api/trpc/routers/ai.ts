import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { addDays } from "date-fns";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { postAIAnalysisSchema } from "@/lib/validations/post";
import { 
  analyzePostContent, 
  generateContentSuggestions, 
  analyzeSentiment,
  extractTopics,
  moderateContent,
  getModel
} from "@/lib/ai/gemini-client";
import { rateLimit, rateLimitConfigs } from "@/lib/security/rate-limit";
import { ratelimit } from "@/lib/ratelimit";
import { AIPlan } from "@prisma/client";

// Rate limit configuration for AI endpoints
const AI_RATE_LIMIT = {
  limit: 20,  // 20 requests
  windowInSeconds: 60 * 10,  // per 10 minutes
};

// Maximum tokens by plan
const MAX_TOKENS = {
  [AIPlan.FREE]: 150,
  [AIPlan.BASIC]: 500,
  [AIPlan.PRO]: 2000,
  [AIPlan.ENTERPRISE]: 10000,
};

/**
 * AI-related TRPC procedures
 */
/**
 * Tracks token usage for a user
 * @param userId User ID
 * @param amount Number of tokens used
 * @param feature Feature that used the tokens
 * @param modelName AI model used
 */
export async function trackTokenUsage(
  prisma: any,
  userId: string,
  amount: number,
  feature: string,
  modelName: string = "gemini-1.5-pro",
) {
  try {
    // First deduct tokens from user's remaining balance
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    
    // If user doesn't have enough tokens, don't allow the operation
    if (!userSettings || userSettings.aiTokensRemaining < amount) {
      throw new Error(`Insufficient tokens: needed ${amount}, has ${userSettings?.aiTokensRemaining || 0}`);
    }
    
    // Update user's token balance
    await prisma.userSettings.update({
      where: { userId },
      data: {
        aiTokensRemaining: {
          decrement: amount
        }
      }
    });
    
    // Record token usage
    await prisma.aITokenUsage.create({
      data: {
        userId,
        amount,
        feature,
        modelName,
      }
    });
    
    return true;
  } catch (error) {
    console.error("Failed to track token usage:", error);
    return false;
  }
}

export const aiRouter = createTRPCRouter({
  /**
   * Analyze post content with AI
   */
  analyzePostContent: protectedProcedure
    .input(postAIAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, content } = input;

      // Apply rate limiting
      const rateLimitResult = rateLimit(ctx.req, AI_RATE_LIMIT);
      if (rateLimitResult) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded for AI analysis",
        });
      }
      
      // Check if AI is enabled for the user
      const userSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!userSettings?.aiEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI features are disabled for this account",
        });
      }

      // Verify post belongs to user
      const post = await ctx.prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to analyze this post",
        });
      }

      try {
        // Check content length
        if (content.length > 5000) {
          throw new TRPCError({
            code: "BAD_REQUEST", 
            message: "Content too long for analysis (max 5000 chars)"
          });
        }
        
        // Moderate content first
        const moderationResult = await moderateContent(content);
        
        if (!moderationResult.isSafe) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Content moderation failed: ${moderationResult.issues.join(", ")}`,
          });
        }

        // Track token usage - content analysis uses 10 tokens
        const tokenTracked = await trackTokenUsage(
          ctx.prisma,
          ctx.session.user.id,
          10, // Token cost
          "content_analysis", 
          "gemini-1.5-pro"
        );
        
        if (!tokenTracked) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient AI tokens for this operation",
          });
        }
        
        // Perform the full content analysis
        const analysisResult = await analyzePostContent(content);

        // Update the post with analysis results
        await ctx.prisma.post.update({
          where: { id },
          data: {
            sentiment: analysisResult.sentiment,
            aiAnalysis: analysisResult.analysis,
          },
        });

        // Log this analysis for admin purposes
        console.log(`Post ${id} analyzed by ${ctx.session.user.id}`);

        return analysisResult;
      } catch (error) {
        console.error("AI analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze post content",
        });
      }
    }),

  /**
   * Generate post content suggestions 
   */
  generatePostSuggestions: protectedProcedure
    .input(z.object({ 
      topic: z.string().min(1).max(100) 
    }))
    .mutation(async ({ ctx, input }) => {
      const { topic } = input;
      
      // Apply rate limiting
      const rateLimitResult = rateLimit(ctx.req, AI_RATE_LIMIT);
      if (rateLimitResult) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded for content suggestions",
        });
      }
      
      // Check if AI is enabled for the user
      const userSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!userSettings?.aiEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI features are disabled for this account",
        });
      }
      
      // Track token usage - content suggestions use 5 tokens
      const tokenTracked = await trackTokenUsage(
        ctx.prisma,
        ctx.session.user.id,
        5, // Token cost
        "content_suggestions", 
        "gemini-1.5-pro"
      );
      
      if (!tokenTracked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient AI tokens for this operation",
        });
      }

      try {
        // Generate content suggestions
        const suggestions = await generateContentSuggestions(topic);
        
        // Log suggestion request
        console.log(`Content suggestions generated for topic "${topic}" by user ${ctx.session.user.id}`);
        
        return suggestions;
      } catch (error) {
        console.error("AI suggestion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate post suggestions",
        });
      }
    }),

  /**
   * Get sentiment analysis for text
   */
  getSentiment: protectedProcedure
    .input(z.object({ 
      text: z.string().min(1).max(1000) 
    }))
    .query(async ({ ctx, input }) => {
      // Check if AI is enabled for the user
      const userSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!userSettings?.aiEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI features are disabled for this account",
        });
      }
      
      // Track token usage - sentiment analysis uses 1 token
      const tokenTracked = await trackTokenUsage(
        ctx.prisma,
        ctx.session.user.id,
        1, // Token cost
        "sentiment_analysis", 
        "gemini-1.5-flash"
      );
      
      if (!tokenTracked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient AI tokens for this operation",
        });
      }
      try {
        const sentiment = await analyzeSentiment(input.text);
        return { sentiment };
      } catch (error) {
        console.error("Sentiment analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze sentiment",
        });
      }
    }),

  /**
   * Extract topics from text
   */
  extractTopics: protectedProcedure
    .input(z.object({ 
      text: z.string().min(1).max(2000) 
    }))
    .query(async ({ ctx, input }) => {
      // Check if AI is enabled for the user
      const userSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!userSettings?.aiEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI features are disabled for this account",
        });
      }
      
      // Track token usage - topic extraction uses 2 tokens
      const tokenTracked = await trackTokenUsage(
        ctx.prisma,
        ctx.session.user.id,
        2, // Token cost
        "topic_extraction", 
        "gemini-1.5-pro"
      );
      
      if (!tokenTracked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient AI tokens for this operation",
        });
      }
      try {
        const topics = await extractTopics(input.text);
        return { topics };
      } catch (error) {
        console.error("Topic extraction error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to extract topics",
        });
      }
    }),
  
  /**
   * Moderate content
   */
  moderateContent: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(5000)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await moderateContent(input.text);
        return result;
      } catch (error) {
        console.error("Content moderation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to moderate content",
        });
      }
    }),

  /**
   * Summarize content
   */
  summarizeContent: protectedProcedure
    .input(z.object({ 
      text: z.string().min(1).max(5000) 
    }))
    .mutation(async ({ ctx, input }) => {
      // Apply rate limiting
      const rateLimitResult = rateLimit(ctx.req, AI_RATE_LIMIT);
      if (rateLimitResult) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded for content summarization",
        });
      }
      
      // Check if AI is enabled for the user
      const userSettings = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!userSettings?.aiEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI features are disabled for this account",
        });
      }
      
      // Token cost depends on text length
      const tokenCost = Math.max(3, Math.ceil(input.text.length / 1000)); // 3 tokens minimum, 1 per 1000 chars
      
      // Track token usage
      const tokenTracked = await trackTokenUsage(
        ctx.prisma,
        ctx.session.user.id,
        tokenCost,
        "content_summarization", 
        "gemini-1.5-flash"
      );
      
      if (!tokenTracked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient AI tokens for this operation",
        });
      }

      try {
        // Use the existing summarization function from our Gemini client
        const model = getModel("flash");
        
        const prompt = `
          Summarize the following text concisely in 1-2 sentences:
          
          "${input.text}"
          
          Return only the summary without any additional text.
        `;
        
        const response = await model.generateContent(prompt);
        const summary = response.response.text().trim();
        
        return { summary };
      } catch (error) {
        console.error("AI summarization error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to summarize content",
        });
      }
    }),
    
  /**
   * Get trending topics based on recent posts (public endpoint)
   */
  getTrendingTopics: publicProcedure
    .query(async ({ ctx }) => {
      try {
        // Get recent posts from the database
        const recentPosts = await ctx.prisma.post.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
            privacyLevel: "PUBLIC",
          },
          select: {
            content: true,
            aiAnalysis: true,
          },
          take: 100,
        });
        
        // Extract topics from each post that has AI analysis
        const allTopics: Record<string, number> = {};
        
        recentPosts.forEach(post => {
          if (post.aiAnalysis && typeof post.aiAnalysis === 'object') {
            const analysis = post.aiAnalysis as any;
            
            if (Array.isArray(analysis.topics)) {
              analysis.topics.forEach((topic: string) => {
                allTopics[topic] = (allTopics[topic] || 0) + 1;
              });
            }
          }
        });
        
        // Sort topics by frequency
        const sortedTopics = Object.entries(allTopics)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 10)
          .map(([topic, count]) => ({ topic, count }));
          
        return { topics: sortedTopics };
      } catch (error) {
        console.error("Trending topics error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get trending topics",
        });
      }
    }),
});