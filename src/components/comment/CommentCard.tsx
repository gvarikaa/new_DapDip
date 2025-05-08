"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Trash, 
  Edit,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { api } from "@/lib/trpc/client";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import CommentForm from "./CommentForm";
import { Comment, User } from "@prisma/client";

interface CommentCardProps {
  comment: Comment & {
    author: User;
    _count: {
      replies: number;
      reactions: number;
    };
  };
}

export default function CommentCard({ comment }: CommentCardProps): JSX.Element {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const utils = api.useUtils();
  
  // Delete comment mutation
  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => {
      utils.comment.getForPost.invalidate({ postId: comment.postId });
      if (comment.parentId) {
        utils.comment.getReplies.invalidate({ commentId: comment.parentId });
      }
    },
  });

  // Toggle reaction mutation
  const toggleReaction = api.comment.toggleReaction.useMutation({
    onSuccess: () => {
      utils.comment.getForPost.invalidate({ postId: comment.postId });
    },
  });

  const handleDelete = (): void => {
    if (!session?.user || session.user.id !== comment.authorId) return;
    
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate({ id: comment.id });
    }
  };

  const handleToggleLike = (): void => {
    if (!session?.user) return;
    toggleReaction.mutate({ commentId: comment.id, type: "LIKE" });
  };

  const handleNewReply = (newReply: any): void => {
    setReplies((prev) => [newReply, ...prev]);
    setShowReplyForm(false);
    
    // Auto-expand replies when a new one is added
    if (!isExpanded) {
      handleLoadReplies();
    }
  };

  const handleLoadReplies = async (): Promise<void> => {
    if (comment._count.replies === 0) return;
    
    setIsLoadingReplies(true);
    setIsExpanded(true);
    
    try {
      const result = await utils.client.comment.getReplies.query({
        commentId: comment.id,
        limit: 100, // Load all replies for simplicity
      });
      
      setReplies(result.replies);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const isAuthor = session?.user?.id === comment.authorId;

  return (
    <div className="space-y-2">
      <div className="rounded-lg border bg-card p-4 shadow">
        <div className="flex justify-between">
          <div className="flex space-x-3">
            <Link href={`/profile/${comment.authorId}`}>
              <div className="h-8 w-8 overflow-hidden rounded-full">
                {comment.author.image ? (
                  <Image
                    src={comment.author.image}
                    alt={comment.author.name || "User"}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    {getInitials(comment.author.name || "User")}
                  </div>
                )}
              </div>
            </Link>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/profile/${comment.authorId}`}
                  className="font-medium hover:underline"
                >
                  {comment.author.name || "Anonymous User"}
                </Link>
                
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(new Date(comment.createdAt))}
                  {comment.updatedAt > comment.createdAt && " (edited)"}
                </span>
              </div>
              
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    className="h-20 w-full resize-none rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={comment.content}
                    // This would be connected to a state in a real app
                    readOnly
                  />
                  
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-md px-3 py-1 text-sm font-medium hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would save the edit
                        setIsEditing(false);
                      }}
                      className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          </div>
          
          {/* Comment options */}
          {isAuthor && !isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border bg-card shadow-lg">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowOptions(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowOptions(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment actions */}
        <div className="mt-4 flex items-center space-x-3 text-xs">
          <button
            onClick={handleToggleLike}
            className="flex items-center space-x-1 rounded-md px-2 py-1 hover:bg-muted"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{comment._count.reactions || 0}</span>
          </button>
          
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center space-x-1 rounded-md px-2 py-1 hover:bg-muted"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-8">
          <CommentForm
            postId={comment.postId}
            parentId={comment.id}
            onCommentAdded={handleNewReply}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Show replies */}
      {comment._count.replies > 0 && !isExpanded && (
        <button
          onClick={handleLoadReplies}
          className="ml-8 flex items-center text-sm text-primary hover:underline"
        >
          <ChevronDown className="mr-1 h-4 w-4" />
          Show {comment._count.replies} {comment._count.replies === 1 ? "reply" : "replies"}
        </button>
      )}

      {/* Hide replies */}
      {isExpanded && replies.length > 0 && (
        <button
          onClick={() => setIsExpanded(false)}
          className="ml-8 flex items-center text-sm text-primary hover:underline"
        >
          <ChevronUp className="mr-1 h-4 w-4" />
          Hide replies
        </button>
      )}

      {/* Replies */}
      {isLoadingReplies ? (
        <div className="ml-8 flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        isExpanded && (
          <div className="ml-8 space-y-2">
            {replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} />
            ))}
          </div>
        )
      )}
    </div>
  );
}