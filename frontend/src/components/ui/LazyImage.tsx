"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/usePerformance';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = '/placeholder-image.jpg',
  blurDataURL,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imgRef = useRef<HTMLDivElement | null>(null);

  const { hasIntersected } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (!hasIntersected || priority) return;

    // Preload the image
    const img = new window.Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setIsError(true);
      onError?.();
    };
    img.src = src;
  }, [hasIntersected, src, priority, onLoad, onError]);

  // For priority images, load immediately
  useEffect(() => {
    if (priority) {
      setImageSrc(src);
    }
  }, [priority, src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsError(true);
    setImageSrc(placeholder);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={!fill ? { width, height } : undefined}
        >
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={!fill ? { width, height } : undefined}
        >
          <div className="text-center text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

// Optimized image component for product cards
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({ src, alt, className = '', priority = false }: ProductImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={300}
      height={300}
      className={className}
      priority={priority}
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="/product-placeholder.jpg"
    />
  );
}

// Optimized image component for hero sections
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HeroImage({ src, alt, className = '' }: HeroImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority={true}
      quality={90}
      sizes="100vw"
    />
  );
}

// Optimized image component for thumbnails
interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ThumbnailImage({ src, alt, className = '' }: ThumbnailImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={80}
      height={80}
      className={className}
      quality={60}
      sizes="80px"
    />
  );
}
