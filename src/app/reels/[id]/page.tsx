'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { api } from '@/lib/api/trpc/client';
import { Button } from '@/components/ui/button';
import ReelItem from '@/components/reels/ReelItem';

interface ReelDetailsPageProps {
  params: {
    id: string;
  };
}

export default function ReelDetailsPage({ params }: ReelDetailsPageProps) {
  const router = useRouter();
  const { id } = params;

  const { data: reel, isLoading, error } = api.reels.getById.useQuery({ id });
  
  // Record view when reel is viewed
  const viewMutation = api.reels.recordView.useMutation();
  
  useEffect(() => {
    if (reel?.id) {
      viewMutation.mutate({ reelId: reel.id });
    }
  }, [reel?.id]);

  return (
    <main className="relative w-full min-h-[100dvh] bg-black">
      <div className="sticky top-0 z-20 bg-transparent">
        <div className="container px-4 py-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="w-full flex justify-center">
        {isLoading ? (
          <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-white/70">Loading reel...</p>
          </div>
        ) : error ? (
          <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
            <p className="text-white/70">Reel not found or was removed</p>
            <Button 
              variant="outline" 
              className="bg-transparent text-white border-white/20 hover:bg-white/20"
              onClick={() => router.push('/reels')}
            >
              Back to reels
            </Button>
          </div>
        ) : reel ? (
          <div className="w-full max-w-md h-[calc(100dvh-60px)]">
            <ReelItem 
              reel={reel} 
              isActive={true} 
              isSingleView={true}
              onShare={(id) => {
                if (navigator.share) {
                  navigator.share({
                    title: reel.caption || 'Check out this reel on DapDip',
                    text: reel.caption || 'Check out this reel on DapDip',
                    url: `${window.location.origin}/reels/${id}`,
                  });
                } else {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(`${window.location.origin}/reels/${id}`);
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}