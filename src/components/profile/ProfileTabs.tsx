"use client";

import { useState } from "react";
import { 
  LayoutGrid, 
  Bookmark, 
  Heart, 
  Info, 
  Loader2 
} from "lucide-react";

import { cn } from "@/lib/utils";
import UserPosts from "./UserPosts";
import SavedPosts from "./SavedPosts";
import UserActivity from "./UserActivity";
import AboutUser from "./AboutUser";

interface ProfileTabsProps {
  userId: string;
}

type TabType = "posts" | "saved" | "activity" | "about";

export default function ProfileTabs({ userId }: ProfileTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  
  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: LayoutGrid,
    },
    {
      id: "saved",
      label: "Saved",
      icon: Bookmark,
    },
    {
      id: "activity",
      label: "Activity",
      icon: Heart,
    },
    {
      id: "about",
      label: "About",
      icon: Info,
    },
  ] as const;

  return (
    <div className="mt-6">
      <div className="border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="py-6">
        {activeTab === "posts" && <UserPosts userId={userId} />}
        {activeTab === "saved" && <SavedPosts userId={userId} />}
        {activeTab === "activity" && <UserActivity userId={userId} />}
        {activeTab === "about" && <AboutUser userId={userId} />}
      </div>
    </div>
  );
}