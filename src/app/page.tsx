import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import CreatePostForm from "@/components/post/CreatePostForm";
import Feed from "@/components/post/Feed";

export default function HomePage(): JSX.Element {
  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <CreatePostForm />
        
        <Suspense fallback={<FeedSkeleton />}>
          <Feed />
        </Suspense>
      </div>
    </MainLayout>
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
