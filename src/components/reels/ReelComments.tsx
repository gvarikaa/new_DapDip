import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, SendHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/api/trpc/client';
import type { ReelComment, User } from '@/types/reels';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReelCommentsProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReelComments = ({
  reelId,
  isOpen,
  onClose,
}: ReelCommentsProps) => {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, isLoading, refetch } = api.reels.getComments.useQuery(
    { reelId },
    { enabled: isOpen }
  );

  const commentMutation = api.reels.comment.useMutation({
    onSuccess: () => {
      setComment('');
      refetch();
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    commentMutation.mutate({
      reelId,
      content: comment.trim(),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[80vh] bg-background rounded-t-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Comments</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto p-4 max-h-[50vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !comments?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none min-h-[60px]"
              maxLength={500}
            />
            <Button 
              size="icon"
              disabled={!comment.trim() || isSubmitting}
              onClick={handleSubmitComment}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: ReelComment & {
    author: Pick<User, 'id' | 'name' | 'image'>;
  };
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const router = useRouter();
  
  return (
    <div className="flex gap-3">
      <Avatar 
        className="h-8 w-8 cursor-pointer"
        onClick={() => router.push(`/profile/${comment.author.id}`)}
      >
        <AvatarImage src={comment.author.image || undefined} alt={comment.author.name || ''} />
        <AvatarFallback>
          {comment.author.name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span 
            className="font-medium text-sm cursor-pointer hover:underline"
            onClick={() => router.push(`/profile/${comment.author.id}`)}
          >
            {comment.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm mt-1">{comment.content}</p>
      </div>
    </div>
  );
};

export default ReelComments;