"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContentRecommendations(): JSX.Element {
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get trending topics
  const { data: trendingTopics } = api.ai.getTrendingTopics.useQuery(
    undefined,
    { 
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  // Generate content suggestions
  const generateSuggestions = api.ai.generatePostSuggestions.useMutation({
    onSuccess: (data) => {
      setSuggestions(data);
      setIsGenerating(false);
    },
    onError: (err) => {
      setError(err.message);
      setIsGenerating(false);
    },
  });

  const handleGenerate = async (): Promise<void> => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    generateSuggestions.mutate({ topic: topic.trim() });
  };

  const handleTopicClick = (topic: string): void => {
    setTopic(topic);
  };

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Suggestions</CardTitle>
          <CardDescription>
            Sign in to get AI-powered content suggestions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          AI Content Suggestions
        </CardTitle>
        <CardDescription>
          Let AI help you create engaging content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Topic selection */}
        <div className="space-y-2">
          <label htmlFor="topic" className="text-sm font-medium">
            What would you like to post about?
          </label>
          
          <div className="flex space-x-2">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            
            <Button 
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Ideas"
              )}
            </Button>
          </div>
        </div>
        
        {/* Trending topics */}
        {trendingTopics?.topics && trendingTopics.topics.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Trending topics:</p>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.topics.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleTopicClick(item.topic)}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                >
                  {item.topic}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Suggested posts:</h3>
            
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="rounded-md border bg-card p-3"
              >
                <h4 className="font-medium">{suggestion.title}</h4>
                <p className="mt-1 text-sm">{suggestion.content}</p>
                
                {suggestion.hashtags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {suggestion.hashtags.map((tag: string, i: number) => (
                      <span 
                        key={i}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 flex justify-end space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="sr-only">Dislike</span>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="sr-only">Like</span>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8"
                    onClick={() => {
                      // Copy suggestion to clipboard
                      navigator.clipboard.writeText(suggestion.content);
                    }}
                  >
                    Copy
                  </Button>
                  
                  <Button 
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      // Open create post page with prefilled content
                      // This would be implemented in a real app
                      window.location.href = `/?content=${encodeURIComponent(suggestion.content)}`;
                    }}
                  >
                    Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          AI-generated content may require editing before posting.
        </p>
      </CardFooter>
    </Card>
  );
}