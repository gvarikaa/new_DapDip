"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Loader2, 
  Tag,
  Globe
} from "lucide-react";

import { api } from "@/lib/trpc/client";

interface AboutUserProps {
  userId: string;
}

export default function AboutUser({ userId }: AboutUserProps): JSX.Element {
  const { data: session } = useSession();
  const [interests, setInterests] = useState<string[]>([]);
  
  const { data: user, isLoading } = api.user.getById.useQuery(
    { userId },
    { 
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  // In a real app, you would fetch user's interests from an API
  useEffect(() => {
    // Mock interests for demo
    setInterests([
      "Technology",
      "Programming",
      "Web Development",
      "Music",
      "Travel",
    ]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow">
        <h3 className="text-lg font-medium">User not found</h3>
      </div>
    );
  }

  const joinedDate = new Date(user.joinedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card shadow">
        <div className="border-b p-4">
          <h3 className="font-medium">About</h3>
        </div>
        
        <div className="p-6">
          {/* Bio */}
          {user.bio ? (
            <div className="mb-6 whitespace-pre-wrap">
              <p>{user.bio}</p>
            </div>
          ) : (
            <div className="mb-6 text-muted-foreground">
              <p>{user.name || "This user"} hasn&apos;t added a bio yet.</p>
            </div>
          )}

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Joined {joinedDate}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {user._count?.posts || 0} posts &middot; {user._count?.followers || 0} followers &middot; {user._count?.following || 0} following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="rounded-lg border bg-card shadow">
        <div className="border-b p-4">
          <h3 className="font-medium">Interests</h3>
        </div>
        
        <div className="p-6">
          {interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <div 
                  key={index}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  <span>{interest}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No interests added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}