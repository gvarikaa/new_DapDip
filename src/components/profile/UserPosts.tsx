"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { api } from "@/lib/trpc/client";
import PostCard from "@/components/post/PostCard";

interface UserPostsProps {
  userId: string;
}

export default function UserPosts({ userId }: UserPostsProps): JSX.Element {
  const { data: session } = useSession();
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<any[]>([]);
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = api.post.getUserPosts.useInfiniteQuery(
    {
      userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      onSuccess: (data) => {
        const flattened = data.pages.flatMap((page) => page.posts);
        setPosts(flattened);
      },
    }
  );

  // Fetch next page when scroll reaches the bottom
  if (inView && data?.pages[data.pages.length - 1].nextCursor && !isFetchingNextPage) {
    fetchNextPage();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || posts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="mt-2 text-muted-foreground">
          {session?.user?.id === userId
            ? "Create your first post to get started!"
            : "This user hasn't posted anything yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {data.pages[data.pages.length - 1].nextCursor && (
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
    </div>
  );
}