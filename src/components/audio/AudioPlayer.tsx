'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download, FileText, X } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioVisualizer } from './AudioVisualizer';
import { type PlaybackSpeed, type AudioMessage } from '@/types/audio';
import { api } from '@/lib/api/trpc/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AudioPlayerProps {
  audioMessage: AudioMessage;
  compact?: boolean;
  showSender?: boolean;
  allowTranscriptGeneration?: boolean;
  onDelete?: () => void;
  className?: string;
}

export function AudioPlayer({
  audioMessage,
  compact = false,
  showSender = false,
  allowTranscriptGeneration = true,
  onDelete,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioMessage.duration);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Parse waveform data from JSON if needed
  const waveformData = Array.isArray(audioMessage.waveform) 
    ? audioMessage.waveform 
    : JSON.parse(audioMessage.waveform as unknown as string);
  
  // Set up transcription generation mutation
  const transcribeMutation = api.audio.transcribe.useMutation({
    onSuccess: () => {
      // Refetch audio message to get updated transcription
      // In a real implementation, you would update the cache or trigger a refetch
      // based on your API's caching strategy
    },
  });

  // Play/pause audio
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      // Update progress
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  };
  
  // Seek to a specific time
  const seekTo = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Reset playback
  const resetPlayback = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    
    if (!isPlaying) {
      togglePlayback(); // Start playing from beginning
    }
  };
  
  // Change playback speed
  const changePlaybackSpeed = (speed: PlaybackSpeed) => {
    if (!audioRef.current) return;
    
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };
  
  // Generate transcript
  const generateTranscript = () => {
    transcribeMutation.mutate({ audioMessageId: audioMessage.id });
  };
  
  // Download audio
  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioMessage.url;
    link.download = `audio-message-${audioMessage.id}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Add event listeners to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef.current]);

  return (
    <div className={cn(
      'rounded-lg bg-card',
      compact ? 'p-2' : 'p-4 border',
      className
    )}>
      <audio 
        ref={audioRef} 
        src={audioMessage.url}
        preload="metadata"
        className="hidden"
      />
      
      {/* Compact mode */}
      {compact ? (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              'rounded-full h-8 w-8',
              isPlaying && 'bg-primary text-primary-foreground'
            )}
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <div className="flex-1 h-8">
            <AudioVisualizer
              data={waveformData}
              isPlaying={isPlaying}
              className="h-full"
              animated={isPlaying}
            />
          </div>
          
          <span className="text-xs font-mono text-muted-foreground">
            {formatTime(isPlaying ? currentTime : duration)}
          </span>
        </div>
      ) : (
        /* Full mode */
        <>
          <div className="flex items-center gap-4 mb-3">
            <Button 
              variant={isPlaying ? 'default' : 'outline'} 
              size="icon"
              onClick={togglePlayback}
              className="rounded-full h-10 w-10 flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex-1">
              {showSender && audioMessage.sender && (
                <div className="text-sm font-medium mb-1">
                  {audioMessage.sender.name}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      {playbackSpeed}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => changePlaybackSpeed(0.5)}>
                      0.5x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackSpeed(1)}>
                      1x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackSpeed(1.5)}>
                      1.5x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackSpeed(2)}>
                      2x
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                <div className="flex gap-1 ml-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={resetPlayback}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Restart</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={downloadAudio}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {allowTranscriptGeneration && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              if (audioMessage.transcription) {
                                setTranscriptOpen(true);
                              } else {
                                generateTranscript();
                              }
                            }}
                            disabled={transcribeMutation.isPending}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{audioMessage.transcription ? 'View transcript' : 'Generate transcript'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {onDelete && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={onDelete}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-16">
              <AudioVisualizer
                data={waveformData}
                isPlaying={isPlaying}
                className="h-full"
                animated={isPlaying}
              />
            </div>
            
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={seekTo}
              className="mt-2"
            />
            
            {audioMessage.transcription && (
              <div 
                className="mt-2 text-xs text-muted-foreground italic cursor-pointer"
                onClick={() => setTranscriptOpen(true)}
              >
                {audioMessage.transcription.length > 100
                  ? `${audioMessage.transcription.substring(0, 100)}...`
                  : audioMessage.transcription}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Transcript Dialog */}
      <Dialog open={transcriptOpen} onOpenChange={setTranscriptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audio Transcript</DialogTitle>
            <DialogDescription>
              AI-generated transcript of the audio message
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-80 overflow-y-auto p-4 bg-muted/30 rounded-md">
            {audioMessage.transcription ? (
              <p className="whitespace-pre-wrap">{audioMessage.transcription}</p>
            ) : (
              <p className="text-muted-foreground italic">
                No transcript available. Generate one using the transcript button.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AudioPlayer;