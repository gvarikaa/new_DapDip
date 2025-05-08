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

interface AudioMessageInputProps {
  receiverId: string;
  onComplete?: () => void;
  className?: string;
}

export function AudioMessageInput({
  receiverId,
  onComplete,
  className
}: AudioMessageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create audio message mutation
  const createAudioMutation = api.audio.create.useMutation({
    onSuccess: () => {
      toast.success('Audio message sent');
      setIsRecording(false);
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send audio message');
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
      
      // Submit audio message
      await createAudioMutation.mutateAsync({
        audioBlob: compressedBlob,
        duration: recording.duration,
        waveform,
        chatId: receiverId,
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
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-card border rounded-lg shadow-lg z-20">
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

export default AudioMessageInput;