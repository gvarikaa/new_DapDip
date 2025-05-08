import { z } from "zod";
import { PrivacyLevel } from "@prisma/client";

export const postCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaTitles: z.array(z.string()).optional(),
  mediaTypes: z.array(z.string()).optional(),
  privacyLevel: z.nativeEnum(PrivacyLevel).default(PrivacyLevel.PUBLIC),
  topicIds: z.array(z.string()).optional(),
  parentId: z.string().optional(),
});

export const postUpdateSchema = z.object({
  id: z.string(),
  content: z.string().min(1).max(5000).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaTitles: z.array(z.string()).optional(),
  mediaTypes: z.array(z.string()).optional(),
  privacyLevel: z.nativeEnum(PrivacyLevel).optional(),
  topicIds: z.array(z.string()).optional(),
});

export const postAIAnalysisSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostAIAnalysisInput = z.infer<typeof postAIAnalysisSchema>;