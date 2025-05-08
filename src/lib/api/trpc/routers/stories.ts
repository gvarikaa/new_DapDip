import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addDays, isAfter } from "date-fns";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  createStorySchema,
  updateStorySchema,
  addStoryReactionSchema,
  addStoryResponseSchema,
  createStoryPollSchema,
  voteStoryPollSchema,
  createStoryQuestionSchema,
  answerStoryQuestionSchema,
  createStorySliderSchema,
  respondStorySliderSchema,
  createStoryLinkSchema,
  createStoryHighlightSchema,
  addStoriesToHighlightSchema,
  viewStorySchema,
  storiesFiltersSchema,
  storiesPaginationSchema
} from "@/lib/validations/stories";
import { ratelimit } from "@/lib/ratelimit";

export const storiesRouter = createTRPCRouter({
  // Create a new story
  create: protectedProcedure
    .input(createStorySchema)
    .mutation(async ({ ctx, input }) => {
      const { success } = await ratelimit.limit(ctx.session.user.id);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      const expiresAt = addDays(new Date(), 1);

      const story = await ctx.db.story.create({
        data: {
          mediaUrl: input.mediaUrl,
          thumbnailUrl: input.thumbnailUrl,
          mediaType: input.mediaType,
          duration: input.duration,
          caption: input.caption,
          location: input.location,
          backgroundColor: input.backgroundColor,
          textOverlays: input.textOverlays ? JSON.stringify(input.textOverlays) : undefined,
          drawElements: input.drawElements ? JSON.stringify(input.drawElements) : undefined,
          stickers: input.stickers ? JSON.stringify(input.stickers) : undefined,
          filter: input.filter,
          musicTrackUrl: input.musicTrackUrl,
          musicArtist: input.musicArtist,
          musicTitle: input.musicTitle,
          allowResponses: input.allowResponses ?? true,
          privacyLevel: input.privacyLevel ?? "PUBLIC",
          expiresAt,
          authorId: ctx.session.user.id,
          ...(input.links && input.links.length > 0
            ? {
                links: {
                  createMany: {
                    data: input.links.map(link => ({
                      url: link.url,
                      label: link.label,
                      position: link.position ? JSON.stringify(link.position) : null,
                    })),
                  },
                },
              }
            : {}),
          ...(input.topicIds && input.topicIds.length > 0
            ? {
                topics: {
                  createMany: {
                    data: input.topicIds.map(topicId => ({
                      topicId,
                    })),
                    skipDuplicates: true,
                  },
                },
              }
            : {}),
        },
      });

      return story;
    }),

  // Update an existing story
  update: protectedProcedure
    .input(updateStorySchema)
    .mutation(async ({ ctx, input }) => {
      const story = await ctx.db.story.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this story",
        });
      }

      return ctx.db.story.update({
        where: { id: input.id },
        data: {
          caption: input.caption,
          location: input.location,
          privacyLevel: input.privacyLevel,
          isArchived: input.isArchived,
        },
      });
    }),

  // Delete a story
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const story = await ctx.db.story.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this story",
        });
      }

      await ctx.db.story.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Record a view on a story
  view: protectedProcedure
    .input(viewStorySchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, viewDuration } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { id: true, expiresAt: true, authorId: true, privacyLevel: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (isAfter(new Date(), story.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Story has expired",
        });
      }

      // Check if user is allowed to view based on privacy settings
      if (story.privacyLevel !== "PUBLIC" && story.authorId !== ctx.session.user.id) {
        if (story.privacyLevel === "FRIENDS") {
          const isFollowing = await ctx.db.follows.findFirst({
            where: {
              followerId: ctx.session.user.id,
              followingId: story.authorId,
              status: "ACCEPTED",
            },
          });

          if (!isFollowing) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have permission to view this story",
            });
          }
        } else if (story.privacyLevel === "PRIVATE" && story.authorId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this story",
          });
        }
      }

      // Create or update view record
      const existingView = await ctx.db.storyView.findUnique({
        where: {
          storyId_userId: {
            storyId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingView) {
        // Already viewed, update view duration if provided
        if (viewDuration) {
          await ctx.db.storyView.update({
            where: {
              id: existingView.id,
            },
            data: {
              viewDuration,
            },
          });
        }
        return { alreadyViewed: true };
      }

      // Create new view record
      await ctx.db.storyView.create({
        data: {
          storyId,
          userId: ctx.session.user.id,
          viewDuration,
        },
      });

      // Send notification if viewing someone else's story
      if (story.authorId !== ctx.session.user.id) {
        await ctx.db.notification.create({
          data: {
            userId: story.authorId,
            senderId: ctx.session.user.id,
            type: "STORY_VIEW",
            title: "Story View",
            content: `${ctx.session.user.name} viewed your story`,
            link: `/stories/${storyId}`,
          },
        });
      }

      return { success: true };
    }),

  // Add a reaction to a story
  addReaction: protectedProcedure
    .input(addStoryReactionSchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, emoji } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { id: true, expiresAt: true, authorId: true, privacyLevel: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (isAfter(new Date(), story.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Story has expired",
        });
      }

      // Check if user already reacted
      const existingReaction = await ctx.db.storyReaction.findUnique({
        where: {
          storyId_userId: {
            storyId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingReaction) {
        // Update existing reaction
        await ctx.db.storyReaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            emoji,
          },
        });
      } else {
        // Create new reaction
        await ctx.db.storyReaction.create({
          data: {
            storyId,
            userId: ctx.session.user.id,
            emoji,
          },
        });

        // Send notification if reacting to someone else's story
        if (story.authorId !== ctx.session.user.id) {
          await ctx.db.notification.create({
            data: {
              userId: story.authorId,
              senderId: ctx.session.user.id,
              type: "STORY_REACTION",
              title: "Story Reaction",
              content: `${ctx.session.user.name} reacted to your story with ${emoji}`,
              link: `/stories/${storyId}`,
            },
          });
        }
      }

      return { success: true };
    }),

  // Add a response to a story
  addResponse: protectedProcedure
    .input(addStoryResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, content } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { id: true, expiresAt: true, authorId: true, allowResponses: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (isAfter(new Date(), story.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Story has expired",
        });
      }

      if (!story.allowResponses) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Responses are not allowed for this story",
        });
      }

      const response = await ctx.db.storyResponse.create({
        data: {
          storyId,
          userId: ctx.session.user.id,
          content,
        },
      });

      // Send notification if responding to someone else's story
      if (story.authorId !== ctx.session.user.id) {
        await ctx.db.notification.create({
          data: {
            userId: story.authorId,
            senderId: ctx.session.user.id,
            type: "STORY_REACTION",
            title: "Story Response",
            content: `${ctx.session.user.name} responded to your story: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            link: `/stories/${storyId}`,
          },
        });
      }

      return response;
    }),

  // Create a poll for a story
  createPoll: protectedProcedure
    .input(createStoryPollSchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, question, options } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { authorId: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the story author can create polls",
        });
      }

      const poll = await ctx.db.storyPoll.create({
        data: {
          storyId,
          question,
          options: JSON.stringify(options.map((option, index) => ({ id: `option-${index}`, text: option.text }))),
          votes: JSON.stringify({}),
        },
      });

      return poll;
    }),

  // Vote on a poll
  voteOnPoll: protectedProcedure
    .input(voteStoryPollSchema)
    .mutation(async ({ ctx, input }) => {
      const { pollId, optionId } = input;

      const poll = await ctx.db.storyPoll.findUnique({
        where: { id: pollId },
        include: { story: true },
      });

      if (!poll) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Poll not found",
        });
      }

      if (isAfter(new Date(), poll.story.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Story has expired",
        });
      }

      const options = JSON.parse(poll.options as string);
      const votes = JSON.parse(poll.votes as string || "{}");

      // Check if option exists
      if (!options.some((option: any) => option.id === optionId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid option ID",
        });
      }

      // Remove user from any existing votes
      Object.keys(votes).forEach(key => {
        if (Array.isArray(votes[key])) {
          votes[key] = votes[key].filter((id: string) => id !== ctx.session.user.id);
        }
      });

      // Add user's vote
      if (!votes[optionId]) {
        votes[optionId] = [];
      }
      votes[optionId].push(ctx.session.user.id);

      await ctx.db.storyPoll.update({
        where: { id: pollId },
        data: {
          votes: JSON.stringify(votes),
        },
      });

      return { success: true };
    }),

  // Create a question for a story
  createQuestion: protectedProcedure
    .input(createStoryQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, question } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { authorId: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the story author can create questions",
        });
      }

      const storyQuestion = await ctx.db.storyQuestion.create({
        data: {
          storyId,
          question,
          answers: JSON.stringify([]),
        },
      });

      return storyQuestion;
    }),

  // Answer a question
  answerQuestion: protectedProcedure
    .input(answerStoryQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const { questionId, answer } = input;

      const question = await ctx.db.storyQuestion.findUnique({
        where: { id: questionId },
        include: { story: true },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      if (isAfter(new Date(), question.story.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Story has expired",
        });
      }

      let answers = [];
      try {
        answers = JSON.parse(question.answers as string || "[]");
      } catch (e) {
        answers = [];
      }

      // Remove existing answer from this user
      answers = answers.filter((a: any) => a.userId !== ctx.session.user.id);

      // Add new answer
      answers.push({
        userId: ctx.session.user.id,
        answer,
        createdAt: new Date(),
      });

      await ctx.db.storyQuestion.update({
        where: { id: questionId },
        data: {
          answers: JSON.stringify(answers),
        },
      });

      // Send notification to story author
      if (question.story.authorId !== ctx.session.user.id) {
        await ctx.db.notification.create({
          data: {
            userId: question.story.authorId,
            senderId: ctx.session.user.id,
            type: "STORY_REACTION",
            title: "Question Answer",
            content: `${ctx.session.user.name} answered your question: "${answer.substring(0, 50)}${answer.length > 50 ? '...' : ''}"`,
            link: `/stories/${question.story.id}`,
          },
        });
      }

      return { success: true };
    }),

  // Create a slider for a story
  createSlider: protectedProcedure
    .input(createStorySliderSchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, question, emoji } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { authorId: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the story author can create sliders",
        });
      }

      const slider = await ctx.db.storySlider.create({
        data: {
          storyId,
          question,
          emoji,
          responses: JSON.stringify([]),
        },
      });

      return slider;
    }),

  // Respond to a slider
  respondToSlider: protectedProcedure
    .input(respondStorySliderSchema)
    .mutation(async ({ ctx, input }) => {
      const { sliderId, value } = input;

      const slider = await ctx.db.storySlider.findUnique({
        where: { id: sliderId },
        include: { story: true },
      });

      if (!slider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Slider not found",
        });
      }

      if (isAfter(new Date(), slider.story.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Story has expired",
        });
      }

      let responses = [];
      try {
        responses = JSON.parse(slider.responses as string || "[]");
      } catch (e) {
        responses = [];
      }

      // Remove existing response from this user
      responses = responses.filter((r: any) => r.userId !== ctx.session.user.id);

      // Add new response
      responses.push({
        userId: ctx.session.user.id,
        value,
        createdAt: new Date(),
      });

      await ctx.db.storySlider.update({
        where: { id: sliderId },
        data: {
          responses: JSON.stringify(responses),
        },
      });

      return { success: true };
    }),

  // Add a link to a story
  addLink: protectedProcedure
    .input(createStoryLinkSchema)
    .mutation(async ({ ctx, input }) => {
      const { storyId, url, label, position } = input;

      const story = await ctx.db.story.findUnique({
        where: { id: storyId },
        select: { authorId: true },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      if (story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the story author can add links",
        });
      }

      const link = await ctx.db.storyLink.create({
        data: {
          storyId,
          url,
          label,
          position: position ? JSON.stringify(position) : null,
        },
      });

      return link;
    }),

  // Create a story highlight
  createHighlight: protectedProcedure
    .input(createStoryHighlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, coverImageUrl, storyIds } = input;

      // Check if user owns all the stories
      const stories = await ctx.db.story.findMany({
        where: {
          id: { in: storyIds },
        },
        select: { id: true, authorId: true },
      });

      if (stories.length !== storyIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more stories not found",
        });
      }

      const notOwnedStories = stories.filter(story => story.authorId !== ctx.session.user.id);
      if (notOwnedStories.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only add your own stories to highlights",
        });
      }

      // Create highlight
      const highlight = await ctx.db.storyHighlight.create({
        data: {
          name,
          coverImageUrl,
          userId: ctx.session.user.id,
          items: {
            createMany: {
              data: storyIds.map((id, index) => ({
                storyId: id,
                order: index,
              })),
            },
          },
        },
        include: {
          items: {
            include: {
              story: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return highlight;
    }),

  // Add stories to an existing highlight
  addStoriesToHighlight: protectedProcedure
    .input(addStoriesToHighlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { highlightId, storyIds } = input;

      const highlight = await ctx.db.storyHighlight.findUnique({
        where: { id: highlightId },
        select: { userId: true },
      });

      if (!highlight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Highlight not found",
        });
      }

      if (highlight.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only add stories to your own highlights",
        });
      }

      // Check if user owns all the stories
      const stories = await ctx.db.story.findMany({
        where: {
          id: { in: storyIds },
        },
        select: { id: true, authorId: true },
      });

      const notOwnedStories = stories.filter(story => story.authorId !== ctx.session.user.id);
      if (notOwnedStories.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only add your own stories to highlights",
        });
      }

      // Get current highest order
      const highestOrder = await ctx.db.storyHighlightItem.findFirst({
        where: { highlightId },
        orderBy: {
          order: "desc",
        },
        select: { order: true },
      });

      let startOrder = (highestOrder?.order ?? -1) + 1;

      // Add stories to highlight
      await ctx.db.storyHighlightItem.createMany({
        data: storyIds.map((id, index) => ({
          highlightId,
          storyId: id,
          userId: ctx.session.user.id,
          order: startOrder + index,
        })),
        skipDuplicates: true,
      });

      return { success: true };
    }),

  // Remove a story from a highlight
  removeStoryFromHighlight: protectedProcedure
    .input(z.object({
      highlightId: z.string(),
      storyId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { highlightId, storyId } = input;

      const highlightItem = await ctx.db.storyHighlightItem.findUnique({
        where: {
          highlightId_storyId: {
            highlightId,
            storyId,
          }
        },
        include: {
          highlight: true,
        },
      });

      if (!highlightItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found in highlight",
        });
      }

      if (highlightItem.highlight.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only remove stories from your own highlights",
        });
      }

      await ctx.db.storyHighlightItem.delete({
        where: {
          id: highlightItem.id,
        },
      });

      // Check if this was the last item in the highlight
      const remainingItems = await ctx.db.storyHighlightItem.count({
        where: { highlightId },
      });

      // If no items left, delete the highlight
      if (remainingItems === 0) {
        await ctx.db.storyHighlight.delete({
          where: { id: highlightId },
        });
        return { success: true, highlightDeleted: true };
      }

      return { success: true, highlightDeleted: false };
    }),

  // Delete a highlight
  deleteHighlight: protectedProcedure
    .input(z.object({ highlightId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { highlightId } = input;

      const highlight = await ctx.db.storyHighlight.findUnique({
        where: { id: highlightId },
        select: { userId: true },
      });

      if (!highlight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Highlight not found",
        });
      }

      if (highlight.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own highlights",
        });
      }

      await ctx.db.storyHighlight.delete({
        where: { id: highlightId },
      });

      return { success: true };
    }),

  // Get current user's active stories
  getMyActiveStories: protectedProcedure
    .query(async ({ ctx }) => {
      const stories = await ctx.db.story.findMany({
        where: {
          authorId: ctx.session.user.id,
          expiresAt: { gte: new Date() },
          isArchived: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          views: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
          },
          reactions: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              emoji: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          polls: true,
          questions: true,
          sliders: true,
          links: true,
        },
      });

      return stories;
    }),

  // Get user's story highlights
  getUserHighlights: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      const highlights = await ctx.db.storyHighlight.findMany({
        where: { userId },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          items: {
            take: 1, // We just need the cover story
            orderBy: {
              order: "asc",
            },
            include: {
              story: {
                select: {
                  id: true,
                  thumbnailUrl: true,
                  mediaUrl: true,
                  mediaType: true,
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      return highlights;
    }),

  // Get a highlight by ID
  getHighlightById: publicProcedure
    .input(z.object({
      highlightId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { highlightId } = input;

      const highlight = await ctx.db.storyHighlight.findUnique({
        where: { id: highlightId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          items: {
            orderBy: {
              order: "asc",
            },
            include: {
              story: {
                include: {
                  polls: true,
                  questions: true,
                  sliders: true,
                  links: true,
                },
              },
            },
          },
        },
      });

      if (!highlight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Highlight not found",
        });
      }

      return highlight;
    }),

  // Get story feed
  getFeed: publicProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
      filters: storiesFiltersSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, filters } = input;
      const userId = ctx.session?.user?.id;

      let whereConditions: any = {
        expiresAt: { gte: new Date() },
        isArchived: false,
      };

      // Apply filters
      if (filters) {
        // Filter by specific user
        if (filters.userId) {
          whereConditions.authorId = filters.userId;
        }

        // Include expired stories if requested
        if (filters.includeExpired) {
          delete whereConditions.expiresAt;
        }

        // Filter by media type
        if (filters.mediaType) {
          whereConditions.mediaType = filters.mediaType;
        }

        // Filter stories with music
        if (filters.hasMusic) {
          whereConditions.musicTrackUrl = { not: null };
        }

        // Filter stories with location
        if (filters.hasLocation) {
          whereConditions.location = { not: null };
        }

        // Filter by topics
        if (filters.topicIds && filters.topicIds.length > 0) {
          whereConditions.topics = {
            some: {
              topicId: { in: filters.topicIds },
            },
          };
        }

        // Filter stories from followed users
        if (filters.following && userId) {
          whereConditions.author = {
            followers: {
              some: {
                followerId: userId,
                status: "ACCEPTED",
              },
            },
          };
        }
      }

      // Handle privacy levels
      if (userId) {
        whereConditions.OR = [
          { privacyLevel: "PUBLIC" },
          { authorId: userId },
          {
            AND: [
              { privacyLevel: "FRIENDS" },
              {
                author: {
                  followers: {
                    some: {
                      followerId: userId,
                      status: "ACCEPTED",
                    },
                  },
                },
              },
            ],
          },
        ];
      } else {
        // For non-logged-in users, only show public stories
        whereConditions.privacyLevel = "PUBLIC";
      }

      // Handle pagination
      if (cursor) {
        whereConditions.id = { lt: cursor };
      }

      // Get stories
      const stories = await ctx.db.story.findMany({
        take: limit + 1,
        where: whereConditions,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          views: userId
            ? {
                where: {
                  userId,
                },
                take: 1,
              }
            : undefined,
          reactions: userId
            ? {
                where: {
                  userId,
                },
                take: 1,
              }
            : undefined,
          _count: {
            select: {
              views: true,
              reactions: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (stories.length > limit) {
        const nextItem = stories.pop();
        nextCursor = nextItem!.id;
      }

      // Transform data for client
      const storyItems = stories.map(story => ({
        ...story,
        viewsCount: story._count.views,
        reactionsCount: story._count.reactions,
        isViewed: story.views?.length > 0,
        hasReacted: story.reactions?.length > 0,
        userReaction: story.reactions?.[0]?.emoji,
        _count: undefined,
        views: undefined,
        reactions: undefined,
        textOverlays: story.textOverlays ? JSON.parse(story.textOverlays as string) : null,
        drawElements: story.drawElements ? JSON.parse(story.drawElements as string) : null,
        stickers: story.stickers ? JSON.parse(story.stickers as string) : null,
      }));

      return {
        stories: storyItems,
        nextCursor,
      };
    }),

  // Get a single story by ID
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session?.user?.id;

      const story = await ctx.db.story.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          views: {
            select: {
              id: true,
              userId: true,
              viewDuration: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
          },
          reactions: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              emoji: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
          },
          responses: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              content: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 20,
          },
          polls: true,
          questions: true,
          sliders: true,
          links: true,
          topics: {
            include: {
              topic: true,
            },
          },
          _count: {
            select: {
              views: true,
              reactions: true,
              responses: true,
            },
          },
        },
      });

      if (!story) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found",
        });
      }

      // Check if user can view story based on privacy settings
      const canView =
        story.privacyLevel === "PUBLIC" ||
        story.authorId === userId ||
        (story.privacyLevel === "FRIENDS" &&
          userId &&
          !!(await ctx.db.follows.findFirst({
            where: {
              followerId: userId,
              followingId: story.authorId,
              status: "ACCEPTED",
            },
          })));

      if (!canView) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this story",
        });
      }

      // Transform data for client
      return {
        ...story,
        viewsCount: story._count.views,
        reactionsCount: story._count.reactions,
        responsesCount: story._count.responses,
        isViewed: userId ? story.views.some(view => view.userId === userId) : false,
        userReaction: userId
          ? story.reactions.find(reaction => reaction.userId === userId)?.emoji
          : undefined,
        hasExpired: isAfter(new Date(), story.expiresAt),
        textOverlays: story.textOverlays ? JSON.parse(story.textOverlays as string) : null,
        drawElements: story.drawElements ? JSON.parse(story.drawElements as string) : null,
        stickers: story.stickers ? JSON.parse(story.stickers as string) : null,
        _count: undefined,
      };
    }),

  // Get poll results
  getPollResults: protectedProcedure
    .input(z.object({
      pollId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { pollId } = input;

      const poll = await ctx.db.storyPoll.findUnique({
        where: { id: pollId },
        include: {
          story: {
            select: {
              id: true,
              authorId: true,
            },
          },
        },
      });

      if (!poll) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Poll not found",
        });
      }

      const options = JSON.parse(poll.options as string);
      const votes = JSON.parse(poll.votes as string || "{}");

      // Calculate results
      const results = options.map((option: any) => {
        const voterIds = votes[option.id] || [];
        return {
          id: option.id,
          text: option.text,
          votes: voterIds.length,
          voterIds,
          percentage: 0, // We'll calculate this next
        };
      });

      // Calculate total votes and percentages
      const totalVotes = results.reduce((sum: number, option: any) => sum + option.votes, 0);
      results.forEach((option: any) => {
        option.percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
      });

      // Get user IDs for all voters
      const allVoterIds = Array.from(
        new Set(Object.values(votes).flat())
      );

      // Get user info for voters if story author
      let voters = [];
      if (poll.story.authorId === ctx.session.user.id && allVoterIds.length > 0) {
        voters = await ctx.db.user.findMany({
          where: {
            id: { in: allVoterIds as string[] },
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });
      }

      // Check if current user has voted
      const userVote = Object.entries(votes).find(
        ([, voterIds]) => Array.isArray(voterIds) && (voterIds as string[]).includes(ctx.session.user.id)
      )?.[0];

      return {
        id: poll.id,
        storyId: poll.storyId,
        question: poll.question,
        options: results,
        totalVotes,
        voters: poll.story.authorId === ctx.session.user.id ? voters : [],
        userVote,
      };
    }),

  // Get question answers
  getQuestionAnswers: protectedProcedure
    .input(z.object({
      questionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { questionId } = input;

      const question = await ctx.db.storyQuestion.findUnique({
        where: { id: questionId },
        include: {
          story: {
            select: {
              id: true,
              authorId: true,
            },
          },
        },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      // Only the story author can see all answers
      if (question.story.authorId !== ctx.session.user.id) {
        return {
          id: question.id,
          storyId: question.storyId,
          question: question.question,
          answers: [],
          totalAnswers: 0,
          userAnswer: null,
        };
      }

      let answers = [];
      try {
        answers = JSON.parse(question.answers as string || "[]");
      } catch (e) {
        answers = [];
      }

      // Get user info for all who answered
      const userIds = answers.map((a: any) => a.userId);
      let users = [];

      if (userIds.length > 0) {
        users = await ctx.db.user.findMany({
          where: {
            id: { in: userIds },
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });
      }

      // Match users to answers
      const answersWithUsers = answers.map((answer: any) => {
        const user = users.find((u: any) => u.id === answer.userId);
        return {
          ...answer,
          user,
        };
      });

      // Find current user's answer
      const userAnswer = answers.find((a: any) => a.userId === ctx.session.user.id)?.answer;

      return {
        id: question.id,
        storyId: question.storyId,
        question: question.question,
        answers: answersWithUsers,
        totalAnswers: answers.length,
        userAnswer,
      };
    }),

  // Get slider responses
  getSliderResponses: protectedProcedure
    .input(z.object({
      sliderId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { sliderId } = input;

      const slider = await ctx.db.storySlider.findUnique({
        where: { id: sliderId },
        include: {
          story: {
            select: {
              id: true,
              authorId: true,
            },
          },
        },
      });

      if (!slider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Slider not found",
        });
      }

      let responses = [];
      try {
        responses = JSON.parse(slider.responses as string || "[]");
      } catch (e) {
        responses = [];
      }

      // Calculate average
      const values = responses.map((r: any) => r.value);
      const average = values.length > 0
        ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length
        : 0;

      // Find current user's response
      const userResponse = responses.find((r: any) => r.userId === ctx.session.user.id)?.value;

      // For story author, include detailed responses
      let responseDetails = [];
      if (slider.story.authorId === ctx.session.user.id && responses.length > 0) {
        const userIds = responses.map((r: any) => r.userId);
        const users = await ctx.db.user.findMany({
          where: {
            id: { in: userIds },
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });

        responseDetails = responses.map((response: any) => {
          const user = users.find((u: any) => u.id === response.userId);
          return {
            userId: response.userId,
            value: response.value,
            createdAt: response.createdAt,
            user,
          };
        });
      }

      return {
        id: slider.id,
        storyId: slider.storyId,
        question: slider.question,
        emoji: slider.emoji,
        average: Math.round(average),
        totalResponses: responses.length,
        userResponse,
        responses: slider.story.authorId === ctx.session.user.id ? responseDetails : [],
      };
    }),
});