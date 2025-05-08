'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  data: number[];
  isRecording?: boolean;
  isPlaying?: boolean;
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  animated?: boolean;
}

export function AudioVisualizer({
  data,
  isRecording = false,
  isPlaying = false,
  className,
  barColor,
  backgroundColor = 'transparent',
  barWidth = 3,
  barGap = 2,
  barRadius = 2,
  animated = true,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match display size
    const setCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    setCanvasDimensions();

    // Create responsive canvas
    window.addEventListener('resize', setCanvasDimensions);

    // Draw function
    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (data.length === 0) {
        // If no data, draw a flat line
        const y = canvas.height / 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = barColor || (isRecording ? '#ef4444' : '#6366f1');
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
      }

      // Calculate bar dimensions
      const totalBarWidth = barWidth + barGap;
      const numBars = Math.min(data.length, Math.floor(canvas.width / totalBarWidth));
      const startX = (canvas.width - (numBars * totalBarWidth)) / 2;

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each bar
      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * data.length);
        const value = data[dataIndex];
        const height = (value / 100) * canvas.height;
        
        // Calculate bar position
        const x = startX + i * totalBarWidth;
        const barHeight = Math.max(2, height * 0.8); // Ensure minimum height
        const y = (canvas.height - barHeight) / 2;
        
        // Set bar color based on state
        if (barColor) {
          ctx.fillStyle = barColor;
        } else if (isRecording) {
          ctx.fillStyle = '#ef4444'; // Red for recording
        } else if (isPlaying) {
          ctx.fillStyle = '#22c55e'; // Green for playing
        } else {
          ctx.fillStyle = '#6366f1'; // Indigo for default
        }
        
        // Draw rounded bar
        if (barRadius > 0) {
          roundedRect(ctx, x, y, barWidth, barHeight, barRadius);
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }
    };

    // Helper function to draw rounded rectangles
    const roundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      // Ensure radius isn't too large for the rectangle
      radius = Math.min(radius, Math.min(width / 2, height / 2));
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
    };

    // Animation loop
    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      // Limit animation frame rate to avoid excessive rendering
      if (timestamp - lastTimestamp > 50 || !animated) {
        draw();
        lastTimestamp = timestamp;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    if (animated && (isRecording || isPlaying)) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      draw(); // Draw once if not animated
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, isRecording, isPlaying, barColor, backgroundColor, barWidth, barGap, barRadius, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'w-full h-full',
        isRecording && 'recording',
        isPlaying && 'playing',
        className
      )}
    />
  );
}

export default AudioVisualizer;