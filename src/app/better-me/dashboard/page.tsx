'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Utensils, 
  Brain, 
  Calendar, 
  ArrowRight, 
  Plus, 
  TrendingUp,
  Droplet,
  Moon,
  ChevronRight,
  Scale,
  Award
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from '@/lib/api/trpc/client';

/**
 * Better Me Dashboard Page
 * Main hub for the user's health and wellness journey
 */
export default function BetterMeDashboardPage() {
  const router = useRouter();
  
  // Get user's health profile
  const { data: healthProfile, isLoading: isLoadingProfile } = api.betterMe.getProfile.useQuery();
  
  // Get active meal and workout plans
  const { data: activeMealPlan } = api.betterMe.getActiveMealPlan.useQuery();
  const { data: activeWorkoutPlan } = api.betterMe.getActiveWorkoutPlan.useQuery();
  
  // Get today's water logs
  const { data: todayWaterLogs } = api.betterMe.getTodayWaterLogs.useQuery();
  
  // Get sleep logs for last 7 days
  const { data: sleepLogs } = api.betterMe.getSleepLogs.useQuery({ days: 7 });
  
  // Get health logs for progress tracking
  const { data: healthLogs } = api.betterMe.getHealthLogs.useQuery({ 
    limit: 30 
  });
  
  // Calculate water intake for today
  const todayWaterIntake = React.useMemo(() => {
    if (!todayWaterLogs) return 0;
    return todayWaterLogs.reduce((sum, log) => sum + log.amount, 0);
  }, [todayWaterLogs]);
  
  // Calculate average sleep duration for the past week
  const averageSleepDuration = React.useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) return 0;
    const totalHours = sleepLogs.reduce((sum, log) => sum + log.duration, 0);
    return totalHours / sleepLogs.length;
  }, [sleepLogs]);
  
  // Calculate progress percentage for primary goal
  const goalProgress = React.useMemo(() => {
    if (!healthProfile || !healthProfile.primaryGoal || !healthProfile.targetDate) {
      return 0;
    }
    
    const startDate = new Date(healthProfile.createdAt);
    const targetDate = new Date(healthProfile.targetDate);
    const today = new Date();
    
    const totalDays = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate progress as percentage of time elapsed
    return Math.min(Math.max(Math.round((daysElapsed / totalDays) * 100), 0), 100);
  }, [healthProfile]);
  
  // If no profile exists, redirect to profile creation
  React.useEffect(() => {
    if (!isLoadingProfile && !healthProfile) {
      router.push('/better-me/profile');
    }
  }, [healthProfile, isLoadingProfile, router]);
  
  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="container max-w-6xl py-8">
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-10 w-64 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-60 bg-muted rounded" />
              <div className="h-60 bg-muted rounded" />
              <div className="h-60 bg-muted rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!healthProfile) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" /> 
            Better Me Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress, access your plans, and stay motivated
          </p>
        </motion.div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Goal Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Goal Progress
                </CardTitle>
                <CardDescription>
                  {healthProfile.primaryGoal || 'No primary goal set'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthProfile.targetDate ? (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goalProgress}%</span>
                      </div>
                      <Progress value={goalProgress} className="h-2" />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{format(new Date(healthProfile.createdAt), 'MMM d')}</span>
                        <span>Target: {format(new Date(healthProfile.targetDate), 'MMM d, yyyy')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-center text-muted-foreground">
                      <div>
                        <p>No target date set</p>
                        <Button variant="link" asChild className="p-0 h-auto">
                          <Link href="/better-me/profile">
                            Update Goals
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {healthProfile.targetWeight && (
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Current Weight</span>
                        <span className="font-medium">
                          {healthProfile.weight ? `${healthProfile.weight} kg` : 'Not recorded'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span>Target Weight</span>
                        <span className="font-medium">{healthProfile.targetWeight} kg</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/better-me/progress">
                    View Details <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Water Intake Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  Water Intake
                </CardTitle>
                <CardDescription>
                  Today's hydration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-muted stroke-current" 
                        strokeWidth="10" 
                        fill="none" 
                        cx="50" 
                        cy="50" 
                        r="40"
                      />
                      <circle 
                        className="text-blue-500 stroke-current" 
                        strokeWidth="10" 
                        strokeLinecap="round" 
                        fill="none" 
                        cx="50" 
                        cy="50" 
                        r="40"
                        strokeDasharray={`${Math.min((todayWaterIntake / 2500) * 251.2, 251.2)} 251.2`}
                        transform="rotate(-90 50 50)"
                      />
                      <text 
                        x="50" 
                        y="50" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        className="text-2xl font-bold"
                        fill="currentColor"
                      >
                        {(todayWaterIntake / 1000).toFixed(1)}L
                      </text>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Goal: 2.5L per day
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {Math.round((todayWaterIntake / 2500) * 100)}% of daily goal
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    api.betterMe.addWaterLog.mutate({
                      amount: 250, // 250ml
                      date: new Date(),
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Water
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Sleep Tracking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Moon className="h-5 w-5 text-purple-500" />
                  Sleep Tracking
                </CardTitle>
                <CardDescription>
                  Last 7 days average
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold">{averageSleepDuration.toFixed(1)}</span>
                    <span className="text-2xl ml-1">hrs</span>
                  </div>
                  
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Sleep Duration</span>
                      <span className="font-medium">{averageSleepDuration.toFixed(1)} hrs</span>
                    </div>
                    <Progress 
                      value={Math.min((averageSleepDuration / 8) * 100, 100)} 
                      className="h-2"
                      indicatorClassName={
                        averageSleepDuration >= 7 ? "bg-green-500" : 
                        averageSleepDuration >= 6 ? "bg-amber-500" : "bg-red-500"
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>4 hrs</span>
                      <span>8 hrs</span>
                    </div>
                  </div>
                  
                  {healthProfile.sleepGoalHours && (
                    <p className="text-sm text-muted-foreground">
                      Your goal: {healthProfile.sleepGoalHours} hours
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/better-me/sleep">
                    Log Sleep <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        {/* Plans and Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Tabs defaultValue="meal-plan" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meal-plan" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" /> Meal Plan
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Workout
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Scale className="h-4 w-4" /> Progress
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Brain className="h-4 w-4" /> Assistant
              </TabsTrigger>
            </TabsList>
            
            {/* Meal Plan Tab */}
            <TabsContent value="meal-plan">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Meal Planning
                  </CardTitle>
                  <CardDescription>
                    Your personalized meal plans and recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeMealPlan ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {activeMealPlan.name}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {format(new Date(activeMealPlan.startDate), 'MMM d')} - {format(new Date(activeMealPlan.endDate), 'MMM d, yyyy')}
                          </p>
                          <p className="mt-1">
                            Daily targets: {activeMealPlan.totalCalories} kcal • {activeMealPlan.protein}g protein • {activeMealPlan.carbs}g carbs • {activeMealPlan.fat}g fat
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Today's Meals</h4>
                        
                        {/* Filter meals for today's day number */}
                        {activeMealPlan.meals
                          .filter(meal => {
                            const startDate = new Date(activeMealPlan.startDate);
                            const today = new Date();
                            const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            return meal.day === daysDiff + 1; // +1 because days are 1-indexed
                          })
                          .map(meal => (
                            <div key={meal.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {meal.type}
                                  </span>
                                  <h5 className="font-medium mt-1">{meal.name}</h5>
                                </div>
                                <div className="text-right text-sm">
                                  <p className="font-medium">{meal.calories} kcal</p>
                                  <p className="text-xs text-muted-foreground">
                                    P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {activeMealPlan.meals
                          .filter(meal => {
                            const startDate = new Date(activeMealPlan.startDate);
                            const today = new Date();
                            const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            return meal.day === daysDiff + 1;
                          }).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No meals planned for today.
                            </p>
                          )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Meal Plan</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate a personalized meal plan based on your health profile and goals.
                      </p>
                      <Button asChild>
                        <Link href="/better-me/meal-plan">
                          Create Meal Plan <Plus className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/better-me/meal-plan">
                      {activeMealPlan ? 'View Full Meal Plan' : 'Create Meal Plan'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Workout Tab */}
            <TabsContent value="workout">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Workout Planning
                  </CardTitle>
                  <CardDescription>
                    Your personalized exercise routine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeWorkoutPlan ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {activeWorkoutPlan.name}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {format(new Date(activeWorkoutPlan.startDate), 'MMM d')} - {format(new Date(activeWorkoutPlan.endDate), 'MMM d, yyyy')}
                          </p>
                          <p className="mt-1">
                            {activeWorkoutPlan.difficulty} difficulty • {activeWorkoutPlan.daysPerWeek} days per week
                          </p>
                          {activeWorkoutPlan.focusArea && activeWorkoutPlan.focusArea.length > 0 && (
                            <p className="mt-1">
                              Focus: {activeWorkoutPlan.focusArea.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Today's Workout</h4>
                          <Link 
                            href="/better-me/workout/calendar" 
                            className="text-sm text-primary hover:underline flex items-center"
                          >
                            <Calendar className="h-4 w-4 mr-1" /> Schedule
                          </Link>
                        </div>
                        
                        {/* Filter workouts for today's day in the plan */}
                        {activeWorkoutPlan.workouts
                          .filter(workout => {
                            const startDate = new Date(activeWorkoutPlan.startDate);
                            const today = new Date();
                            const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            
                            // For simplicity, we'll match the day number modulo the total days
                            // in the workout plan, so it repeats after completion
                            const totalDays = activeWorkoutPlan.workouts.length;
                            return workout.day === (daysDiff % totalDays) + 1;
                          })
                          .slice(0, 1) // Take only the first matching workout
                          .map(workout => (
                            <div key={workout.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">{workout.name}</h5>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {workout.durationMinutes} min • ~{workout.caloriesBurned} kcal
                                  </p>
                                </div>
                                <div>
                                  {workout.completed ? (
                                    <span className="flex items-center text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      <Award className="h-3 w-3 mr-1" /> Completed
                                    </span>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      onClick={() => {
                                        api.betterMe.completeWorkout.mutate({
                                          workoutId: workout.id,
                                        });
                                      }}
                                    >
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {!workout.completed && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {workout.exercises.map(exercise => (
                                    <div key={exercise.id} className="text-sm border border-dashed p-2 rounded">
                                      <p className="font-medium">{exercise.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {exercise.sets && exercise.reps 
                                          ? `${exercise.sets} sets × ${exercise.reps} reps` 
                                          : exercise.duration 
                                            ? `${exercise.duration} seconds`
                                            : 'As instructed'
                                        }
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        
                        {activeWorkoutPlan.workouts
                          .filter(workout => {
                            const startDate = new Date(activeWorkoutPlan.startDate);
                            const today = new Date();
                            const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            const totalDays = activeWorkoutPlan.workouts.length;
                            return workout.day === (daysDiff % totalDays) + 1;
                          }).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No workout scheduled for today.
                            </p>
                          )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Workout Plan</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate a personalized workout plan based on your fitness level and goals.
                      </p>
                      <Button asChild>
                        <Link href="/better-me/workout">
                          Create Workout Plan <Plus className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/better-me/workout">
                      {activeWorkoutPlan ? 'View Full Workout Plan' : 'Create Workout Plan'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Progress Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor your health journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {healthLogs && healthLogs.length > 0 ? (
                    <div className="space-y-6">
                      {/* Weight chart would go here */}
                      <div className="h-48 w-full bg-muted rounded-md flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Weight chart visualization</p>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Recent Measurements</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {["Weight", "Body Fat", "Energy", "Mood"].map((metric, index) => (
                            <div key={metric} className="border rounded-lg p-3">
                              <p className="text-sm text-muted-foreground">{metric}</p>
                              <p className="text-lg font-medium">
                                {index === 0 && healthLogs[0]?.weight ? `${healthLogs[0].weight} kg` : '--'}
                                {index === 1 && healthLogs[0]?.bodyFatPercentage ? `${healthLogs[0].bodyFatPercentage}%` : ''}
                                {index === 2 && healthLogs[0]?.energyLevel ? `${healthLogs[0].energyLevel}/10` : ''}
                                {index === 3 && healthLogs[0]?.moodRating ? `${healthLogs[0].moodRating}/10` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Progress Data Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Log your measurements regularly to track your progress over time.
                      </p>
                      <Button asChild>
                        <Link href="/better-me/progress/log">
                          Log Your Measurements <Plus className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/better-me/progress">
                      View Progress History <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Assistant Tab */}
            <TabsContent value="assistant">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Better Me Assistant
                  </CardTitle>
                  <CardDescription>
                    Your AI health companion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Health Assistant</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Chat with our AI assistant for personalized health advice, answers to your nutrition and fitness questions, and daily motivation.
                    </p>
                    <Button asChild>
                      <Link href="/better-me/assistant">
                        Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}