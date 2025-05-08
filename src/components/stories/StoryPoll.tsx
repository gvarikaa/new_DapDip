import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/trpc/client';
import { cn } from '@/lib/utils';
import type { StoryPoll } from '@/types/stories';

interface StoryPollProps {
  poll: StoryPoll;
  onVote?: (pollId: string, optionId: string) => void;
  className?: string;
}

const StoryPoll: React.FC<StoryPollProps> = ({ poll, onVote, className }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.userVote || null);
  const [isVoting, setIsVoting] = useState(false);
  
  const voteMutation = api.story.voteOnPoll.useMutation({
    onSuccess: () => {
      setIsVoting(false);
      if (onVote) {
        onVote(poll.id, selectedOption!);
      }
    },
    onError: () => {
      setIsVoting(false);
      setSelectedOption(poll.userVote || null);
    },
  });
  
  const handleVote = (optionId: string) => {
    if (isVoting || poll.userVote) return;
    
    setSelectedOption(optionId);
    setIsVoting(true);
    
    voteMutation.mutate({
      pollId: poll.id,
      optionId,
    });
  };
  
  // Calculate percentages if already voted
  const totalVotes = poll.votes ? Object.values(poll.votes).flat().length : 0;
  
  const options = Array.isArray(poll.options) ? poll.options : [];
  
  const getOptionVotes = (optionId: string) => {
    if (!poll.votes || !poll.votes[optionId]) return 0;
    return poll.votes[optionId].length;
  };
  
  const getOptionPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((getOptionVotes(optionId) / totalVotes) * 100);
  };
  
  const hasVoted = !!selectedOption || !!poll.userVote;

  return (
    <div className={cn("bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white", className)}>
      <h3 className="text-lg font-medium mb-3">{poll.question}</h3>
      
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            className={cn(
              "w-full h-10 px-3 rounded-md relative overflow-hidden transition-all",
              "flex items-center justify-between",
              hasVoted 
                ? "cursor-default" 
                : "hover:bg-white/10 cursor-pointer",
              selectedOption === option.id && "border border-primary"
            )}
            onClick={() => handleVote(option.id)}
            disabled={hasVoted || isVoting}
          >
            {/* Background fill based on votes */}
            {hasVoted && (
              <motion.div 
                className="absolute inset-y-0 left-0 bg-primary/30"
                initial={{ width: 0 }}
                animate={{ width: `${getOptionPercentage(option.id)}%` }}
                transition={{ duration: 0.5 }}
              />
            )}
            
            {/* Option text */}
            <span className="relative z-10">{option.text}</span>
            
            {/* Percentage if voted */}
            {hasVoted && (
              <span className="relative z-10 font-semibold">
                {getOptionPercentage(option.id)}%
              </span>
            )}
          </button>
        ))}
      </div>
      
      {hasVoted && (
        <p className="text-sm text-center mt-3 text-white/70">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </p>
      )}
    </div>
  );
};

export default StoryPoll;