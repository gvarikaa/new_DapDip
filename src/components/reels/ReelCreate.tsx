import React, { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Loader2, X, Play, Pause } from 'lucide-react';
import { z } from 'zod';

import { api } from '@/lib/api/trpc/client';
import { createReelSchema } from '@/lib/validations/reels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const ReelCreate = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    tags: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'upload' | 'details'>('upload');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check if the file is a video
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size should be less than 100MB');
      return;
    }
    
    const videoUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreviewUrl(videoUrl);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const validateForm = () => {
    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim())
        : [];
      
      createReelSchema.parse({
        caption: formData.caption,
        tags: tagsArray,
        location: formData.location || undefined,
      });
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        
        error.errors.forEach(err => {
          const field = err.path[0].toString();
          fieldErrors[field] = err.message;
        });
        
        setErrors(fieldErrors);
      }
      
      return false;
    }
  };

  const createReelMutation = api.reels.create.useMutation({
    onSuccess: () => {
      toast.success('Reel created successfully!');
      router.push('/reels');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create reel');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!videoFile || !validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would upload the video to a storage service
      // like Bunny.net or AWS S3 and get back a URL
      // For this example, we'll simulate a successful upload
      
      // Simulate video upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockVideoUrl = 'https://example.com/videos/sample-video.mp4';
      const mockThumbnailUrl = 'https://example.com/thumbnails/sample-thumbnail.jpg';
      
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim())
        : [];
      
      createReelMutation.mutate({
        caption: formData.caption,
        videoUrl: mockVideoUrl,
        thumbnailUrl: mockThumbnailUrl,
        tags: tagsArray,
        location: formData.location || undefined,
        duration: videoRef.current?.duration || 0,
      });
      
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-background">
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="container max-w-2xl px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Reel</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container max-w-2xl px-4 py-6">
        {step === 'upload' ? (
          <div className="flex flex-col items-center">
            {videoPreviewUrl ? (
              <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  className="w-full h-full object-contain"
                  loop
                  onClick={toggleVideoPlay}
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full bg-black/50 border-0 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoPlay();
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 rounded-full h-8 w-8"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="w-full max-w-md aspect-[9/16] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-center mb-1">Click to upload video</p>
                <p className="text-xs text-muted-foreground text-center">
                  MP4, WebM or MOV (max. 100MB)
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {videoFile && (
              <Button 
                className="mt-4"
                onClick={() => setStep('details')}
              >
                Continue
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black">
                  {videoPreviewUrl && (
                    <video
                      src={videoPreviewUrl}
                      className="w-full h-full object-contain"
                      muted
                      autoPlay
                      loop
                    />
                  )}
                </div>
              </div>
              
              <div className="col-span-2 flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caption" className={errors.caption ? 'text-destructive' : ''}>
                    Caption {errors.caption && `(${errors.caption})`}
                  </Label>
                  <Textarea
                    id="caption"
                    name="caption"
                    placeholder="Write a caption..."
                    value={formData.caption}
                    onChange={handleInputChange}
                    maxLength={2200}
                    className={errors.caption ? 'border-destructive' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags" className={errors.tags ? 'text-destructive' : ''}>
                    Tags {errors.tags && `(${errors.tags})`}
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="Add tags separated by commas"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className={errors.tags ? 'border-destructive' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Add a location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('upload')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Post Reel'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelCreate;