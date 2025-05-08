'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import ThemeSettings from '@/components/settings/ThemeSettings';

export default function ThemeSettingsPage() {
  const router = useRouter();
  
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Theme &amp; Appearance</h1>
      </div>
      
      <ThemeSettings />
    </div>
  );
}