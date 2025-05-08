'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, AlertCircle, Coins, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/trpc/client';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIPlan } from '@prisma/client';

interface TokenStatusProps {
  compact?: boolean;
  className?: string;
}

export function TokenStatus({
  compact = false,
  className
}: TokenStatusProps) {
  // Get user's AI settings
  const { data: userSettings, isLoading } = api.user.getSettings.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Calculate token reset time if available
  const getResetTimeText = () => {
    if (!userSettings?.aiTokensReset) return 'in 24 hours';
    
    const resetTime = new Date(userSettings.aiTokensReset);
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    
    return `in ${minutes}m`;
  };

  // Generate token progress percentage
  const getTokenPercentage = () => {
    if (!userSettings) return 0;
    
    const max = getPlanTokenLimit(userSettings.aiPlan);
    return (userSettings.aiTokensRemaining / max) * 100;
  };
  
  // Get color based on remaining tokens
  const getProgressColor = () => {
    if (!userSettings) return 'bg-primary';
    
    const percentage = getTokenPercentage();
    if (percentage > 75) return 'bg-green-500';
    if (percentage > 25) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Get max tokens for the current plan
  const getPlanTokenLimit = (plan: AIPlan) => {
    switch (plan) {
      case 'BASIC': return 500;
      case 'PRO': return 2000;
      case 'ENTERPRISE': return 10000;
      default: return 150; // FREE plan
    }
  };
  
  // Compact display for headers
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("relative", className)}
              asChild
            >
              <Link href="/settings/ai">
                <Sparkles className="h-5 w-5" />
                {userSettings && userSettings.aiTokensRemaining < 20 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
                )}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{userSettings?.aiTokensRemaining || 0} AI Tokens</p>
              <p className="text-xs text-muted-foreground">Resets {getResetTimeText()}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Full display for settings page
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Token Status
        </CardTitle>
        <CardDescription>
          Your AI token usage and limits
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="bg-muted h-5 w-2/3 rounded"></div>
            <div className="bg-muted h-8 w-full rounded"></div>
            <div className="bg-muted h-5 w-1/2 rounded"></div>
          </div>
        ) : userSettings?.aiEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{userSettings?.aiPlan || 'FREE'} Plan</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {userSettings?.aiPlan === 'FREE' ? 'Free' : 'Paid'}
                </span>
              </div>
              
              {userSettings?.aiPlan === 'FREE' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/settings/ai/upgrade">
                    Upgrade
                  </Link>
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {userSettings?.aiTokensRemaining || 0} / {getPlanTokenLimit(userSettings?.aiPlan)} tokens remaining
                </span>
                <span className="text-xs text-muted-foreground">
                  Resets {getResetTimeText()}
                </span>
              </div>
              
              <Progress
                value={getTokenPercentage()}
                className="h-2"
                indicatorClassName={getProgressColor()}
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>
                  {userSettings?.aiPlan === 'FREE' 
                    ? 'Free tokens reset daily'
                    : 'Monthly tokens reset on billing date'}
                </span>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/ai/history">
                  <Coins className="h-3.5 w-3.5 mr-1.5" />
                  Usage History
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium">AI Features Disabled</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              You have disabled AI features in your settings. Enable them to use AI-powered features like audio transcription and analysis.
            </p>
            <Button asChild>
              <Link href="/settings/ai">
                Enable AI Features
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TokenStatus;