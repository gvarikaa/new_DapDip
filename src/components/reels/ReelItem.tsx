"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  VolumeX,
  Volume2,
  Sparkles
} from "lucide-react";

import { api } from "@/lib/trpc/client";
import { ReelWithAuthor } from "@/types/reels";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import ReelProgress from "./ReelProgress";
import ReelComments from "./ReelComments";

interface ReelItemProps {
  reel: ReelWithAuthor & { isLiked?: boolean };
  isActive: boolean;
  onLike?: () => void;
}

export default function ReelItem({ 
  reel, 
  isActive,
  onLike,
}: ReelItemProps): JSX.Element {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [viewRecorded, setViewRecorded] = useState(false);

  // Toggle like mutation
  const likeMutation = api.reel.toggleLike.useMutation({
    onSuccess: () => {
      if (onLike) onLike();
    },
  });

  // Handle like button click
  const handleLike = (): void => {
    if (!session?.user) return;
    likeMutation.mutate({ reelId: reel.id });
  };

  // Record view once per session
  const recordView = api.reel.recordView.useMutation();

  // Auto play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Try to play the video when it becomes active
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Auto-play was prevented
            setIsPlaying(false);
            console.log("Autoplay prevented:", error);
          });
      }

      // Record the view when the reel becomes active
      if (!viewRecorded && session?.user) {
        setViewRecorded(true);
        recordView.mutate({
          reelId: reel.id,
          watchDuration: 0,
          watchPercentage: 0,
          completedView: false,
        });
      }
    } else {
      // Pause the video when it's not active
      video.pause();
      setIsPlaying(false);
    }

    // Cleanup on unmount
    return () => {
      video.pause();
    };
  }, [isActive, reel.id, session?.user, viewRecorded]);

  // Update current time for progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = (): void => {
      setCurrentTime(video.currentTime);
      setProgressWidth((video.currentTime / video.duration) * 100);

      // Record view completion data on significant events
      if (!viewRecorded || video.currentTime > 5) {
        const watchPercentage = (video.currentTime / video.duration) * 100;
        const completedView = watchPercentage > 90;

        if (session?.user && (completedView || watchPercentage > 50)) {
          recordView.mutate({
            reelId: reel.id,
            watchDuration: video.currentTime,
            watchPercentage,
            completedView,
          });
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [reel.id, session?.user, viewRecorded]);

  // Toggle play/pause on click
  const togglePlay = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch((error) => {
        console.log("Play error:", error);
      });
      setIsPlaying(true);
    }
  };

  // Toggle mute
  const toggleMute = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Format audio information
  const audioInfo = reel.audio 
    ? `${reel.audio.artist ? `${reel.audio.artist} · ` : ''}${reel.audio.name || 'Original Audio'}`
    : "Original Audio";

  return (
    <div className="relative h-full w-full bg-black">
      {/* Video */}
      <div className="absolute inset-0" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          loop
          playsInline
          muted={isMuted}
          preload="auto"
          className="h-full w-full object-cover"
        />

        {/* Play/Pause overlay button (shows briefly when tapped) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="h-16 w-16 text-white/80" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 w-full">
        <ReelProgress progress={progressWidth} duration={reel.duration} />
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex h-full flex-col justify-between">
          {/* Top controls with author info */}
          <div className="z-10 p-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              <Link 
                href={`/profile/${reel.authorId}`} 
                className="flex items-center space-x-2"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white">
                  {reel.author.image ? (
                    <Image
                      src={reel.author.image}
                      alt={reel.author.name || "User"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                      {getInitials(reel.author.name || "User")}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {reel.author.username || reel.author.name}
                  </p>
                  <p className="text-xs text-white/70">
                    {formatTimeAgo(new Date(reel.createdAt))}
                  </p>
                </div>
              </Link>

              <button className="rounded-full p-2 text-white hover:bg-white/10">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom info section */}
          <div className="z-10 space-y-4 p-4 pointer-events-auto">
            {/* Description */}
            {reel.description && (
              <p className="text-white text-sm line-clamp-2">{reel.description}</p>
            )}

            {/* Audio info */}
            <div className="flex items-center text-white">
              <Music2 className="mr-2 h-4 w-4" />
              <p className="text-xs truncate">{audioInfo}</p>
            </div>

            {/* Tags */}
            {reel.tags && reel.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reel.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/reels/tag/${tag}`}
                    className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white hover:bg-white/20"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side action buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-6">
        {/* Like button */}
        <button
          className="flex flex-col items-center"
          onClick={handleLike}
        >
          <Heart
            className={`h-8 w-8 ${
              reel.isLiked ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
          <span className="mt-1 text-xs text-white">
            {reel._count?.likes || 0}
          </span>
        </button>

        {/* Comments button */}
        <button
          className="flex flex-col items-center"
          onClick={() => setShowComments(true)}
        >
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="mt-1 text-xs text-white">
            {reel._count?.comments || 0}
          </span>
        </button>

        {/* Share button */}
        <button className="flex flex-col items-center">
          <Share2 className="h-8 w-8 text-white" />
          <span className="mt-1 text-xs text-white">Share</span>
        </button>

        {/* Bookmark button */}
        <button className="flex flex-col items-center">
          <Bookmark className="h-8 w-8 text-white" />
          <span className="mt-1 text-xs text-white">Save</span>
        </button>

        {/* AI Analysis button */}
        <button className="flex flex-col items-center">
          <Sparkles className="h-8 w-8 text-white" />
          <span className="mt-1 text-xs text-white">AI</span>
        </button>
      </div>

      {/* Volume control */}
      <button
        className="absolute bottom-4 left-4 rounded-full bg-black/50 p-2 text-white"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>

      {/* Comments drawer */}
      {showComments && (
        <ReelComments
          reelId={reel.id}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
}