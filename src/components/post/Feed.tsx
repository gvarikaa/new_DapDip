import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/trpc/client";
import PostCard from "./PostCard";

export default function Feed(): JSX.Element {
  const [posts, setPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const { ref, inView } = useInView();

  const { data, isLoading, isFetchingNextPage, fetchNextPage } =
    api.post.getFeed.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        onSuccess: (data) => {
          const flattened = data.pages.flatMap((page) => page.posts);
          setPosts(flattened);
          setNextCursor(data.pages[data.pages.length - 1].nextCursor);
        },
      }
    );

  // Fetch next page when scroll reaches the bottom
  if (inView && nextCursor && !isFetchingNextPage) {
    fetchNextPage();
  }

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (!data || posts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="mt-2 text-muted-foreground">
          Be the first to create a post or follow more people
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {nextCursor && (
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

function FeedSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card shadow">
          <div className="flex items-center space-x-4 p-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div>
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="mt-2 h-3 w-24 rounded bg-muted" />
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="mt-2 h-4 w-full rounded bg-muted" />
            <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
          </div>
          <div className="aspect-video w-full bg-muted" />
          <div className="flex justify-between border-t border-b p-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="flex justify-between p-2">
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}