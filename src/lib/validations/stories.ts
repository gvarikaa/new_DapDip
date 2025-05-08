import { z } from "zod";

// Basic position object
const positionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100)
});

// Text overlay validation
export const textOverlaySchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1).max(500),
  position: positionSchema,
  rotation: z.number().min(-180).max(180).default(0),
  fontSize: z.number().min(8).max(72).default(16),
  fontFamily: z.string().default("Arial"),
  fontWeight: z.string().default("normal"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  padding: z.number().min(0).max(50).optional(),
  borderRadius: z.number().min(0).max(50).optional(),
});

// Drawing element validation
export const drawElementSchema = z.object({
  id: z.string().optional(),
  points: z.array(positionSchema).min(2),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  width: z.number().min(1).max(50).default(2),
});

// Sticker validation
export const stickerSchema = z.object({
  id: z.string().optional(),
  stickerId: z.string(),
  position: positionSchema,
  scale: z.number().min(0.5).max(3).default(1),
  rotation: z.number().min(-180).max(180).default(0),
});

// Story link validation
export const storyLinkSchema = z.object({
  url: z.string().url("Invalid URL"),
  label: z.string().max(50).optional(),
  position: positionSchema.optional(),
});

// Poll option validation
export const pollOptionSchema = z.object({
  text: z.string().min(1).max(100),
});

// Create story schema
export const createStorySchema = z.object({
  mediaUrl: z.string().url("Please provide a valid media URL"),
  thumbnailUrl: z.string().url("Please provide a valid thumbnail URL").optional(),
  mediaType: z.enum(["IMAGE", "VIDEO", "TEXT"]),
  duration: z.number().positive().optional(),
  caption: z.string().max(2200).optional(),
  location: z.string().max(100).optional(),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  textOverlays: z.array(textOverlaySchema).optional(),
  drawElements: z.array(drawElementSchema).optional(),
  stickers: z.array(stickerSchema).optional(),
  filter: z.string().optional(),
  musicTrackUrl: z.string().url("Please provide a valid music track URL").optional(),
  musicArtist: z.string().max(100).optional(),
  musicTitle: z.string().max(100).optional(),
  allowResponses: z.boolean().default(true),
  privacyLevel: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).default("PUBLIC"),
  links: z.array(storyLinkSchema).optional(),
  topicIds: z.array(z.string()).optional(),
});

// Update story schema
export const updateStorySchema = z.object({
  id: z.string(),
  caption: z.string().max(2200).optional(),
  location: z.string().max(100).optional(),
  privacyLevel: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
  isArchived: z.boolean().optional(),
});

// Story reaction schema
export const addStoryReactionSchema = z.object({
  storyId: z.string(),
  emoji: z.string().min(1).max(10),
});

// Story response schema
export const addStoryResponseSchema = z.object({
  storyId: z.string(),
  content: z.string().min(1).max(1000),
});

// Create story poll schema
export const createStoryPollSchema = z.object({
  storyId: z.string(),
  question: z.string().min(1).max(200),
  options: z.array(pollOptionSchema).min(2).max(10),
});

// Vote on story poll schema
export const voteStoryPollSchema = z.object({
  pollId: z.string(),
  optionId: z.string(),
});

// Create story question schema
export const createStoryQuestionSchema = z.object({
  storyId: z.string(),
  question: z.string().min(1).max(200),
});

// Answer story question schema
export const answerStoryQuestionSchema = z.object({
  questionId: z.string(),
  answer: z.string().min(1).max(500),
});

// Create story slider schema
export const createStorySliderSchema = z.object({
  storyId: z.string(),
  question: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
});

// Respond to story slider schema
export const respondStorySliderSchema = z.object({
  sliderId: z.string(),
  value: z.number().min(0).max(100),
});

// Create story link schema
export const createStoryLinkSchema = z.object({
  storyId: z.string(),
  url: z.string().url("Please provide a valid URL"),
  label: z.string().max(50).optional(),
  position: positionSchema.optional(),
});

// Create story highlight schema
export const createStoryHighlightSchema = z.object({
  name: z.string().min(1).max(50),
  coverImageUrl: z.string().url("Please provide a valid cover image URL").optional(),
  storyIds: z.array(z.string()).min(1),
});

// Add stories to highlight schema
export const addStoriesToHighlightSchema = z.object({
  highlightId: z.string(),
  storyIds: z.array(z.string()).min(1),
});

// Story view schema
export const viewStorySchema = z.object({
  storyId: z.string(),
  viewDuration: z.number().positive().optional(),
});

// Stories filters schema
export const storiesFiltersSchema = z.object({
  userId: z.string().optional(),
  includeExpired: z.boolean().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO", "TEXT"]).optional(),
  hasMusic: z.boolean().optional(),
  hasLocation: z.boolean().optional(),
  topicIds: z.array(z.string()).optional(),
  following: z.boolean().optional(),
});

// Story pagination schema
export const storiesPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
});