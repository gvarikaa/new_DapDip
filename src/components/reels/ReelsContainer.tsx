"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/trpc/client";
import { ReelWithAuthor } from "@/types/reels";
import ReelItem from "./ReelItem";
import ReelsSkeleton from "./ReelsSkeleton";

interface ReelsContainerProps {
  initialReels?: ReelWithAuthor[];
  userId?: string; // For profile reels
  tag?: string; // For tag-based reels
  trending?: boolean; // For trending reels
}

export default function ReelsContainer({
  initialReels,
  userId,
  tag,
  trending = false,
}: ReelsContainerProps): JSX.Element {
  const { data: session } = useSession();
  const [activeIndex, setActiveIndex] = useState(0);
  const [reels, setReels] = useState<ReelWithAuthor[]>(initialReels || []);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollY = useRef<number>(0);
  const prevTouchY = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set up query based on props
  const queryFn = userId
    ? api.reel.getUserReels
    : tag
    ? api.reel.getByTag
    : trending
    ? api.reel.getTrending
    : api.reel.getFeed;

  // Query hook based on type
  const query = trending
    ? api.reel.getTrending.useQuery(
        { limit: 10, timeframe: "week" },
        { enabled: trending }
      )
    : tag
    ? api.reel.getByTag.useInfiniteQuery(
        { tag, limit: 10 },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          enabled: !!tag,
        }
      )
    : userId
    ? api.reel.getUserReels.useInfiniteQuery(
        { userId, limit: 10 },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          enabled: !!userId,
        }
      )
    : api.reel.getFeed.useInfiniteQuery(
        { limit: 10 },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      );

  const { ref: loadMoreRef } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      setIsIntersecting(inView);
    },
  });

  // Update reels from query data
  useEffect(() => {
    if (query.data) {
      if ("pages" in query.data) {
        // Infinite query
        const flattenedReels = query.data.pages.flatMap((page) => page.reels);
        setReels(flattenedReels);
        const lastPage = query.data.pages[query.data.pages.length - 1];
        setNextCursor(lastPage.nextCursor);
      } else if ("reels" in query.data) {
        // Regular query (trending)
        setReels(query.data.reels);
      }
    }
  }, [query.data]);

  // Load more when reaching the end
  useEffect(() => {
    if (isIntersecting && nextCursor && !query.isFetchingNextPage && !trending) {
      if ("fetchNextPage" in query) {
        query.fetchNextPage();
      }
    }
  }, [isIntersecting, nextCursor, query]);

  // Scroll snap effect and active reel detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = (): void => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const reelHeight = container.clientHeight;
        const newIndex = Math.round(scrollTop / reelHeight);
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
          setActiveIndex(newIndex);
        }

        // Scrolling direction detection
        const direction = scrollTop > prevScrollY.current ? "down" : "up";
        prevScrollY.current = scrollTop;

        // Snap to nearest reel
        const targetScroll = newIndex * reelHeight;
        if (Math.abs(scrollTop - targetScroll) > 10) {
          container.scrollTo({
            top: targetScroll,
            behavior: "smooth",
          });
        }
      }, 100);
    };

    // Touch handling for mobile
    const handleTouchStart = (e: TouchEvent): void => {
      prevTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (prevTouchY.current === null) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = prevTouchY.current - currentY;
      const sensitivity = 50; // Adjust sensitivity as needed
      
      if (Math.abs(deltaY) > sensitivity) {
        const direction = deltaY > 0 ? "down" : "up";
        const newIndex = direction === "down" 
          ? Math.min(activeIndex + 1, reels.length - 1)
          : Math.max(activeIndex - 1, 0);
        
        if (newIndex !== activeIndex) {
          container.scrollTo({
            top: newIndex * container.clientHeight,
            behavior: "smooth",
          });
          setActiveIndex(newIndex);
        }
        
        // Reset touch position
        prevTouchY.current = null;
      }
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [reels.length, activeIndex]);

  if (query.isLoading && reels.length === 0) {
    return <ReelsSkeleton />;
  }

  if (reels.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <h3 className="text-xl font-semibold">No Reels Found</h3>
        <p className="mt-2 text-muted-foreground">
          {tag
            ? `No reels found with tag #${tag}`
            : userId
            ? "This user hasn't posted any reels yet"
            : "No reels available right now"}
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="hide-scrollbar relative h-screen w-full snap-y snap-mandatory overflow-y-scroll"
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className="h-screen w-full snap-start snap-always"
        >
          <ReelItem 
            reel={reel} 
            isActive={index === activeIndex}
            onLike={() => {
              // Update like status optimistically
              setReels(prev => 
                prev.map(r => 
                  r.id === reel.id
                    ? { ...r, isLiked: !r.isLiked }
                    : r
                )
              );
            }}
          />
        </div>
      ))}
      
      {/* Load more indicator */}
      {!trending && (
        <div 
          ref={loadMoreRef}
          className="flex h-20 w-full items-center justify-center"
        >
          {query.isFetchingNextPage && (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Loading indicator for initial load */}
      {isLoading && reels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}