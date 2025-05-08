"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/trpc/client";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import NoCommentsPlaceholder from "./NoCommentsPlaceholder";

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps): JSX.Element {
  const { data: session } = useSession();
  const { ref, inView } = useInView();
  const [comments, setComments] = useState<any[]>([]);
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = api.comment.getForPost.useInfiniteQuery(
    {
      postId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      onSuccess: (data) => {
        const flattened = data.pages.flatMap((page) => page.comments);
        setComments(flattened);
      },
    }
  );

  // Fetch next page when scroll reaches the bottom
  if (inView && data?.pages[data.pages.length - 1].nextCursor && !isFetchingNextPage) {
    fetchNextPage();
  }

  const handleNewComment = (newComment: any): void => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {session ? (
        <CommentForm postId={postId} onCommentAdded={handleNewComment} />
      ) : (
        <div className="rounded-lg border bg-card p-4 text-center shadow">
          <p className="text-muted-foreground">
            Sign in to join the conversation
          </p>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <NoCommentsPlaceholder />
        ) : (
          <>
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
            
            {data?.pages[data.pages.length - 1].nextCursor && (
              <div
                ref={ref}
                className="flex items-center justify-center p-4"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="h-8" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}