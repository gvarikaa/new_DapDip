'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  caption?: string;
  loading?: 'eager' | 'lazy';
  fit?: 'contain' | 'cover' | 'fill';
  className?: string;
  wrapperClassName?: string;
}

/**
 * SEO-optimized image component with fallback, lazy loading, and accessibility features
 * 
 * @example
 * <OptimizedImage
 *   src="/images/profile.jpg"
 *   alt="User profile picture"
 *   width={300}
 *   height={300}
 *   caption="John Doe's profile"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio = '1/1',
  caption,
  loading = 'lazy',
  fit = 'cover',
  className,
  wrapperClassName,
  ...props
}: OptimizedImageProps): JSX.Element {
  const [isError, setIsError] = useState(false);
  
  // Handle image load error
  const handleError = () => {
    setIsError(true);
  };
  
  return (
    <figure className={cn('relative overflow-hidden', wrapperClassName)}>
      <div 
        className={cn('relative overflow-hidden', className)}
        style={{ aspectRatio }}
      >
        <Image
          src={isError ? fallbackSrc : src}
          alt={alt} // Alt text is required for accessibility
          loading={loading} // Default to lazy loading for better performance
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            fit === 'contain' && 'object-contain',
            fit === 'cover' && 'object-cover',
            fit === 'fill' && 'object-fill'
          )}
          {...props}
        />
      </div>
      
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default OptimizedImage;
