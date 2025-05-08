import { z } from "zod";

// Validation schema for creating an audio message
export const createAudioMessageSchema = z.object({
  audioBlob: z.instanceof(Blob, {
    message: "Audio blob is required",
  }),
  duration: z.number().min(0.5, "Audio should be at least 0.5 seconds").max(60, "Audio cannot exceed 60 seconds"),
  waveform: z.array(z.number().min(0).max(100)).min(10, "Waveform data is required"),
  chatId: z.string().optional(),
  commentId: z.string().optional(),
  postId: z.string().optional(),
  reelId: z.string().optional(),
  storyId: z.string().optional(),
}).refine(
  (data) => {
    // Ensure at least one destination is provided
    return !!(data.chatId || data.commentId || data.postId || data.reelId || data.storyId);
  },
  {
    message: "Audio message must be associated with a chat, comment, post, reel, or story",
    path: ["chatId"],
  }
);

// Validation schema for transcribing an audio message
export const transcribeAudioSchema = z.object({
  audioMessageId: z.string(),
  language: z.string().optional(),
});

// Validation schema for retrieving audio messages
export const getAudioMessagesSchema = z.object({
  chatId: z.string().optional(),
  commentId: z.string().optional(),
  postId: z.string().optional(),
  reelId: z.string().optional(),
  storyId: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
}).refine(
  (data) => {
    // Ensure at least one filter is provided
    return !!(data.chatId || data.commentId || data.postId || data.reelId || data.storyId);
  },
  {
    message: "At least one filter is required",
    path: ["chatId"],
  }
);

// Validation schema for updating an audio message
export const updateAudioMessageSchema = z.object({
  id: z.string(),
  transcription: z.string().optional(),
});

// Validation schema for deleting an audio message
export const deleteAudioMessageSchema = z.object({
  id: z.string(),
});