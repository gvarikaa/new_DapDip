"use client";

import { useState, useEffect } from "react";
import { Sparkles, BarChart, Tag, RefreshCcw, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentAnalysisProps {
  analysis: any;
  sentiment: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ContentAnalysisVisualizer({ 
  analysis, 
  sentiment,
  onRefresh,
  isRefreshing = false,
}: ContentAnalysisProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"overview" | "sentiment" | "topics">("overview");

  // Format sentiment as percentage
  const sentimentPercentage = Math.round((sentiment + 1) * 50); // -1 to 1 -> 0% to 100%
  
  // Get sentiment color
  const getSentimentColor = (): string => {
    if (sentiment > 0.3) return "bg-green-500";
    if (sentiment < -0.3) return "bg-red-500";
    return "bg-yellow-500";
  };
  
  // Get sentiment label
  const getSentimentLabel = (): string => {
    if (sentiment > 0.5) return "Very Positive";
    if (sentiment > 0.3) return "Positive";
    if (sentiment > -0.3) return "Neutral";
    if (sentiment > -0.5) return "Negative";
    return "Very Negative";
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
          <CardDescription>No analysis available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            AI Analysis
          </CardTitle>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="rounded-full p-1 hover:bg-muted"
              title="Refresh analysis"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
        <CardDescription>
          AI-powered insights about your content
        </CardDescription>
        
        {/* Tabs */}
        <div className="mt-4 flex border-b">
          <button
            className={`border-b-2 px-3 pb-2 text-sm font-medium ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent hover:text-foreground/80"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          
          <button
            className={`border-b-2 px-3 pb-2 text-sm font-medium ${
              activeTab === "sentiment"
                ? "border-primary text-primary"
                : "border-transparent hover:text-foreground/80"
            }`}
            onClick={() => setActiveTab("sentiment")}
          >
            Sentiment
          </button>
          
          <button
            className={`border-b-2 px-3 pb-2 text-sm font-medium ${
              activeTab === "topics"
                ? "border-primary text-primary"
                : "border-transparent hover:text-foreground/80"
            }`}
            onClick={() => setActiveTab("topics")}
          >
            Topics
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Tone */}
            <div>
              <h3 className="mb-1 text-sm font-medium">Tone:</h3>
              <div className="rounded-md bg-muted p-2.5 text-sm">
                {analysis.tone || "Not detected"}
              </div>
            </div>
            
            {/* Emotions */}
            {analysis.emotions && analysis.emotions.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Emotions:</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.emotions.map((emotion: string, index: number) => (
                    <span 
                      key={index}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Engagement prediction */}
            {analysis.engagement && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Predicted Engagement:</h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      analysis.engagement.toLowerCase().includes("high")
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : analysis.engagement.toLowerCase().includes("medium")
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {analysis.engagement.split(" ")[0]} {/* Just the level */}
                  </span>
                  <span className="text-sm">
                    {analysis.engagement.includes(" ")
                      ? analysis.engagement.substring(analysis.engagement.indexOf(" ") + 1)
                      : ""}
                  </span>
                </div>
              </div>
            )}
            
            {/* Suggestions */}
            {analysis.suggestions && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Suggestions:</h3>
                <div className="rounded-md bg-muted p-2.5 text-sm">
                  {analysis.suggestions}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sentiment tab */}
        {activeTab === "sentiment" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{getSentimentLabel()}</h3>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                Score: {sentiment.toFixed(2)}
              </span>
            </div>
            
            {/* Sentiment meter */}
            <div className="space-y-2">
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${getSentimentColor()}`}
                  style={{ width: `${sentimentPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>
            
            {/* Explanation */}
            <div className="rounded-md bg-muted p-3 text-sm">
              {sentiment > 0.3
                ? "Your content has a positive tone, which often leads to better engagement and reception."
                : sentiment < -0.3
                ? "Your content has a negative tone, which might affect how it's received. Consider adjusting for a more positive message if appropriate."
                : "Your content has a neutral tone, which can be appropriate for informational content but might not evoke strong emotional responses."}
            </div>
          </div>
        )}
        
        {/* Topics tab */}
        {activeTab === "topics" && (
          <div className="space-y-4">
            {/* Topics */}
            {analysis.topics && analysis.topics.length > 0 ? (
              <div>
                <h3 className="mb-2 text-sm font-medium">Detected Topics:</h3>
                <div className="space-y-1.5">
                  {analysis.topics.map((topic: string, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center rounded-md bg-muted p-2"
                    >
                      <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No specific topics detected
              </div>
            )}
            
            {/* Key themes */}
            {analysis.keyThemes && analysis.keyThemes.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Key Themes:</h3>
                <div className="space-y-1.5">
                  {analysis.keyThemes.map((theme: string, index: number) => (
                    <div 
                      key={index}
                      className="rounded-md bg-muted p-2 text-sm"
                    >
                      {theme}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <div className="text-xs text-muted-foreground">
          Analysis generated by AI. Results may vary.
        </div>
      </CardFooter>
    </Card>
  );
}