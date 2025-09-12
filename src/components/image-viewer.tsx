"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export function ImageViewer({ images, startIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious(e as any);
    if (e.key === 'ArrowRight') goToNext(e as any);
    if (e.key === 'Escape') onClose();
  }
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);


  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
      onClick={handleClose}
    >
        {/* Close Button */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 hover:text-white z-[101]" 
            onClick={handleClose}
        >
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
        </Button>

        {images.length > 1 && (
            <>
            {/* Previous Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 hover:text-white z-[101]" 
                onClick={goToPrevious}
            >
                <ChevronLeft className="h-8 w-8" />
                <span className="sr-only">Anterior</span>
            </Button>
            {/* Next Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 hover:text-white z-[101]" 
                onClick={goToNext}
            >
                <ChevronRight className="h-8 w-8" />
                <span className="sr-only">Próxima</span>
            </Button>
            </>
        )}
      
        <div className="relative w-full h-full p-16" onClick={(e) => e.stopPropagation()}>
            <Image
                src={images[currentIndex]}
                alt={`Prova ampliada ${currentIndex + 1}`}
                fill
                className="object-contain"
            />
        </div>

        {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-[101]">
                {currentIndex + 1} / {images.length}
            </div>
        )}
    </div>
  );
}
