'use client';

import React from 'react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type AudioMessage } from '@/types/audio';
import { api } from '@/lib/api/trpc/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioCommentProps {
  audioMessage: AudioMessage;
  showAvatar?: boolean;
  isReply?: boolean;
  onDelete?: () => void;
  className?: string;
}

export function AudioComment({
  audioMessage,
  showAvatar = true,
  isReply = false,
  onDelete,
  className
}: AudioCommentProps) {
  // Delete audio comment mutation
  const deleteAudioMutation = api.audio.delete.useMutation({
    onSuccess: () => {
      toast.success('Audio comment deleted');
      if (onDelete) {
        onDelete();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete audio comment');
    },
  });
  
  // Handle delete
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this audio comment?')) {
      deleteAudioMutation.mutate({ id: audioMessage.id });
    }
  };
  
  // Parse sender data
  const sender = 'sender' in audioMessage 
    ? audioMessage.sender 
    : 'user' in audioMessage 
      ? audioMessage.user 
      : null;

  return (
    <div className={cn(
      'flex gap-3',
      isReply && 'ml-12',
      className
    )}>
      {showAvatar && sender && (
        <Link href={`/profile/${sender.id}`} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender.image || undefined} />
            <AvatarFallback>{sender.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      
      <div className="flex-1 space-y-1">
        {showAvatar && sender && (
          <div className="flex items-baseline gap-2">
            <Link href={`/profile/${sender.id}`} className="font-medium text-sm hover:underline">
              {sender.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(audioMessage.createdAt)}
            </span>
          </div>
        )}
        
        <AudioPlayer
          audioMessage={audioMessage}
          compact={true}
          onDelete={
            // Only allow delete if the current user is the sender
            deleteAudioMutation.isPending 
              ? undefined 
              : handleDelete
          }
        />
        
        {audioMessage.transcription && (
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
            {audioMessage.transcription.length > 200
              ? `${audioMessage.transcription.substring(0, 200)}...`
              : audioMessage.transcription}
          </p>
        )}
      </div>
    </div>
  );
}

export default AudioComment;