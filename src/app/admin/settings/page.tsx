'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Undo2, 
  Upload, 
  Settings as SettingsIcon, 
  Info, 
  AlertTriangle, 
  Lock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch
} from "@/components/ui/switch";
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';

export default function SettingsPage() {
  // Mock settings values
  const [siteName, setSiteName] = useState('DapDip Social Network');
  const [siteDescription, setSiteDescription] = useState('A modern social platform focused on health, wellness, and community connection');
  const [siteUrl, setSiteUrl] = useState('https://dapdip.com');
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userRegistration, setUserRegistration] = useState(true);
  const [contentModeration, setContentModeration] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);
  const [betterMeFeatures, setBetterMeFeatures] = useState(true);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);
  
  // Mock save functionality with confirmation message
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setSaveMessage('Settings saved successfully');
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }, 800);
  };
  
  const handleRevert = () => {
    // For demo purposes, we're not actually reverting anything
    setSaveError('This functionality is not implemented in the demo');
    setTimeout(() => setSaveError(null), 3000);
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
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage global application settings and configurations
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRevert}>
              <Undo2 className="mr-2 h-4 w-4" />
              Revert Changes
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
        
        {saveMessage && (
          <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}
        
        {saveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your social platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The name of your social network, displayed in browser tabs and emails
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    A brief description of your platform, used in search results and metadata
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The primary URL of your social platform
                  </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="site-logo">Site Logo</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-16 w-16 rounded-md border bg-muted"></div>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 512x512px, PNG or SVG
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site-favicon">Site Favicon</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-16 w-16 rounded-md border bg-muted"></div>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 32x32px, ICO or PNG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Localization</CardTitle>
                <CardDescription>
                  Language, timezone, and date formatting settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="CST">Central Time</SelectItem>
                        <SelectItem value="MST">Mountain Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                        <SelectItem value="CET">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MMM D, YYYY">MMM D, YYYY</SelectItem>
                        <SelectItem value="D MMM YYYY">D MMM YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select value={timeFormat} onValueChange={setTimeFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Control the operational status of your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, the site will display a maintenance page to all non-admin users
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                
                {maintenanceMode && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Maintenance Mode Active</AlertTitle>
                    <AlertDescription>
                      Your site is currently in maintenance mode. Only administrators can access the site.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="We're currently performing maintenance. Please check back soon."
                    rows={3}
                    disabled={!maintenanceMode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Features</CardTitle>
                <CardDescription>
                  Enable or disable main platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="user-registration">User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to create accounts on the platform
                    </p>
                  </div>
                  <Switch
                    id="user-registration"
                    checked={userRegistration}
                    onCheckedChange={setUserRegistration}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="content-moderation">Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered content moderation for posts and comments
                    </p>
                  </div>
                  <Switch
                    id="content-moderation"
                    checked={contentModeration}
                    onCheckedChange={setContentModeration}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-features">AI Assistant Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered features like content suggestions and analysis
                    </p>
                  </div>
                  <Switch
                    id="ai-features"
                    checked={aiFeatures}
                    onCheckedChange={setAiFeatures}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="better-me-features">Better Me Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable health and wellness tracking and recommendations
                    </p>
                  </div>
                  <Switch
                    id="better-me-features"
                    checked={betterMeFeatures}
                    onCheckedChange={setBetterMeFeatures}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics-tracking">Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable internal analytics to track user engagement and platform usage
                    </p>
                  </div>
                  <Switch
                    id="analytics-tracking"
                    checked={analyticsTracking}
                    onCheckedChange={setAnalyticsTracking}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>
                  Settings for AI-powered features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select defaultValue="gemini-1.5-pro">
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    The large language model used for AI features
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="token-limit">Default Monthly Token Limit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="token-limit"
                      type="number"
                      defaultValue="1000"
                    />
                    <span className="text-sm text-muted-foreground">tokens</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Default monthly token allocation for free users
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-filter">Content Filter Strength</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Controls how aggressively AI models filter inappropriate content
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Feature Limits</CardTitle>
                <CardDescription>
                  Set limits for various platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-upload-size">Maximum Upload Size</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="max-upload-size"
                        type="number"
                        defaultValue="50"
                      />
                      <span className="text-sm text-muted-foreground">MB</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-video-length">Maximum Video Length</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="max-video-length"
                        type="number"
                        defaultValue="10"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="story-duration">Story Duration</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="story-duration"
                        type="number"
                        defaultValue="24"
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="post-character-limit">Post Character Limit</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="post-character-limit"
                        type="number"
                        defaultValue="1000"
                      />
                      <span className="text-sm text-muted-foreground">characters</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Configuration</CardTitle>
                <CardDescription>
                  Customize the visual appearance of your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-theme">Default Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue placeholder="Select default theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    The default theme for new users
                  </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-md bg-blue-500"></div>
                      <Input
                        id="primary-color"
                        type="text"
                        defaultValue="#3b82f6"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-md bg-purple-500"></div>
                      <Input
                        id="secondary-color"
                        type="text"
                        defaultValue="#8b5cf6"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-family">Default Font Family</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger>
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="open-sans">Open Sans</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="system-ui">System UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-animations">Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable UI animations throughout the platform
                    </p>
                  </div>
                  <Switch
                    id="enable-animations"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="rounded-corners">Rounded Corners</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable rounded corners on UI elements
                    </p>
                  </div>
                  <Switch
                    id="rounded-corners"
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Landing Page</CardTitle>
                <CardDescription>
                  Configure the landing page for new and logged-out users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Hero Title</Label>
                  <Input
                    id="hero-title"
                    defaultValue="Connect, Share, and Grow with DapDip"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    defaultValue="Join our community focused on wellness, personal growth, and meaningful connections."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-image">Hero Image</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-20 w-32 rounded-md border bg-muted"></div>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 1920x1080px, JPG or PNG
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="featured-sections">Featured Sections</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature-community" defaultChecked />
                      <Label htmlFor="feature-community">Community Highlights</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature-better-me" defaultChecked />
                      <Label htmlFor="feature-better-me">Better Me Showcase</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature-testimonials" defaultChecked />
                      <Label htmlFor="feature-testimonials">User Testimonials</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature-ai" defaultChecked />
                      <Label htmlFor="feature-ai">AI Features</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Caching & Performance</CardTitle>
                <CardDescription>
                  Configure caching and performance optimizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-caching">Enable Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache static content to improve load times
                    </p>
                  </div>
                  <Switch
                    id="enable-caching"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache TTL (Time to Live)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="cache-ttl"
                      type="number"
                      defaultValue="3600"
                    />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    How long cached content remains valid
                  </p>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="image-optimization">Image Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically optimize images for faster loading
                    </p>
                  </div>
                  <Switch
                    id="image-optimization"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="lazy-loading">Lazy Loading</Label>
                    <p className="text-sm text-muted-foreground">
                      Load images and content only when they enter the viewport
                    </p>
                  </div>
                  <Switch
                    id="lazy-loading"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="code-minification">Code Minification</Label>
                    <p className="text-sm text-muted-foreground">
                      Minify JavaScript and CSS for faster loading
                    </p>
                  </div>
                  <Switch
                    id="code-minification"
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Media Optimization</CardTitle>
                <CardDescription>
                  Configure image and video optimization settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-quality">Image Quality</Label>
                  <Select defaultValue="85">
                    <SelectTrigger>
                      <SelectValue placeholder="Select image quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Maximum (100%)</SelectItem>
                      <SelectItem value="90">High (90%)</SelectItem>
                      <SelectItem value="85">Medium - High (85%)</SelectItem>
                      <SelectItem value="80">Medium (80%)</SelectItem>
                      <SelectItem value="70">Low (70%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    JPEG/WebP quality for uploaded images
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video-quality">Video Transcoding Quality</Label>
                  <Select defaultValue="720p">
                    <SelectTrigger>
                      <SelectValue placeholder="Select video quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="360p">360p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="2k">2K</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Maximum resolution for transcoded videos
                  </p>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="webp-conversion">WebP Conversion</Label>
                    <p className="text-sm text-muted-foreground">
                      Convert images to WebP format for better compression
                    </p>
                  </div>
                  <Switch
                    id="webp-conversion"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="responsive-images">Responsive Images</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate multiple sizes of images for different devices
                    </p>
                  </div>
                  <Switch
                    id="responsive-images"
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure API settings and access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-api">Enable API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow external applications to access the platform API
                    </p>
                  </div>
                  <Switch
                    id="enable-api"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-rate-limit">API Rate Limit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="api-rate-limit"
                      type="number"
                      defaultValue="100"
                    />
                    <span className="text-sm text-muted-foreground">requests per minute</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-keys">API Keys</Label>
                  <div className="space-y-2">
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Primary API Key</p>
                          <p className="text-sm text-muted-foreground">Created on May 1, 2023</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rotate
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <Input
                          value="••••••••••••••••••••••••••••••"
                          type="password"
                          readOnly
                        />
                        <Button variant="outline" size="sm">
                          Show
                        </Button>
                      </div>
                    </div>
                    
                    <Button variant="outline">
                      Generate New API Key
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allowed-origins">Allowed Origins (CORS)</Label>
                  <Textarea
                    id="allowed-origins"
                    placeholder="https://example.com, https://app.example.com"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    List of domains allowed to make API requests, one per line
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>
                  Configure database settings and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Warning: Advanced Settings</AlertTitle>
                  <AlertDescription>
                    These settings should only be modified by experienced administrators.
                    Incorrect configuration can result in data loss or system instability.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="db-connection-limit">Database Connection Limit</Label>
                  <Input
                    id="db-connection-limit"
                    type="number"
                    defaultValue="20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of concurrent database connections
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="db-timeout">Query Timeout</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="db-timeout"
                      type="number"
                      defaultValue="30"
                    />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Maintenance Tasks</Label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Optimize Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Vacuum Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="mr-2 h-4 w-4" />
                      Backup Database
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Danger Zone</AlertTitle>
                  <AlertDescription>
                    The following actions are potentially destructive and cannot be undone.
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" className="w-full">
                  Reset Database to Defaults
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Logging</CardTitle>
                <CardDescription>
                  Configure system logging and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger>
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="trace">Trace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="log-to-file">Log to File</Label>
                    <p className="text-sm text-muted-foreground">
                      Save logs to disk in addition to console output
                    </p>
                  </div>
                  <Switch
                    id="log-to-file"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="log-rotation">Log Rotation</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select log rotation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="size-10mb">Size based (10MB)</SelectItem>
                      <SelectItem value="size-100mb">Size based (100MB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="log-retention">Log Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select log retention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View System Logs
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}