/**
 * Types related to the reels feature
 */

import { User } from "@prisma/client";

/**
 * Represents a single reel (video post)
 */
export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  authorId: string;
  createdAt: Date;
  duration: number; // in seconds
  aspectRatio: number; // width / height
  views: number;
  likes: number;
  comments: number;
  shares: number;
  audio?: {
    id: string;
    name: string;
    artist: string;
  };
  tags?: string[];
}

/**
 * Reel with author information
 */
export interface ReelWithAuthor extends Reel {
  author: User;
}

/**
 * Reel playback state
 */
export interface ReelPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
}

/**
 * Reel interaction state
 */
export interface ReelInteractionState {
  isLiked: boolean;
  isSaved: boolean;
  isFollowingAuthor: boolean;
}