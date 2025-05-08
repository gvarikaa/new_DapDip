import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

import PostCard from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export async function FeaturedPosts() {
  // Fetch featured posts directly from the server
  const featuredPosts = await prisma.post.findMany({
    where: {
      privacyLevel: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          reactions: true,
          views: true,
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Featured Posts</h2>
      
      <div className="grid gap-4">
        {featuredPosts.map((post) => (
          <Suspense key={post.id} fallback={<PostSkeleton />}>
            <PostCard post={post} />
          </Suspense>
        ))}
      </div>
    </div>
  );
}

export async function TrendingTopics() {
  // Fetch trending topics from the server
  const trendingTopics = await prisma.topic.findMany({
    orderBy: {
      interests: {
        _count: "desc",
      },
    },
    take: 5,
    include: {
      _count: {
        select: {
          posts: true,
          interests: true,
        },
      },
    },
  });

  return (
    <div className="rounded-lg border bg-card p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold">Trending Topics</h2>
      
      <div className="space-y-2">
        {trendingTopics.map((topic) => (
          <div 
            key={topic.id}
            className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
          >
            <span className="font-medium">{topic.name}</span>
            <span className="text-sm text-muted-foreground">
              {topic._count.posts} posts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow">
      <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="mt-2 h-3 w-24 rounded" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="mt-2 h-4 w-full rounded" />
        <Skeleton className="mt-2 h-4 w-2/3 rounded" />
      </div>
      <Skeleton className="aspect-video w-full" />
      <div className="flex justify-between border-t border-b p-4">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <div className="flex justify-between p-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}