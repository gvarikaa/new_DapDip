"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Heart, 
  ThumbsUp,
  Laugh,
  Sparkles,
  HeartCrack,
  Flame
} from "lucide-react";

import { api } from "@/lib/trpc/client";
import { Post, ReactionType } from "@prisma/client";

interface PostReactionsProps {
  post: Post & {
    _count: {
      reactions: number;
      comments: number;
    };
  };
}

// Reaction icons with their colors
const reactionIcons = {
  LIKE: { icon: ThumbsUp, color: "text-blue-500" },
  LOVE: { icon: Heart, color: "text-red-500" },
  HAHA: { icon: Laugh, color: "text-yellow-500" },
  WOW: { icon: Sparkles, color: "text-purple-500" },
  SAD: { icon: HeartCrack, color: "text-orange-500" },
  ANGRY: { icon: Flame, color: "text-red-600" },
};

export default function PostReactions({ post }: PostReactionsProps): JSX.Element {
  const { data: session } = useSession();
  const [showReactions, setShowReactions] = useState(false);

  // Get user's current reaction to this post
  const { data: userReaction } = api.post.getById.useQuery(
    { id: post.id },
    {
      select: (data) => {
        if (!data || !session?.user) return null;
        
        // Find the user's reaction
        // In a real app, this would be a separate query
        return null; // Placeholder
      },
      enabled: !!session?.user,
    }
  );

  // Toggle reaction mutation
  const utils = api.useUtils();
  const toggleReaction = api.post.toggleReaction.useMutation({
    onSuccess: () => {
      utils.post.getById.invalidate({ id: post.id });
    },
  });

  const handleToggleReaction = (type: ReactionType): void => {
    if (!session?.user) return;
    toggleReaction.mutate({ postId: post.id, type });
    setShowReactions(false);
  };

  // Get current reaction if any
  const currentReaction = userReaction as ReactionType | null;
  const CurrentReactionIcon = currentReaction 
    ? reactionIcons[currentReaction].icon 
    : Heart;
  const currentColor = currentReaction 
    ? reactionIcons[currentReaction].color 
    : "";

  return (
    <div className="flex items-center justify-between">
      <div className="relative flex items-center">
        <button
          className="group flex items-center"
          onClick={() => setShowReactions(!showReactions)}
        >
          <CurrentReactionIcon 
            className={`mr-2 h-5 w-5 ${currentColor}`} 
          />
          <span>
            {post._count.reactions} 
            {post._count.reactions === 1 ? " reaction" : " reactions"}
          </span>
        </button>
        
        {/* Reaction picker */}
        {showReactions && (
          <div className="absolute bottom-full left-0 z-10 mb-2 flex rounded-full border bg-card p-1 shadow-lg">
            {Object.entries(reactionIcons).map(([type, { icon: Icon, color }]) => (
              <button
                key={type}
                onClick={() => handleToggleReaction(type as ReactionType)}
                className="rounded-full p-2 hover:bg-muted"
                title={type.charAt(0) + type.slice(1).toLowerCase()}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <span>
          {post._count.comments}
          {post._count.comments === 1 ? " comment" : " comments"}
        </span>
      </div>
    </div>
  );
}