import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Heart, MessageCircle, Send, Pause, Play, Volume2, VolumeX, Link as LinkIcon, MoreHorizontal, Smile, X } from 'lucide-react';

import { api } from '@/lib/api/trpc/client';
import { formatTimeAgo } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Story, StoryPoll, StoryQuestion, StorySlider, StoryLink } from '@/types/stories';

import StoryPollComponent from './StoryPoll';
import StoryQuestionComponent from './StoryQuestion';
import StorySliderComponent from './StorySlider';

// Default duration for image stories if not specified
const DEFAULT_DURATION = 5;

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex?: number;
  userId?: string;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  stories, 
  initialStoryIndex = 0,
  userId,
  onClose 
}) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [responseMode, setResponseMode] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [viewStartTime, setViewStartTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStory = stories[currentIndex];

  // Record view when a new story is shown
  const viewMutation = api.story.view.useMutation();
  
  // Add reaction to a story
  const reactionMutation = api.story.addReaction.useMutation({
    onSuccess: () => {
      toast.success('Reaction added');
      setShowReactionPicker(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add reaction');
    },
  });
  
  // Add response to a story
  const responseMutation = api.story.addResponse.useMutation({
    onSuccess: () => {
      toast.success('Response sent');
      setResponseMode(false);
      setResponseText('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send response');
    },
  });

  // Calculate total duration for the current story
  const getDuration = () => {
    if (currentStory.mediaType === 'VIDEO' && videoRef.current) {
      return videoRef.current.duration * 1000; // convert to ms
    }
    return (currentStory.duration || DEFAULT_DURATION) * 1000; // convert to ms
  };

  // Reset progress and timer when moving to a new story
  const resetStoryProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setProgress(0);
    setPaused(false);
    setResponseMode(false);
    setShowReactionPicker(false);
    
    // Record view for the new story
    if (userId) {
      viewMutation.mutate({ storyId: currentStory.id });
      setViewStartTime(new Date());
    }
    
    // Start timer for non-video types or when video is loaded
    if (currentStory.mediaType !== 'VIDEO') {
      startProgressTimer();
    }
  };

  // Progress timer
  const startProgressTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const duration = getDuration();
    const interval = 100; // Update every 100ms
    let elapsed = 0;
    
    timerRef.current = setInterval(() => {
      if (!paused) {
        elapsed += interval;
        const newProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          goToNextStory();
        }
      }
    }, interval);
  };

  // Reset and initial setup when stories change
  useEffect(() => {
    if (stories.length > 0) {
      resetStoryProgress();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stories, currentIndex]);

  // Handle video play/pause & progress
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement && currentStory.mediaType === 'VIDEO') {
      const handleTimeUpdate = () => {
        if (videoElement.duration) {
          setProgress((videoElement.currentTime / videoElement.duration) * 100);
        }
      };
      
      const handleEnded = () => {
        goToNextStory();
      };
      
      const handleLoadedData = () => {
        if (paused) {
          videoElement.pause();
        } else {
          videoElement.play().catch(error => {
            console.error('Error playing video:', error);
            setPaused(true);
          });
        }
      };
      
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('ended', handleEnded);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      
      // Set muted state
      videoElement.muted = muted;
      
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [currentStory, paused, muted]);

  // Record view duration when changing stories
  useEffect(() => {
    return () => {
      if (userId && viewStartTime && currentStory) {
        const duration = (new Date().getTime() - viewStartTime.getTime()) / 1000; // in seconds
        viewMutation.mutate({ 
          storyId: currentStory.id,
          viewDuration: duration
        });
      }
    };
  }, [currentStory, viewStartTime]);

  // Navigation functions
  const goToPreviousStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onClose();
    }
  };
  
  const goToNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };
  
  const togglePause = () => {
    setPaused(!paused);
    
    if (videoRef.current && currentStory.mediaType === 'VIDEO') {
      if (paused) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
  };

  // Add reaction to story
  const addReaction = (emoji: string) => {
    if (!userId) {
      toast.error('You must be logged in to react to stories');
      return;
    }
    
    reactionMutation.mutate({
      storyId: currentStory.id,
      emoji
    });
  };
  
  // Send response to story
  const sendResponse = () => {
    if (!responseText.trim() || !userId) return;
    
    responseMutation.mutate({
      storyId: currentStory.id,
      content: responseText.trim()
    });
  };

  // Touch handlers for navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Only register horizontal swipes if they're more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToPreviousStory();
      } else {
        goToNextStory();
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Click handlers for navigation based on screen regions
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showReactionPicker || responseMode) return;
    
    const { clientX } = e;
    const containerWidth = containerRef.current?.clientWidth || 0;
    
    // Left third of screen goes to previous story
    if (clientX < containerWidth / 3) {
      goToPreviousStory();
    } 
    // Right third of screen goes to next story
    else if (clientX > (containerWidth * 2) / 3) {
      goToNextStory();
    } 
    // Middle third toggles pause
    else {
      togglePause();
    }
  };

  // Handle user visiting a link
  const handleLinkClick = (url: string) => {
    // For internal links
    if (url.startsWith('/')) {
      router.push(url);
      onClose();
    } 
    // For external links
    else {
      window.open(url, '_blank');
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div 
        ref={containerRef}
        className="relative w-full h-full max-w-md mx-auto bg-black overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleScreenClick}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 z-30 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Story Progress Indicators */}
        <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
          {stories.map((story, index) => (
            <Progress 
              key={index} 
              value={index === currentIndex ? progress : (index < currentIndex ? 100 : 0)} 
              className="h-1 flex-1 bg-white/30"
              indicatorClassName="bg-white" 
            />
          ))}
        </div>
        
        {/* Media Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* For image stories */}
          {currentStory.mediaType === 'IMAGE' && (
            <Image 
              src={currentStory.mediaUrl} 
              alt="Story" 
              fill
              className="object-contain z-0"
              priority
            />
          )}
          
          {/* For video stories */}
          {currentStory.mediaType === 'VIDEO' && (
            <video 
              ref={videoRef}
              src={currentStory.mediaUrl} 
              className="w-full h-full object-contain z-0"
              autoPlay 
              playsInline
              loop={false}
              muted={muted}
            />
          )}
          
          {/* For text-only stories */}
          {currentStory.mediaType === 'TEXT' && (
            <div 
              className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center"
              style={{ backgroundColor: currentStory.backgroundColor || '#3B82F6' }}
            >
              {currentStory.textOverlays?.map((overlay, index) => (
                <div 
                  key={index}
                  className="text-4xl font-bold whitespace-pre-wrap"
                  style={{
                    position: 'absolute',
                    left: `${overlay.position.x}%`,
                    top: `${overlay.position.y}%`,
                    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                    color: overlay.color,
                    fontFamily: overlay.fontFamily,
                    fontSize: `${overlay.fontSize}px`,
                    backgroundColor: overlay.backgroundColor,
                    padding: overlay.padding ? `${overlay.padding}px` : undefined,
                    borderRadius: overlay.borderRadius ? `${overlay.borderRadius}px` : undefined,
                  }}
                >
                  {overlay.text}
                </div>
              ))}
              
              {/* If no text overlays, show caption as main content */}
              {(!currentStory.textOverlays || currentStory.textOverlays.length === 0) && (
                <p className="text-3xl font-bold">{currentStory.caption}</p>
              )}
            </div>
          )}
          
          {/* Drawings overlay */}
          {currentStory.drawElements && currentStory.drawElements.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {currentStory.drawElements.map((element, index) => (
                <polyline
                  key={index}
                  points={element.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                  fill="none"
                  stroke={element.color}
                  strokeWidth={element.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          )}
          
          {/* Stickers overlay */}
          {currentStory.stickers && currentStory.stickers.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {currentStory.stickers.map((sticker, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${sticker.position.x}%`,
                    top: `${sticker.position.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                  }}
                >
                  <img
                    src={`/stickers/${sticker.stickerId}.png`}
                    alt="Sticker"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* User info */}
        <div className="absolute top-10 left-4 z-20 flex items-center gap-2 text-white">
          <Avatar className="h-8 w-8 ring-2 ring-primary">
            <AvatarImage src={currentStory.author?.image || undefined} />
            <AvatarFallback>{currentStory.author?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{currentStory.author?.name}</span>
            <span className="text-xs opacity-70">{formatTimeAgo(currentStory.createdAt)}</span>
          </div>
        </div>
        
        {/* Caption */}
        {currentStory.caption && currentStory.mediaType !== 'TEXT' && (
          <div className="absolute bottom-20 left-4 right-4 z-20 text-white">
            <p className="text-sm">{currentStory.caption}</p>
          </div>
        )}
        
        {/* Location */}
        {currentStory.location && (
          <div className="absolute top-20 left-4 z-20 text-white">
            <p className="text-xs inline-flex items-center bg-black/30 px-2 py-1 rounded-full">
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {currentStory.location}
            </p>
          </div>
        )}
        
        {/* Music info */}
        {currentStory.musicTitle && (
          <div className="absolute bottom-28 left-4 right-4 z-20 flex items-center text-white">
            <div className="w-8 h-8 mr-2 bg-black/30 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-xs font-medium">{currentStory.musicTitle}</span>
                {currentStory.musicArtist && (
                  <span className="text-xs opacity-70"> • {currentStory.musicArtist}</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Interactive elements */}
        {currentStory.polls && currentStory.polls.map((poll: StoryPoll) => (
          <div key={poll.id} className="absolute left-4 right-4 z-20" style={{ top: '40%' }}>
            <StoryPollComponent 
              poll={poll} 
              onVote={(pollId, optionId) => {
                // Handle vote with tRPC mutation
                setPaused(true);
              }}
            />
          </div>
        ))}
        
        {currentStory.questions && currentStory.questions.map((question: StoryQuestion) => (
          <div key={question.id} className="absolute left-4 right-4 z-20" style={{ top: '40%' }}>
            <StoryQuestionComponent 
              question={question} 
              onAnswer={(questionId, answer) => {
                // Handle answer with tRPC mutation
                setPaused(true);
              }}
            />
          </div>
        ))}
        
        {currentStory.sliders && currentStory.sliders.map((slider: StorySlider) => (
          <div key={slider.id} className="absolute left-4 right-4 z-20" style={{ top: '40%' }}>
            <StorySliderComponent 
              slider={slider} 
              onResponse={(sliderId, value) => {
                // Handle response with tRPC mutation
                setPaused(true);
              }}
            />
          </div>
        ))}
        
        {/* Links */}
        {currentStory.links && currentStory.links.map((link: StoryLink) => (
          <div 
            key={link.id} 
            className="absolute z-20 bg-black/30 px-3 py-1.5 rounded-md text-white cursor-pointer hover:bg-black/50 transition-colors"
            style={{
              left: link.position ? `${link.position.x}%` : '50%',
              top: link.position ? `${link.position.y}%` : '70%',
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleLinkClick(link.url);
            }}
          >
            <div className="flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              <span className="text-sm">{link.label || 'Visit Link'}</span>
            </div>
          </div>
        ))}
        
        {/* Media controls */}
        <div className="absolute bottom-16 right-4 z-20 flex flex-col gap-4">
          {currentStory.mediaType === 'VIDEO' && (
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionPicker(!showReactionPicker);
              setResponseMode(false);
            }}
          >
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setResponseMode(!responseMode);
              setShowReactionPicker(false);
              setPaused(true);
            }}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle share - could be implemented with navigator.share API
              toast.info('Share functionality coming soon');
            }}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Reaction picker */}
        <AnimatePresence>
          {showReactionPicker && (
            <motion.div 
              className="absolute bottom-16 right-16 z-30 bg-black/70 rounded-lg p-2 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2">
                {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji) => (
                  <button
                    key={emoji}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    onClick={() => addReaction(emoji)}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Response input */}
        <AnimatePresence>
          {responseMode && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 z-30 bg-black/70 p-3 backdrop-blur-sm"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Send a message..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="flex-1 resize-none bg-black/50 border-white/20 text-white h-10 min-h-[40px]"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={sendResponse}
                  disabled={!responseText.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pause/Play indicator */}
        <AnimatePresence>
          {paused && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="rounded-full bg-black/50 p-6">
                <Play className="h-12 w-12 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryViewer;