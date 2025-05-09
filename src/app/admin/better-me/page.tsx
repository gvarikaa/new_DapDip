'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  Apple, 
  Dumbbell, 
  BarChart2, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Search, 
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  ZapIcon,
  Sparkles,
  Calendar,
  LineChart,
  PieChart,
  ListChecks,
  Settings,
  MessageSquare
} from 'lucide-react';

import AdminLayout from '@/components/admin/AdminLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// For charts
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data for Better Me users
const betterMeUsers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: '',
    planType: 'premium',
    joinDate: '2023-03-15',
    lastActive: '2023-07-10T14:30:00Z',
    streak: 24,
    aiInteractions: 86,
    goalsCompleted: 12,
    focusAreas: ['Fitness', 'Nutrition', 'Sleep'],
  },
  {
    id: '3',
    name: 'Jessica Williams',
    email: 'jessica.w@example.com',
    avatar: '',
    planType: 'premium',
    joinDate: '2023-01-08',
    lastActive: '2023-07-10T09:45:00Z',
    streak: 103,
    aiInteractions: 247,
    goalsCompleted: 28,
    focusAreas: ['Mental Health', 'Fitness', 'Nutrition'],
  },
  {
    id: '5',
    name: 'Emma Thompson',
    email: 'emma.t@example.com',
    avatar: '',
    planType: 'basic',
    joinDate: '2023-05-20',
    lastActive: '2023-07-10T16:15:00Z',
    streak: 7,
    aiInteractions: 23,
    goalsCompleted: 3,
    focusAreas: ['Mental Health', 'Sleep'],
  },
  {
    id: '7',
    name: 'Olivia Parker',
    email: 'olivia.p@example.com',
    avatar: '',
    planType: 'premium',
    joinDate: '2023-02-12',
    lastActive: '2023-07-09T21:10:00Z',
    streak: 56,
    aiInteractions: 132,
    goalsCompleted: 18,
    focusAreas: ['Fitness', 'Mental Health'],
  },
  {
    id: '9',
    name: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    avatar: '',
    planType: 'premium',
    joinDate: '2023-04-17',
    lastActive: '2023-07-10T11:25:00Z',
    streak: 37,
    aiInteractions: 98,
    goalsCompleted: 9,
    focusAreas: ['Nutrition', 'Fitness'],
  },
  {
    id: '11',
    name: 'William Taylor',
    email: 'william.t@example.com',
    avatar: '',
    planType: 'basic',
    joinDate: '2023-05-30',
    lastActive: '2023-07-09T18:40:00Z',
    streak: 10,
    aiInteractions: 17,
    goalsCompleted: 2,
    focusAreas: ['Fitness', 'Sleep'],
  },
  {
    id: '13',
    name: 'Sophia Garcia',
    email: 'sophia.g@example.com',
    avatar: '',
    planType: 'premium',
    joinDate: '2023-03-22',
    lastActive: '2023-07-10T08:55:00Z',
    streak: 42,
    aiInteractions: 105,
    goalsCompleted: 14,
    focusAreas: ['Mental Health', 'Nutrition'],
  },
  {
    id: '15',
    name: 'Alexander Johnson',
    email: 'alex.j@example.com',
    avatar: '',
    planType: 'basic',
    joinDate: '2023-06-10',
    lastActive: '2023-07-10T12:15:00Z',
    streak: 4,
    aiInteractions: 8,
    goalsCompleted: 1,
    focusAreas: ['Fitness'],
  },
];

