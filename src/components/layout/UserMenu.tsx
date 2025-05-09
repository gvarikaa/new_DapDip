'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "next-auth";
import { ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";

import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center space-x-1 rounded-full p-1 hover:bg-muted focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 overflow-hidden rounded-full">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User avatar"}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
              {getInitials(user.name || "User")}
            </div>
          )}
        </div>
        <ChevronDown
          className="h-4 w-4"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-card shadow-lg">
          <div className="p-3">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="border-t">
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center px-4 py-3 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center px-4 py-3 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <div className="border-t">
              <Link
                href="/api/auth/signout"
                className="flex items-center px-4 py-3 text-sm text-destructive hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}