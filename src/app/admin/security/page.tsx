'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Users, 
  AlertTriangle, 
  Clock, 
  Eye, 
  EyeOff,
  Search, 
  Trash2, 
  RotateCw, 
  Download, 
  Lock as LockIcon,
  User,
  Terminal,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for admins and audit logs
const ADMIN_USERS = [
  {
    id: '1',
    name: 'Sarah Williams',
    email: 'sarah.williams@dapdip.com',
    role: 'Super Admin',
    lastLogin: new Date(Date.now() - 1000 * 60 * 10),
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=5',
    twoFactorEnabled: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@dapdip.com',
    role: 'Admin',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=6',
    twoFactorEnabled: true,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@dapdip.com',
    role: 'Content Manager',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=7',
    twoFactorEnabled: false,
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@dapdip.com',
    role: 'Support Specialist',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=8',
    twoFactorEnabled: true,
  },
  {
    id: '5',
    name: 'Aisha Patel',
    email: 'aisha.patel@dapdip.com',
    role: 'Analytics Manager',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=9',
    twoFactorEnabled: true,
  },
];

const AUDIT_LOGS = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: 'Sarah Williams',
    action: 'User account updated',
    target: 'User ID: 45892',
    ipAddress: '192.168.1.103',
    status: 'success',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: 'Michael Chen',
    action: 'Content flagged as inappropriate',
    target: 'Post ID: 78943',
    ipAddress: '203.112.24.186',
    status: 'success',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    user: 'System',
    action: 'Automated content moderation',
    target: 'Post ID: 78952',
    ipAddress: 'Internal',
    status: 'success',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    user: 'Michael Chen',
    action: 'Failed login attempt',
    target: 'Account: michael.chen@dapdip.com',
    ipAddress: '203.112.24.187',
    status: 'failed',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    user: 'Sarah Williams',
    action: 'Admin role updated',
    target: 'User: Elena Rodriguez',
    ipAddress: '192.168.1.103',
    status: 'success',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    user: 'Elena Rodriguez',
    action: 'Settings changed',
    target: 'Content Moderation Settings',
    ipAddress: '172.16.254.1',
    status: 'success',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    user: 'API',
    action: 'Rate limit exceeded',
    target: 'API Key: ****8f2a3',
    ipAddress: '45.89.165.89',
    status: 'warning',
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    user: 'System',
    action: 'Database backup',
    target: 'Scheduled task',
    ipAddress: 'Internal',
    status: 'success',
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    user: 'Unknown',
    action: 'Attempted unauthorized access',
    target: 'Admin Panel',
    ipAddress: '103.74.19.154',
    status: 'failed',
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    user: 'Sarah Williams',
    action: 'API key generated',
    target: 'New API Key',
    ipAddress: '192.168.1.103',
    status: 'success',
  },
];

