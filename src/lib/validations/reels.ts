import { z } from "zod";
import { PrivacyLevel } from "@prisma/client";

/**
 * Schema for creating a new reel
 */
export const reelCreateSchema = z.object({
  // Video content is required
  videoUrl: z.string().url({
    message: "Valid video URL is required"
  }),
  
  // Thumbnail is required for preview/loading
  thumbnailUrl: z.string().url({
    message: "Valid thumbnail URL is required"
  }),
  
  // Optional description
  description: z.string().max(2000).optional(),
  
  // Video metadata
  duration: z.number().positive({
    message: "Duration must be a positive number in seconds"
  }),
  
  // Default to 9:16 vertical video aspect ratio
  aspectRatio: z.number().default(0.5625),
  
  // Audio information
  audio: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    artist: z.string().optional()
  }).optional(),
  
  // Privacy settings
  privacyLevel: z.nativeEnum(PrivacyLevel).default(PrivacyLevel.PUBLIC),
  
  // Tags for discoverability
  tags: z.array(z.string()).max(10).optional()
});

/**
 * Schema for updating an existing reel
 */
export const reelUpdateSchema = z.object({
  id: z.string(),
  description: z.string().max(2000).optional(),
  privacyLevel: z.nativeEnum(PrivacyLevel).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

/**
 * Schema for creating a comment on a reel
 */
export const reelCommentCreateSchema = z.object({
  reelId: z.string(),
  content: z.string().min(1).max(500),
  parentId: z.string().optional(),
});

/**
 * Schema for tracking reel views
 */
export const reelViewSchema = z.object({
  reelId: z.string(),
  watchDuration: z.number().min(0),
  watchPercentage: z.number().min(0).max(100),
  completedView: z.boolean().default(false),
});

// Type exports derived from schemas
export type ReelCreateInput = z.infer<typeof reelCreateSchema>;
export type ReelUpdateInput = z.infer<typeof reelUpdateSchema>;
export type ReelCommentCreateInput = z.infer<typeof reelCommentCreateSchema>;
export type ReelViewInput = z.infer<typeof reelViewSchema>;