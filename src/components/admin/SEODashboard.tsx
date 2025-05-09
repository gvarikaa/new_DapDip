'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, 
  LineChart, 
  Search, 
  Layers, 
  Rocket, 
  Zap, 
  Globe, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Link as LinkIcon,
  Share2
} from 'lucide-react';

// Types for SEO analytics data
interface SEOMetric {
  name: string;
  value: number;
  change: number; // Percentage change
  status: 'success' | 'warning' | 'error' | 'neutral';
}

interface PageSEOData {
  url: string;
  title: string;
  description: string;
  score: number;
  issues: {
    critical: number;
    warnings: number;
    improvements: number;
  };
}

/**
 * SEO Dashboard Component for administrators
 * Displays SEO metrics, issues, and recommendations
 */
export default function SEODashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for demonstration
  const seoMetrics: SEOMetric[] = [
    { name: 'Organic Traffic', value: 12458, change: 8.3, status: 'success' },
    { name: 'Avg. Position', value: 12.4, change: -2.1, status: 'warning' },
    { name: 'Indexed Pages', value: 348, change: 12.5, status: 'success' },
    { name: 'Crawl Rate', value: 87, change: 4.3, status: 'success' },
    { name: 'Page Load Speed', value: 2.4, change: -15.2, status: 'success' },
    { name: 'Mobile Usability', value: 92, change: 1.8, status: 'success' },
  ];
  
  const topPages: PageSEOData[] = [
    {
      url: '/profile/johndoe',
      title: 'John Doe (@johndoe) | DapDip',
      description: "Check out John Doe's profile on DapDip",
      score: 92,
      issues: { critical: 0, warnings: 1, improvements: 2 },
    },
    {
      url: '/',
      title: 'DapDip - Social Network',
      description: 'Connect with friends and share your moments with DapDip social network',
      score: 95,
      issues: { critical: 0, warnings: 0, improvements: 2 },
    },
    {
      url: '/explore',
      title: 'Explore | DapDip',
      description: 'Discover new content and people on DapDip',
      score: 88,
      issues: { critical: 0, warnings: 2, improvements: 3 },
    },
    {
      url: '/messages',
      title: 'Messages | DapDip',
      description: 'Your private messages on DapDip',
      score: 81,
      issues: { critical: 1, warnings: 2, improvements: 4 },
    },
  ];
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const getChangeIndicator = (change: number): JSX.Element => {
    if (change > 0) {
      return <span className="text-green-500">↑ {change}%</span>;
    } else if (change < 0) {
      return <span className="text-red-500">↓ {Math.abs(change)}%</span>;
    } else {
      return <span className="text-gray-500">—</span>;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SEO Dashboard</h1>
        
        <div className="flex items-center gap-3">
          <Input
            type="search"
            placeholder="Search pages..."
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seoMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className={getStatusColor(metric.status)}>
                      {getChangeIndicator(metric.change)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Organic Traffic
                </CardTitle>
                <CardDescription>
                  Daily organic search traffic over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full bg-muted rounded-md flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Top Keywords
                </CardTitle>
                <CardDescription>
                  Keywords driving the most traffic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Traffic</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>social network</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>1,245</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>dapdip login</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>983</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>photo sharing app</TableCell>
                      <TableCell>14</TableCell>
                      <TableCell>756</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>connect with friends</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>621</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>stories platform</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>548</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pages" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages by SEO Performance</CardTitle>
              <CardDescription>
                Analysis of your best performing pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map((page) => (
                    <TableRow key={page.url}>
                      <TableCell className="font-medium">{page.url}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={page.title}>
                          {page.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" title={page.description}>
                          {page.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={page.score}
                            className="h-2 w-16"
                            indicatorClassName={
                              page.score >= 90 ? 'bg-green-500' :
                              page.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }
                          />
                          <span>{page.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {page.issues.critical > 0 && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              {page.issues.critical} critical
                            </span>
                          )}
                          {page.issues.warnings > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              {page.issues.warnings} warnings
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Analyze
                          </Button>
                          <Button variant="ghost" size="sm">
                            Optimize
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
              <CardDescription>
                Track performance of important keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full bg-muted rounded-md flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">Issues that need immediate attention</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">View All</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Issues that should be addressed</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">View All</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">28</div>
                <p className="text-sm text-muted-foreground">Potential improvements to consider</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">View All</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>SEO Issues</CardTitle>
              <CardDescription>
                All detected SEO issues and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Missing meta descriptions on 3 pages</h3>
                      <p className="text-sm text-muted-foreground">
                        Meta descriptions are missing on several pages, which may affect click-through rates from search results.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">Fix Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Slow page load time on mobile</h3>
                      <p className="text-sm text-muted-foreground">
                        Some pages have slow loading times on mobile devices, which can impact user experience and search rankings.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Improve internal linking structure</h3>
                      <p className="text-sm text-muted-foreground">
                        Adding more internal links between related content can improve site navigation and SEO performance.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">View Recommendations</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Schema.org Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Organization</Label>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex justify-between items-center">
                <Label>Profile</Label>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex justify-between items-center">
                <Label>SocialMediaPosting</Label>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex justify-between items-center">
                <Label>BreadcrumbList</Label>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex justify-between items-center">
                <Label>Article</Label>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Inbound Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 w-full bg-muted rounded-md flex items-center justify-center">
              <BarChart className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">127</span> new backlinks in the last 30 days
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Facebook</Label>
                <span>1,245 shares</span>
              </div>
              <div className="flex justify-between items-center">
                <Label>Twitter</Label>
                <span>867 shares</span>
              </div>
              <div className="flex justify-between items-center">
                <Label>Pinterest</Label>
                <span>432 shares</span>
              </div>
              <div className="flex justify-between items-center">
                <Label>LinkedIn</Label>
                <span>218 shares</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            AI-Powered SEO Recommendations
          </CardTitle>
          <CardDescription>
            Smart suggestions to improve your SEO performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Optimize trending keywords in profile pages</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI has detected increased search volume for "social audio" and "voice messaging" keywords. Consider incorporating these themes into profile pages to capture this traffic.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm">Implement</Button>
                <Button variant="outline" size="sm">Dismiss</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Improve meta descriptions for story pages</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Story pages have generic meta descriptions. Adding more specific, keyword-rich descriptions could improve click-through rates by approximately 15%.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm">Generate AI Descriptions</Button>
                <Button variant="outline" size="sm">Dismiss</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Add FAQ schema to help pages</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adding FAQ schema markup to help pages could increase visibility in search results with rich snippets, potentially increasing click-through rates.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm">Add Schema</Button>
                <Button variant="outline" size="sm">Dismiss</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}