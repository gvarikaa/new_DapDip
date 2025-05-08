'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart, FileAudio, Sparkles, Brain, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { api } from '@/lib/api/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';

export default function AITokenHistoryPage() {
  const router = useRouter();
  const [cursor, setCursor] = useState<string | null>(null);
  
  // Get user's token usage history
  const { data, isLoading, fetchNextPage, hasNextPage } = api.user.getTokenUsageHistory.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Get feature icons
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'audio_transcription':
        return <FileAudio className="h-4 w-4" />;
      case 'content_analysis':
        return <BarChart className="h-4 w-4" />;
      case 'sentiment_analysis':
        return <Brain className="h-4 w-4" />;
      case 'topic_extraction':
        return <Brain className="h-4 w-4" />;
      case 'content_suggestions':
        return <Sparkles className="h-4 w-4" />;
      case 'content_summarization':
        return <Brain className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };
  
  // Get friendly feature name
  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'audio_transcription':
        return 'Audio Transcription';
      case 'content_analysis':
        return 'Content Analysis';
      case 'sentiment_analysis':
        return 'Sentiment Analysis';
      case 'topic_extraction':
        return 'Topic Extraction';
      case 'content_suggestions':
        return 'Content Suggestions';
      case 'content_summarization':
        return 'Content Summarization';
      default:
        return feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!data?.pages?.[0]?.stats?.featureUsage) return [];
    
    const featureUsage = data.pages[0].stats.featureUsage;
    
    return Object.entries(featureUsage).map(([feature, amount]) => ({
      name: getFeatureName(feature),
      value: amount,
      color: getFeatureColor(feature),
    }));
  };
  
  // Get feature color
  const getFeatureColor = (feature: string) => {
    switch (feature) {
      case 'audio_transcription':
        return '#3b82f6'; // blue
      case 'content_analysis':
        return '#10b981'; // green
      case 'sentiment_analysis':
        return '#f59e0b'; // amber
      case 'topic_extraction':
        return '#8b5cf6'; // purple
      case 'content_suggestions':
        return '#ec4899'; // pink
      case 'content_summarization':
        return '#14b8a6'; // teal
      default:
        return '#6b7280'; // gray
    }
  };
  
  const chartData = prepareChartData();
  
  // Load more history
  const handleLoadMore = () => {
    fetchNextPage();
  };
  
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
        <h1 className="text-2xl font-bold">AI Token Usage History</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Token Usage
              </CardTitle>
              <CardDescription>
                Your AI token usage history
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Model</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.pages.flatMap(page => page.history).map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="flex items-center gap-2">
                            <span className="text-primary">
                              {getFeatureIcon(usage.feature)}
                            </span>
                            {getFeatureName(usage.feature)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {usage.amount}
                          </TableCell>
                          <TableCell>
                            {format(new Date(usage.createdAt), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {usage.modelName}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {hasNextPage && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={handleLoadMore}>
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Usage Breakdown
              </CardTitle>
              <CardDescription>
                Your token usage by feature
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value} tokens`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Total Usage: {data?.pages[0]?.stats.totalUsage || 0} tokens
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Token Reset
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm">
                Your daily tokens will reset automatically based on your plan:
              </p>
              
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li><span className="font-medium">Free:</span> 150 tokens, reset daily</li>
                <li><span className="font-medium">Basic:</span> 500 tokens, reset daily</li>
                <li><span className="font-medium">Pro:</span> 2,000 tokens, reset monthly</li>
                <li><span className="font-medium">Enterprise:</span> 10,000 tokens, reset monthly</li>
              </ul>
              
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/settings/ai">
                  Back to AI Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}