// Mock meal plans
const mealPlans = [
  {
    id: '1',
    title: 'Beginner Weight Loss Meal Plan',
    category: 'Weight Loss',
    difficulty: 'Beginner',
    totalUsers: 1247,
    activeUsers: 845,
    completionRate: 68,
    averageRating: 4.7,
    createdAt: '2023-03-10',
    updatedAt: '2023-06-15',
    featuredRecipes: ['Overnight Oats', 'Greek Yogurt Bowl', 'Grilled Chicken Salad'],
  },
  {
    id: '2',
    title: 'Muscle Building Nutrition Plan',
    category: 'Muscle Gain',
    difficulty: 'Intermediate',
    totalUsers: 876,
    activeUsers: 723,
    completionRate: 72,
    averageRating: 4.5,
    createdAt: '2023-02-18',
    updatedAt: '2023-06-20',
    featuredRecipes: ['Protein Pancakes', 'Quinoa Power Bowl', 'Salmon with Sweet Potato'],
  },
  {
    id: '3',
    title: 'Plant-Based Nutrition Essentials',
    category: 'Vegan',
    difficulty: 'Beginner',
    totalUsers: 934,
    activeUsers: 812,
    completionRate: 65,
    averageRating: 4.8,
    createdAt: '2023-01-25',
    updatedAt: '2023-05-30',
    featuredRecipes: ['Tofu Scramble', 'Chickpea Buddha Bowl', 'Black Bean Burgers'],
  },
  {
    id: '4',
    title: 'Low-Carb Meal Plan',
    category: 'Keto',
    difficulty: 'Intermediate',
    totalUsers: 652,
    activeUsers: 498,
    completionRate: 59,
    averageRating: 4.3,
    createdAt: '2023-04-05',
    updatedAt: '2023-07-01',
    featuredRecipes: ['Avocado Egg Boats', 'Cauliflower Rice Stir-Fry', 'Keto Fat Bombs'],
  },
  {
    id: '5',
    title: 'Balanced Nutrition for Busy Professionals',
    category: 'General Health',
    difficulty: 'Beginner',
    totalUsers: 1587,
    activeUsers: 1243,
    completionRate: 74,
    averageRating: 4.6,
    createdAt: '2023-02-08',
    updatedAt: '2023-06-25',
    featuredRecipes: ['Mason Jar Salads', 'Sheet Pan Dinners', 'Slow Cooker Chili'],
  },
];

// Mock workout plans
const workoutPlans = [
  {
    id: '1',
    title: '30-Day Body Weight Challenge',
    category: 'Bodyweight',
    difficulty: 'Beginner',
    totalUsers: 2184,
    activeUsers: 1567,
    completionRate: 62,
    averageRating: 4.8,
    createdAt: '2023-01-15',
    updatedAt: '2023-06-10',
    duration: '30 days',
    workoutsPerWeek: 5,
    targetAreas: ['Full Body'],
  },
  {
    id: '2',
    title: 'Strength Training Fundamentals',
    category: 'Strength',
    difficulty: 'Intermediate',
    totalUsers: 1432,
    activeUsers: 1109,
    completionRate: 65,
    averageRating: 4.7,
    createdAt: '2023-02-20',
    updatedAt: '2023-06-15',
    duration: '8 weeks',
    workoutsPerWeek: 4,
    targetAreas: ['Upper Body', 'Lower Body', 'Core'],
  },
  {
    id: '3',
    title: 'HIIT for Fat Loss',
    category: 'HIIT',
    difficulty: 'Advanced',
    totalUsers: 1876,
    activeUsers: 1354,
    completionRate: 58,
    averageRating: 4.6,
    createdAt: '2023-03-05',
    updatedAt: '2023-06-20',
    duration: '6 weeks',
    workoutsPerWeek: 5,
    targetAreas: ['Full Body', 'Cardio'],
  },
  {
    id: '4',
    title: 'Yoga for Beginners',
    category: 'Yoga',
    difficulty: 'Beginner',
    totalUsers: 2435,
    activeUsers: 1987,
    completionRate: 78,
    averageRating: 4.9,
    createdAt: '2023-01-10',
    updatedAt: '2023-05-25',
    duration: '4 weeks',
    workoutsPerWeek: 3,
    targetAreas: ['Flexibility', 'Core', 'Balance'],
  },
  {
    id: '5',
    title: '5K Running Program',
    category: 'Cardio',
    difficulty: 'Intermediate',
    totalUsers: 1567,
    activeUsers: 1243,
    completionRate: 71,
    averageRating: 4.7,
    createdAt: '2023-02-15',
    updatedAt: '2023-06-05',
    duration: '8 weeks',
    workoutsPerWeek: 3,
    targetAreas: ['Cardio', 'Endurance'],
  },
];

// Format date to relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec} seconds ago`;
  }
  if (diffMin < 60) {
    return `${diffMin} minutes ago`;
  }
  if (diffHour < 24) {
    return `${diffHour} hours ago`;
  }
  if (diffDay === 1) {
    return 'yesterday';
  }
  if (diffDay < 30) {
    return `${diffDay} days ago`;
  }
  
  return date.toLocaleDateString();
}

