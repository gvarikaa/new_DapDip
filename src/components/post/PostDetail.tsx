"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  Heart, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  AlertTriangle,
  Sparkles,
  Loader2,
  ArrowLeft
} from "lucide-react";

import { api } from "@/lib/trpc/client";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import PostAnalysisModal from "./PostAnalysisModal";
import PostMedia from "./PostMedia";
import PostReactions from "./PostReactions";

interface PostDetailProps {
  postId: string;
}

export default function PostDetail({ postId }: PostDetailProps): JSX.Element {
  const { data: session } = useSession();
  const [showOptions, setShowOptions] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { data: post, isLoading } = api.post.getById.useQuery(
    { id: postId },
    {
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const utils = api.useUtils();
  
  const deletePostMutation = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getFeed.invalidate();
      if (post?.authorId) {
        utils.post.getUserPosts.invalidate({ userId: post.authorId });
      }
      window.location.href = "/";
    },
  });

  const savePostMutation = api.post.savePost.useMutation({
    onSuccess: () => {
      utils.post.getSavedPosts.invalidate();
    },
  });

  const handleDelete = (): void => {
    if (!session?.user || session.user.id !== post?.authorId) return;
    
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ id: postId });
    }
  };

  const handleSave = (): void => {
    if (!session?.user) return;
    savePostMutation.mutate({ postId });
  };

  const handleShare = (): void => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow">
        <h3 className="text-lg font-medium">Post not found</h3>
        <p className="mt-2 text-muted-foreground">
          The post you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const isAuthor = session?.user?.id === post.authorId;

  return (
    <div className="rounded-lg border bg-card shadow">
      {/* Back button */}
      <div className="border-b p-4">
        <Link 
          href="/"
          className="inline-flex items-center text-sm font-medium hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to feed
        </Link>
      </div>
      
      {/* Post header */}
      <div className="flex items-center justify-between p-4">
        <Link 
          href={`/profile/${post.author.id}`} 
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
                  handleShare();
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
                      handleDelete();
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
        <p className="whitespace-pre-line text-lg">{post.content}</p>
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
      <div className="border-t px-4 py-3">
        <PostReactions post={post} />
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between border-t p-4">
        <button
          className="flex items-center rounded-full px-4 py-2 font-medium hover:bg-muted"
          onClick={handleSave}
        >
          <Bookmark className="mr-2 h-5 w-5" />
          Save
        </button>
        
        <button
          className="flex items-center rounded-full px-4 py-2 font-medium hover:bg-muted"
          onClick={handleShare}
        >
          <Share className="mr-2 h-5 w-5" />
          Share
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