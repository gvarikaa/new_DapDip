'use client';

import React, { useState } from 'react';
import { Mic, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { type AudioRecording } from '@/types/audio';
import { blobToWaveform, compressAudioBlob } from '@/lib/audio';
import { api } from '@/lib/api/trpc/client';

interface AudioCommentInputProps {
  postId?: string;
  reelId?: string;
  storyId?: string;
  commentId?: string; // For replying to a comment
  onComplete?: () => void;
  className?: string;
}

export function AudioCommentInput({
  postId,
  reelId,
  storyId,
  commentId,
  onComplete,
  className
}: AudioCommentInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create audio message mutation
  const createAudioMutation = api.audio.create.useMutation({
    onSuccess: () => {
      toast.success('Audio comment sent');
      setIsRecording(false);
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send audio comment');
      setIsProcessing(false);
    },
  });
  
  // Handle recording complete
  const handleRecordingComplete = async (recording: AudioRecording) => {
    try {
      setIsProcessing(true);
      
      // Compress audio for better performance
      const compressedBlob = await compressAudioBlob(recording.blob);
      
      // Generate waveform if not provided
      let waveform = recording.waveform;
      if (!waveform || waveform.length === 0) {
        waveform = await blobToWaveform(compressedBlob);
      }
      
      // Check if at least one destination is provided
      if (!postId && !reelId && !storyId && !commentId) {
        toast.error('Missing destination for audio comment');
        setIsProcessing(false);
        return;
      }
      
      // Submit audio message
      await createAudioMutation.mutateAsync({
        audioBlob: compressedBlob,
        duration: recording.duration,
        waveform,
        postId,
        reelId,
        storyId,
        commentId,
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn(className)}>
      {!isRecording ? (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={() => setIsRecording(true)}
          disabled={isProcessing}
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <div className="relative w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-accent"
            onClick={() => setIsRecording(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <AudioRecorder
            maxDuration={60}
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => setIsRecording(false)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

export default AudioCommentInput;