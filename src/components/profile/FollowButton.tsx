"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, UserMinus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/trpc/client";

interface FollowButtonProps {
  userId: string;
}

export default function FollowButton({ userId }: FollowButtonProps): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  // Get follow status
  const { 
    data: followStatus, 
    isLoading: isStatusLoading 
  } = api.follow.getFollowStatus.useQuery(
    { userId }, 
    { enabled: !!session?.user, staleTime: 10000 }
  );

  // Follow/unfollow mutation
  const utils = api.useUtils();
  const followMutation = api.follow.followUser.useMutation({
    onSuccess: () => {
      utils.follow.getFollowStatus.invalidate({ userId });
      utils.user.getById.invalidate({ userId });
      if (session?.user?.id) {
        utils.user.getById.invalidate({ userId: session.user.id });
      }
    },
  });

  const handleFollow = (): void => {
    if (!session?.user) {
      // Redirect to sign in if not logged in
      router.push("/auth/signin?callbackUrl=/profile/" + userId);
      return;
    }

    followMutation.mutate({ userId });
  };

  const isFollowing = followStatus?.isFollowing;
  const isMutual = followStatus?.isMutual;
  const isLoading = isStatusLoading || followMutation.isLoading;

  return (
    <button
      className={`flex items-center rounded-full px-4 py-2 font-medium ${
        isFollowing
          ? "border hover:bg-destructive hover:text-destructive-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
      onClick={handleFollow}
      disabled={isLoading}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        isHovering ? (
          <UserMinus className="mr-2 h-4 w-4" />
        ) : (
          <UserCheck className="mr-2 h-4 w-4" />
        )
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      
      {isLoading
        ? "Loading..."
        : isFollowing
        ? isHovering
          ? "Unfollow"
          : isMutual
          ? "Following (Mutual)"
          : "Following"
        : "Follow"}
    </button>
  );
}