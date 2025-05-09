'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Zap,
  Calendar, 
  Filter, 
  Download, 
  RefreshCw
} from 'lucide-react';
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
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Mock data for charts
const DAILY_ACTIVE_USERS = [
  { date: '2023-05-01', users: 1200 },
  { date: '2023-05-02', users: 1250 },
  { date: '2023-05-03', users: 1300 },
  { date: '2023-05-04', users: 1500 },
  { date: '2023-05-05', users: 1800 },
  { date: '2023-05-06', users: 2000 },
  { date: '2023-05-07', users: 2200 },
  { date: '2023-05-08', users: 2400 },
  { date: '2023-05-09', users: 2300 },
  { date: '2023-05-10', users: 2100 },
  { date: '2023-05-11', users: 2200 },
  { date: '2023-05-12', users: 2400 },
  { date: '2023-05-13', users: 2600 },
  { date: '2023-05-14', users: 2800 },
];

const CONTENT_METRICS = [
  { date: '2023-05-01', posts: 320, comments: 580, stories: 120 },
  { date: '2023-05-02', posts: 332, comments: 623, stories: 143 },
  { date: '2023-05-03', posts: 301, comments: 543, stories: 132 },
  { date: '2023-05-04', posts: 334, comments: 602, stories: 150 },
  { date: '2023-05-05', posts: 390, comments: 670, stories: 178 },
  { date: '2023-05-06', posts: 330, comments: 610, stories: 145 },
  { date: '2023-05-07', posts: 320, comments: 590, stories: 135 },
  { date: '2023-05-08', posts: 360, comments: 640, stories: 160 },
  { date: '2023-05-09', posts: 380, comments: 690, stories: 170 },
  { date: '2023-05-10', posts: 390, comments: 710, stories: 185 },
  { date: '2023-05-11', posts: 400, comments: 730, stories: 192 },
  { date: '2023-05-12', posts: 410, comments: 750, stories: 205 },
  { date: '2023-05-13', posts: 420, comments: 770, stories: 210 },
  { date: '2023-05-14', posts: 430, comments: 790, stories: 220 },
];

const AI_USAGE = [
  { date: '2023-05-01', tokens: 8500 },
  { date: '2023-05-02', tokens: 9200 },
  { date: '2023-05-03', tokens: 7800 },
  { date: '2023-05-04', tokens: 8900 },
  { date: '2023-05-05', tokens: 11200 },
  { date: '2023-05-06', tokens: 10800 },
  { date: '2023-05-07', tokens: 9600 },
  { date: '2023-05-08', tokens: 10400 },
  { date: '2023-05-09', tokens: 11300 },
  { date: '2023-05-10', tokens: 12100 },
  { date: '2023-05-11', tokens: 12800 },
  { date: '2023-05-12', tokens: 13500 },
  { date: '2023-05-13', tokens: 14200 },
  { date: '2023-05-14', tokens: 15000 },
];

const AI_FEATURES_USAGE = [
  { name: 'Content Analysis', value: 35 },
  { name: 'Post Suggestions', value: 25 },
  { name: 'Better Me Assistant', value: 20 },
  { name: 'Meal Plans', value: 10 },
  { name: 'Workout Plans', value: 5 },
  { name: 'Other', value: 5 },
];

const PLATFORM_USAGE = [
  { name: 'Mobile App', value: 65 },
  { name: 'Desktop Web', value: 25 },
  { name: 'Mobile Web', value: 10 },
];

const USER_DEMOGRAPHICS = [
  { age: '18-24', male: 18, female: 22, other: 2 },
  { age: '25-34', male: 22, female: 25, other: 3 },
  { age: '35-44', male: 15, female: 16, other: 1 },
  { age: '45-54', male: 8, female: 10, other: 0.5 },
  { age: '55-64', male: 4, female: 5, other: 0.3 },
  { age: '65+', male: 2, female: 3, other: 0.2 },
];

// Colors for charts
const COLORS = {
  primary: '#0ea5e9',
  secondary: '#a855f7',
  tertiary: '#f43f5e',
  success: '#22c55e',
  warning: '#eab308',
  info: '#3b82f6',
  background: 'rgba(14, 165, 233, 0.2)',
  grid: '#e2e8f0',
};

