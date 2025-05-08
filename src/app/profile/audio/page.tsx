'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, FileText, Calendar, ArrowDown, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/format';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Skeleton } from '@/components/ui/skeleton';

export default function AudioArchivePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Search audio messages
  const { data: searchResults, isLoading: isSearching } = api.audio.search.useQuery(
    { query: searchQuery, limit: 20 },
    { 
      enabled: searchQuery.length > 0,
      keepPreviousData: true,
    }
  );
  
  // Get user's audio messages (chats and comments)
  const { data: allMessages, isLoading: isLoadingMessages } = api.audio.getMessages.useQuery(
    { limit: 100, chatId: 'all' }, // 'all' is a special case in our back-end
    { enabled: searchQuery.length === 0 }
  );
  
  // Filter and sort messages
  const displayMessages = searchQuery ? searchResults?.items : allMessages?.items || [];
  
  // Sort messages
  const sortedMessages = [...(displayMessages || [])].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'duration') {
      return b.duration - a.duration;
    }
    return 0;
  });
  
  // Group messages by date
  const messagesByDate = sortedMessages.reduce((acc, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof sortedMessages>);
  
  // Sort dates
  const sortedDates = Object.keys(messagesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Audio Archive</h1>
      </div>
      
      <div className="space-y-6">
        {/* Search and filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search transcriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
              </SelectItem>
              <SelectItem value="duration">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Audio messages */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Audio</TabsTrigger>
            <TabsTrigger value="chats">Chat Messages</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="transcribed">Transcribed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6 mt-4">
            {isSearching || isLoadingMessages ? (
              // Loading state
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <div className="space-y-2">
                      {Array.from({ length: 2 }).map((_, j) => (
                        <Skeleton key={j} className="h-24 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedDates.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h2 className="mt-4 text-lg font-medium">No audio messages found</h2>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "You haven't sent any audio messages yet"}
                </p>
              </div>
            ) : (
              // Messages by date
              sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                  <h2 className="font-medium text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(date)}
                  </h2>
                  
                  <div className="space-y-3">
                    {messagesByDate[date].map((message) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <AudioPlayer audioMessage={message} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="chats" className="space-y-6 mt-4">
            {/* Filter only chat messages - logic would be similar */}
            <div className="text-center py-12">
              <h2 className="mt-4 text-lg font-medium">Chat Audio Messages</h2>
              <p className="text-muted-foreground mt-1">
                View and search your chat audio messages
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-6 mt-4">
            {/* Filter only comment messages - logic would be similar */}
            <div className="text-center py-12">
              <h2 className="mt-4 text-lg font-medium">Audio Comments</h2>
              <p className="text-muted-foreground mt-1">
                View and search your audio comments
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="transcribed" className="space-y-6 mt-4">
            {/* Filter only transcribed messages - logic would be similar */}
            <div className="text-center py-12">
              <h2 className="mt-4 text-lg font-medium">Transcribed Audio</h2>
              <p className="text-muted-foreground mt-1">
                View and search your transcribed audio messages
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Load more button */}
        {(searchResults?.nextCursor || allMessages?.nextCursor) && (
          <div className="flex justify-center mt-6">
            <Button variant="outline">
              <ArrowDown className="h-4 w-4 mr-2" />
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}