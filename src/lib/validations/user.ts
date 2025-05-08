import { z } from "zod";
import { PrivacyLevel, AIPlan } from "@prisma/client";

export const userProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  }).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
});

export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "dusk", "system"]).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontPreference: z.string().optional(),
  animationsEnabled: z.boolean().optional(),
  language: z.string().min(2).max(10).optional(),
  privacyLevel: z.nativeEnum(PrivacyLevel).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  messageNotifications: z.boolean().optional(),
  // AI settings
  aiEnabled: z.boolean().optional(),
  aiPlan: z.nativeEnum(AIPlan).optional(),
  aiTokensRemaining: z.number().min(0).optional(),
  aiTokensReset: z.date().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;