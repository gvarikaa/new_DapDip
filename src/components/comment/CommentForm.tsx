"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Send } from "lucide-react";
import Image from "next/image";

import { api } from "@/lib/trpc/client";
import { getInitials } from "@/lib/utils";
import { CommentCreateInput } from "@/lib/validations/comment";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded: (comment: any) => void;
  onCancel?: () => void;
}

export default function CommentForm({
  postId,
  parentId,
  onCommentAdded,
  onCancel,
}: CommentFormProps): JSX.Element {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();
  const createComment = api.comment.create.useMutation({
    onSuccess: (newComment) => {
      setContent("");
      setIsSubmitting(false);
      onCommentAdded(newComment);
      
      // Invalidate queries to refetch data
      utils.comment.getForPost.invalidate({ postId });
      if (parentId) {
        utils.comment.getReplies.invalidate({ commentId: parentId });
      }
    },
    onError: (error) => {
      alert(`Error creating comment: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!session?.user || !content.trim()) return;
    
    setIsSubmitting(true);
    
    const commentData: CommentCreateInput = {
      content: content.trim(),
      postId,
      ...(parentId && { parentId }),
    };
    
    createComment.mutate(commentData);
  };

  if (!session?.user) {
    return <></>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start space-x-3 rounded-lg border bg-card p-4 shadow"
    >
      <div className="h-8 w-8 overflow-hidden rounded-full">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
            {getInitials(session.user.name || "User")}
          </div>
        )}
      </div>
      
      <div className="relative flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="h-20 w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        />
        
        <div className="mt-2 flex items-center justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-3 py-1 text-sm font-medium hover:bg-muted"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="flex items-center rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {parentId ? "Reply" : "Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}