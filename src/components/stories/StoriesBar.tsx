import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { api } from '@/lib/api/trpc/client';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { Story, StoryHighlight } from '@/types/stories';
import StoryViewer from './StoryViewer';

interface StoriesBarProps {
  className?: string;
  includeCreateStory?: boolean;
  showHighlights?: boolean;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ 
  className,
  includeCreateStory = true,
  showHighlights = false,
}) => {
  const router = useRouter();
  const [viewingStories, setViewingStories] = useState<Story[]>([]);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);
  const [viewingHighlight, setViewingHighlight] = useState<StoryHighlight | null>(null);
  
  // Fetch stories feed with active stories
  const { data: storiesData, isLoading } = api.story.getFeed.useQuery({
    limit: 20,
    filters: {
      includeExpired: false,
    },
  }, {
    refetchOnWindowFocus: false,
  });
  
  // Group stories by user
  const userStories = React.useMemo(() => {
    if (!storiesData?.stories) return new Map();
    
    const storyMap = new Map<string, { user: any; stories: Story[] }>();
    
    storiesData.stories.forEach(story => {
      if (!story.author) return;
      
      if (!storyMap.has(story.author.id)) {
        storyMap.set(story.author.id, {
          user: story.author,
          stories: [],
        });
      }
      
      storyMap.get(story.author.id)!.stories.push(story);
    });
    
    return storyMap;
  }, [storiesData]);
  
  // Handle opening story viewer
  const openStories = (userId: string, initialStoryIndex = 0) => {
    const userStoryGroup = userStories.get(userId);
    if (!userStoryGroup) return;
    
    setViewingStories(userStoryGroup.stories);
    setViewingUserId(userId);
    setViewingStoryIndex(initialStoryIndex);
  };
  
  // Handle creating a new story
  const handleCreateStory = () => {
    router.push('/stories/create');
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div className="relative max-w-full overflow-x-auto overflow-y-hidden py-2 px-4">
        <div className="flex gap-3">
          {/* Create Story button */}
          {includeCreateStory && (
            <div className="flex flex-col items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full relative border-dashed hover:border-primary hover:border-dashed" 
                onClick={handleCreateStory}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
              </Button>
              <span className="text-xs mt-1.5 max-w-16 truncate">Create</span>
            </div>
          )}
          
          {/* Story loading skeletons */}
          {isLoading && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-2 w-12 mt-2" />
                </div>
              ))}
            </>
          )}
          
          {/* User stories */}
          {!isLoading && Array.from(userStories.entries()).map(([userId, { user, stories }]) => (
            <div key={userId} className="flex flex-col items-center">
              <button 
                className="relative p-0.5 rounded-full focus:outline-none"
                onClick={() => openStories(userId)}
              >
                {/* Story ring */}
                <div className={cn(
                  "absolute inset-0 rounded-full p-0.5",
                  stories.some(s => !s.isViewed) 
                    ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500" 
                    : "bg-muted"
                )} />
                
                <Avatar className="h-16 w-16 ring-2 ring-background">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
              </button>
              <span className="text-xs mt-1.5 max-w-16 truncate">{user.name}</span>
            </div>
          ))}
          
          {/* Story highlights (optional) */}
          {showHighlights && (
            // Highlight avatars would go here
            <></>
          )}
        </div>
      </div>
      
      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewingStories.length > 0 && viewingUserId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <StoryViewer
              stories={viewingStories}
              initialStoryIndex={viewingStoryIndex}
              userId={viewingUserId}
              onClose={() => {
                setViewingStories([]);
                setViewingUserId(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesBar;