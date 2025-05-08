# DapDip API Documentation

This document provides a comprehensive guide to the DapDip API using tRPC for type-safe API calls.

## Overview

DapDip uses tRPC to provide a fully type-safe API with automatic validation using Zod schemas. All API endpoints are organized into logical routers by feature area.

## Base URL

In development: `http://localhost:3000/api/trpc`
In production: `https://your-domain.com/api/trpc`

## Authentication

Most API endpoints require authentication using NextAuth.js. Provide the authentication token in the cookie or Authorization header.

## Core Routers

### User Router

User-related operations including profiles, settings, and search.

#### `user.getById`

Get a user by ID.

**Input:**
```typescript
{
  userId: string
}
```

**Output:**
```typescript
User & {
  _count: {
    followers: number;
    following: number;
    posts: number;
  }
}
```

#### `user.getProfile`

Get the current user's profile (requires authentication).

**Output:**
```typescript
User & {
  settings: UserSettings;
  _count: {
    followers: number;
    following: number;
    posts: number;
  }
}
```

#### `user.updateProfile`

Update the current user's profile (requires authentication).

**Input:**
```typescript
{
  name?: string;
  username?: string;
  bio?: string;
  image?: string;
  coverImage?: string;
}
```

**Output:**
```typescript
User
```

#### `user.updateSettings`

Update the current user's settings (requires authentication).

**Input:**
```typescript
{
  theme: "light" | "dark" | "system";
  language: string;
  privacyLevel: PrivacyLevel;
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
}
```

**Output:**
```typescript
UserSettings
```

#### `user.searchUsers`

Search for users by name or username.

**Input:**
```typescript
{
  query: string
}
```

**Output:**
```typescript
User[]
```

### Post Router

Operations for creating, updating, and interacting with posts.

#### `post.create`

Create a new post (requires authentication).

**Input:**
```typescript
{
  content: string;
  mediaUrls?: string[];
  mediaTitles?: string[];
  mediaTypes?: string[];
  privacyLevel?: PrivacyLevel;
  topicIds?: string[];
  parentId?: string;
}
```

**Output:**
```typescript
Post
```

#### `post.update`

Update an existing post (requires authentication and post ownership).

**Input:**
```typescript
{
  id: string;
  content?: string;
  mediaUrls?: string[];
  mediaTitles?: string[];
  mediaTypes?: string[];
  privacyLevel?: PrivacyLevel;
  topicIds?: string[];
}
```

**Output:**
```typescript
Post
```

#### `post.delete`

Delete a post (requires authentication and post ownership).

**Input:**
```typescript
{
  id: string
}
```

**Output:**
```typescript
{
  success: boolean
}
```

#### `post.getById`

Get a post by ID.

**Input:**
```typescript
{
  id: string
}
```

**Output:**
```typescript
Post & {
  author: User;
  topics: {
    topic: Topic;
  }[];
  parent?: Post & {
    author: User;
  };
  _count: {
    comments: number;
    reactions: number;
  }
}
```

#### `post.getFeed`

Get paginated feed of posts.

**Input:**
```typescript
{
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  posts: PostWithAuthor[];
  nextCursor?: string;
}
```

#### `post.getUserPosts`

Get posts by a specific user.

**Input:**
```typescript
{
  userId: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  posts: PostWithAuthor[];
  nextCursor?: string;
}
```

#### `post.savePost`

Save or unsave a post (requires authentication).

**Input:**
```typescript
{
  postId: string;
}
```

**Output:**
```typescript
{
  saved: boolean;
}
```

#### `post.getSavedPosts`

Get posts saved by the current user (requires authentication).

**Input:**
```typescript
{
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  posts: PostWithAuthor[];
  nextCursor?: string;
}
```

#### `post.toggleReaction`

Toggle a reaction on a post (requires authentication).

**Input:**
```typescript
{
  postId: string;
  type: ReactionType;
}
```

**Output:**
```typescript
{
  type: ReactionType | null;
}
```

### Comment Router

Operations for managing comments.

#### `comment.create`

Create a new comment (requires authentication).

**Input:**
```typescript
{
  content: string;
  postId: string;
  parentId?: string;
}
```

**Output:**
```typescript
Comment
```

#### `comment.update`

Update a comment (requires authentication and comment ownership).

**Input:**
```typescript
{
  id: string;
  content: string;
}
```

**Output:**
```typescript
Comment
```

#### `comment.delete`

Delete a comment (requires authentication and comment ownership).

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

#### `comment.getForPost`

Get comments for a specific post.

**Input:**
```typescript
{
  postId: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  comments: CommentWithAuthor[];
  nextCursor?: string;
}
```

#### `comment.getReplies`

Get replies to a specific comment.

**Input:**
```typescript
{
  commentId: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  replies: CommentWithAuthor[];
  nextCursor?: string;
}
```

#### `comment.toggleReaction`

Toggle a reaction on a comment (requires authentication).

**Input:**
```typescript
{
  commentId: string;
  type: ReactionType;
}
```

**Output:**
```typescript
{
  type: ReactionType | null;
}
```

### AI Router

AI-powered content analysis and generation.

#### `ai.analyzePostContent`

Analyze post content with AI (requires authentication).

**Input:**
```typescript
{
  id: string;
  content: string;
}
```

**Output:**
```typescript
{
  sentiment: number;
  analysis: {
    topics: string[];
    tone: string;
    emotions: string[];
    keyThemes: string[];
    engagement: string;
    suggestions: string;
  }
}
```

#### `ai.generatePostSuggestions`

Generate post suggestions based on a topic (requires authentication).

**Input:**
```typescript
{
  topic: string;
}
```

**Output:**
```typescript
Array<{
  title: string;
  content: string;
  hashtags: string[];
}>
```

#### `ai.getSentiment`

Get sentiment analysis for text (requires authentication).

**Input:**
```typescript
{
  text: string;
}
```

**Output:**
```typescript
{
  sentiment: number;
}
```

#### `ai.extractTopics`

Extract topics from text (requires authentication).

**Input:**
```typescript
{
  text: string;
}
```

**Output:**
```typescript
{
  topics: string[];
}
```

#### `ai.moderateContent`

Moderate content for inappropriate material (requires authentication).

**Input:**
```typescript
{
  text: string;
}
```

**Output:**
```typescript
{
  isSafe: boolean;
  issues: string[];
  categories: Record<string, number>;
}
```

#### `ai.summarizeContent`

Summarize text content (requires authentication).

**Input:**
```typescript
{
  text: string;
}
```

**Output:**
```typescript
{
  summary: string;
}
```

#### `ai.getTrendingTopics`

Get trending topics based on recent posts.

**Output:**
```typescript
{
  topics: {
    topic: string;
    count: number;
  }[];
}
```

### Follow Router

Operations for managing follow relationships between users.

#### `follow.followUser`

Follow or unfollow a user (requires authentication).

**Input:**
```typescript
{
  userId: string;
}
```

**Output:**
```typescript
{
  following: boolean;
}
```

#### `follow.blockUser`

Block or unblock a user (requires authentication).

**Input:**
```typescript
{
  userId: string;
}
```

**Output:**
```typescript
{
  blocked: boolean;
}
```

#### `follow.getFollowers`

Get followers of a user.

**Input:**
```typescript
{
  userId: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  followers: User[];
  nextCursor?: string;
}
```

#### `follow.getFollowing`

Get users followed by a user.

**Input:**
```typescript
{
  userId: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  following: User[];
  nextCursor?: string;
}
```

#### `follow.getFollowStatus`

Get follow status between current user and another user (requires authentication).

**Input:**
```typescript
{
  userId: string;
}
```

**Output:**
```typescript
{
  isFollowing: boolean;
  isFollower: boolean;
  isMutual: boolean;
  isBlocked: boolean;
}
```

### Message Router

Operations for real-time messaging.

#### `message.sendMessage`

Send a message to another user (requires authentication).

**Input:**
```typescript
{
  receiverId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
}
```

**Output:**
```typescript
Message
```

#### `message.getConversation`

Get messages between current user and another user (requires authentication).

**Input:**
```typescript
{
  userId: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  messages: MessageWithUsers[];
  nextCursor?: string;
}
```

#### `message.getConversations`

Get all conversations for the current user (requires authentication).

**Input:**
```typescript
{
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  conversations: {
    message: MessageWithUsers;
    otherUser: User;
    unreadCount: number;
  }[];
  nextCursor?: string;
}
```

#### `message.markAsRead`

Mark a message as read (requires authentication).

**Input:**
```typescript
{
  messageId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

#### `message.getUnreadCount`

Get count of unread messages (requires authentication).

**Output:**
```typescript
{
  count: number;
}
```

### Notification Router

Operations for managing notifications.

#### `notification.getAll`

Get all notifications for the current user (requires authentication).

**Input:**
```typescript
{
  limit?: number;
  cursor?: string;
  unreadOnly?: boolean;
}
```

**Output:**
```typescript
{
  notifications: Notification[];
  nextCursor?: string;
}
```

#### `notification.markAsRead`

Mark a notification as read (requires authentication).

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

#### `notification.markAllAsRead`

Mark all notifications as read (requires authentication).

**Output:**
```typescript
{
  success: boolean;
}
```

#### `notification.getUnreadCount`

Get count of unread notifications (requires authentication).

**Output:**
```typescript
{
  count: number;
}
```

#### `notification.delete`

Delete a notification (requires authentication).

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

#### `notification.deleteAll`

Delete all notifications (requires authentication).

**Output:**
```typescript
{
  success: boolean;
}
```

## Error Handling

All API calls may return the following errors:

- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Requested resource not found
- `BAD_REQUEST`: Invalid input
- `INTERNAL_SERVER_ERROR`: Server-side error
- `TOO_MANY_REQUESTS`: Rate limit exceeded

Example error response:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404
    }
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication operations: 5 requests per minute
- Content operations: 20 requests per minute
- Read operations: 100 requests per minute
- AI operations: 20 requests per 10 minutes

## Using with TypeScript

With tRPC, you get full type safety when using the API:

```typescript
import { api } from "@/lib/trpc/client";

// Example: Get a user profile
const { data: user } = api.user.getById.useQuery({ userId: "123" });

// Example: Create a post
const createPost = api.post.create.useMutation();
createPost.mutate({
  content: "Hello world!",
  privacyLevel: "PUBLIC",
});
```