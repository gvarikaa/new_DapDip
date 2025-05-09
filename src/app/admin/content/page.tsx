'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  FileText, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Flag, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Edit, 
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart2,
  Calendar,
  ArrowRight,
  Heart,
  MessageCircle,
  Share2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Mock content data
const contentItems = [
  {
    id: '1',
    title: 'My morning workout routine',
    type: 'post',
    status: 'published',
    creator: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '',
    },
    createdAt: '2023-07-09T08:30:00Z',
    engagementStats: {
      likes: 243,
      comments: 57,
      shares: 18,
    },
    contentPreview: 'Started my day with a great HIIT workout session. Here are some exercises that...',
    mediaType: 'image',
    mediaCount: 4,
    reportCount: 0,
    tags: ['workout', 'fitness', 'morning'],
    category: 'Fitness',
  },
  {
    id: '2',
    title: 'Weekend getaway ideas',
    type: 'post',
    status: 'published',
    creator: {
      id: '5',
      name: 'Emma Thompson',
      avatar: '',
    },
    createdAt: '2023-07-08T14:15:00Z',
    engagementStats: {
      likes: 187,
      comments: 42,
      shares: 29,
    },
    contentPreview: 'Looking for a quick weekend escape? Here are my top 5 destinations within a 3-hour drive...',
    mediaType: 'image',
    mediaCount: 5,
    reportCount: 0,
    tags: ['travel', 'weekend', 'getaway'],
    category: 'Travel',
  },
  {
    id: '3',
    title: 'This is what happened when I tried intermittent fasting',
    type: 'story',
    status: 'published',
    creator: {
      id: '3',
      name: 'Jessica Williams',
      avatar: '',
    },
    createdAt: '2023-07-10T10:00:00Z',
    engagementStats: {
      likes: 421,
      comments: 0,
      shares: 0,
    },
    contentPreview: 'My journey with intermittent fasting for 30 days. The results were surprising...',
    mediaType: 'image',
    mediaCount: 1,
    reportCount: 0,
    tags: ['health', 'diet', 'fasting'],
    category: 'Health',
  },
  {
    id: '4',
    title: 'Quick 5-minute meditation',
    type: 'reel',
    status: 'published',
    creator: {
      id: '7',
      name: 'Olivia Parker',
      avatar: '',
    },
    createdAt: '2023-07-09T12:45:00Z',
    engagementStats: {
      likes: 1567,
      comments: 143,
      shares: 287,
    },
    contentPreview: 'Try this quick guided meditation to center yourself during a busy day...',
    mediaType: 'video',
    mediaCount: 1,
    reportCount: 0,
    tags: ['meditation', 'mindfulness', 'wellness'],
    category: 'Mindfulness',
  },
  {
    id: '5',
    title: '',
    type: 'comment',
    status: 'published',
    creator: {
      id: '2',
      name: 'Michael Chen',
      avatar: '',
    },
    createdAt: '2023-07-10T11:23:00Z',
    engagementStats: {
      likes: 28,
      comments: 3,
      shares: 0,
    },
    contentPreview: 'I tried this routine and it really helped with my back pain! Would recommend adding some stretching at the end.',
    mediaType: 'none',
    mediaCount: 0,
    reportCount: 0,
    tags: [],
    category: 'Comments',
    parentContent: 'My morning workout routine',
  },
  {
    id: '6',
    title: 'Healthy meal prep ideas for the week',
    type: 'post',
    status: 'draft',
    creator: {
      id: '9',
      name: 'Sophia Martinez',
      avatar: '',
    },
    createdAt: '2023-07-10T09:15:00Z',
    engagementStats: {
      likes: 0,
      comments: 0,
      shares: 0,
    },
    contentPreview: 'Here are some quick and nutritious meal prep ideas that will save you time and keep you on track...',
    mediaType: 'image',
    mediaCount: 6,
    reportCount: 0,
    tags: ['food', 'mealprep', 'nutrition'],
    category: 'Nutrition',
  },
  {
    id: '7',
    title: 'Summer fitness challenge',
    type: 'post',
    status: 'scheduled',
    creator: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '',
    },
    createdAt: '2023-07-15T08:00:00Z',
    engagementStats: {
      likes: 0,
      comments: 0,
      shares: 0,
    },
    contentPreview: 'Join our 30-day summer fitness challenge starting next week! Daily workouts, nutrition tips, and more...',
    mediaType: 'image',
    mediaCount: 2,
    reportCount: 0,
    tags: ['challenge', 'summer', 'fitness'],
    category: 'Fitness',
  },
  {
    id: '8',
    title: 'Inappropriate dance moves',
    type: 'reel',
    status: 'flagged',
    creator: {
      id: '10',
      name: 'Daniel Brown',
      avatar: '',
    },
    createdAt: '2023-07-09T19:30:00Z',
    engagementStats: {
      likes: 342,
      comments: 87,
      shares: 45,
    },
    contentPreview: 'Check out these new dance moves I learned...',
    mediaType: 'video',
    mediaCount: 1,
    reportCount: 5,
    reportReasons: ['Inappropriate content', 'Sexual content'],
    tags: ['dance', 'moves', 'trending'],
    category: 'Entertainment',
  },
  {
    id: '9',
    title: 'How to make passive income',
    type: 'post',
    status: 'flagged',
    creator: {
      id: '4',
      name: 'David Kim',
      avatar: '',
    },
    createdAt: '2023-07-08T16:20:00Z',
    engagementStats: {
      likes: 156,
      comments: 34,
      shares: 67,
    },
    contentPreview: 'Learn how I make $5000 per day with this simple trick that financial advisors don\'t want you to know...',
    mediaType: 'none',
    mediaCount: 0,
    reportCount: 12,
    reportReasons: ['Misinformation', 'Spam', 'Scam'],
    tags: ['money', 'finance', 'passive income'],
    category: 'Finance',
  },
  {
    id: '10',
    title: '',
    type: 'comment',
    status: 'flagged',
    creator: {
      id: '8',
      name: 'James Wilson',
      avatar: '',
    },
    createdAt: '2023-07-10T13:45:00Z',
    engagementStats: {
      likes: 2,
      comments: 5,
      shares: 0,
    },
    contentPreview: 'This is complete nonsense. You should be ashamed of spreading such false information just to get clicks.',
    mediaType: 'none',
    mediaCount: 0,
    reportCount: 3,
    reportReasons: ['Harassment', 'Hate speech'],
    tags: [],
    category: 'Comments',
    parentContent: 'How to make passive income',
  },
];

