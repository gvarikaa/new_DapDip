'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api/trpc/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoriesBar from '@/components/stories/StoriesBar';

export default function StoriesPage() {
  const router = useRouter();
  
  // Get active stories for the current user
  const { data: myStories, isLoading: isLoadingMyStories } = api.story.getMyActiveStories.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  
  const handleCreateStory = () => {
    router.push('/stories/create');
  };

  return (
    <div className="container max-w-5xl py-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stories</h1>
        <Button onClick={handleCreateStory}>
          <Plus className="h-4 w-4 mr-2" />
          Create Story
        </Button>
      </div>
      
      <Tabs defaultValue="feed">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="feed">For You</TabsTrigger>
          <TabsTrigger value="mine">Your Stories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="mt-4">
          <StoriesBar includeCreateStory />
          
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold">All Stories</h2>
            <p className="text-muted-foreground mt-1">
              View the latest stories from everyone
            </p>
            
            {/* Grid view of all stories would go here */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Story cards would go here */}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mine" className="mt-4">
          {isLoadingMyStories ? (
            <div className="text-center py-12">
              <p>Loading your stories...</p>
            </div>
          ) : !myStories || myStories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No active stories</h3>
              <p className="text-muted-foreground mt-1">
                Your stories will appear here for 24 hours
              </p>
              <Button 
                className="mt-4" 
                onClick={handleCreateStory}
              >
                Create Your First Story
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted p-4 border-b">
                  <h3 className="font-medium">Your Active Stories</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visible for 24 hours
                  </p>
                </div>
                
                <div className="p-4 space-y-4">
                  {myStories.map((story) => (
                    <div key={story.id} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-md bg-muted overflow-hidden">
                          {story.mediaType === 'IMAGE' ? (
                            <img 
                              src={story.thumbnailUrl || story.mediaUrl} 
                              alt="Story thumbnail" 
                              className="w-full h-full object-cover"
                            />
                          ) : story.mediaType === 'VIDEO' ? (
                            <video 
                              src={story.mediaUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: story.backgroundColor || '#3B82F6' }}
                            >
                              <span className="text-white text-xs font-medium">Text</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium">{story.mediaType}</p>
                          <p className="text-xs text-muted-foreground">
                            {story._count?.views || 0} views • Expires in {getExpiryTime(story.expiresAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/stories/${story.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted p-4 border-b">
                  <h3 className="font-medium">Story Stats</h3>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {myStories.reduce((sum, s) => sum + (s._count?.views || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {myStories.reduce((sum, s) => sum + (s._count?.reactions || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Reactions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {myStories.reduce((sum, s) => sum + (s._count?.responses || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Responses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to display human-readable expiry time
function getExpiryTime(expiryDate: Date) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}