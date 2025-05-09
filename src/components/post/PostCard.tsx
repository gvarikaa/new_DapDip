'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, 
  Heart, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  AlertTriangle,
  Sparkles,
  ThumbsUp,
  Laugh,
  HeartCrack,
  Flame
} from "lucide-react";

import { api } from "@/lib/trpc/client";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import { Post, User, ReactionType } from "@prisma/client";
import PostAnalysisModal from "./PostAnalysisModal";
import PostMedia from "./PostMedia";

interface PostCardProps {
  post: Post & {
    author: User;
    _count: {
      comments: number;
      reactions: number;
      views?: number;
    };
  };
  onDelete?: () => void;
}

export default function PostCard({ post, onDelete }: PostCardProps): JSX.Element {
  const { data: session } = useSession();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // TRPC mutations
  const utils = api.useUtils();
  const toggleReaction = api.post.toggleReaction.useMutation({
    onSuccess: () => {
      utils.post.getById.invalidate({ id: post.id });
      utils.post.getFeed.invalidate();
      utils.post.getUserPosts.invalidate({ userId: post.authorId });
    },
  });
  
  const savePost = api.post.savePost.useMutation({
    onSuccess: () => {
      utils.post.getSavedPosts.invalidate();
    },
  });

  const deletePostMutation = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getFeed.invalidate();
      utils.post.getUserPosts.invalidate({ userId: post.authorId });
      if (onDelete) onDelete();
    },
  });

  const handleToggleReaction = (type: ReactionType): void => {
    if (!session?.user) return;
    toggleReaction.mutate({ postId: post.id, type });
    setShowReactions(false);
  };

  const handleSavePost = (): void => {
    if (!session?.user) return;
    savePost.mutate({ postId: post.id });
  };

  const handleDeletePost = (): void => {
    if (!session?.user || session.user.id !== post.authorId) return;
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ id: post.id });
    }
  };

  const handleSharePost = (): void => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    alert("Link copied to clipboard!");
  };

  const isAuthor = session?.user?.id === post.authorId;

  return (
    <div className="rounded-lg border bg-card shadow">
      {/* Post header */}
      <div className="flex items-center justify-between p-4">
        <Link 
          href={`/profile/${post.authorId}`} 
          className="flex items-center space-x-3"
        >
          <div className="h-10 w-10 overflow-hidden rounded-full">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name || "User"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                {getInitials(post.author.name || "User")}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(new Date(post.createdAt))}
              {post.updatedAt > post.createdAt && " (edited)"}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="rounded-full p-2 hover:bg-muted"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showOptions && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border bg-card shadow-lg">
              {post.aiAnalysis && (
                <button
                  onClick={() => {
                    setShowAnalysis(true);
                    setShowOptions(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  View AI Analysis
                </button>
              )}
              
              <button
                onClick={() => {
                  handleSharePost();
                  setShowOptions(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
              >
                <Share className="mr-2 h-4 w-4" />
                Share post
              </button>
              
              <button
                onClick={() => {
                  // In a real app, this would open a report modal
                  alert("Post reported");
                  setShowOptions(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report post
              </button>
              
              {isAuthor && (
                <>
                  <Link
                    href={`/post/edit/${post.id}`}
                    className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => setShowOptions(false)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Edit post
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleDeletePost();
                      setShowOptions(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Delete post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post media */}
      {post.mediaUrls.length > 0 && (
        <PostMedia
          mediaUrls={post.mediaUrls}
          mediaTitles={post.mediaTitles}
          mediaTypes={post.mediaTypes}
        />
      )}

      {/* Post stats */}
      <div className="flex items-center justify-between border-t border-b px-4 py-2 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span>{post._count.reactions} reactions</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{post._count.comments} comments</span>
          {post._count.views && <span>{post._count.views} views</span>}
        </div>
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between p-2">
        <div className="relative">
          <button
            className="flex items-center rounded-full px-3 py-2 hover:bg-muted"
            onClick={() => setShowReactions(!showReactions)}
          >
            <Heart className="mr-2 h-5 w-5" />
            <span>React</span>
          </button>
          
          {showReactions && (
            <div className="absolute left-0 bottom-full z-10 mb-2 flex rounded-full border bg-card p-1 shadow-lg">
              <button
                onClick={() => handleToggleReaction("LIKE")}
                className="rounded-full p-2 hover:bg-muted"
                title="Like"
              >
                <ThumbsUp className="h-5 w-5 text-blue-500" />
              </button>
              <button
                onClick={() => handleToggleReaction("LOVE")}
                className="rounded-full p-2 hover:bg-muted"
                title="Love"
              >
                <Heart className="h-5 w-5 text-red-500" />
              </button>
              <button
                onClick={() => handleToggleReaction("HAHA")}
                className="rounded-full p-2 hover:bg-muted"
                title="Haha"
              >
                <Laugh className="h-5 w-5 text-yellow-500" />
              </button>
              <button
                onClick={() => handleToggleReaction("WOW")}
                className="rounded-full p-2 hover:bg-muted"
                title="Wow"
              >
                <Sparkles className="h-5 w-5 text-purple-500" />
              </button>
              <button
                onClick={() => handleToggleReaction("SAD")}
                className="rounded-full p-2 hover:bg-muted"
                title="Sad"
              >
                <HeartCrack className="h-5 w-5 text-orange-500" />
              </button>
              <button
                onClick={() => handleToggleReaction("ANGRY")}
                className="rounded-full p-2 hover:bg-muted"
                title="Angry"
              >
                <Flame className="h-5 w-5 text-red-600" />
              </button>
            </div>
          )}
        </div>
        
        <Link
          href={`/post/${post.id}`}
          className="flex items-center rounded-full px-3 py-2 hover:bg-muted"
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          <span>Comment</span>
        </Link>
        
        <button
          className="flex items-center rounded-full px-3 py-2 hover:bg-muted"
          onClick={handleSharePost}
        >
          <Share className="mr-2 h-5 w-5" />
          <span>Share</span>
        </button>
        
        <button
          className="flex items-center rounded-full px-3 py-2 hover:bg-muted"
          onClick={handleSavePost}
        >
          <Bookmark className="mr-2 h-5 w-5" />
          <span>Save</span>
        </button>
      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && post.aiAnalysis && (
        <PostAnalysisModal
          post={post}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
}