// Trending content
const trendingContentStats = [
  { category: 'Fitness', posts: 2843, change: 12 },
  { category: 'Nutrition', posts: 1976, change: 8 },
  { category: 'Mental Health', posts: 1752, change: 23 },
  { category: 'Mindfulness', posts: 1489, change: 15 },
  { category: 'Sleep', posts: 1251, change: -3 },
];

// Content types distribution
const contentTypeStats = [
  { type: 'Posts', count: 62450, percentage: 58 },
  { type: 'Comments', count: 31278, percentage: 29 },
  { type: 'Stories', count: 8642, percentage: 8 },
  { type: 'Reels', count: 5312, percentage: 5 },
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

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let style = '';
  let icon = null;
  
  switch (status) {
    case 'published':
      style = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      icon = <CheckCircle2 className="mr-1 h-3.5 w-3.5" />;
      break;
    case 'draft':
      style = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      icon = <Edit className="mr-1 h-3.5 w-3.5" />;
      break;
    case 'scheduled':
      style = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      icon = <Calendar className="mr-1 h-3.5 w-3.5" />;
      break;
    case 'flagged':
      style = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      icon = <Flag className="mr-1 h-3.5 w-3.5" />;
      break;
    default:
      style = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
  
  return (
    <span className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Content type badge component
function ContentTypeBadge({ type }: { type: string }) {
  let style = '';
  let icon = null;
  
  switch (type) {
    case 'post':
      style = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      icon = <FileText className="mr-1 h-3.5 w-3.5" />;
      break;
    case 'comment':
      style = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      icon = <MessageSquare className="mr-1 h-3.5 w-3.5" />;
      break;
    case 'story':
      style = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      icon = <ImageIcon className="mr-1 h-3.5 w-3.5" />;
      break;
    case 'reel':
      style = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      icon = <Video className="mr-1 h-3.5 w-3.5" />;
      break;
    default:
      style = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
  
  return (
    <span className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// Content details dialog
function ContentDetailDialog({ content, open, onOpenChange }: { content: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!content) return null;
  
  const createdAt = new Date(content.createdAt).toLocaleString();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Content Details</DialogTitle>
          <DialogDescription>
            {content.type === 'comment' ? 'View comment details' : `View details for "${content.title}"`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <ContentTypeBadge type={content.type} />
                <StatusBadge status={content.status} />
                {content.reportCount > 0 && (
                  <span className="flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                    <Flag className="mr-1 h-3.5 w-3.5" />
                    {content.reportCount} Reports
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {content.id}
              </div>
            </div>
            
            {content.type !== 'comment' && (
              <h3 className="text-xl font-bold">{content.title}</h3>
            )}
          </div>
          
          {/* Content Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={content.creator.avatar} />
                    <AvatarFallback>{content.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{content.creator.name}</p>
                    <p className="text-xs text-muted-foreground">{createdAt}</p>
                  </div>
                </div>
                {content.type === 'comment' && (
                  <div className="text-xs text-muted-foreground">
                    On: {content.parentContent}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{content.contentPreview}</p>
              
              {content.mediaCount > 0 && (
                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  {content.mediaType === 'image' ? (
                    <ImageIcon className="mr-1 h-4 w-4" />
                  ) : (
                    <Video className="mr-1 h-4 w-4" />
                  )}
                  {content.mediaCount} {content.mediaType}{content.mediaCount > 1 ? 's' : ''}
                </div>
              )}
              
              {content.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {content.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-3">
              <div className="flex w-full items-center justify-between">
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Heart className="mr-1 h-4 w-4" /> {content.engagementStats.likes}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" /> {content.engagementStats.comments}
                  </span>
                  <span className="flex items-center">
                    <Share2 className="mr-1 h-4 w-4" /> {content.engagementStats.shares}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Category: {content.category}
                </span>
              </div>
            </CardFooter>
          </Card>
          
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              {content.reportCount > 0 && (
                <TabsTrigger value="reports">Reports</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Content Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{content.type.charAt(0).toUpperCase() + content.type.slice(1)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{content.status.charAt(0).toUpperCase() + content.status.slice(1)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{createdAt}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Creator</span>
                    <span className="font-medium">{content.creator.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{content.category}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Media</span>
                    <span className="font-medium">
                      {content.mediaCount > 0 ? `${content.mediaCount} ${content.mediaType}(s)` : 'None'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex space-x-4">
                <Button className="flex-1" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Content
                </Button>
                {content.status === 'published' ? (
                  <Button className="flex-1" variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Unpublish
                  </Button>
                ) : content.status === 'draft' || content.status === 'scheduled' ? (
                  <Button className="flex-1" variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Publish Now
                  </Button>
                ) : null}
                {content.status === 'flagged' && (
                  <Button className="flex-1" variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                )}
                <Button className="flex-1" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Likes</span>
                      <span className="text-sm font-medium">{content.engagementStats.likes}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-pink-500" 
                        style={{ width: `${Math.min(100, (content.engagementStats.likes / 20))}%` }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Comments</span>
                      <span className="text-sm font-medium">{content.engagementStats.comments}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ width: `${Math.min(100, (content.engagementStats.comments / 1.5))}%` }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Shares</span>
                      <span className="text-sm font-medium">{content.engagementStats.shares}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-green-500" 
                        style={{ width: `${Math.min(100, (content.engagementStats.shares / 3))}%` }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Engagement</span>
                      <span className="text-sm font-medium">
                        {content.engagementStats.likes + content.engagementStats.comments + content.engagementStats.shares}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-purple-500" 
                        style={{ 
                          width: `${Math.min(
                            100, 
                            ((content.engagementStats.likes + content.engagementStats.comments + content.engagementStats.shares) / 25)
                          )}%` 
                        }} 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Audience Reach</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Math.floor(content.engagementStats.likes * 4.7)}
                      </p>
                      <p className="text-xs text-muted-foreground">Impressions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Math.floor(content.engagementStats.likes * 2.3)}
                      </p>
                      <p className="text-xs text-muted-foreground">Unique Viewers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Math.floor((content.engagementStats.likes + content.engagementStats.comments + content.engagementStats.shares) / 
                          (content.engagementStats.likes * 2.3) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Engagement Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {content.reportCount > 0 && (
              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Report Information</CardTitle>
                    <CardDescription>
                      This content has been reported {content.reportCount} times
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Report Reasons</h4>
                      <div className="space-y-2">
                        {content.reportReasons?.map((reason: string, index: number) => (
                          <div key={index} className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-sm">{reason}</span>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                              {Math.ceil(content.reportCount / content.reportReasons.length)} reports
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button className="flex-1" variant="outline">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Content
                      </Button>
                      <Button className="flex-1" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Content
                      </Button>
                    </div>
                    
                    <div className="rounded-md border p-3">
                      <h4 className="text-sm font-medium">Moderation Note</h4>
                      <textarea 
                        className="mt-2 w-full rounded-md border border-input bg-background p-2 text-sm" 
                        rows={3} 
                        placeholder="Add a note about your moderation decision..."
                      />
                      <Button size="sm" className="mt-2">
                        Save Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminContentPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedContent, setSelectedContent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filter content based on search term, type, and status
  const filteredContent = contentItems.filter((item) => {
    // Apply search filter
    const searchMatch = 
      search === '' ||
      (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
      item.contentPreview.toLowerCase().includes(search.toLowerCase()) ||
      item.creator.name.toLowerCase().includes(search.toLowerCase());
    
    // Apply type filter
    const typeMatch = filterType === 'all' || item.type === filterType;
    
    // Apply status filter
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    
    return searchMatch && typeMatch && statusMatch;
  });
  
  // Sort filtered content
  const sortedContent = [...filteredContent].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'engagement':
        const aTotal = a.engagementStats.likes + a.engagementStats.comments + a.engagementStats.shares;
        const bTotal = b.engagementStats.likes + b.engagementStats.comments + b.engagementStats.shares;
        comparison = bTotal - aTotal;
        break;
      case 'reports':
        comparison = (b.reportCount || 0) - (a.reportCount || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? -comparison : comparison;
  });
  
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  const handleViewContent = (content: any) => {
    setSelectedContent(content);
    setIsDetailOpen(true);
  };
  
  // Flagged content count
  const flaggedCount = contentItems.filter(item => item.status === 'flagged').length;
  
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
              <h1 className="text-3xl font-bold">Content Management</h1>
              <p className="text-muted-foreground">
                Manage and moderate all content across the platform
              </p>
            </div>
            {flaggedCount > 0 && (
              <Button variant="destructive" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Review Flagged Content ({flaggedCount})
              </Button>
            )}
          </div>
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contentTypeStats.map((stat) => (
            <Card key={stat.type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="mr-2 h-2 w-full max-w-24 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  {stat.percentage}% of all content
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
        
        {/* Actions and Filters */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search content..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="story">Stories</SelectItem>
                <SelectItem value="reel">Reels</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
        
        {/* Content Table */}
        <motion.div variants={itemVariants} className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('title')}
                  >
                    Content
                    {sortBy === 'title' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('type')}
                  >
                    Type
                    {sortBy === 'type' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('status')}
                  >
                    Status
                    {sortBy === 'status' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('createdAt')}
                  >
                    Date
                    {sortBy === 'createdAt' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('engagement')}
                  >
                    Engagement
                    {sortBy === 'engagement' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No content found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedContent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium">
                          {item.type === 'comment' ? (
                            <span className="line-clamp-1">{item.contentPreview}</span>
                          ) : (
                            <span className="line-clamp-1">{item.title}</span>
                          )}
                        </div>
                        {item.type !== 'comment' && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {item.contentPreview}
                          </p>
                        )}
                        {item.reportCount > 0 && (
                          <span className="flex w-fit items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                            <Flag className="mr-1 h-3 w-3" />
                            {item.reportCount} Reports
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ContentTypeBadge type={item.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.creator.avatar} />
                          <AvatarFallback>{item.creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.creator.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.status === 'scheduled' ? (
                        <span className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      ) : (
                        formatRelativeTime(item.createdAt)
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="flex items-center">
                          <Heart className="mr-1 h-4 w-4 text-red-500" />
                          {item.engagementStats.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4 text-blue-500" />
                          {item.engagementStats.comments}
                        </span>
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
                          <DropdownMenuItem onClick={() => handleViewContent(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {item.status === 'published' && (
                            <DropdownMenuItem>
                              <XCircle className="mr-2 h-4 w-4" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          {item.status === 'flagged' && (
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
        
        {/* Content Detail Dialog */}
        {selectedContent && (
          <ContentDetailDialog 
            content={selectedContent} 
            open={isDetailOpen} 
            onOpenChange={setIsDetailOpen} 
          />
        )}
        
        {/* Trend Analysis */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Content Trends</CardTitle>
              <CardDescription>
                Popular categories and trending topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Trending Categories</h3>
                  <div className="space-y-3">
                    {trendingContentStats.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-md bg-primary/10 p-1.5">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{category.category}</p>
                            <p className="text-xs text-muted-foreground">
                              {category.posts.toLocaleString()} posts in the last 30 days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={category.change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {category.change > 0 ? '+' : ''}{category.change}%
                          </div>
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full ${
                                category.change > 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.abs(category.change) * 4)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-3 text-sm font-medium">Popular Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      #fitness <span className="ml-1 text-xs">+25%</span>
                    </span>
                    <span className="flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                      #wellness <span className="ml-1 text-xs">+18%</span>
                    </span>
                    <span className="flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      #meditation <span className="ml-1 text-xs">+32%</span>
                    </span>
                    <span className="flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                      #nutrition <span className="ml-1 text-xs">+15%</span>
                    </span>
                    <span className="flex items-center rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800 dark:bg-pink-900 dark:text-pink-300">
                      #workout <span className="ml-1 text-xs">+22%</span>
                    </span>
                    <span className="flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                      #mentalhealth <span className="ml-1 text-xs">+28%</span>
                    </span>
                    <span className="flex items-center rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                      #selfcare <span className="ml-1 text-xs">+20%</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/analytics/content">
                  View Content Analytics <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}