export default function SecurityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [adminUsers, setAdminUsers] = useState(ADMIN_USERS);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  // Filter admin users based on search term
  const filteredAdmins = adminUsers.filter(admin => {
    if (filter !== 'all' && admin.status !== filter) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        admin.name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        admin.role.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Filter audit logs based on search term
  const filteredLogs = auditLogs.filter(log => {
    if (filter !== 'all' && filter === 'success' && log.status !== 'success') {
      return false;
    }
    
    if (filter !== 'all' && filter === 'warning' && log.status !== 'warning') {
      return false;
    }
    
    if (filter !== 'all' && filter === 'failed' && log.status !== 'failed') {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.target.toLowerCase().includes(searchLower) ||
        log.ipAddress.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLogStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security</h1>
            <p className="text-muted-foreground">
              Manage admin access, audit logs, and security settings
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Lock className="mr-2 h-4 w-4" />
              Security Report
            </Button>
            <Button>
              <Shield className="mr-2 h-4 w-4" />
              Security Scan
            </Button>
          </div>
        </div>

        <Tabs defaultValue="admin-access" className="space-y-4">
          <TabsList>
            <TabsTrigger value="admin-access">Admin Access</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="auth-settings">Authentication</TabsTrigger>
            <TabsTrigger value="data-security">Data Security</TabsTrigger>
          </TabsList>
          
          {/* Admin Access Tab */}
          <TabsContent value="admin-access" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>
                      Manage administrator accounts and permissions
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search admins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="all" onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>2FA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={admin.avatar} />
                                <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{admin.name}</p>
                                <p className="text-xs text-muted-foreground">{admin.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={admin.role === 'Super Admin' ? 'default' : 'outline'}>
                              {admin.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(admin.lastLogin, 'MMM d, h:mm a')}
                          </TableCell>
                          <TableCell>
                            {admin.twoFactorEnabled ? 
                              <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                              <XCircle className="h-5 w-5 text-red-500" />
                            }
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(admin.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <User className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Terminal className="mr-2 h-4 w-4" />
                                  Edit Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Admin Role Permissions</CardTitle>
                <CardDescription>
                  Configure access levels for different admin roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Super Admin</h3>
                      <Badge>Highest Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access to all system settings, user management, and security controls.
                      Can create and manage other admin accounts.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Badge variant="outline" className="justify-center">User Management</Badge>
                      <Badge variant="outline" className="justify-center">Content Management</Badge>
                      <Badge variant="outline" className="justify-center">Security Settings</Badge>
                      <Badge variant="outline" className="justify-center">System Settings</Badge>
                      <Badge variant="outline" className="justify-center">Admin Management</Badge>
                      <Badge variant="outline" className="justify-center">Financial Data</Badge>
                      <Badge variant="outline" className="justify-center">API Management</Badge>
                      <Badge variant="outline" className="justify-center">Analytics</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Admin</h3>
                      <Badge variant="secondary">Standard Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Access to user management, content moderation, and basic system settings.
                      Cannot modify security settings or manage admin accounts.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Badge variant="outline" className="justify-center">User Management</Badge>
                      <Badge variant="outline" className="justify-center">Content Management</Badge>
                      <Badge variant="outline" className="justify-center">Basic Settings</Badge>
                      <Badge variant="outline" className="justify-center">Analytics</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Content Manager</h3>
                      <Badge variant="secondary">Limited Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Access limited to content moderation and publishing tools.
                      Cannot access user management or system settings.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Badge variant="outline" className="justify-center">Content Management</Badge>
                      <Badge variant="outline" className="justify-center">Content Analytics</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Support Specialist</h3>
                      <Badge variant="secondary">Support Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Access to user support tools and limited user management.
                      Cannot modify content or system settings.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Badge variant="outline" className="justify-center">View User Data</Badge>
                      <Badge variant="outline" className="justify-center">Support Messages</Badge>
                      <Badge variant="outline" className="justify-center">Help Center</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Edit Roles</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Audit Logs</CardTitle>
                    <CardDescription>
                      Comprehensive logs of all security-related system events
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="all" onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(log.timestamp, 'MMM d, h:mm:ss a')}
                          </TableCell>
                          <TableCell>
                            {log.user}
                          </TableCell>
                          <TableCell>
                            {log.action}
                          </TableCell>
                          <TableCell>
                            <span className="truncate">{log.target}</span>
                          </TableCell>
                          <TableCell>
                            {log.ipAddress}
                          </TableCell>
                          <TableCell>
                            {getLogStatusBadge(log.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredLogs.length} of {AUDIT_LOGS.length} logs
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>
                  Recent security-related alerts that require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Multiple Failed Login Attempts</AlertTitle>
                    <AlertDescription>
                      5 failed login attempts detected for account michael.chen@dapdip.com from IP 203.112.24.187.
                      Last attempt was 45 minutes ago.
                    </AlertDescription>
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button size="sm" variant="outline">Ignore</Button>
                      <Button size="sm" variant="destructive">Lock Account</Button>
                    </div>
                  </Alert>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Unusual Activity Detected</AlertTitle>
                    <AlertDescription>
                      Unusual admin panel access pattern detected from IP 103.74.19.154.
                      Multiple page requests in rapid succession.
                    </AlertDescription>
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button size="sm" variant="outline">Ignore</Button>
                      <Button size="sm">Investigate</Button>
                    </div>
                  </Alert>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>API Rate Limit Exceeded</AlertTitle>
                    <AlertDescription>
                      API key ****8f2a3 has exceeded rate limits multiple times in the past 24 hours.
                      This may indicate unauthorized usage or a misconfigured application.
                    </AlertDescription>
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button size="sm" variant="outline">Ignore</Button>
                      <Button size="sm">Revoke Key</Button>
                    </div>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Security Alerts
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Authentication Tab */}
          <TabsContent value="auth-settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Configure authentication methods and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Password Policy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Minimum Password Length</Label>
                      </div>
                      <Select defaultValue="12">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8">8 characters</SelectItem>
                          <SelectItem value="10">10 characters</SelectItem>
                          <SelectItem value="12">12 characters</SelectItem>
                          <SelectItem value="16">16 characters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Upper Case Letters</Label>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Numbers</Label>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Special Characters</Label>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Password Expiry</Label>
                      </div>
                      <Select defaultValue="90">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select expiry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Password History</Label>
                        <p className="text-sm text-muted-foreground">
                          Prevent reuse of previous passwords
                        </p>
                      </div>
                      <Select defaultValue="5">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Disabled</SelectItem>
                          <SelectItem value="3">Last 3 passwords</SelectItem>
                          <SelectItem value="5">Last 5 passwords</SelectItem>
                          <SelectItem value="10">Last 10 passwords</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require 2FA for Admin Users</Label>
                        <p className="text-sm text-muted-foreground">
                          Force all administrator accounts to enable 2FA
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable 2FA for Regular Users</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow regular users to enable 2FA for their accounts
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>2FA Methods</Label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="2fa-app" defaultChecked />
                          <Label htmlFor="2fa-app">Authenticator App</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="2fa-sms" defaultChecked />
                          <Label htmlFor="2fa-sms">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="2fa-email" defaultChecked />
                          <Label htmlFor="2fa-email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="2fa-security-key" />
                          <Label htmlFor="2fa-security-key">Security Key</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Session Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically log out inactive users
                        </p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Remember Me Duration</Label>
                        <p className="text-sm text-muted-foreground">
                          How long to keep users logged in with "Remember me"
                        </p>
                      </div>
                      <Select defaultValue="14">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Concurrent Sessions</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to be logged in on multiple devices
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Login Protection</CardTitle>
                <CardDescription>
                  Configure login security measures to prevent unauthorized access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Failed Login Attempts</Label>
                      <p className="text-sm text-muted-foreground">
                        Number of failed attempts before temporary lockout
                      </p>
                    </div>
                    <Select defaultValue="5">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Account Lockout Duration</Label>
                      <p className="text-sm text-muted-foreground">
                        How long accounts remain locked after failed attempts
                      </p>
                    </div>
                    <Select defaultValue="15">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="manual">Until manual unlock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require CAPTCHA</Label>
                      <p className="text-sm text-muted-foreground">
                        When to require CAPTCHA verification during login
                      </p>
                    </div>
                    <Select defaultValue="failures">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always</SelectItem>
                        <SelectItem value="failures">After failed attempts</SelectItem>
                        <SelectItem value="suspicious">Suspicious activity only</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP-Based Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit login attempts from the same IP address
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Location Login Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require email verification for logins from new locations
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Data Security Tab */}
          <TabsContent value="data-security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  Configure data security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Encryption</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Database Encryption</Label>
                      <p className="text-sm text-muted-foreground">
                        Encrypt sensitive data stored in the database
                      </p>
                    </div>
                    <Select defaultValue="sensitive">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sensitive">Sensitive fields only</SelectItem>
                        <SelectItem value="all">All user data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>End-to-End Encryption for Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable E2E encryption for direct messages
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SSL/TLS Version</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimum TLS version required for connections
                      </p>
                    </div>
                    <Select defaultValue="1.2">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.0">TLS 1.0 (Not recommended)</SelectItem>
                        <SelectItem value="1.1">TLS 1.1</SelectItem>
                        <SelectItem value="1.2">TLS 1.2</SelectItem>
                        <SelectItem value="1.3">TLS 1.3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backups & Recovery</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Schedule regular database backups
                      </p>
                    </div>
                    <Select defaultValue="daily">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Disabled</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep backup files
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Encryption</Label>
                      <p className="text-sm text-muted-foreground">
                        Encrypt backup files with a secure password
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline">Manual Backup</Button>
                    <Button variant="outline">Restore from Backup</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Retention</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Data Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep data after account deletion
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Delete immediately</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Deleted Content Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep deleted posts and comments
                      </p>
                    </div>
                    <Select defaultValue="90">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Delete immediately</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Log Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep audit and security logs
                      </p>
                    </div>
                    <Select defaultValue="365">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API & Integration Security</CardTitle>
                <CardDescription>
                  Configure API security settings and third-party access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Authentication Method</Label>
                      <p className="text-sm text-muted-foreground">
                        How API clients should authenticate
                      </p>
                    </div>
                    <Select defaultValue="oauth2">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="jwt">JWT Tokens</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit requests per minute per API key
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        defaultValue="100"
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">req/min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require HTTPS for All API Calls</Label>
                      <p className="text-sm text-muted-foreground">
                        Reject non-secure API requests
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>CORS Policy</Label>
                      <p className="text-sm text-muted-foreground">
                        Cross-Origin Resource Sharing settings
                      </p>
                    </div>
                    <Select defaultValue="allowlist">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No CORS (Not recommended)</SelectItem>
                        <SelectItem value="allowlist">Domain Allowlist</SelectItem>
                        <SelectItem value="all">Allow All Origins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Third-Party Integrations</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>OAuth Application Review</Label>
                      <p className="text-sm text-muted-foreground">
                        Require admin review for new OAuth applications
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing Limitations</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict what data third-party apps can access
                      </p>
                    </div>
                    <Select defaultValue="minimal">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full access</SelectItem>
                        <SelectItem value="standard">Standard access</SelectItem>
                        <SelectItem value="minimal">Minimal access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Webhooks Security</Label>
                      <p className="text-sm text-muted-foreground">
                        Security measures for outgoing webhooks
                      </p>
                    </div>
                    <Select defaultValue="hmac">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic Authentication</SelectItem>
                        <SelectItem value="hmac">HMAC Signatures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">View Connected Apps</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}

// More vertical icon component
function MoreVertical(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}