"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallback?: React.ReactNode;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  containerClassName?: string;
}

/**
 * A wrapper around Next.js Image component with optimizations:
 * - Lazy loading by default
 * - Loading state with skeleton
 * - Error handling with fallback content
 * - Common aspect ratios
 */
const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      className,
      priority,
      fallback,
      aspectRatio = "auto",
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(!priority);
    const [error, setError] = useState(false);

    // Handle different aspect ratios
    const aspectRatioClasses = {
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]", 
      auto: "",
    };

    if (error && fallback) {
      return <>{fallback}</>;
    }

    return (
      <div 
        className={cn(
          "relative overflow-hidden", 
          aspectRatioClasses[aspectRatio],
          containerClassName
        )}
      >
        {isLoading && (
          <Skeleton className="absolute inset-0 z-10" />
        )}
        <Image
          ref={ref}
          src={src}
          alt={alt || "Image"}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoading(false)}
          onError={() => setError(true)}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage };