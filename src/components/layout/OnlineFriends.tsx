import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { getInitials } from "@/lib/utils";
import { api } from "@/lib/trpc/client";

interface FriendWithStatus {
  id: string;
  name: string | null;
  image: string | null;
  isOnline: boolean;
}

export function OnlineFriends(): JSX.Element {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  
  // Get friends list
  const { data: followingData } = api.follow.getFollowing.useQuery(
    { 
      userId: session?.user?.id || "",
      limit: 50
    },
    { 
      enabled: !!session?.user?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // In a real app, this would use Pusher or similar for real-time status
  useEffect(() => {
    if (followingData?.following) {
      // Simulate online status (random in this demo)
      const friendsWithStatus = followingData.following.map(user => ({
        id: user.id,
        name: user.name,
        image: user.image,
        isOnline: Math.random() > 0.5, // Random online status for demo
      }));
      
      // Sort by online status first, then by name
      friendsWithStatus.sort((a, b) => {
        if (a.isOnline !== b.isOnline) {
          return a.isOnline ? -1 : 1;
        }
        return (a.name || "").localeCompare(b.name || "");
      });
      
      setFriends(friendsWithStatus);
    }
  }, [followingData]);

  if (!session?.user) {
    return (
      <div className="rounded-lg border p-4">
        <h3 className="font-medium">Chat</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to chat with your friends
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Friends</h3>
        <Link href="/messages" className="text-xs text-primary hover:underline">
          See all
        </Link>
      </div>

      {friends.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No friends yet. Start following people!
        </p>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li key={friend.id}>
              <Link
                href={`/messages/${friend.id}`}
                className="flex items-center rounded-lg p-2 hover:bg-muted"
              >
                <div className="relative h-10 w-10">
                  {friend.image ? (
                    <Image
                      src={friend.image}
                      alt={friend.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {getInitials(friend.name || "User")}
                    </div>
                  )}
                  {friend.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{friend.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}