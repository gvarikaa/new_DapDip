'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatTimeAgo } from '@/lib/utils';
import { api } from '@/lib/api/trpc/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Eye, Clock, Share2, ArrowLeft } from 'lucide-react';
import StoryViewer from '@/components/stories/StoryViewer';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  const { id } = params;
  const router = useRouter();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const { data: story, isLoading, error } = api.story.getById.useQuery({ id });
  
  // Force redirect if story has expired or doesn't exist
  useEffect(() => {
    if (error?.data?.code === 'NOT_FOUND' || 
       (story && story.hasExpired)) {
      router.push('/stories');
    }
  }, [story, error, router]);
  
  // Open viewer immediately if the story exists and isn't expired
  useEffect(() => {
    if (story && !story.hasExpired && !isViewerOpen) {
      setIsViewerOpen(true);
    }
  }, [story, isViewerOpen]);

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" className="p-0 h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Story</h1>
        </div>
        
        <div className="w-full max-w-lg mx-auto">
          <div className="aspect-[9/16] rounded-lg overflow-hidden relative">
            <Skeleton className="absolute inset-0" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!story || error) {
    return (
      <div className="container max-w-5xl py-12 text-center">
        <h1 className="text-xl font-bold mb-2">Story not found</h1>
        <p className="text-muted-foreground mb-6">
          This story may have expired or been deleted.
        </p>
        <Button onClick={() => router.push('/stories')}>
          Back to Stories
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="p-0 h-9 w-9"
          onClick={() => router.push('/stories')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Story</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full max-w-md mx-auto">
          <div 
            className="aspect-[9/16] rounded-lg overflow-hidden relative cursor-pointer"
            onClick={() => setIsViewerOpen(true)}
          >
            {story.mediaType === 'IMAGE' ? (
              <img 
                src={story.mediaUrl} 
                alt="Story" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : story.mediaType === 'VIDEO' ? (
              <video 
                src={story.mediaUrl} 
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                loop
                autoPlay
              />
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center text-white text-center p-6"
                style={{ backgroundColor: story.backgroundColor || '#3B82F6' }}
              >
                {story.textOverlays && story.textOverlays.length > 0 ? (
                  story.textOverlays.map((overlay, index) => (
                    <div 
                      key={index}
                      className="text-4xl font-bold"
                      style={{
                        position: 'absolute',
                        left: `${overlay.position.x}%`,
                        top: `${overlay.position.y}%`,
                        transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                        color: overlay.color,
                        fontFamily: overlay.fontFamily,
                        fontSize: `${overlay.fontSize}px`,
                        backgroundColor: overlay.backgroundColor,
                        padding: overlay.padding ? `${overlay.padding}px` : undefined,
                        borderRadius: overlay.borderRadius ? `${overlay.borderRadius}px` : undefined,
                      }}
                    >
                      {overlay.text}
                    </div>
                  ))
                ) : (
                  <p className="text-2xl font-bold">{story.caption}</p>
                )}
              </div>
            )}
            
            {/* Play button overlay for videos */}
            {story.mediaType === 'VIDEO' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between">
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="flex gap-1.5">
                <Heart className="h-4 w-4" />
                <span>{story.reactionsCount || 0}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{story.responsesCount || 0}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{story.viewsCount || 0}</span>
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="flex gap-1.5">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={story.author?.image || undefined} />
              <AvatarFallback>{story.author?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-medium">{story.author?.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(story.createdAt)}
              </p>
            </div>
          </div>
          
          {story.caption && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-1">Caption</h2>
              <p>{story.caption}</p>
            </div>
          )}
          
          {story.location && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-1">Location</h2>
              <p>{story.location}</p>
            </div>
          )}
          
          {story.musicTitle && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-1">Music</h2>
              <p>
                {story.musicTitle}
                {story.musicArtist && ` • ${story.musicArtist}`}
              </p>
            </div>
          )}
          
          {story.topics && story.topics.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-1">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {story.topics.map(topic => (
                  <div key={topic.topic.id} className="px-3 py-1 bg-muted rounded-full text-xs">
                    {topic.topic.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="rounded-lg border overflow-hidden mt-6">
            <div className="bg-muted p-3 border-b">
              <h3 className="font-medium">Story Stats</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{story.viewsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{story.reactionsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Reactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{story.responsesCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Responses</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              className="w-full"
              onClick={() => setIsViewerOpen(true)}
            >
              View Story
            </Button>
          </div>
        </div>
      </div>
      
      {/* Story Viewer */}
      {isViewerOpen && (
        <StoryViewer
          stories={[story]}
          initialStoryIndex={0}
          userId={story.authorId}
          onClose={() => {
            setIsViewerOpen(false);
          }}
        />
      )}
    </div>
  );
}