import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | DapDip',
  description: 'Manage your DapDip account settings',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  );
}