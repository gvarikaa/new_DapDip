'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, Sparkles, Zap, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/api/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PlanFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export default function AIUpgradePage() {
  const router = useRouter();
  
  // Get user's current plan
  const { data: userSettings, isLoading } = api.user.getSettings.useQuery();
  
  // Update AI plan mutation
  const updatePlanMutation = api.user.updateAIPlan.useMutation({
    onSuccess: () => {
      toast.success('AI plan updated successfully');
      router.push('/settings/ai');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update plan');
    },
  });
  
  // Handle plan selection
  const handleSelectPlan = (plan: "FREE" | "BASIC" | "PRO" | "ENTERPRISE") => {
    updatePlanMutation.mutate({ plan });
  };
  
  // Define features for comparison
  const features: PlanFeature[] = [
    { name: 'Daily Tokens', free: '150', basic: '500', pro: '2,000', enterprise: '10,000' },
    { name: 'Token Reset', free: 'Daily', basic: 'Daily', pro: 'Monthly', enterprise: 'Monthly' },
    { name: 'Audio Transcription', free: '60 sec limit', basic: '5 min limit', pro: '30 min limit', enterprise: 'Unlimited' },
    { name: 'Content Analysis', free: 'Basic', basic: 'Standard', pro: 'Advanced', enterprise: 'Enterprise' },
    { name: 'Sentiment Analysis', free: true, basic: true, pro: true, enterprise: true },
    { name: 'Topic Extraction', free: true, basic: true, pro: true, enterprise: true },
    { name: 'Content Suggestions', free: 'Basic', basic: 'Enhanced', pro: 'Premium', enterprise: 'Custom' },
    { name: 'Fact Checking', free: false, basic: 'Basic', pro: 'Advanced', enterprise: 'Premium' },
    { name: 'Custom AI Models', free: false, basic: false, pro: true, enterprise: true },
    { name: 'Priority Processing', free: false, basic: false, pro: true, enterprise: true },
  ];
  
  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Upgrade AI Plan</h1>
      </div>
      
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Choose Your AI Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the AI plan that best fits your needs. Upgrade anytime to unlock more powerful AI features and increase your token allowance.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Free Plan */}
        <Card className={`relative ${userSettings?.aiPlan === 'FREE' ? 'border-primary' : ''}`}>
          {userSettings?.aiPlan === 'FREE' && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
              Current Plan
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Free
            </CardTitle>
            <CardDescription>Basic AI features</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  {feature.free ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        {feature.name}
                        {typeof feature.free === 'string' && feature.free !== 'true' && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({feature.free})
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 shrink-0" />
                      <span className="text-muted-foreground line-through">{feature.name}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={userSettings?.aiPlan === 'FREE' ? 'outline' : 'default'}
              disabled={userSettings?.aiPlan === 'FREE' || isLoading || updatePlanMutation.isPending}
              onClick={() => handleSelectPlan('FREE')}
            >
              {userSettings?.aiPlan === 'FREE' ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Basic Plan */}
        <Card className={`relative ${userSettings?.aiPlan === 'BASIC' ? 'border-primary' : ''}`}>
          {userSettings?.aiPlan === 'BASIC' && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
              Current Plan
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Basic
            </CardTitle>
            <CardDescription>Enhanced AI capabilities</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.slice(0, 7).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  {feature.basic ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        {feature.name}
                        {typeof feature.basic === 'string' && feature.basic !== 'true' && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({feature.basic})
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 shrink-0" />
                      <span className="text-muted-foreground line-through">{feature.name}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={userSettings?.aiPlan === 'BASIC' ? 'outline' : 'default'}
              disabled={userSettings?.aiPlan === 'BASIC' || isLoading || updatePlanMutation.isPending}
              onClick={() => handleSelectPlan('BASIC')}
            >
              {userSettings?.aiPlan === 'BASIC' ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Pro Plan */}
        <Card className={`relative ${userSettings?.aiPlan === 'PRO' ? 'border-primary' : ''} border-2`}>
          {userSettings?.aiPlan === 'PRO' ? (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
              Current Plan
            </Badge>
          ) : (
            <Badge variant="secondary" className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Pro
            </CardTitle>
            <CardDescription>Advanced AI features</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  {feature.pro ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        {feature.name}
                        {typeof feature.pro === 'string' && feature.pro !== 'true' && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({feature.pro})
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 shrink-0" />
                      <span className="text-muted-foreground line-through">{feature.name}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={userSettings?.aiPlan === 'PRO' ? 'outline' : 'default'}
              disabled={userSettings?.aiPlan === 'PRO' || isLoading || updatePlanMutation.isPending}
              onClick={() => handleSelectPlan('PRO')}
            >
              {userSettings?.aiPlan === 'PRO' ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Enterprise Plan */}
        <Card className={`relative ${userSettings?.aiPlan === 'ENTERPRISE' ? 'border-primary' : ''}`}>
          {userSettings?.aiPlan === 'ENTERPRISE' && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
              Current Plan
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Enterprise
            </CardTitle>
            <CardDescription>Maximum AI capabilities</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$24.99</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  {feature.enterprise ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        {feature.name}
                        {typeof feature.enterprise === 'string' && feature.enterprise !== 'true' && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({feature.enterprise})
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 shrink-0" />
                      <span className="text-muted-foreground line-through">{feature.name}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={userSettings?.aiPlan === 'ENTERPRISE' ? 'outline' : 'default'}
              disabled={userSettings?.aiPlan === 'ENTERPRISE' || isLoading || updatePlanMutation.isPending}
              onClick={() => handleSelectPlan('ENTERPRISE')}
            >
              {userSettings?.aiPlan === 'ENTERPRISE' ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold mb-3">About AI Plans</h3>
        <div className="text-muted-foreground space-y-4">
          <p>
            AI plans determine how many tokens you can use for AI-powered features like audio transcription, content analysis, and suggestions. You can upgrade or downgrade at any time.
          </p>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">What are tokens?</h4>
              <p className="text-sm">
                Tokens are a unit of measurement for AI operations. Each AI feature uses a different number of tokens. For example, an audio transcription might use 10 tokens, while a simple sentiment analysis might use just 1 token.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Token Reset</h4>
              <p className="text-sm">
                Free and Basic plans reset tokens daily, while Pro and Enterprise plans reset monthly. This means you can use your full token allowance every day on Free and Basic plans, or spread it throughout the month on Pro and Enterprise plans.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <p className="text-sm">
            For any billing-related questions or custom plan requirements, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}