import { type User } from "./user";
import { type Topic } from "./topics";

export type MediaType = "IMAGE" | "VIDEO" | "TEXT";
export type PrivacyLevel = "PUBLIC" | "FRIENDS" | "PRIVATE";

export interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  rotation: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface DrawElement {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface Sticker {
  id: string;
  stickerId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface StoryLink {
  id: string;
  url: string;
  label?: string;
  position?: { x: number; y: number };
}

export interface PollOption {
  id: string;
  text: string;
}

export interface Story {
  id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: MediaType;
  duration?: number;
  
  authorId: string;
  author?: User;
  caption?: string;
  location?: string;
  
  backgroundColor?: string;
  textOverlays?: TextOverlay[];
  drawElements?: DrawElement[];
  stickers?: Sticker[];
  filter?: string;
  
  musicTrackUrl?: string;
  musicArtist?: string;
  musicTitle?: string;
  
  allowResponses: boolean;
  
  privacyLevel: PrivacyLevel;
  isArchived: boolean;
  expiresAt: Date;
  
  links?: StoryLink[];
  topics?: Topic[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Calculated fields
  viewsCount?: number;
  reactionsCount?: number;
  isViewed?: boolean; // Whether current user has viewed
  hasExpired?: boolean; // Whether story has expired
}

export interface StoryView {
  id: string;
  storyId: string;
  userId: string;
  viewDuration?: number;
  createdAt: Date;
}

export interface StoryReaction {
  id: string;
  storyId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface StoryResponse {
  id: string;
  storyId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryPoll {
  id: string;
  storyId: string;
  question: string;
  options: PollOption[];
  votes?: Record<string, string[]>; // optionId -> userIds
  userVote?: string; // Current user's vote (option id)
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryQuestion {
  id: string;
  storyId: string;
  question: string;
  answers?: Array<{ userId: string; answer: string; user?: User }>;
  userAnswer?: string; // Current user's answer
  createdAt: Date;
  updatedAt: Date;
}

export interface StorySlider {
  id: string;
  storyId: string;
  question: string;
  emoji?: string;
  responses?: Array<{ userId: string; value: number }>;
  userResponse?: number; // Current user's response (0-100)
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryHighlight {
  id: string;
  userId: string;
  name: string;
  coverImageUrl?: string;
  items?: StoryHighlightItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryHighlightItem {
  id: string;
  highlightId: string;
  storyId: string;
  story?: Story;
  order: number;
  createdAt: Date;
}

export interface CreateStoryInput {
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: MediaType;
  duration?: number;
  caption?: string;
  location?: string;
  backgroundColor?: string;
  textOverlays?: TextOverlay[];
  drawElements?: DrawElement[];
  stickers?: Sticker[];
  filter?: string;
  musicTrackUrl?: string;
  musicArtist?: string;
  musicTitle?: string;
  allowResponses?: boolean;
  privacyLevel?: PrivacyLevel;
  links?: Omit<StoryLink, "id">[];
  topicIds?: string[];
}

export interface UpdateStoryInput {
  id: string;
  caption?: string;
  location?: string;
  privacyLevel?: PrivacyLevel;
  isArchived?: boolean;
}

export interface AddStoryReactionInput {
  storyId: string;
  emoji: string;
}

export interface AddStoryResponseInput {
  storyId: string;
  content: string;
}

export interface CreateStoryPollInput {
  storyId: string;
  question: string;
  options: Omit<PollOption, "id">[];
}

export interface VoteStoryPollInput {
  pollId: string;
  optionId: string;
}

export interface CreateStoryQuestionInput {
  storyId: string;
  question: string;
}

export interface AnswerStoryQuestionInput {
  questionId: string;
  answer: string;
}

export interface CreateStorySliderInput {
  storyId: string;
  question: string;
  emoji?: string;
}

export interface RespondStorySliderInput {
  sliderId: string;
  value: number; // 0-100
}

export interface CreateStoryLinkInput {
  storyId: string;
  url: string;
  label?: string;
  position?: { x: number; y: number };
}

export interface CreateStoryHighlightInput {
  name: string;
  coverImageUrl?: string;
  storyIds: string[];
}

export interface AddStoriesToHighlightInput {
  highlightId: string;
  storyIds: string[];
}

export interface StoriesFilters {
  userId?: string;
  includeExpired?: boolean;
  mediaType?: MediaType;
  hasMusic?: boolean;
  hasLocation?: boolean;
  topicIds?: string[];
  following?: boolean; // Only stories from users the current user follows
}

export interface StoriesConnection {
  edges: Array<{
    cursor: string;
    node: Story;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}