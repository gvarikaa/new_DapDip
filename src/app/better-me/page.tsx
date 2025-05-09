'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Activity, Utensils, Brain, User, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api/trpc/client';

/**
 * Better Me landing page
 * Introduces users to the health and wellness features
 */
export default function BetterMePage() {
  const { data: healthProfile, isLoading: isLoadingProfile } = api.betterMe.getProfile.useQuery();
  
  // Features list for the landing page
  const features = [
    {
      title: "Personalized Health Profile",
      description: "Create your unique health profile with goals, preferences, and biometrics",
      icon: <User className="h-10 w-10 text-primary" />,
      href: "/better-me/profile",
    },
    {
      title: "AI Meal Planning",
      description: "Get custom meal plans tailored to your dietary needs and preferences",
      icon: <Utensils className="h-10 w-10 text-primary" />,
      href: "/better-me/meal-plan",
    },
    {
      title: "Workout Routines",
      description: "Follow personalized workout plans designed for your fitness level",
      icon: <Activity className="h-10 w-10 text-primary" />,
      href: "/better-me/workout",
    },
    {
      title: "Wellness Assistant",
      description: "Chat with our AI assistant for health advice and motivation",
      icon: <Brain className="h-10 w-10 text-primary" />,
      href: "/better-me/assistant",
    },
  ];
  
  return (
    <MainLayout>
      <div className="container max-w-7xl py-8">
        {/* Hero section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  <Heart className="h-8 w-8 text-red-500" /> Better Me
                </h1>
                <p className="text-xl md:text-2xl font-light text-muted-foreground mt-2">
                  Your personalized AI health and wellness companion
                </p>
              </motion.div>
              
              <motion.p 
                className="text-base md:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Take control of your health journey with personalized meal plans, workout routines, 
                and health recommendations powered by AI and tailored to your unique goals.
              </motion.p>
              
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {healthProfile ? (
                  <Button size="lg" asChild>
                    <Link href="/better-me/dashboard">
                      Go to My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <Link href="/better-me/profile">
                      Create My Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img 
                src="/images/better-me-hero.svg" 
                alt="Better Me Wellness" 
                className="w-full h-auto rounded-lg shadow-lg" 
              />
            </motion.div>
          </div>
        </section>
        
        {/* Features section */}
        <section className="mb-16">
          <motion.h2 
            className="text-3xl font-bold text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Your Wellness Journey Starts Here
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.5 }}
              >
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-2">
                    <Button variant="ghost" asChild className="w-full">
                      <Link href={feature.href}>
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* How it works section */}
        <section className="mb-16">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Your personalized journey to better health in 4 easy steps</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Tell us about yourself, your goals, and your preferences to get started.",
              },
              {
                step: "2",
                title: "Get Your Plan",
                description: "Receive AI-generated meal and workout plans tailored to your needs.",
              },
              {
                step: "3",
                title: "Track Progress",
                description: "Log your activity, meals, and measurements to track your journey.",
              },
              {
                step: "4",
                title: "Stay Motivated",
                description: "Get guidance and encouragement from our AI assistant along the way.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + (index * 0.1), duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Testimonials or success stories could be added here */}
        
        {/* CTA section */}
        <section>
          <motion.div 
            className="bg-primary/5 rounded-2xl p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of users who are achieving their health and fitness goals with
              personalized AI guidance tailored just for them.
            </p>
            
            {healthProfile ? (
              <Button size="lg" asChild>
                <Link href="/better-me/dashboard">
                  Continue Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link href="/better-me/profile">
                  Start Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
}