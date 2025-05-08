'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Palette, User, Bell, Lock, Globe, Eye, ExternalLink, HelpCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { 
        icon: <User className="h-5 w-5" />, 
        title: 'Profile Information', 
        description: 'Update your profile details and information',
        href: '/settings/profile'
      },
      { 
        icon: <Lock className="h-5 w-5" />, 
        title: 'Password & Security', 
        description: 'Manage your password and security settings',
        href: '/settings/security'
      },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { 
        icon: <Palette className="h-5 w-5" />, 
        title: 'Theme & Appearance', 
        description: 'Customize how DapDip looks for you',
        href: '/settings/theme'
      },
      { 
        icon: <Bell className="h-5 w-5" />, 
        title: 'Notifications', 
        description: 'Choose what notifications you want to receive',
        href: '/settings/notifications'
      },
      { 
        icon: <Globe className="h-5 w-5" />, 
        title: 'Language & Region', 
        description: 'Set your language and regional preferences',
        href: '/settings/language'
      },
      { 
        icon: <Eye className="h-5 w-5" />, 
        title: 'Privacy & Visibility', 
        description: 'Control who can see your content and activities',
        href: '/settings/privacy'
      },
    ]
  },
  {
    title: 'Support',
    items: [
      { 
        icon: <HelpCircle className="h-5 w-5" />, 
        title: 'Help & FAQ', 
        description: 'Get answers to common questions about DapDip',
        href: '/help'
      },
      { 
        icon: <ExternalLink className="h-5 w-5" />, 
        title: 'Terms & Policies', 
        description: 'Review our terms of service and policies',
        href: '/legal'
      },
    ]
  }
];

export default function SettingsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="space-y-8">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}