/**
 * Type definitions for the DapDip social network application.
 */

import { Post, User, Comment, Reaction } from "@prisma/client";
import { Session } from "next-auth";

/**
 * Extended Session type with user ID
 */
export interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * Post with author and counts for use in UI
 */
export interface PostWithAuthor extends Post {
  author: User;
  _count: {
    comments: number;
    reactions: number;
    views?: number;
  };
}

/**
 * Comment with author and counts for use in UI
 */
export interface CommentWithAuthor extends Comment {
  author: User;
  _count: {
    replies: number;
    reactions: number;
  };
}

/**
 * User with follower/following counts for profiles
 */
export interface UserWithCounts extends User {
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
}

/**
 * AI Analysis result structure
 */
export interface AIAnalysisResult {
  sentiment: number;
  topics: string[];
  analysis: {
    tone: string;
    emotions: string[];
    keyThemes: string[];
    engagement: string;
    suggestions: string;
  };
}

/**
 * Moderation result structure
 */
export interface ModerationResult {
  isSafe: boolean;
  issues: string[];
  categories: Record<string, number>;
}

/**
 * Follow relationship status
 */
export interface FollowStatus {
  isFollowing: boolean;
  isFollower: boolean;
  isMutual: boolean;
  isBlocked: boolean;
}

/**
 * Message with sender and receiver for chat
 */
export interface MessageWithUsers {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  read: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination metadata for API responses
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}