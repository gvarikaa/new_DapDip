import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

interface ReelProgressProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  isMuted: boolean;
  onClick?: () => void;
}

export const ReelProgress = ({
  duration,
  currentTime,
  isPlaying,
  isMuted,
  onClick,
}: ReelProgressProps) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current && duration > 0) {
      const percent = (currentTime / duration) * 100;
      progressRef.current.style.width = `${percent}%`;
    }
  }, [currentTime, duration]);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-4">
      <div 
        className="flex-1 h-1 bg-gray-800/50 rounded-full overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div
          ref={progressRef}
          className={clsx(
            "h-full transition-all duration-100",
            isPlaying ? "bg-white" : "bg-gray-400"
          )}
        />
      </div>
      
      <div className="text-white text-xs font-medium flex items-center gap-1.5">
        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
        <span className="opacity-60">/</span>
        {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
      </div>
      
      <div className={clsx(
        "w-6 h-6 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm",
        isMuted ? "text-gray-400" : "text-white"
      )}>
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
            <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
          </svg>
        )}
      </div>
    </div>
  );
};

export default ReelProgress;