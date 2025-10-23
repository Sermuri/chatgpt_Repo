import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  totalImages: number;
}

export function ImageCarousel({ totalImages }: ImageCarouselProps) {
  const [currentImage, setCurrentImage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentImage]);

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImage((prev) => (prev === totalImages ? 1 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImage((prev) => (prev === 1 ? totalImages : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
      <img
        src={`/imag/imagen${currentImage}.jpeg`}
        alt={`Generated Image ${currentImage}`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}
      />
      
      {/* Navigation Buttons */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: totalImages }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentImage(index + 1);
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              currentImage === index + 1
                ? 'bg-white w-4'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
}