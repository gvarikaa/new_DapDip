'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Activity, 
  Server, 
  Flag, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Hash, 
  Globe, 
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';

// Required in client components to plot charts
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for the dashboard
const userData = [
  { name: 'Jan', active: 4000, new: 2400 },
  { name: 'Feb', active: 3000, new: 1398 },
  { name: 'Mar', active: 2000, new: 9800 },
  { name: 'Apr', active: 2780, new: 3908 },
  { name: 'May', active: 1890, new: 4800 },
  { name: 'Jun', active: 2390, new: 3800 },
  { name: 'Jul', active: 3490, new: 4300 },
];

const contentData = [
  { name: 'Mon', posts: 4000, comments: 2400, stories: 2400 },
  { name: 'Tue', posts: 3000, comments: 1398, stories: 2210 },
  { name: 'Wed', posts: 2000, comments: 9800, stories: 2290 },
  { name: 'Thu', posts: 2780, comments: 3908, stories: 2000 },
  { name: 'Fri', posts: 1890, comments: 4800, stories: 2181 },
  { name: 'Sat', posts: 2390, comments: 3800, stories: 2500 },
  { name: 'Sun', posts: 3490, comments: 4300, stories: 2100 },
];

const deviceData = [
  { name: 'Mobile', value: 70 },
  { name: 'Desktop', value: 25 },
  { name: 'Tablet', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const aiUsageData = [
  { name: 'Content Analysis', value: 35 },
  { name: 'Audio Transcription', value: 25 },
  { name: 'Health Assistant', value: 20 },
  { name: 'Others', value: 20 },
];

const serverLoadData = [
  { name: '00:00', cpu: 40, memory: 50, response: 120 },
  { name: '04:00', cpu: 30, memory: 55, response: 180 },
  { name: '08:00', cpu: 60, memory: 62, response: 200 },
  { name: '12:00', cpu: 85, memory: 70, response: 250 },
  { name: '16:00', cpu: 90, memory: 75, response: 280 },
  { name: '20:00', cpu: 70, memory: 60, response: 220 },
  { name: '23:59', cpu: 45, memory: 55, response: 150 },
];

// Active users data for the Activity section
const activeUsers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com', activity: 'Posted a story', time: '2 minutes ago' },
  { id: '2', name: 'Michael Chen', email: 'michael.c@example.com', activity: 'Commented on a post', time: '5 minutes ago' },
  { id: '3', name: 'Jessica Williams', email: 'jessica.w@example.com', activity: 'Liked multiple posts', time: '10 minutes ago' },
  { id: '4', name: 'David Kim', email: 'david.k@example.com', activity: 'Updated profile', time: '15 minutes ago' },
  { id: '5', name: 'Emma Thompson', email: 'emma.t@example.com', activity: 'Started using Better Me', time: '20 minutes ago' },
];

// Flagged content for the Moderation Queue section
const flaggedContent = [
  { id: '1', user: 'Anonymous User', type: 'Post', reason: 'Inappropriate content', time: '30 minutes ago' },
  { id: '2', user: 'John Doe', type: 'Comment', reason: 'Harassment', time: '1 hour ago' },
  { id: '3', user: 'Jane Smith', type: 'Story', reason: 'Misinformation', time: '2 hours ago' },
  { id: '4', user: 'Bob Johnson', type: 'Reel', reason: 'Copyright violation', time: '3 hours ago' },
  { id: '5', user: 'Alice Brown', type: 'Message', reason: 'Spam', time: '4 hours ago' },
];

// Trending topics for the Trends section
const trendingTopics = [
  { id: '1', tag: '#HealthyLifestyle', posts: 523, trend: 'up' },
  { id: '2', tag: '#MondayMotivation', posts: 412, trend: 'up' },
  { id: '3', tag: '#FitnessGoals', posts: 387, trend: 'down' },
  { id: '4', tag: '#Meditation', posts: 341, trend: 'up' },
  { id: '5', tag: '#VeganRecipes', posts: 298, trend: 'down' },
];

// Stats box component
interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  description: string;
  href: string;
}

