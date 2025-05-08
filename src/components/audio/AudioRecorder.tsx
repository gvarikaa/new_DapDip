'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Square, Trash2, Send, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AudioVisualizer } from './AudioVisualizer';
import { formatTime } from '@/lib/format';
import { type AudioRecording } from '@/types/audio';

interface AudioRecorderProps {
  maxDuration?: number; // Maximum recording duration in seconds
  onRecordingComplete?: (recording: AudioRecording) => void;
  onCancel?: () => void;
  className?: string;
}

export function AudioRecorder({
  maxDuration = 60,
  onRecordingComplete,
  onCancel,
  className
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const waveformUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const MAX_WAVEFORM_POINTS = 100;

  // Request microphone access and start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Create analyser node for visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      source.connect(analyser);
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        
        if (waveformUpdateIntervalRef.current) {
          clearInterval(waveformUpdateIntervalRef.current);
          waveformUpdateIntervalRef.current = null;
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
      
      // Start recording
      audioChunksRef.current = [];
      mediaRecorder.start(100); // Collect data every 100ms
      
      // Start timer
      startTimer();
      
      // Start waveform visualization
      startWaveformCapture();
      
      setIsRecording(true);
      setIsPaused(false);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };
  
  // Start timer to track recording duration
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setDuration(0);
    
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        // Check if we've hit max duration
        if (prev >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return prev + 0.1;
      });
    }, 100);
  };
  
  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Pause waveform updates
      if (waveformUpdateIntervalRef.current) {
        clearInterval(waveformUpdateIntervalRef.current);
        waveformUpdateIntervalRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };
  
  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      startTimer();
      
      // Resume waveform capture
      startWaveformCapture();
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Cancel recording
  const cancelRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    // Clean up audio blob URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setWaveformData([]);
    
    if (onCancel) {
      onCancel();
    }
  };
  
  // Start capturing waveform data
  const startWaveformCapture = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Create a smoother waveform by capturing and averaging multiple samples
    const captureWaveformPoint = () => {
      if (!analyserRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average amplitude
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const avg = sum / bufferLength;
      const normalizedValue = Math.min(100, Math.max(0, (avg / 255) * 100));
      
      // Add to waveform data, but keep array at fixed size
      setWaveformData(prev => {
        const newData = [...prev, normalizedValue];
        if (newData.length > MAX_WAVEFORM_POINTS) {
          return newData.slice(-MAX_WAVEFORM_POINTS);
        }
        return newData;
      });
    };
    
    // Capture waveform data periodically
    waveformUpdateIntervalRef.current = setInterval(() => {
      captureWaveformPoint();
    }, 100);
  };
  
  // Play recorded audio
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Submit the recording
  const submitRecording = () => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete({
        blob: audioBlob,
        url: audioUrl!,
        duration,
        waveform: waveformData,
      });
    }
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (waveformUpdateIntervalRef.current) {
        clearInterval(waveformUpdateIntervalRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);
  
  // Add event listeners to audio element
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      audioElement.addEventListener('ended', handleEnded);
      
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioRef.current]);

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex flex-col gap-3">
        {/* Waveform Visualization */}
        <div className="h-20 w-full">
          <AudioVisualizer
            data={waveformData}
            isRecording={isRecording && !isPaused}
            isPlaying={isPlaying}
          />
        </div>
        
        {/* Audio player (hidden) */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            className="hidden"
          />
        )}
        
        {/* Timer Display */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-mono">
            {formatTime(duration)}
          </div>
          <div className="text-xs text-muted-foreground">
            {isRecording && !isPaused && 'Recording...'}
            {isRecording && isPaused && 'Paused'}
            {!isRecording && audioBlob && 'Recording complete'}
            {!isRecording && !audioBlob && 'Ready to record'}
          </div>
          <div className="text-xs text-muted-foreground">
            max {formatTime(maxDuration)}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-between mt-2">
          <AnimatePresence mode="wait">
            {!isRecording && !audioBlob && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <Button 
                  onClick={startRecording} 
                  variant="default" 
                  className="gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </Button>
              </motion.div>
            )}
            
            {isRecording && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                {isPaused ? (
                  <Button 
                    onClick={resumeRecording} 
                    variant="default" 
                    size="icon"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={pauseRecording} 
                    variant="outline" 
                    size="icon"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  onClick={stopRecording} 
                  variant="destructive" 
                  size="icon"
                >
                  <Square className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={cancelRecording}
                  variant="ghost" 
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            
            {!isRecording && audioBlob && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="icon"
                  disabled={isPlaying}
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={startRecording}
                  variant="outline"
                  size="icon"
                  title="Record again"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={cancelRecording}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={submitRecording}
                  variant="default"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AudioRecorder;