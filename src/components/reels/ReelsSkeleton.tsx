import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReelsSkeletonProps {
  count?: number;
}

export const ReelsSkeleton = ({ count = 1 }: ReelsSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="relative w-full h-[100vh] snap-start snap-always flex items-center justify-center bg-gray-950"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
          </div>
          
          {/* User info placeholder */}
          <div className="absolute bottom-24 left-4 z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          
          {/* Interaction buttons placeholder */}
          <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-5 h-5 text-gray-400" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-5 h-5 text-gray-400" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Progress bar placeholder */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-4">
            <Skeleton className="h-1 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
};

export default ReelsSkeleton;