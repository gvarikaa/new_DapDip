'use client';

import React from 'react';
import { formatTimeAgo } from '@/lib/utils';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { cn } from '@/lib/utils';
import { type AudioMessage } from '@/types/audio';
import { api } from '@/lib/api/trpc/client';
import { toast } from 'sonner';

interface AudioMessageBubbleProps {
  audioMessage: AudioMessage;
  isCurrentUser: boolean;
  onDelete?: () => void;
  className?: string;
}

export function AudioMessageBubble({
  audioMessage,
  isCurrentUser,
  onDelete,
  className
}: AudioMessageBubbleProps) {
  // Delete audio message mutation
  const deleteAudioMutation = api.audio.delete.useMutation({
    onSuccess: () => {
      toast.success('Audio message deleted');
      if (onDelete) {
        onDelete();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete audio message');
    },
  });
  
  // Handle delete
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this audio message?')) {
      deleteAudioMutation.mutate({ id: audioMessage.id });
    }
  };

  return (
    <div className={cn(
      'flex flex-col max-w-[80%]',
      isCurrentUser ? 'ml-auto' : 'mr-auto',
      className
    )}>
      <div className={cn(
        'rounded-lg overflow-hidden',
        isCurrentUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-foreground'
      )}>
        <AudioPlayer
          audioMessage={audioMessage}
          compact={true}
          onDelete={isCurrentUser ? handleDelete : undefined}
          className={cn(
            'border-0',
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          )}
        />
      </div>
      
      <div className={cn(
        'text-xs text-muted-foreground mt-1',
        isCurrentUser ? 'text-right' : 'text-left'
      )}>
        {formatTimeAgo(audioMessage.createdAt)}
      </div>
      
      {audioMessage.transcription && (
        <div className={cn(
          'text-xs text-muted-foreground mt-1 max-w-[90%]',
          isCurrentUser ? 'ml-auto text-right' : 'mr-auto text-left'
        )}>
          <span className="italic">
            {audioMessage.transcription.length > 100
              ? `${audioMessage.transcription.substring(0, 100)}...`
              : audioMessage.transcription}
          </span>
        </div>
      )}
    </div>
  );
}

export default AudioMessageBubble;