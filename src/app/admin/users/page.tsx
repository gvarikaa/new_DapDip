'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  MoreHorizontal, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  BanIcon,
  XCircle,
  ArrowUpDown,
  ChevronDown,
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

// Mock user data
const users = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'user',
    status: 'active',
    verified: true,
    joinDate: '2023-01-15',
    lastActive: '2023-07-10T14:23:01Z',
    postsCount: 156,
    followersCount: 1243,
    avatar: '',
    betterMeSubscriber: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    role: 'moderator',
    status: 'active',
    verified: true,
    joinDate: '2023-02-20',
    lastActive: '2023-07-09T18:43:21Z',
    postsCount: 89,
    followersCount: 762,
    avatar: '',
    betterMeSubscriber: false,
  },
  {
    id: '3',
    name: 'Jessica Williams',
    email: 'jessica.w@example.com',
    role: 'admin',
    status: 'active',
    verified: true,
    joinDate: '2022-11-05',
    lastActive: '2023-07-10T09:15:45Z',
    postsCount: 243,
    followersCount: 2891,
    avatar: '',
    betterMeSubscriber: true,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.k@example.com',
    role: 'user',
    status: 'suspended',
    verified: true,
    joinDate: '2023-03-30',
    lastActive: '2023-06-28T11:52:33Z',
    postsCount: 42,
    followersCount: 357,
    avatar: '',
    betterMeSubscriber: false,
  },
  {
    id: '5',
    name: 'Emma Thompson',
    email: 'emma.t@example.com',
    role: 'user',
    status: 'active',
    verified: false,
    joinDate: '2023-05-18',
    lastActive: '2023-07-10T16:09:27Z',
    postsCount: 28,
    followersCount: 195,
    avatar: '',
    betterMeSubscriber: true,
  },
  {
    id: '6',
    name: 'Alex Rodriguez',
    email: 'alex.r@example.com',
    role: 'user',
    status: 'inactive',
    verified: true,
    joinDate: '2023-02-10',
    lastActive: '2023-05-15T08:27:19Z',
    postsCount: 76,
    followersCount: 548,
    avatar: '',
    betterMeSubscriber: false,
  },
  {
    id: '7',
    name: 'Olivia Parker',
    email: 'olivia.p@example.com',
    role: 'moderator',
    status: 'active',
    verified: true,
    joinDate: '2022-12-12',
    lastActive: '2023-07-09T21:34:52Z',
    postsCount: 112,
    followersCount: 987,
    avatar: '',
    betterMeSubscriber: true,
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.w@example.com',
    role: 'user',
    status: 'pending',
    verified: false,
    joinDate: '2023-06-25',
    lastActive: '2023-07-08T17:41:36Z',
    postsCount: 5,
    followersCount: 42,
    avatar: '',
    betterMeSubscriber: false,
  },
  {
    id: '9',
    name: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    role: 'user',
    status: 'active',
    verified: true,
    joinDate: '2023-04-02',
    lastActive: '2023-07-10T10:53:14Z',
    postsCount: 67,
    followersCount: 523,
    avatar: '',
    betterMeSubscriber: true,
  },
  {
    id: '10',
    name: 'Daniel Brown',
    email: 'daniel.b@example.com',
    role: 'user',
    status: 'blocked',
    verified: true,
    joinDate: '2023-01-30',
    lastActive: '2023-06-15T13:47:09Z',
    postsCount: 95,
    followersCount: 673,
    avatar: '',
    betterMeSubscriber: false,
  },
];

