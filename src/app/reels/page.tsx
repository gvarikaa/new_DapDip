'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import ReelsContainer from '@/components/reels/ReelsContainer';
import ReelsSkeleton from '@/components/reels/ReelsSkeleton';

export default function ReelsPage() {
  return (
    <main className="relative w-full h-full bg-black">
      <Suspense fallback={<ReelsLoadingFallback />}>
        <ReelsContainer />
      </Suspense>
    </main>
  );
}

const ReelsLoadingFallback = () => {
  return (
    <div className="relative w-full h-[100vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading reels...</p>
      <div className="absolute inset-0 -z-10">
        <ReelsSkeleton />
      </div>
    </div>
  );
};