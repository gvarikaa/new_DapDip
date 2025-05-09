import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Home, 
  Compass, 
  MessageSquare, 
  Bell, 
  User, 
  Settings,
  LogOut,
  Bookmark,
  Menu,
  X,
  Heart
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Explore",
      href: "/explore",
      icon: Compass,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      label: "Better Me",
      href: "/better-me",
      icon: Heart,
    },
    {
      label: "Saved",
      href: "/saved",
      icon: Bookmark,
    },
    {
      label: "Profile",
      href: session?.user ? `/profile/${session.user.id}` : "/auth/signin",
      icon: User,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed left-4 top-4 z-40 rounded-full p-2 bg-primary text-primary-foreground md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for desktop and mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex-col bg-card shadow-lg transition-transform duration-300 ease-in-out md:flex md:translate-x-0",
          isOpen ? "flex translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-center border-b px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">DapDip</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {session?.user && (
          <div className="border-t p-4">
            <Link
              href="/api/auth/signout"
              className="flex w-full items-center rounded-md px-4 py-3 text-sm font-medium text-destructive hover:bg-muted"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Link>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}