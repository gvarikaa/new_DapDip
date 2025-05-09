'use client';

import { useState, useEffect, type ReactNode, type ElementType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  Heart, 
  BarChart2, 
  Settings, 
  Shield, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Sun, 
  Moon,
  User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

type NavItem = {
  title: string;
  href: string;
  icon: ElementType;
  submenu?: { title: string; href: string }[];
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: string; read: boolean }[]>([
    { id: '1', text: 'New user registration spike detected', type: 'info', read: false },
    { id: '2', text: 'Content reported for moderation', type: 'warning', read: false },
    { id: '3', text: 'System update completed successfully', type: 'success', read: true },
  ]);

  // Required for server-side rendering with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      submenu: [
        { title: 'All Users', href: '/admin/users' },
        { title: 'Roles & Permissions', href: '/admin/users/roles' },
        { title: 'Verification', href: '/admin/users/verification' },
        { title: 'Blocked Users', href: '/admin/users/blocked' },
      ],
    },
    {
      title: 'Content',
      href: '/admin/content',
      icon: FileText,
      submenu: [
        { title: 'Posts', href: '/admin/content/posts' },
        { title: 'Comments', href: '/admin/content/comments' },
        { title: 'Stories', href: '/admin/content/stories' },
        { title: 'Reels', href: '/admin/content/reels' },
        { title: 'Reported Content', href: '/admin/content/reported' },
      ],
    },
    {
      title: 'Messages',
      href: '/admin/messages',
      icon: MessageSquare,
    },
    {
      title: 'Better Me',
      href: '/admin/better-me',
      icon: Heart,
      submenu: [
        { title: 'Analytics', href: '/admin/better-me/analytics' },
        { title: 'Meal Plans', href: '/admin/better-me/meal-plans' },
        { title: 'Workout Plans', href: '/admin/better-me/workout-plans' },
        { title: 'Assistant Config', href: '/admin/better-me/assistant' },
      ],
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart2,
      submenu: [
        { title: 'Overview', href: '/admin/analytics' },
        { title: 'User Analytics', href: '/admin/analytics/users' },
        { title: 'Content Analytics', href: '/admin/analytics/content' },
        { title: 'AI Usage', href: '/admin/analytics/ai' },
      ],
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      submenu: [
        { title: 'General', href: '/admin/settings' },
        { title: 'SEO', href: '/admin/settings/seo' },
        { title: 'Email', href: '/admin/settings/email' },
        { title: 'API', href: '/admin/settings/api' },
      ],
    },
    {
      title: 'Security',
      href: '/admin/security',
      icon: Shield,
      submenu: [
        { title: 'Admin Access', href: '/admin/security' },
        { title: 'Audit Logs', href: '/admin/security/logs' },
        { title: 'Authentication', href: '/admin/security/auth' },
      ],
    },
  ];

  const toggleSubmenu = (title: string) => {
    if (expandedSubmenu === title) {
      setExpandedSubmenu(null);
    } else {
      setExpandedSubmenu(title);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // The sidebar for both mobile and desktop
  const Sidebar = (
    <motion.aside
      initial={false}
      animate={{
        width: isSidebarOpen ? '240px' : '80px',
        transition: { duration: 0.3 },
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-card shadow-sm",
        isSidebarOpen ? "w-60" : "w-20"
      )}
    >
      {/* Logo and toggle button */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link 
          href="/admin/dashboard" 
          className={cn(
            "flex items-center",
            isSidebarOpen ? "justify-start" : "justify-center w-full"
          )}
        >
          {isSidebarOpen ? (
            <span className="text-xl font-bold">DapDip Admin</span>
          ) : (
            <span className="text-xl font-bold">DD</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={isSidebarOpen ? "" : "hidden"}
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <div key={item.title} className="mb-1">
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.title)}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isSidebarOpen ? "mr-2" : "")} />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedSubmenu === item.title && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {isSidebarOpen && expandedSubmenu === item.title && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {item.submenu.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            className={cn(
                              "flex rounded-md px-3 py-2 text-sm transition-colors",
                              isActive(subitem.href)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {subitem.title}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5", isSidebarOpen ? "mr-2" : "")} />
                {isSidebarOpen && <span className="truncate">{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t p-3">
        {isSidebarOpen ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback>{session?.user?.name?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>{session?.user?.name?.[0] || "A"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </motion.aside>
  );

  // Handle click outside to close sidebar on mobile
  const handleContentClick = () => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for both mobile and desktop */}
      {Sidebar}

      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 bg-black"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          isSidebarOpen ? "lg:pl-60" : "lg:pl-20"
        )}
        onClick={handleContentClick}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-card px-4 shadow-sm">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </Button>

          {/* Page title */}
          <h1 className="ml-4 text-xl font-semibold lg:ml-0">
            {navItems.find((item) => 
              pathname === item.href || 
              pathname.startsWith(`${item.href}/`))?.title || "Admin Panel"}
          </h1>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Header actions */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                  <h3 className="font-medium">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNotifications(
                        notifications.map((n) => ({ ...n, read: true }))
                      );
                    }}
                  >
                    Mark all as read
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex items-start p-3",
                          !notification.read && "bg-accent"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-1">
                          <p className="text-sm">{notification.text}</p>
                          <p className="text-xs text-muted-foreground">Just now</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center">
                  <Link href="/admin/notifications" className="w-full text-center text-sm">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session?.user?.name || "Administrator"}</p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email || "admin@example.com"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/security">Security</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">Log Out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DapDip Admin Panel
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}