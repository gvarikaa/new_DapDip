"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  Camera, 
  Edit, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/trpc/client";
import { getInitials } from "@/lib/utils";
import FollowButton from "./FollowButton";
import EditProfileModal from "./EditProfileModal";

interface ProfileHeaderProps {
  userId: string;
}

export default function ProfileHeader({ userId }: ProfileHeaderProps): JSX.Element {
  const { data: session } = useSession();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: user, isLoading } = api.user.getById.useQuery(
    { userId },
    { 
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const isCurrentUser = session?.user?.id === userId;

  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>User not found</p>
      </div>
    );
  }

  const joinedDate = new Date(user.joinedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
        {user.coverImage ? (
          <Image
            src={user.coverImage}
            alt={`${user.name}'s cover`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}

        {isCurrentUser && (
          <button
            className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            onClick={() => toast.error("Cover image upload not implemented yet")}
          >
            <Camera className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="relative -mt-16">
          <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-2xl">
                {getInitials(user.name || "User")}
              </div>
            )}
          </div>

          {isCurrentUser && (
            <button
              className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
              onClick={() => toast.error("Profile image upload not implemented yet")}
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{user.name || "Anonymous User"}</h1>
          
          {user.username && (
            <p className="text-muted-foreground">@{user.username}</p>
          )}
          
          {user.bio && (
            <p className="max-w-2xl whitespace-pre-wrap">{user.bio}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Joined {joinedDate}
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold text-foreground">{user._count?.followers ?? 0}</span>
              <span className="ml-1">Followers</span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold text-foreground">{user._count?.following ?? 0}</span>
              <span className="ml-1">Following</span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold text-foreground">{user._count?.posts ?? 0}</span>
              <span className="ml-1">Posts</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          {isCurrentUser ? (
            <button
              className="flex items-center rounded-full border px-4 py-2 font-medium hover:bg-muted"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <FollowButton userId={userId} />
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal 
          user={user} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
    </div>
  );
}

function ProfileHeaderSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="h-48 w-full rounded-lg bg-muted" />
      <div className="flex items-start space-x-4">
        <div className="-mt-16 h-32 w-32 rounded-full border-4 border-background bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-1/3 rounded bg-muted" />
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-16 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="h-10 w-24 rounded-full bg-muted" />
      </div>
    </div>
  );
}