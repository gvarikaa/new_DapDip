"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { api } from "@/lib/trpc/client";
import PostCard from "@/components/post/PostCard";

interface SavedPostsProps {
  userId: string;
}

export default function SavedPosts({ userId }: SavedPostsProps): JSX.Element {
  const { data: session } = useSession();
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<any[]>([]);
  
  const isCurrentUser = session?.user?.id === userId;

  // Only fetch saved posts for the current user
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = api.post.getSavedPosts.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      enabled: isCurrentUser,
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

  // If not the current user, show a privacy message
  if (!isCurrentUser) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Private content</h3>
        <p className="mt-2 text-muted-foreground">
          Saved posts are only visible to the user who saved them.
        </p>
      </div>
    );
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
        <h3 className="text-lg font-medium">No saved posts</h3>
        <p className="mt-2 text-muted-foreground">
          You haven&apos;t saved any posts yet. Browse the 
          <Link href="/explore" className="mx-1 text-primary">
            explore page
          </Link>
          to find interesting content.
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