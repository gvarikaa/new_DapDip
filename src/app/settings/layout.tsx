import type { Metadata, ReactNode } from 'next';

export const metadata: Metadata = {
  title: 'Settings | DapDip',
  description: 'Manage your DapDip account settings',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  );
}