// Recent user activity
const recentActivity = [
  { 
    id: '1', 
    userId: '5', 
    userName: 'Emma Thompson', 
    action: 'created a new account', 
    timestamp: '2023-07-10T16:00:00Z', 
    ip: '192.168.1.105', 
    device: 'iPhone 13, iOS 16.2',
    location: 'New York, US' 
  },
  { 
    id: '2', 
    userId: '2', 
    userName: 'Michael Chen', 
    action: 'updated profile picture', 
    timestamp: '2023-07-10T15:45:30Z',
    ip: '172.16.254.1',
    device: 'Chrome on Windows 11',
    location: 'San Francisco, US'
  },
  { 
    id: '3', 
    userId: '1', 
    userName: 'Sarah Johnson', 
    action: 'posted a new story', 
    timestamp: '2023-07-10T15:30:00Z',
    ip: '10.0.0.1',
    device: 'Safari on MacBook Pro',
    location: 'Chicago, US'
  },
  { 
    id: '4', 
    userId: '7', 
    userName: 'Olivia Parker', 
    action: 'moderated 3 reported comments', 
    timestamp: '2023-07-10T15:15:45Z',
    ip: '192.168.0.254',
    device: 'Firefox on Ubuntu 22.04',
    location: 'Toronto, CA'
  },
  { 
    id: '5', 
    userId: '9', 
    userName: 'Sophia Martinez', 
    action: 'upgraded to Better Me subscription', 
    timestamp: '2023-07-10T15:00:00Z',
    ip: '172.20.10.2',
    device: 'Samsung Galaxy S22, Android 13',
    location: 'Los Angeles, US'
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

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <CheckCircle2 className="mr-1 h-3.5 w-3.5" />,
        };
      case 'suspended':
        return {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
          icon: <AlertTriangle className="mr-1 h-3.5 w-3.5" />,
        };
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          icon: <XCircle className="mr-1 h-3.5 w-3.5" />,
        };
      case 'blocked':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          icon: <BanIcon className="mr-1 h-3.5 w-3.5" />,
        };
      case 'pending':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <ChevronDown className="mr-1 h-3.5 w-3.5" />,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          icon: null,
        };
    }
  };

  const { color, icon } = getStatusConfig(status);

  return (
    <span className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          icon: <Shield className="mr-1 h-3.5 w-3.5" />,
        };
      case 'moderator':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Shield className="mr-1 h-3.5 w-3.5" />,
        };
      case 'user':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          icon: null,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          icon: null,
        };
    }
  };

  const { color, icon } = getRoleConfig(role);

  return (
    <span className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {icon}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// User detail dialog component
function UserDetailDialog({ user, open, onOpenChange }: { user: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!user) return null;

  // Format join date
  const joinDate = new Date(user.joinDate).toLocaleDateString();
  
  // Calculate last active in relative time
  const lastActive = formatRelativeTime(user.lastActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center space-y-3 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
                {user.verified && (
                  <span className="flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
                {user.betterMeSubscriber && (
                  <span className="flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                    Better Me
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <span className="text-sm font-medium">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm font-medium">{joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Active</span>
                      <span className="text-sm font-medium">{lastActive}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Social Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posts</span>
                      <span className="text-sm font-medium">{user.postsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <span className="text-sm font-medium">{user.followersCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Following</span>
                      <span className="text-sm font-medium">{Math.floor(user.followersCount * 0.7)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Login Frequency</span>
                      <span className="text-sm font-medium">Daily</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '90%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <span className="text-sm font-medium">High</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Content Creation</span>
                      <span className="text-sm font-medium">Medium</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-yellow-500" style={{ width: '60%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Actions</CardTitle>
                  <CardDescription>User activity from the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Mock activity items */}
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                      </span>
                      <div>
                        <p className="text-sm">Posted a new story</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-300" />
                      </span>
                      <div>
                        <p className="text-sm">Liked 5 posts</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5 rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-300" />
                      </span>
                      <div>
                        <p className="text-sm">Followed 3 users</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5 rounded-full bg-amber-100 p-1 dark:bg-amber-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-300" />
                      </span>
                      <div>
                        <p className="text-sm">Updated profile picture</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-0.5 rounded-full bg-red-100 p-1 dark:bg-red-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-300" />
                      </span>
                      <div>
                        <p className="text-sm">Deleted a post</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Login History</CardTitle>
                  <CardDescription>Recent login attempts and sessions</CardDescription>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <div>
                        <p>Chrome on MacBook Pro</p>
                        <p className="text-xs text-muted-foreground">San Francisco, US</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Today, 10:42 AM</p>
                        <p className="text-xs font-medium text-green-600">Success</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p>Safari on iPhone 13</p>
                        <p className="text-xs text-muted-foreground">San Francisco, US</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Yesterday, 8:15 PM</p>
                        <p className="text-xs font-medium text-green-600">Success</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p>Chrome on Windows 11</p>
                        <p className="text-xs text-muted-foreground">New York, US</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Jul 8, 2:32 PM</p>
                        <p className="text-xs font-medium text-red-600">Failed</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p>Firefox on Ubuntu 22.04</p>
                        <p className="text-xs text-muted-foreground">San Francisco, US</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Jul 5, 11:07 AM</p>
                        <p className="text-xs font-medium text-green-600">Success</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Roles & Permissions</CardTitle>
                  <CardDescription>User access control settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Role</p>
                        <p className="text-sm text-muted-foreground">User access level</p>
                      </div>
                      <RoleBadge role={user.role} />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Permissions</h4>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">Create Content</span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Allowed
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">Moderate Comments</span>
                          <span className={user.role === 'user' ? 
                            "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300" : 
                            "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                          }>
                            {user.role === 'user' ? 'Denied' : 'Allowed'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">Report Content</span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Allowed
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">Access Admin Panel</span>
                          <span className={user.role === 'admin' ? 
                            "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300" : 
                            "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300"
                          }>
                            {user.role === 'admin' ? 'Allowed' : 'Denied'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Permissions
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Account Status</CardTitle>
                  <CardDescription>User account state management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Status</p>
                        <p className="text-sm text-muted-foreground">Account accessibility state</p>
                      </div>
                      <StatusBadge status={user.status} />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Actions</h4>
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm" className="justify-start">
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </Button>
                        {user.status === 'active' ? (
                          <Button variant="outline" size="sm" className="justify-start text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Suspend Account
                          </Button>
                        ) : user.status === 'suspended' ? (
                          <Button variant="outline" size="sm" className="justify-start text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Reactivate Account
                          </Button>
                        ) : null}
                        {user.status !== 'blocked' ? (
                          <Button variant="outline" size="sm" className="justify-start text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                            <BanIcon className="mr-2 h-4 w-4" />
                            Block Account
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="justify-start text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Unblock Account
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filter users based on search term, role, and status
  const filteredUsers = users.filter((user) => {
    // Apply search filter
    const searchMatch = 
      search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    // Apply role filter
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    
    // Apply status filter
    const statusMatch = filterStatus === 'all' || user.status === filterStatus;
    
    return searchMatch && roleMatch && statusMatch;
  });
  
  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'role':
        comparison = a.role.localeCompare(b.role);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'joinDate':
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
        break;
      case 'lastActive':
        comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
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
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">
                Manage users, roles, and permissions across the platform
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New User
            </Button>
          </div>
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10,243</div>
              <div className="text-xs text-muted-foreground">
                +124 new users this week
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,942</div>
              <div className="text-xs text-muted-foreground">
                87.3% of total users
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Better Me Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,765</div>
              <div className="text-xs text-muted-foreground">
                36.8% of total users
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reported Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <div className="text-xs text-muted-foreground">
                12 pending review
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Actions and Filters */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Role: {filterRole === 'all' ? 'All' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRole('all')}>All Roles</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('admin')}>Admin</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('moderator')}>Moderator</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('user')}>User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>Inactive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>Suspended</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('blocked')}>Blocked</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('pending')}>Pending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
        
        {/* Users Table */}
        <motion.div variants={itemVariants} className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('name')}
                  >
                    Name
                    {sortBy === 'name' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('email')}
                  >
                    Email
                    {sortBy === 'email' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('role')}
                  >
                    Role
                    {sortBy === 'role' && (
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
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('joinDate')}
                  >
                    Joined
                    {sortBy === 'joinDate' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('lastActive')}
                  >
                    Last Active
                    {sortBy === 'lastActive' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{user.name}</div>
                          {user.verified && (
                            <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>{formatRelativeTime(user.lastActive)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
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
        
        {/* User Detail Dialog */}
        {selectedUser && (
          <UserDetailDialog 
            user={selectedUser} 
            open={isDetailOpen} 
            onOpenChange={setIsDetailOpen} 
          />
        )}
        
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>
                Latest actions performed by users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{activity.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{activity.userName}</p>
                        <p className="text-muted-foreground">{activity.action}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                        <span>{activity.device}</span>
                        <span>{activity.ip}</span>
                        <span>{activity.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/users/activity">
                  View All Activity
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}