// Mock data for charts
const userGrowthData = [
  { name: 'Jan', users: 1540 },
  { name: 'Feb', users: 1890 },
  { name: 'Mar', users: 2390 },
  { name: 'Apr', users: 2780 },
  { name: 'May', users: 3190 },
  { name: 'Jun', users: 3390 },
  { name: 'Jul', users: 3690 },
];

const focusAreasDistribution = [
  { name: 'Fitness', value: 40 },
  { name: 'Nutrition', value: 30 },
  { name: 'Mental Health', value: 20 },
  { name: 'Sleep', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const usageByPlanData = [
  { name: 'Basic', mealPlans: 456, workoutPlans: 789, aiCoaching: 245 },
  { name: 'Premium', mealPlans: 1287, workoutPlans: 1856, aiCoaching: 1546 },
];

const aiInteractionsData = [
  { date: '7/4', interactions: 245 },
  { date: '7/5', interactions: 312 },
  { date: '7/6', interactions: 287 },
  { date: '7/7', interactions: 356 },
  { date: '7/8', interactions: 403 },
  { date: '7/9', interactions: 389 },
  { date: '7/10', interactions: 421 },
];

export default function AdminBetterMePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchMealPlans, setSearchMealPlans] = useState('');
  const [searchWorkoutPlans, setSearchWorkoutPlans] = useState('');
  const [sortUserBy, setSortUserBy] = useState('lastActive');
  const [sortUserDirection, setSortUserDirection] = useState('desc');
  const [sortMealBy, setSortMealBy] = useState('activeUsers');
  const [sortMealDirection, setSortMealDirection] = useState('desc');
  const [sortWorkoutBy, setSortWorkoutBy] = useState('activeUsers');
  const [sortWorkoutDirection, setSortWorkoutDirection] = useState('desc');
  
  // Filter and sort users
  const filteredUsers = betterMeUsers.filter((user) => {
    return (
      searchUsers === '' ||
      user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUsers.toLowerCase())
    );
  });
  
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortUserBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'planType':
        comparison = a.planType.localeCompare(b.planType);
        break;
      case 'joinDate':
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
        break;
      case 'lastActive':
        comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
        break;
      case 'streak':
        comparison = a.streak - b.streak;
        break;
      case 'aiInteractions':
        comparison = a.aiInteractions - b.aiInteractions;
        break;
      case 'goalsCompleted':
        comparison = a.goalsCompleted - b.goalsCompleted;
        break;
      default:
        comparison = 0;
    }
    
    return sortUserDirection === 'asc' ? comparison : -comparison;
  });
  
  // Filter and sort meal plans
  const filteredMealPlans = mealPlans.filter((plan) => {
    return (
      searchMealPlans === '' ||
      plan.title.toLowerCase().includes(searchMealPlans.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchMealPlans.toLowerCase())
    );
  });
  
  const sortedMealPlans = [...filteredMealPlans].sort((a, b) => {
    let comparison = 0;
    
    switch (sortMealBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'difficulty':
        comparison = a.difficulty.localeCompare(b.difficulty);
        break;
      case 'totalUsers':
        comparison = a.totalUsers - b.totalUsers;
        break;
      case 'activeUsers':
        comparison = a.activeUsers - b.activeUsers;
        break;
      case 'completionRate':
        comparison = a.completionRate - b.completionRate;
        break;
      case 'averageRating':
        comparison = a.averageRating - b.averageRating;
        break;
      default:
        comparison = 0;
    }
    
    return sortMealDirection === 'asc' ? comparison : -comparison;
  });
  
  // Filter and sort workout plans
  const filteredWorkoutPlans = workoutPlans.filter((plan) => {
    return (
      searchWorkoutPlans === '' ||
      plan.title.toLowerCase().includes(searchWorkoutPlans.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchWorkoutPlans.toLowerCase())
    );
  });
  
  const sortedWorkoutPlans = [...filteredWorkoutPlans].sort((a, b) => {
    let comparison = 0;
    
    switch (sortWorkoutBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'difficulty':
        comparison = a.difficulty.localeCompare(b.difficulty);
        break;
      case 'totalUsers':
        comparison = a.totalUsers - b.totalUsers;
        break;
      case 'activeUsers':
        comparison = a.activeUsers - b.activeUsers;
        break;
      case 'completionRate':
        comparison = a.completionRate - b.completionRate;
        break;
      case 'averageRating':
        comparison = a.averageRating - b.averageRating;
        break;
      default:
        comparison = 0;
    }
    
    return sortWorkoutDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleUserSortChange = (column: string) => {
    if (sortUserBy === column) {
      setSortUserDirection(sortUserDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortUserBy(column);
      setSortUserDirection('desc');
    }
  };
  
  const handleMealSortChange = (column: string) => {
    if (sortMealBy === column) {
      setSortMealDirection(sortMealDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMealBy(column);
      setSortMealDirection('desc');
    }
  };
  
  const handleWorkoutSortChange = (column: string) => {
    if (sortWorkoutBy === column) {
      setSortWorkoutDirection(sortWorkoutDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortWorkoutBy(column);
      setSortWorkoutDirection('desc');
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">Better Me Management</h1>
              <p className="text-muted-foreground">
                Manage health and wellness features, plans, and users
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setActiveTab('users')}>
                <User className="mr-2 h-4 w-4" />
                Users
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('meal-plans')}>
                <Apple className="mr-2 h-4 w-4" />
                Meal Plans
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('workout-plans')}>
                <Dumbbell className="mr-2 h-4 w-4" />
                Workout Plans
              </Button>
              <Button onClick={() => setActiveTab('assistant')}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Main stats */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,690</div>
              <div className="text-xs text-muted-foreground">
                +142 new users in the last 30 days
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,432</div>
              <div className="text-xs text-muted-foreground">
                Across meal and workout plans
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,413</div>
              <div className="text-xs text-muted-foreground">
                In the last 7 days
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,857</div>
              <div className="text-xs text-muted-foreground">
                This month
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Tabs content */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
              <TabsTrigger value="workout-plans">Workout Plans</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* User growth chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Better Me users over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={userGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }} 
                          />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                            name="Users"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/analytics/better-me">
                        View Detailed Analytics <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Focus areas distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Focus Areas Distribution</CardTitle>
                    <CardDescription>
                      Popular health and wellness categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={focusAreasDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {focusAreasDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Usage by plan type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Plan Type</CardTitle>
                    <CardDescription>Feature usage between basic and premium users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={usageByPlanData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="mealPlans" name="Meal Plans" fill="#8884d8" />
                          <Bar dataKey="workoutPlans" name="Workout Plans" fill="#82ca9d" />
                          <Bar dataKey="aiCoaching" name="AI Coaching" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* AI Interactions trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Assistant Interactions</CardTitle>
                    <CardDescription>
                      Daily interactions with the Better Me AI assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={aiInteractionsData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="interactions"
                            name="AI Interactions"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/better-me/assistant">
                        Configure AI Assistant <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Quick stats and actions */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Meal Plans</CardTitle>
                    <CardDescription>Most popular nutrition plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mealPlans
                        .sort((a, b) => b.activeUsers - a.activeUsers)
                        .slice(0, 3)
                        .map((plan) => (
                          <div key={plan.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{plan.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {plan.activeUsers} active users
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-sm">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className="text-yellow-400">
                                    {i < Math.floor(plan.averageRating) ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {plan.averageRating.toFixed(1)} rating
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/better-me/meal-plans">
                        View All Meal Plans
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Workout Plans</CardTitle>
                    <CardDescription>Most popular fitness plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workoutPlans
                        .sort((a, b) => b.activeUsers - a.activeUsers)
                        .slice(0, 3)
                        .map((plan) => (
                          <div key={plan.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{plan.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {plan.activeUsers} active users
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-sm">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className="text-yellow-400">
                                    {i < Math.floor(plan.averageRating) ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {plan.averageRating.toFixed(1)} rating
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/better-me/workout-plans">
                        View All Workout Plans
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Users</CardTitle>
                    <CardDescription>Users with highest engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {betterMeUsers
                        .sort((a, b) => b.streak - a.streak)
                        .slice(0, 3)
                        .map((user) => (
                          <div key={user.id} className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <ZapIcon className="mr-1 h-3 w-3 text-yellow-500" />
                                {user.streak} day streak
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/better-me/users">
                        View All Users
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* Users tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Export User Data
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Better Me Users</CardTitle>
                  <CardDescription>
                    Manage users of the health and wellness features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleUserSortChange('name')}
                            >
                              User
                              {sortUserBy === 'name' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleUserSortChange('planType')}
                            >
                              Plan
                              {sortUserBy === 'planType' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleUserSortChange('joinDate')}
                            >
                              Joined
                              {sortUserBy === 'joinDate' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleUserSortChange('lastActive')}
                            >
                              Last Active
                              {sortUserBy === 'lastActive' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleUserSortChange('streak')}
                            >
                              Streak
                              {sortUserBy === 'streak' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleUserSortChange('goalsCompleted')}
                            >
                              Goals
                              {sortUserBy === 'goalsCompleted' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>Focus Areas</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.planType === 'premium'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                  {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                              <TableCell>{formatRelativeTime(user.lastActive)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <ZapIcon className="mr-1 h-4 w-4 text-yellow-500" />
                                  {user.streak} days
                                </div>
                              </TableCell>
                              <TableCell>{user.goalsCompleted}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.focusAreas.map((area) => (
                                    <span key={area} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <LineChart className="mr-2 h-4 w-4" />
                                      View Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      Message User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Data
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Meal Plans tab */}
            <TabsContent value="meal-plans" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search meal plans..."
                    className="pl-8"
                    value={searchMealPlans}
                    onChange={(e) => setSearchMealPlans(e.target.value)}
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Meal Plan
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Meal Plans</CardTitle>
                  <CardDescription>
                    Manage nutrition and meal planning content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleMealSortChange('title')}
                            >
                              Plan Name
                              {sortMealBy === 'title' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleMealSortChange('category')}
                            >
                              Category
                              {sortMealBy === 'category' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleMealSortChange('difficulty')}
                            >
                              Difficulty
                              {sortMealBy === 'difficulty' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleMealSortChange('activeUsers')}
                            >
                              Active Users
                              {sortMealBy === 'activeUsers' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleMealSortChange('completionRate')}
                            >
                              Completion
                              {sortMealBy === 'completionRate' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleMealSortChange('averageRating')}
                            >
                              Rating
                              {sortMealBy === 'averageRating' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMealPlans.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No meal plans found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedMealPlans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell>
                                <div className="font-medium">{plan.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  Updated {new Date(plan.updatedAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  {plan.category}
                                </span>
                              </TableCell>
                              <TableCell>{plan.difficulty}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{plan.activeUsers}</span>
                                  <span className="text-xs text-muted-foreground">
                                    of {plan.totalUsers} total
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span>{plan.completionRate}%</span>
                                  <div className="h-2 w-16 rounded-full bg-muted">
                                    <div
                                      className="h-2 rounded-full bg-green-500"
                                      style={{ width: `${plan.completionRate}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="mr-1">{plan.averageRating.toFixed(1)}</span>
                                  <div className="text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i}>
                                        {i < Math.floor(plan.averageRating) ? "★" : "☆"}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <BarChart2 className="mr-2 h-4 w-4" />
                                      View Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Plan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <ListChecks className="mr-2 h-4 w-4" />
                                      Manage Recipes
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Plan
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Workout Plans tab */}
            <TabsContent value="workout-plans" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search workout plans..."
                    className="pl-8"
                    value={searchWorkoutPlans}
                    onChange={(e) => setSearchWorkoutPlans(e.target.value)}
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Workout Plan
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Workout Plans</CardTitle>
                  <CardDescription>
                    Manage fitness and exercise planning content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleWorkoutSortChange('title')}
                            >
                              Plan Name
                              {sortWorkoutBy === 'title' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleWorkoutSortChange('category')}
                            >
                              Category
                              {sortWorkoutBy === 'category' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleWorkoutSortChange('difficulty')}
                            >
                              Difficulty
                              {sortWorkoutBy === 'difficulty' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleWorkoutSortChange('activeUsers')}
                            >
                              Active Users
                              {sortWorkoutBy === 'activeUsers' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleWorkoutSortChange('completionRate')}
                            >
                              Completion
                              {sortWorkoutBy === 'completionRate' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => handleWorkoutSortChange('averageRating')}
                            >
                              Rating
                              {sortWorkoutBy === 'averageRating' && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedWorkoutPlans.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No workout plans found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedWorkoutPlans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell>
                                <div className="font-medium">{plan.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {plan.duration}, {plan.workoutsPerWeek}x per week
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  {plan.category}
                                </span>
                              </TableCell>
                              <TableCell>{plan.difficulty}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{plan.activeUsers}</span>
                                  <span className="text-xs text-muted-foreground">
                                    of {plan.totalUsers} total
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span>{plan.completionRate}%</span>
                                  <div className="h-2 w-16 rounded-full bg-muted">
                                    <div
                                      className="h-2 rounded-full bg-green-500"
                                      style={{ width: `${plan.completionRate}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="mr-1">{plan.averageRating.toFixed(1)}</span>
                                  <div className="text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i}>
                                        {i < Math.floor(plan.averageRating) ? "★" : "☆"}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <BarChart2 className="mr-2 h-4 w-4" />
                                      View Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Plan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <ListChecks className="mr-2 h-4 w-4" />
                                      Manage Workouts
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Plan
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Assistant tab */}
            <TabsContent value="assistant" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Assistant Configuration</CardTitle>
                    <CardDescription>
                      Manage the Better Me AI health assistant settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Assistant Status</h3>
                        <span className="flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Active
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Current Model</h3>
                        <div className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <p className="font-medium">Gemini 1.5 Pro</p>
                            <p className="text-xs text-muted-foreground">
                              Last updated: July 5, 2023
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Update Model
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Knowledge Base</h3>
                        <div className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Nutrition Database</p>
                            <span className="text-xs text-green-600">Up to date</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="font-medium">Exercise Library</p>
                            <span className="text-xs text-green-600">Up to date</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="font-medium">Health Guidelines</p>
                            <span className="text-xs text-amber-600">Update available</span>
                          </div>
                          <Button size="sm" className="mt-3 w-full">
                            Update Knowledge Base
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Response Configuration</h3>
                        <div className="space-y-3 rounded-md border p-3">
                          <div>
                            <div className="mb-1 flex justify-between text-sm">
                              <span>Response Length</span>
                              <span>Medium</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div className="h-2 rounded-full bg-primary" style={{ width: '60%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 flex justify-between text-sm">
                              <span>Personalization Level</span>
                              <span>High</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div className="h-2 rounded-full bg-primary" style={{ width: '80%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 flex justify-between text-sm">
                              <span>Technical Detail</span>
                              <span>Medium</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div className="h-2 rounded-full bg-primary" style={{ width: '50%' }} />
                            </div>
                          </div>
                          <Button size="sm" className="w-full">
                            Customize Responses
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Save Configuration Changes
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Usage Statistics</CardTitle>
                      <CardDescription>
                        Better Me AI assistant interactions and metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
                          <span className="text-sm text-muted-foreground">Daily Interactions</span>
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold">421</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            +8% from yesterday
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
                          <span className="text-sm text-muted-foreground">Avg. Session Length</span>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold">4.2m</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            +0.3m from last week
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
                          <span className="text-sm text-muted-foreground">User Satisfaction</span>
                          <div className="flex items-center">
                            <Heart className="mr-2 h-5 w-5 text-red-500" />
                            <span className="text-2xl font-bold">92%</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            +3% from last month
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
                          <span className="text-sm text-muted-foreground">Response Accuracy</span>
                          <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold">97%</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            +1% from last month
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="mb-2 text-sm font-medium">Top User Inquiries</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <span>Nutrition advice</span>
                            <span className="text-sm">32%</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <span>Workout routines</span>
                            <span className="text-sm">28%</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <span>Mental health tips</span>
                            <span className="text-sm">19%</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <span>Sleep improvement</span>
                            <span className="text-sm">12%</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <span>Goal tracking</span>
                            <span className="text-sm">9%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Assistant Training</CardTitle>
                      <CardDescription>
                        Manage training data and models
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Conversation Samples</h3>
                          <p className="text-sm text-muted-foreground">
                            Use real conversations to improve responses
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Review Samples
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Feedback Collection</h3>
                          <p className="text-sm text-muted-foreground">
                            Gather user feedback on AI responses
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Feedback
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Response Templates</h3>
                          <p className="text-sm text-muted-foreground">
                            Customize assistant response patterns
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Templates
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Custom Prompts</h3>
                          <p className="text-sm text-muted-foreground">
                            Create specialized instructions for the AI
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage Prompts
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Run Training Cycle
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}