// Pie chart colors
const PIE_COLORS = ['#0ea5e9', '#a855f7', '#f43f5e', '#22c55e', '#eab308', '#3b82f6'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('2w');

  // Custom date formatter for X axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d');
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Platform performance metrics and insights
            </p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="2w">Last 2 Weeks</SelectItem>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overview KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">54,328</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+12.4%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daily Active Users
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,845</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+8.2%</span> from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Content Engagement
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.5%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+3.7%</span> from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Token Usage
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15.2M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+21.9%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="ai">AI Usage</TabsTrigger>
            <TabsTrigger value="betterme">Better Me</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* User Growth Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>
                    Daily active users over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={DAILY_ACTIVE_USERS}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatXAxis} 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value} users`, 'Active Users']}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke={COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage</CardTitle>
                  <CardDescription>
                    By device type
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PLATFORM_USAGE}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PLATFORM_USAGE.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Usage']} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Content Creation */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Content Activity</CardTitle>
                  <CardDescription>
                    Posts, comments, and stories over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={CONTENT_METRICS}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatXAxis}
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value}`, '']}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      />
                      <Legend />
                      <Bar dataKey="posts" name="Posts" fill={COLORS.primary} />
                      <Bar dataKey="comments" name="Comments" fill={COLORS.secondary} />
                      <Bar dataKey="stories" name="Stories" fill={COLORS.tertiary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* AI Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Token Usage</CardTitle>
                  <CardDescription>
                    Daily token consumption
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={AI_USAGE}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatXAxis}
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value.toLocaleString()} tokens`, 'Usage']}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      />
                      <Line
                        type="monotone"
                        dataKey="tokens"
                        stroke={COLORS.info}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* AI Features Usage */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>AI Features Usage</CardTitle>
                  <CardDescription>
                    Distribution by feature type
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={AI_FEATURES_USAGE}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {AI_FEATURES_USAGE.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Usage']} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Demographics Chart */}
              <Card className="md:col-span-3 lg:col-span-3">
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                  <CardDescription>
                    Age distribution across gender groups
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={USER_DEMOGRAPHICS}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis dataKey="age" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="male" name="Male" fill={COLORS.primary} />
                      <Bar dataKey="female" name="Female" fill={COLORS.tertiary} />
                      <Bar dataKey="other" name="Other" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>
                  Detailed user metrics and demographics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  User analytics section would include detailed tables and charts about user acquisition, retention, behavior patterns, and demographic breakdowns.
                </p>
                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Coming Soon</p>
                  <p className="mt-2 text-sm">
                    This detailed section is currently in development. It will provide comprehensive user analytics including cohort analysis, retention rates, user journey mapping, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
                <CardDescription>
                  Detailed content performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Content analytics section would include detailed analysis of post engagement, content categorization, trending hashtags, sentiment analysis, and virality indicators.
                </p>
                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Coming Soon</p>
                  <p className="mt-2 text-sm">
                    This detailed section is currently in development. It will provide comprehensive content analytics including engagement rates by content type, trending topics, AI-powered insights on what content performs best, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Usage Tab */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Usage Analytics</CardTitle>
                <CardDescription>
                  Detailed AI feature and token usage metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI usage analytics section would include detailed token consumption by feature, user satisfaction with AI features, cost analysis, and optimization recommendations.
                </p>
                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Coming Soon</p>
                  <p className="mt-2 text-sm">
                    This detailed section is currently in development. It will provide comprehensive AI usage analytics including user-level token consumption patterns, ROI analysis of AI features, and predictive usage forecasting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Better Me Tab */}
          <TabsContent value="betterme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Better Me Analytics</CardTitle>
                <CardDescription>
                  Health and wellness feature usage and impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Better Me analytics section would include detailed usage of meal plans, workout routines, health tracking features, and user health improvement metrics.
                </p>
                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Coming Soon</p>
                  <p className="mt-2 text-sm">
                    This detailed section is currently in development. It will provide comprehensive Better Me analytics including user health progress metrics, most popular health goals, workout completion rates, and AI assistant interaction patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}