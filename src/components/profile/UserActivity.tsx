"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Star, 
  Share,
  Lock,
  Loader2
} from "lucide-react";

import { api } from "@/lib/trpc/client";
import { formatTimeAgo, getInitials } from "@/lib/utils";

interface UserActivityProps {
  userId: string;
}

// Activity types and their icons
const activityIcons = {
  LIKE: Heart,
  COMMENT: MessageSquare,
  FOLLOW: UserPlus,
  SHARE: Share,
  MENTION: Star,
};

export default function UserActivity({ userId }: UserActivityProps): JSX.Element {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isCurrentUser = session?.user?.id === userId;

  useEffect(() => {
    // For the demo, we'll just mock some activity data
    // In a real app, you would fetch this from an API endpoint
    if (isCurrentUser) {
      const mockActivities = [
        {
          id: "1",
          type: "LIKE",
          content: "You liked a post",
          targetId: "post-1",
          targetUrl: "/post/post-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          actor: session?.user,
        },
        {
          id: "2",
          type: "COMMENT",
          content: "You commented on a post",
          targetId: "post-2",
          targetUrl: "/post/post-2",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          actor: session?.user,
        },
        {
          id: "3",
          type: "FOLLOW",
          content: "You followed a user",
          targetId: "user-1",
          targetUrl: "/profile/user-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          actor: session?.user,
        },
      ];
      
      setActivities(mockActivities);
      setIsLoading(false);
    } else {
      // For other users, we only show public activities
      const mockPublicActivities = [
        {
          id: "1",
          type: "COMMENT",
          content: "Commented on a post",
          targetId: "post-1",
          targetUrl: "/post/post-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          actor: {
            id: userId,
            name: "User",
            image: null,
          },
        },
        {
          id: "2",
          type: "FOLLOW",
          content: "Started following a user",
          targetId: "user-2",
          targetUrl: "/profile/user-2",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          actor: {
            id: userId,
            name: "User",
            image: null,
          },
        },
      ];
      
      setActivities(mockPublicActivities);
      setIsLoading(false);
    }
  }, [userId, isCurrentUser, session?.user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow">
        <h3 className="text-lg font-medium">No activity yet</h3>
        <p className="mt-2 text-muted-foreground">
          {isCurrentUser
            ? "Your activity will appear here as you interact with posts and other users."
            : "This user hasn't had any public activity yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card shadow">
        <div className="border-b p-4">
          <h3 className="font-medium">Recent Activity</h3>
        </div>
        <ul className="divide-y">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Star;
            
            return (
              <li key={activity.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 overflow-hidden rounded-full">
                        {activity.actor?.image ? (
                          <Image
                            src={activity.actor.image}
                            alt={activity.actor.name || "User"}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-xs">
                            {getInitials(activity.actor?.name || "User")}
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        href={activity.targetUrl} 
                        className="text-sm hover:underline"
                      >
                        {activity.content}
                      </Link>
                    </div>
                    
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}