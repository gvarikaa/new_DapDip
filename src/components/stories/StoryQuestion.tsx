import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { api } from '@/lib/api/trpc/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StoryQuestion } from '@/types/stories';

interface StoryQuestionProps {
  question: StoryQuestion;
  onAnswer?: (questionId: string, answer: string) => void;
  className?: string;
}

const StoryQuestion: React.FC<StoryQuestionProps> = ({ question, onAnswer, className }) => {
  const [answer, setAnswer] = useState(question.userAnswer || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(!!question.userAnswer);
  
  const answerMutation = api.story.answerQuestion.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setHasAnswered(true);
      if (onAnswer) {
        onAnswer(question.id, answer);
      }
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || hasAnswered) return;
    
    setIsSubmitting(true);
    
    answerMutation.mutate({
      questionId: question.id,
      answer: answer.trim(),
    });
  };
  
  return (
    <div className={cn("bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white", className)}>
      <h3 className="text-lg font-medium mb-3">{question.question}</h3>
      
      {hasAnswered ? (
        <div className="p-3 bg-white/10 rounded-md">
          <p className="text-sm text-white/70 mb-1">Your answer:</p>
          <p>{answer}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-white/10 border-white/20 text-white"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!answer.trim() || isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      )}
      
      {question.answers && question.answers.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-white/70 mb-2">
            {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
          </p>
          
          {question.answers.length <= 3 && (
            <div className="space-y-2">
              {question.answers.map((answerItem, index) => (
                <div key={index} className="flex items-start gap-2">
                  {answerItem.user?.image && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={answerItem.user.image} 
                        alt={answerItem.user.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium">{answerItem.user?.name}</p>
                    <p className="text-sm">{answerItem.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryQuestion;