import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/trpc/client';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import type { StorySlider } from '@/types/stories';

interface StorySliderProps {
  slider: StorySlider;
  onResponse?: (sliderId: string, value: number) => void;
  className?: string;
}

const StorySliderComponent: React.FC<StorySliderProps> = ({ slider, onResponse, className }) => {
  // Start with user's previous response or 50 as default
  const [value, setValue] = useState(slider.userResponse || 50);
  const [hasResponded, setHasResponded] = useState(!!slider.userResponse);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const respondMutation = api.story.respondToSlider.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setHasResponded(true);
      if (onResponse) {
        onResponse(slider.id, value);
      }
    },
    onError: () => {
      setIsSubmitting(false);
      setValue(slider.userResponse || 50);
    },
  });
  
  const handleChange = (newValue: number[]) => {
    setValue(newValue[0]);
  };
  
  const handleReleased = () => {
    if (hasResponded || isSubmitting) return;
    
    setIsSubmitting(true);
    
    respondMutation.mutate({
      sliderId: slider.id,
      value,
    });
  };
  
  // Custom emoji based on value
  const getEmoji = () => {
    if (slider.emoji) return slider.emoji;
    
    if (value < 20) return '😢';
    if (value < 40) return '😕';
    if (value < 60) return '😐';
    if (value < 80) return '🙂';
    return '😁';
  };
  
  const averageValue = slider.responses && slider.responses.length > 0
    ? Math.round(slider.responses.reduce((sum, r) => sum + r.value, 0) / slider.responses.length)
    : null;

  return (
    <div className={cn("bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white", className)}>
      <h3 className="text-lg font-medium mb-3">{slider.question}</h3>
      
      <div className="flex flex-col items-center">
        <div className="text-4xl mb-4">{getEmoji()}</div>
        
        <div className="w-full px-2">
          <Slider
            value={[value]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleChange}
            onValueCommit={handleReleased}
            disabled={hasResponded || isSubmitting}
            className="w-full"
          />
        </div>
        
        <div className="w-full flex justify-between text-xs mt-1 px-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      {hasResponded && averageValue !== null && (
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-white/70">Average</p>
          <div className="flex justify-center items-center gap-2">
            <span className="text-2xl">{averageValue}%</span>
            <span className="text-lg">
              {averageValue < 20 ? '😢' : 
               averageValue < 40 ? '😕' : 
               averageValue < 60 ? '😐' : 
               averageValue < 80 ? '🙂' : '😁'}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            {slider.responses?.length || 0} {(slider.responses?.length || 0) === 1 ? 'response' : 'responses'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StorySliderComponent;