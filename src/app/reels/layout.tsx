import type { Metadata, ReactNode } from 'next';

export const metadata: Metadata = {
  title: 'Reels | DapDip',
  description: 'Discover and watch short, engaging videos from creators around the world.',
};

export default function ReelsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-black">
      {children}
    </div>
  );
}