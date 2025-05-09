'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Clock, 
  Search, 
  ChevronDown, 
  Send, 
  Trash2, 
  CheckSquare, 
  Paperclip,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock message data
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: {
      id: 'user1',
      name: 'Jane Cooper',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'user'
    },
    category: 'support',
    subject: 'Account verification issue',
    content: 'I\'ve been trying to verify my account for the past two days but I keep getting an error message. Can someone help me with this issue?',
    attachments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
    status: 'open',
    priority: 'medium',
    responses: [
      {
        id: 'resp1',
        sender: {
          id: 'admin1',
          name: 'Support Team',
          avatar: '',
          role: 'admin'
        },
        content: 'Hi Jane, I\'ll be happy to help you with your verification issue. Could you please provide a screenshot of the error message you\'re receiving?',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
        attachments: []
      }
    ]
  },
  {
    id: '2',
    sender: {
      id: 'user2',
      name: 'Robert Fox',
      avatar: 'https://i.pravatar.cc/150?img=2',
      role: 'user'
    },
    category: 'feature',
    subject: 'Suggestion for Better Me section',
    content: 'I really love the Better Me section, but I think it would be great if we could have more customized workout plans based on equipment availability. Not everyone has access to a full gym.',
    attachments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isRead: true,
    status: 'open',
    priority: 'low',
    responses: []
  },
  {
    id: '3',
    sender: {
      id: 'user3',
      name: 'Brooklyn Simmons',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'user'
    },
    category: 'report',
    subject: 'Inappropriate content in post #4532',
    content: 'I want to report a post that contains harmful content. The post ID is #4532 and it has graphic content that shouldn\'t be allowed according to your community guidelines.',
    attachments: [
      { name: 'screenshot.png', size: '243 KB', type: 'image/png' }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    status: 'open',
    priority: 'high',
    responses: []
  },
  {
    id: '4',
    sender: {
      id: 'user4',
      name: 'Cameron Williamson',
      avatar: 'https://i.pravatar.cc/150?img=4',
      role: 'user'
    },
    category: 'billing',
    subject: 'Double charged for AI tokens',
    content: 'I was charged twice for my AI token package purchase on May 3rd. Order numbers: #ORD-2345 and #ORD-2346. Could you please look into this and process a refund for the duplicate charge?',
    attachments: [
      { name: 'receipt1.pdf', size: '156 KB', type: 'application/pdf' },
      { name: 'receipt2.pdf', size: '158 KB', type: 'application/pdf' }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    isRead: true,
    status: 'resolved',
    priority: 'medium',
    responses: [
      {
        id: 'resp2',
        sender: {
          id: 'admin2',
          name: 'Billing Support',
          avatar: '',
          role: 'admin'
        },
        content: 'Hello Cameron, Thank you for bringing this to our attention. I\'ve confirmed that there was a duplicate charge, and I\'ve processed a refund for order #ORD-2346. The refund should appear on your account within 3-5 business days.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        attachments: []
      },
      {
        id: 'resp3',
        sender: {
          id: 'user4',
          name: 'Cameron Williamson',
          avatar: 'https://i.pravatar.cc/150?img=4',
          role: 'user'
        },
        content: 'Thank you for the quick resolution! I appreciate it.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        attachments: []
      }
    ]
  },
  {
    id: '5',
    sender: {
      id: 'user5',
      name: 'Leslie Alexander',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'user'
    },
    category: 'bug',
    subject: 'App crashes when uploading 4K videos',
    content: 'I\'ve noticed that the app consistently crashes when I try to upload 4K videos over 2 minutes long. This happens on both my iPhone 14 Pro and my iPad Pro. I\'ve attached my device logs for reference.',
    attachments: [
      { name: 'crash_log.txt', size: '324 KB', type: 'text/plain' }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isRead: true,
    status: 'in-progress',
    priority: 'high',
    responses: [
      {
        id: 'resp4',
        sender: {
          id: 'admin3',
          name: 'Technical Support',
          avatar: '',
          role: 'admin'
        },
        content: 'Hi Leslie, Thanks for reporting this issue. We\'ve been able to reproduce the crash with 4K videos over 2 minutes in length. Our engineering team is working on a fix, which should be included in the next app update (v2.4.5) scheduled for release next week.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        attachments: []
      }
    ]
  }
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [newReplyContent, setNewReplyContent] = useState('');

  const selectedMessage = messages.find(msg => msg.id === selectedMessageId);

  // Filter messages based on current filter and search term
  const filteredMessages = messages.filter(message => {
    // Filter by status
    if (currentFilter !== 'all' && message.status !== currentFilter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        message.subject.toLowerCase().includes(searchLower) ||
        message.content.toLowerCase().includes(searchLower) ||
        message.sender.name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Mark a message as read
  const markAsRead = (id: string) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, isRead: true } : message
    ));
  };

  // Handle message selection
  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
    markAsRead(id);
  };

  // Handle status change
  const handleStatusChange = (id: string, status: string) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, status } : message
    ));
  };

  // Handle sending a reply
  const handleSendReply = () => {
    if (!selectedMessageId || !newReplyContent.trim()) return;

    const updatedMessages = messages.map(message => {
      if (message.id === selectedMessageId) {
        return {
          ...message,
          responses: [
            ...message.responses,
            {
              id: `resp${Date.now()}`,
              sender: {
                id: 'admin1',
                name: 'Support Team',
                avatar: '',
                role: 'admin'
              },
              content: newReplyContent,
              timestamp: new Date(),
              attachments: []
            }
          ]
        };
      }
      return message;
    });

    setMessages(updatedMessages);
    setNewReplyContent('');
  };

  // Priority badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return null;
    }
  };

  // Category badge styles
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'support':
        return <Badge variant="outline">Support</Badge>;
      case 'feature':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Feature</Badge>;
      case 'report':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Report</Badge>;
      case 'billing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Billing</Badge>;
      case 'bug':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Bug</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Manage and respond to user messages, support requests, and reports.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              Create Template
            </Button>
            <Button>
              Bulk Actions
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Message List Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inbox</CardTitle>
                <Badge variant="outline">
                  {filteredMessages.filter(m => !m.isRead).length} Unread
                </Badge>
              </div>
              <div className="flex w-full items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {currentFilter === 'all' ? 'All' : 
                       currentFilter === 'open' ? 'Open' : 
                       currentFilter === 'in-progress' ? 'In Progress' : 
                       'Resolved'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCurrentFilter('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentFilter('open')}>Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentFilter('in-progress')}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentFilter('resolved')}>Resolved</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex cursor-pointer flex-col rounded-lg border p-3 transition-colors",
                        selectedMessageId === message.id ? "bg-muted" : "hover:bg-accent/10",
                        !message.isRead && "border-l-4 border-l-primary"
                      )}
                      onClick={() => handleSelectMessage(message.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{message.sender.name}</p>
                            <div className="flex items-center space-x-2">
                              {getCategoryBadge(message.category)}
                              {getPriorityBadge(message.priority)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(message.timestamp, 'MMM d, h:mm a')}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium">{message.subject}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {message.content}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {message.attachments.length > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Paperclip className="mr-1 h-3 w-3" />
                              {message.attachments.length}
                            </div>
                          )}
                          {message.responses.length > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              {message.responses.length}
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant={
                            message.status === 'resolved' ? 'secondary' : 
                            message.status === 'in-progress' ? 'default' : 
                            'outline'
                          }
                          className="text-xs"
                        >
                          {message.status === 'resolved' ? 'Resolved' : 
                           message.status === 'in-progress' ? 'In Progress' : 
                           'Open'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No messages found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Conversation Panel */}
          <Card className="lg:col-span-2">
            {selectedMessage ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedMessage.subject}</CardTitle>
                      <CardDescription>
                        From: {selectedMessage.sender.name} • {format(selectedMessage.timestamp, 'PPP p')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            {selectedMessage.status === 'resolved' ? 'Resolved' : 
                             selectedMessage.status === 'in-progress' ? 'In Progress' : 
                             'Open'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusChange(selectedMessage.id, 'open')}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(selectedMessage.id, 'in-progress')}>
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(selectedMessage.id, 'resolved')}>
                            Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreActionsIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Flag as Important
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" />
                            Block Sender
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="conversation">
                    <TabsList className="mb-4">
                      <TabsTrigger value="conversation">Conversation</TabsTrigger>
                      <TabsTrigger value="user">User Info</TabsTrigger>
                      <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="conversation" className="space-y-4">
                      {/* Original message */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedMessage.sender.avatar} />
                              <AvatarFallback>{selectedMessage.sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{selectedMessage.sender.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(selectedMessage.timestamp, 'PPP p')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {getCategoryBadge(selectedMessage.category)}
                            {getPriorityBadge(selectedMessage.priority)}
                          </div>
                        </div>
                        <div className="mt-4 whitespace-pre-line">
                          {selectedMessage.content}
                        </div>
                        {selectedMessage.attachments.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm font-medium">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedMessage.attachments.map((attachment, index) => (
                                <div 
                                  key={index}
                                  className="flex items-center rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
                                >
                                  <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{attachment.name}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">({attachment.size})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Response thread */}
                      {selectedMessage.responses.map((response, index) => (
                        <div 
                          key={response.id}
                          className={cn(
                            "rounded-lg border p-4",
                            response.sender.role === 'admin' ? "bg-muted/50 ml-4" : ""
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={response.sender.avatar} />
                              <AvatarFallback>
                                {response.sender.role === 'admin' ? 'A' : response.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {response.sender.name}
                                {response.sender.role === 'admin' && (
                                  <Badge variant="outline" className="ml-2">Staff</Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(response.timestamp, 'PPP p')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 whitespace-pre-line">
                            {response.content}
                          </div>
                          {response.attachments?.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-sm font-medium">Attachments:</p>
                              <div className="flex flex-wrap gap-2">
                                {response.attachments.map((attachment, i) => (
                                  <div 
                                    key={i}
                                    className="flex items-center rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
                                  >
                                    <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{attachment.name}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">({attachment.size})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Reply box */}
                      {selectedMessage.status !== 'resolved' && (
                        <div className="rounded-lg border p-4">
                          <p className="mb-2 text-sm font-medium">Reply to {selectedMessage.sender.name}</p>
                          <div className="space-y-4">
                            <textarea 
                              className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              placeholder="Type your response here..."
                              rows={5}
                              value={newReplyContent}
                              onChange={(e) => setNewReplyContent(e.target.value)}
                            ></textarea>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Paperclip className="mr-2 h-4 w-4" />
                                  Attach File
                                </Button>
                                <Button variant="outline" size="sm">
                                  Insert Template
                                </Button>
                              </div>
                              <Button 
                                onClick={handleSendReply}
                                disabled={!newReplyContent.trim()}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Send Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="user" className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="mb-4 flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedMessage.sender.avatar} />
                            <AvatarFallback>{selectedMessage.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-bold">{selectedMessage.sender.name}</h3>
                            <p className="text-muted-foreground">User ID: {selectedMessage.sender.id}</p>
                            <div className="mt-2 flex space-x-2">
                              <Button variant="outline" size="sm">View Profile</Button>
                              <Button variant="outline" size="sm">Message History</Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 font-medium">User Information</h4>
                            <div className="rounded-md border">
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Joined Date</p>
                                <p className="text-sm">January 15, 2023</p>
                              </div>
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="text-sm">user@example.com</p>
                              </div>
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Account Status</p>
                                <Badge variant="outline">Active</Badge>
                              </div>
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Verification</p>
                                <Badge>Verified</Badge>
                              </div>
                              <div className="flex justify-between px-4 py-2">
                                <p className="text-sm text-muted-foreground">Last Login</p>
                                <p className="text-sm">Today, 10:42 AM</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="mb-2 font-medium">Activity Overview</h4>
                            <div className="rounded-md border">
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Total Posts</p>
                                <p className="text-sm">87</p>
                              </div>
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Comments</p>
                                <p className="text-sm">132</p>
                              </div>
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">Support Tickets</p>
                                <p className="text-sm">5</p>
                              </div>
                              <div className="flex justify-between border-b px-4 py-2">
                                <p className="text-sm text-muted-foreground">AI Token Usage</p>
                                <p className="text-sm">423 tokens</p>
                              </div>
                              <div className="flex justify-between px-4 py-2">
                                <p className="text-sm text-muted-foreground">Premium Status</p>
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Gold</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="mb-2 font-medium">Notes</h4>
                          <textarea 
                            className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Add admin notes about this user..."
                            rows={3}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <Button variant="outline" size="sm">Save Notes</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="attachments">
                      <div className="rounded-lg border p-4">
                        <h3 className="mb-4 text-lg font-medium">All Attachments</h3>
                        {selectedMessage.attachments.length > 0 || 
                          selectedMessage.responses.some(r => r.attachments?.length > 0) ? (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {selectedMessage.attachments.map((attachment, index) => (
                              <div 
                                key={`original-${index}`}
                                className="flex flex-col rounded-lg border p-4"
                              >
                                <div className="mb-2 flex justify-between">
                                  <p className="font-medium">{attachment.name}</p>
                                  <Badge variant="outline">{attachment.size}</Badge>
                                </div>
                                <div className="flex-1 rounded-md bg-muted/40 p-8 text-center">
                                  <Paperclip className="mx-auto h-10 w-10 text-muted-foreground" />
                                </div>
                                <div className="mt-4 flex justify-between">
                                  <p className="text-xs text-muted-foreground">Added by {selectedMessage.sender.name}</p>
                                  <Button variant="ghost" size="sm">Download</Button>
                                </div>
                              </div>
                            ))}
                            
                            {selectedMessage.responses.flatMap((response, responseIndex) => 
                              (response.attachments || []).map((attachment, attachmentIndex) => (
                                <div 
                                  key={`response-${responseIndex}-${attachmentIndex}`}
                                  className="flex flex-col rounded-lg border p-4"
                                >
                                  <div className="mb-2 flex justify-between">
                                    <p className="font-medium">{attachment.name}</p>
                                    <Badge variant="outline">{attachment.size}</Badge>
                                  </div>
                                  <div className="flex-1 rounded-md bg-muted/40 p-8 text-center">
                                    <Paperclip className="mx-auto h-10 w-10 text-muted-foreground" />
                                  </div>
                                  <div className="mt-4 flex justify-between">
                                    <p className="text-xs text-muted-foreground">Added by {response.sender.name}</p>
                                    <Button variant="ghost" size="sm">Download</Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                            <Paperclip className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              No attachments in this conversation
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Select a message</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a message from the list to view the conversation.
                </p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </AdminLayout>
  );
}

// More actions icon
function MoreActionsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}