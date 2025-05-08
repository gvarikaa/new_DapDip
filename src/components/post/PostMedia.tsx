import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostMediaProps {
  mediaUrls: string[];
  mediaTitles: string[];
  mediaTypes: string[];
}

export default function PostMedia({
  mediaUrls,
  mediaTitles,
  mediaTypes,
}: PostMediaProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (mediaUrls.length === 0) return <></>;

  const handleNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const handlePrev = (): void => {
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const renderMedia = (url: string, type: string, inLightbox = false): JSX.Element => {
    const isImage = type.startsWith("image");
    const isVideo = type.startsWith("video");

    if (isImage) {
      return (
        <div
          className={cn(
            "relative overflow-hidden",
            inLightbox ? "h-full w-full" : "aspect-video w-full"
          )}
        >
          <Image
            src={url}
            alt={mediaTitles[currentIndex] || "Post media"}
            fill
            className="object-contain"
            onClick={() => !inLightbox && setShowLightbox(true)}
          />
        </div>
      );
    } else if (isVideo) {
      return (
        <div className={cn(inLightbox ? "h-full w-full" : "aspect-video w-full")}>
          <video
            src={url}
            controls
            className="h-full w-full"
            onClick={(e) => !inLightbox && e.currentTarget.paused && setShowLightbox(true)}
          />
        </div>
      );
    } else {
      // Fallback for other media types
      return (
        <div className="flex aspect-video w-full items-center justify-center bg-muted">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            View attachment
          </a>
        </div>
      );
    }
  };

  return (
    <>
      <div className="relative">
        {/* Media carousel */}
        {renderMedia(mediaUrls[currentIndex], mediaTypes[currentIndex])}

        {/* Navigation arrows for multiple media */}
        {mediaUrls.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-1 text-white"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-1 text-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            {/* Indicators */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1">
              {mediaUrls.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === currentIndex ? "bg-primary" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setShowLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative h-[80vh] w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMedia(mediaUrls[currentIndex], mediaTypes[currentIndex], true)}

            {mediaUrls.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white">
              {currentIndex + 1} / {mediaUrls.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}