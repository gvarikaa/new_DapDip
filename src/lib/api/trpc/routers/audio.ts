import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { 
  createAudioMessageSchema,
  transcribeAudioSchema,
  updateAudioMessageSchema,
  deleteAudioMessageSchema,
  getAudioMessagesSchema
} from "@/lib/validations/audio";
import { ratelimit } from "@/lib/ratelimit";
import { AudioProcessingStatus } from "@prisma/client";

// Mock function for transcription - in production would use AI service
const mockTranscribeAudio = async (audioUrl: string): Promise<string> => {
  // Simulate transcription delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock transcription
  return "This is a mock transcription of the audio message. In a real implementation, this would use an AI service to transcribe the audio content.";
};

// Mock function for sentiment analysis - in production would use AI service
const mockAnalyzeAudioSentiment = async (transcription: string): Promise<number> => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return random sentiment score between -1 and 1
  return Math.random() * 2 - 1;
};

// Mock function for tag generation - in production would use AI service
const mockGenerateTags = async (transcription: string): Promise<string[]> => {
  // Simulate tag generation delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock tags
  return ["audio", "message", "voice", "recording"];
};

export const audioRouter = createTRPCRouter({
  // Create a new audio message
  create: protectedProcedure
    .input(createAudioMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { success } = await ratelimit.limit(ctx.session.user.id);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      // Check user token limits if AI features are enabled
      const userSettings = await ctx.db.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
        select: { aiEnabled: true, aiTokensRemaining: true },
      });

      const enableAI = userSettings?.aiEnabled && userSettings.aiTokensRemaining > 0;

      // Create relations data object for the appropriate entity
      const relationsData: any = {};
      
      if (input.chatId) {
        // Create a message
        const message = await ctx.db.message.create({
          data: {
            content: "",
            senderId: ctx.session.user.id,
            receiverId: input.chatId, // In this case, chatId is actually the receiver ID
          },
        });
        
        relationsData.messageId = message.id;
      } else if (input.commentId) {
        relationsData.commentId = input.commentId;
      } else if (input.reelId && !input.commentId) {
        // Direct reel audio comment
        const reelComment = await ctx.db.reelComment.create({
          data: {
            content: null,
            reelId: input.reelId,
            authorId: ctx.session.user.id,
          },
        });
        
        relationsData.reelCommentId = reelComment.id;
        relationsData.reelId = input.reelId;
      } else if (input.postId && !input.commentId) {
        // Direct post audio comment
        const comment = await ctx.db.comment.create({
          data: {
            content: null,
            postId: input.postId,
            authorId: ctx.session.user.id,
          },
        });
        
        relationsData.commentId = comment.id;
        relationsData.postId = input.postId;
      } else if (input.storyId) {
        // This could be a direct story audio comment or attached to a storyResponse
        if (input.commentId) {
          // Attached to a story response
          relationsData.storyResponseId = input.commentId;
        } else {
          // Direct story audio comment
          const storyResponse = await ctx.db.storyResponse.create({
            data: {
              content: null,
              storyId: input.storyId,
              userId: ctx.session.user.id,
            },
          });
          
          relationsData.storyResponseId = storyResponse.id;
        }
        
        relationsData.storyId = input.storyId;
      }

      // Mock URL - In production, upload to storage
      const audioUrl = `https://example.com/audio/${Date.now()}.webm`;
      
      // Create the audio message
      const audioMessage = await ctx.db.audioMessage.create({
        data: {
          url: audioUrl,
          duration: input.duration,
          waveform: input.waveform,
          userId: ctx.session.user.id,
          processingStatus: enableAI 
            ? AudioProcessingStatus.PROCESSING 
            : AudioProcessingStatus.COMPLETED,
          ...relationsData,
        },
      });

      // If AI is enabled, schedule transcription and analysis
      if (enableAI) {
        // In a real implementation, you would:
        // 1. Upload the audio to a storage service
        // 2. Call a transcription service (e.g., OpenAI Whisper API)
        // 3. Process the transcription with sentiment analysis
        // 4. Update the audio message with the results
        
        // For this mock version, we'll do it synchronously with delays
        setTimeout(async () => {
          try {
            // Mock transcription
            const transcription = await mockTranscribeAudio(audioUrl);
            
            // Mock sentiment analysis
            const sentiment = await mockAnalyzeAudioSentiment(transcription);
            
            // Mock tag generation
            const tags = await mockGenerateTags(transcription);
            
            // Update the audio message
            await ctx.db.audioMessage.update({
              where: { id: audioMessage.id },
              data: {
                transcription,
                sentiment,
                aiTags: tags,
                processingStatus: AudioProcessingStatus.COMPLETED,
              },
            });
            
            // Deduct tokens from user
            await ctx.db.userSettings.update({
              where: { userId: ctx.session.user.id },
              data: {
                aiTokensRemaining: {
                  decrement: 10, // Example token cost
                },
              },
            });
            
            // Log token usage
            await ctx.db.aITokenUsage.create({
              data: {
                userId: ctx.session.user.id,
                amount: 10,
                feature: "audio_transcription",
                modelName: "whisper",
              },
            });
          } catch (error) {
            // Update status to failed
            await ctx.db.audioMessage.update({
              where: { id: audioMessage.id },
              data: {
                processingStatus: AudioProcessingStatus.FAILED,
              },
            });
            
            console.error("Error processing audio:", error);
          }
        }, 2000);
      }

      return audioMessage;
    }),

  // Transcribe an audio message
  transcribe: protectedProcedure
    .input(transcribeAudioSchema)
    .mutation(async ({ ctx, input }) => {
      const { audioMessageId, language } = input;

      // Check if user has permission to transcribe this audio
      const audioMessage = await ctx.db.audioMessage.findUnique({
        where: { id: audioMessageId },
        select: { 
          id: true, 
          userId: true, 
          url: true, 
          processingStatus: true,
          transcription: true
        },
      });

      if (!audioMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audio message not found",
        });
      }

      // Check if already transcribed
      if (audioMessage.transcription) {
        return { transcription: audioMessage.transcription };
      }

      // Check if already in progress
      if (audioMessage.processingStatus === AudioProcessingStatus.PROCESSING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transcription is already in progress",
        });
      }

      // Check user token limits
      const userSettings = await ctx.db.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
        select: { aiEnabled: true, aiTokensRemaining: true },
      });

      if (!userSettings?.aiEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI features are not enabled for your account",
        });
      }

      if ((userSettings.aiTokensRemaining || 0) < 10) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient tokens for transcription",
        });
      }

      // Update status to processing
      await ctx.db.audioMessage.update({
        where: { id: audioMessageId },
        data: {
          processingStatus: AudioProcessingStatus.PROCESSING,
        },
      });

      // In a real implementation, we would:
      // 1. Call a transcription service (e.g., OpenAI Whisper API)
      // 2. Process the transcription with sentiment analysis
      // 3. Update the audio message with the results
      
      // For this mock version, we'll do it with a delay
      setTimeout(async () => {
        try {
          // Mock transcription
          const transcription = await mockTranscribeAudio(audioMessage.url);
          
          // Mock sentiment analysis
          const sentiment = await mockAnalyzeAudioSentiment(transcription);
          
          // Mock tag generation
          const tags = await mockGenerateTags(transcription);
          
          // Update the audio message
          await ctx.db.audioMessage.update({
            where: { id: audioMessageId },
            data: {
              transcription,
              sentiment,
              aiTags: tags,
              languageCode: language || "en",
              processingStatus: AudioProcessingStatus.COMPLETED,
            },
          });
          
          // Deduct tokens from user
          await ctx.db.userSettings.update({
            where: { userId: ctx.session.user.id },
            data: {
              aiTokensRemaining: {
                decrement: 10, // Example token cost
              },
            },
          });
          
          // Log token usage
          await ctx.db.aITokenUsage.create({
            data: {
              userId: ctx.session.user.id,
              amount: 10,
              feature: "audio_transcription",
              modelName: "whisper",
            },
          });
        } catch (error) {
          // Update status to failed
          await ctx.db.audioMessage.update({
            where: { id: audioMessageId },
            data: {
              processingStatus: AudioProcessingStatus.FAILED,
            },
          });
          
          console.error("Error transcribing audio:", error);
        }
      }, 2000);

      return { 
        success: true, 
        message: "Transcription started successfully" 
      };
    }),

  // Get audio messages
  getMessages: protectedProcedure
    .input(getAudioMessagesSchema)
    .query(async ({ ctx, input }) => {
      const { chatId, commentId, postId, reelId, storyId, limit, cursor } = input;
      
      // Build where clause
      const where: any = {};
      
      if (chatId) {
        where.message = {
          OR: [
            { senderId: chatId, receiverId: ctx.session.user.id },
            { senderId: ctx.session.user.id, receiverId: chatId },
          ],
        };
      } else if (commentId) {
        where.commentId = commentId;
      } else if (postId) {
        where.postId = postId;
      } else if (reelId) {
        where.reelId = reelId;
      } else if (storyId) {
        where.storyId = storyId;
      }
      
      // Add cursor-based pagination
      if (cursor) {
        where.id = { lt: cursor };
      }
      
      // Get messages
      const messages = await ctx.db.audioMessage.findMany({
        where,
        take: limit + 1,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
      });
      
      // Handle pagination
      let nextCursor: string | undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: messages.map((message) => ({
          ...message,
          sender: message.user,
        })),
        nextCursor,
      };
    }),

  // Get a single audio message
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const message = await ctx.db.audioMessage.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
      });
      
      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audio message not found",
        });
      }
      
      return {
        ...message,
        sender: message.user,
      };
    }),

  // Update an audio message
  update: protectedProcedure
    .input(updateAudioMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, transcription } = input;
      
      // Check if user has permission to update this audio
      const audioMessage = await ctx.db.audioMessage.findUnique({
        where: { id },
        select: { userId: true },
      });
      
      if (!audioMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audio message not found",
        });
      }
      
      if (audioMessage.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this audio message",
        });
      }
      
      // Update the audio message
      return ctx.db.audioMessage.update({
        where: { id },
        data: {
          transcription,
        },
      });
    }),

  // Delete an audio message
  delete: protectedProcedure
    .input(deleteAudioMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      
      // Check if user has permission to delete this audio
      const audioMessage = await ctx.db.audioMessage.findUnique({
        where: { id },
        select: { 
          userId: true,
          commentId: true,
          reelCommentId: true,
          messageId: true,
          storyResponseId: true
        },
      });
      
      if (!audioMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audio message not found",
        });
      }
      
      if (audioMessage.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this audio message",
        });
      }
      
      // Delete the audio message and associated content
      await ctx.db.audioMessage.delete({
        where: { id },
      });
      
      // Delete associated content if it only exists for this audio
      if (audioMessage.commentId) {
        await ctx.db.comment.delete({
          where: { id: audioMessage.commentId },
        });
      }
      
      if (audioMessage.reelCommentId) {
        await ctx.db.reelComment.delete({
          where: { id: audioMessage.reelCommentId },
        });
      }
      
      if (audioMessage.messageId) {
        await ctx.db.message.delete({
          where: { id: audioMessage.messageId },
        });
      }
      
      if (audioMessage.storyResponseId) {
        await ctx.db.storyResponse.delete({
          where: { id: audioMessage.storyResponseId },
        });
      }
      
      return { success: true };
    }),

  // Search audio messages by transcription
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit, cursor } = input;
      
      // Build where clause
      const where: any = {
        userId: ctx.session.user.id,
        transcription: {
          contains: query,
          mode: 'insensitive',
        },
      };
      
      // Add cursor-based pagination
      if (cursor) {
        where.id = { lt: cursor };
      }
      
      // Get messages
      const messages = await ctx.db.audioMessage.findMany({
        where,
        take: limit + 1,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
      });
      
      // Handle pagination
      let nextCursor: string | undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: messages.map((message) => ({
          ...message,
          sender: message.user,
        })),
        nextCursor,
      };
    }),
});