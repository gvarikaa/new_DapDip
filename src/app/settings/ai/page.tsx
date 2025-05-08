'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Lightbulb, Settings, Fingerprint, StarIcon, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/api/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TokenStatus } from '@/components/ai/TokenStatus';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AISettingsPage() {
  const router = useRouter();
  
  // Get user's AI settings
  const { data: userSettings, isLoading } = api.user.getSettings.useQuery();
  
  // Update AI settings mutation
  const updateSettingsMutation = api.user.updateSettings.useMutation({
    onSuccess: () => {
      toast.success('AI settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
  
  // Toggle AI features
  const handleToggleAI = (enabled: boolean) => {
    updateSettingsMutation.mutate({
      aiEnabled: enabled,
    });
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
        <h1 className="text-2xl font-bold">AI Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    General AI Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how AI features work across the platform
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ai-features">AI Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable AI-powered features such as audio transcription, content analysis, and smart recommendations
                      </p>
                    </div>
                    <Switch
                      id="ai-features"
                      checked={userSettings?.aiEnabled}
                      onCheckedChange={handleToggleAI}
                      disabled={isLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ai-model">AI Model</Label>
                      <p className="text-sm text-muted-foreground">
                        Select which AI model to use for generating content
                      </p>
                    </div>
                    <select
                      id="ai-model"
                      className="px-3 py-2 border rounded-md bg-background"
                      defaultValue="gemini-1.5-pro"
                      disabled={!userSettings?.aiEnabled || isLoading}
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-2.5" disabled={userSettings?.aiPlan === 'FREE'}>
                        Gemini 2.5 (Pro plan only)
                      </option>
                    </select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Behavior Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize how AI interacts with your content
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analysis-depth">Analysis Depth</Label>
                      <select
                        id="analysis-depth"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        defaultValue="standard"
                        disabled={!userSettings?.aiEnabled || isLoading}
                      >
                        <option value="basic">Basic (1 token)</option>
                        <option value="standard">Standard (5 tokens)</option>
                        <option value="deep">Deep (10 tokens)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Deeper analysis uses more tokens
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="writing-style">AI Writing Style</Label>
                      <select
                        id="writing-style"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        defaultValue="balanced"
                        disabled={!userSettings?.aiEnabled || isLoading}
                      >
                        <option value="formal">Formal</option>
                        <option value="balanced">Balanced</option>
                        <option value="casual">Casual</option>
                        <option value="creative">Creative</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Affects AI generated text tone
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Audio Features
                  </CardTitle>
                  <CardDescription>
                    Configure audio message and transcription settings
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-transcribe">Auto-Transcribe</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically transcribe audio messages (uses 5-10 tokens per minute)
                      </p>
                    </div>
                    <Switch
                      id="auto-transcribe"
                      defaultChecked={true}
                      disabled={!userSettings?.aiEnabled || isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="noise-reduction">Noise Reduction</Label>
                      <p className="text-sm text-muted-foreground">
                        Apply AI noise reduction to audio recordings
                      </p>
                    </div>
                    <Switch
                      id="noise-reduction"
                      defaultChecked={true}
                      disabled={!userSettings?.aiEnabled || isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sentiment-analysis">Sentiment Analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Detect tone and emotion in audio messages
                      </p>
                    </div>
                    <Switch
                      id="sentiment-analysis"
                      defaultChecked={true}
                      disabled={!userSettings?.aiEnabled || isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Content Analysis
                  </CardTitle>
                  <CardDescription>
                    Configure how AI analyzes posts and comments
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="comment-analysis">Comment Analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze comment sections for sentiment and key insights
                      </p>
                    </div>
                    <Switch
                      id="comment-analysis"
                      defaultChecked={true}
                      disabled={!userSettings?.aiEnabled || isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="fact-checking">Fact Checking</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight potential misinformation in comments
                      </p>
                    </div>
                    <Switch
                      id="fact-checking"
                      defaultChecked={false}
                      disabled={!userSettings?.aiEnabled || isLoading || userSettings?.aiPlan === 'FREE'}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="content-suggestions">Content Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered suggestions for your posts
                      </p>
                    </div>
                    <Switch
                      id="content-suggestions"
                      defaultChecked={true}
                      disabled={!userSettings?.aiEnabled || isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    AI Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control how your data is used by AI systems
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-usage">AI Training Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your content to improve our AI systems
                      </p>
                    </div>
                    <Switch
                      id="data-usage"
                      defaultChecked={false}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="personal-data">Personal Data Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to process personal information in your content
                      </p>
                    </div>
                    <Switch
                      id="personal-data"
                      defaultChecked={false}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-retention">Data Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long we store your AI processing data
                      </p>
                    </div>
                    <select
                      id="data-retention"
                      className="px-3 py-2 border rounded-md bg-background"
                      defaultValue="30"
                      disabled={isLoading}
                    >
                      <option value="0">Do not store</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    To completely disable AI features, turn off the main AI toggle in the General tab.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <TokenStatus />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-primary" />
                Upgrade Your Plan
              </CardTitle>
              <CardDescription>
                Get more AI tokens and premium features
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Pro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Daily Tokens</TableCell>
                    <TableCell>150</TableCell>
                    <TableCell>2,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Audio Transcription</TableCell>
                    <TableCell>Limited</TableCell>
                    <TableCell>Unlimited</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>AI Models</TableCell>
                    <TableCell>Basic</TableCell>
                    <TableCell>Advanced</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Content Analysis</TableCell>
                    <TableCell>Basic</TableCell>
                    <TableCell>Advanced</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <Button className="w-full" asChild>
                <Link href="/settings/ai/upgrade">
                  Upgrade to Pro
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Benefits of Pro
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">
                  <span className="font-medium">Advanced audio transcription</span>
                  <span className="text-muted-foreground"> with 99% accuracy</span>
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">
                  <span className="font-medium">Access to Gemini 2.5</span>
                  <span className="text-muted-foreground"> for superior AI understanding</span>
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">
                  <span className="font-medium">Advanced fact checking</span>
                  <span className="text-muted-foreground"> to identify misinformation</span>
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">
                  <span className="font-medium">Priority processing</span>
                  <span className="text-muted-foreground"> for all AI requests</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}