import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Bell, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import UserMenu from "@/components/layout/UserMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { api } from "@/lib/trpc/client";

export function Header(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Get notification and message counts
  const { data: notificationsData } = api.notification.getUnreadCount.useQuery(
    undefined,
    { enabled: !!session }
  );
  const { data: messagesData } = api.message.getUnreadCount.useQuery(
    undefined,
    { enabled: !!session }
  );

  const notificationCount = notificationsData?.count || 0;
  const messageCount = messagesData?.count || 0;

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo for mobile only */}
        <Link href="/" className="mr-4 flex items-center md:hidden">
          <span className="text-xl font-bold">DapDip</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {session?.user ? (
            <>
              <Link 
                href="/notifications" 
                className="relative rounded-full p-2 hover:bg-muted"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/messages" 
                className="relative rounded-full p-2 hover:bg-muted"
              >
                <MessageSquare className="h-5 w-5" />
                {messageCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {messageCount > 9 ? '9+' : messageCount}
                  </span>
                )}
              </Link>
              <ThemeToggle />
              <UserMenu user={session.user} />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link 
                href="/auth/signin" 
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}