function StatsCard({ title, value, change, icon, description, href }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs">
          {change > 0 ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
          )}
          <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(change)}% from last month
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href={href} className="flex items-center justify-center">
            View Details <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'

  const isDark = theme === 'dark';
  
  // Chart colors based on theme
  const chartColors = {
    text: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    tooltip: isDark ? '#1e1e1e' : '#ffffff',
    active: isDark ? '#818cf8' : '#4f46e5',
    new: isDark ? '#a78bfa' : '#8b5cf6',
    posts: isDark ? '#38bdf8' : '#0ea5e9',
    comments: isDark ? '#fb923c' : '#f97316',
    stories: isDark ? '#34d399' : '#10b981',
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
        <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Welcome to the DapDip admin dashboard. Here's what's happening today.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/admin/reports">Generate Report</Link>
            </Button>
            <Button>
              <Link href="/admin/settings">System Settings</Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <StatsCard
            title="Active Users"
            value="8,942"
            change={12}
            icon={<Users />}
            description="Daily active users across all platforms"
            href="/admin/users"
          />
          <StatsCard
            title="New Posts"
            value="1,234"
            change={-2}
            icon={<FileText />}
            description="Posts created in the last 24 hours"
            href="/admin/content/posts"
          />
          <StatsCard
            title="Messages"
            value="4,567"
            change={8}
            icon={<MessageSquare />}
            description="Messages sent in the last 24 hours"
            href="/admin/messages"
          />
          <StatsCard
            title="Better Me Users"
            value="3,765"
            change={24}
            icon={<Heart />}
            description="Active users in the Better Me section"
            href="/admin/better-me"
          />
        </motion.div>

        {/* Activity Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Activity</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="ai">AI Usage</TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* User growth chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>
                      Active users and new registrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={userData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColors.active} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={chartColors.active} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColors.new} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={chartColors.new} stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                          <XAxis dataKey="name" tick={{ fill: chartColors.text }} />
                          <YAxis tick={{ fill: chartColors.text }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: chartColors.tooltip,
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }} 
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="active"
                            stroke={chartColors.active}
                            fillOpacity={1}
                            fill="url(#colorActive)"
                            name="Active Users"
                          />
                          <Area
                            type="monotone"
                            dataKey="new"
                            stroke={chartColors.new}
                            fillOpacity={1}
                            fill="url(#colorNew)"
                            name="New Registrations"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/analytics/users">
                        View Full Analytics <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Recent activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>
                      Latest user actions on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeUsers.map((user) => (
                        <div key={user.id} className="flex items-start space-x-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{user.name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {user.time}
                              </span>
                            </div>
                            <p className="text-sm">{user.activity}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/users/activity">
                        View All Activity <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Demographics</CardTitle>
                  <CardDescription>User distribution by region and device</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Geographic distribution */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Geographic Distribution</h3>
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-primary" />
                        <div className="w-full">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>United States</span>
                            <span>45%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: '45%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-indigo-500" />
                        <div className="w-full">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>Europe</span>
                            <span>30%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-indigo-500" style={{ width: '30%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-orange-500" />
                        <div className="w-full">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>Asia</span>
                            <span>15%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-orange-500" style={{ width: '15%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-green-500" />
                        <div className="w-full">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>Other</span>
                            <span>10%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-green-500" style={{ width: '10%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Device breakdown */}
                    <div>
                      <h3 className="mb-4 text-sm font-medium">Device Breakdown</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deviceData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Content activity chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Activity</CardTitle>
                    <CardDescription>Posts, comments, and stories over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={contentData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                          <XAxis dataKey="name" tick={{ fill: chartColors.text }} />
                          <YAxis tick={{ fill: chartColors.text }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: chartColors.tooltip,
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="posts" fill={chartColors.posts} name="Posts" />
                          <Bar dataKey="comments" fill={chartColors.comments} name="Comments" />
                          <Bar dataKey="stories" fill={chartColors.stories} name="Stories" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/analytics/content">
                        View Content Analytics <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Moderation queue */}
                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Queue</CardTitle>
                    <CardDescription>
                      Recently flagged content requiring review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {flaggedContent.map((item) => (
                        <div key={item.id} className="flex items-start space-x-4">
                          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                            <Flag className="h-4 w-4 text-red-600 dark:text-red-300" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{item.user}</h4>
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                {item.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-sm">Reason: {item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/content/reported">
                        View All Reported Content <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Trending topics */}
              <Card>
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                  <CardDescription>
                    Popular hashtags and topics across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendingTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Hash className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{topic.tag}</p>
                            <p className="text-xs text-muted-foreground">
                              {topic.posts} posts in the last 24 hours
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {topic.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={
                              topic.trend === 'up'
                                ? 'text-xs text-green-600'
                                : 'text-xs text-red-600'
                            }
                          >
                            {topic.trend === 'up' ? '+' : '-'}
                            {Math.floor(Math.random() * 50)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/analytics/trends">
                      View All Trends <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>
                    Server resource usage and response times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={serverLoadData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis dataKey="name" tick={{ fill: chartColors.text }} />
                        <YAxis tick={{ fill: chartColors.text }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: chartColors.tooltip,
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          }} 
                        />
                        <Legend />
                        <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                        <Line
                          type="monotone"
                          dataKey="response"
                          stroke="#ffc658"
                          name="Avg Response Time (ms)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="grid w-full grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">CPU: 45%</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">Memory: 35%</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">Disk: 55%</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Status</CardTitle>
                    <CardDescription>
                      Current server health and incidents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="font-medium">All Systems Operational</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Uptime</span>
                        <span className="font-medium">99.98%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Main Web Server</span>
                        <span className="font-medium">100.00%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Database Cluster</span>
                        <span className="font-medium">99.99%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>File Storage</span>
                        <span className="font-medium">99.95%</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-xs">
                      <p className="font-medium">Recent Scheduled Maintenance</p>
                      <p className="mt-1 text-muted-foreground">
                        Database optimization completed on July 5, 2023 (03:00 - 04:30 UTC)
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/system/status">
                        View Full Status <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Notifications</CardTitle>
                    <CardDescription>
                      Recent system events and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                          <Server className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">Database Backup Completed</p>
                          <p className="text-xs text-muted-foreground">
                            Today at 02:00 UTC | Successful
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="rounded-full bg-yellow-100 p-1 dark:bg-yellow-900">
                          <Server className="h-3 w-3 text-yellow-600 dark:text-yellow-300" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">High CPU Usage Detected</p>
                          <p className="text-xs text-muted-foreground">
                            Yesterday at 18:45 UTC | Resolved
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                          <Server className="h-3 w-3 text-green-600 dark:text-green-300" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">System Update Applied</p>
                          <p className="text-xs text-muted-foreground">
                            2 days ago at 05:30 UTC | Successful
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="rounded-full bg-red-100 p-1 dark:bg-red-900">
                          <Server className="h-3 w-3 text-red-600 dark:text-red-300" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">Failed Login Attempts Spike</p>
                          <p className="text-xs text-muted-foreground">
                            3 days ago at 22:15 UTC | Investigated
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/system/logs">
                        View System Logs <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* AI Tab */}
            <TabsContent value="ai" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Usage Breakdown</CardTitle>
                    <CardDescription>
                      Token consumption by feature
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={aiUsageData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {aiUsageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full text-center text-sm">
                      <p>
                        <span className="font-medium">1.2M</span> tokens used in the last 30 days
                      </p>
                      <p className="text-xs text-muted-foreground">
                        65% of monthly allocation
                      </p>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Feature Performance</CardTitle>
                    <CardDescription>
                      Quality and usage metrics by feature
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Audio Transcription</span>
                          <span className="font-medium">96% accuracy</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: '96%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Content Analysis</span>
                          <span className="font-medium">92% accuracy</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: '92%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Health Recommendations</span>
                          <span className="font-medium">88% satisfaction</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: '88%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Content Moderation</span>
                          <span className="font-medium">94% accuracy</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: '94%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-sm font-medium">Average response time: 245ms</p>
                      <p className="text-xs text-muted-foreground">
                        Across all AI features
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href="/admin/analytics/ai">
                        View AI Analytics <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>
                    Settings and configurations for AI features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Model Configuration</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Model</span>
                            <span className="font-medium">Gemini 1.5 Pro</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Audio Transcription</span>
                            <span className="font-medium">Gemini 1.5 Pro</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Content Moderation</span>
                            <span className="font-medium">Gemini 1.5 Flash</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Token Allocation</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Monthly Limit</span>
                            <span className="font-medium">2,000,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Used This Month</span>
                            <span className="font-medium">1,289,453</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Remaining</span>
                            <span className="font-medium">710,547</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Feature Status</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Better Me Assistant</span>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Content Analysis</span>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Audio Transcription</span>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Content Moderation</span>
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                              Maintenance
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <h3 className="text-sm font-medium">Upcoming Features</h3>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li className="flex items-center">
                            <span className="mr-2 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                            </span>
                            Gemini 2.5 Integration (Q3 2023)
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                            </span>
                            Advanced Image Analysis (Q3 2023)
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                            </span>
                            Fact-Checking System (Q4 2023)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/settings/ai">
                      Configure AI Settings <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}