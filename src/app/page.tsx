import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import CreatePostForm from "@/components/post/CreatePostForm";
import Feed from "@/components/post/Feed";
import { Metadata } from "next";

/**
 * Generate metadata for the home page
 * This function is called at build time and helps with SEO
 */
export const metadata: Metadata = {
  title: "Home",
  description: "Connect with friends and share your moments on DapDip social network",
  alternates: {
    canonical: "https://dapdip.com/",
  }
};

export default function HomePage(): JSX.Element {
  return (
    <MainLayout>
      <section className="mx-auto max-w-2xl space-y-6">
        <header className="sr-only">
          <h1>DapDip Home Feed</h1>
          <p>Connect with friends and share your moments</p>
        </header>
        
        <article aria-label="Create a new post">
          <CreatePostForm />
        </article>
        
        <section aria-label="Feed of posts">
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        </section>
      </section>
    </MainLayout>
  );
}

function FeedSkeleton(): JSX.Element {
  return (
    <div className="space-y-4" aria-label="Loading posts">
      {Array.from({ length: 3 }).map((_, i) => (
        <article key={i} className="rounded-lg border bg-card shadow" aria-busy="true" aria-label="Loading post">
          <div className="flex items-center space-x-4 p-4">
            <div className="h-10 w-10 rounded-full bg-muted" aria-label="Loading avatar" />
            <div>
              <div className="h-4 w-40 rounded bg-muted" aria-label="Loading name" />
              <div className="mt-2 h-3 w-24 rounded bg-muted" aria-label="Loading date" />
            </div>
          </div>
          <div className="px-4 pb-4" aria-label="Loading content">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="mt-2 h-4 w-full rounded bg-muted" />
            <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
          </div>
          <div className="aspect-video w-full bg-muted" aria-label="Loading media" />
          <div className="flex justify-between border-t border-b p-4" aria-label="Loading engagement stats">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="flex justify-between p-2" aria-label="Loading action buttons">
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
          </div>
        </article>
      ))}
    </div>
  );
}
