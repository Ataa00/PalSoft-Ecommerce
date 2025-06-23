import { useRef, useLayoutEffect, RefObject } from "react";
import gsap from "gsap";

/**
 * Configuration options for progress bar animation
 */
export interface ProgressBarAnimationConfig {
  translateX?: string;
  duration?: number;
  ease?: string;
  repeat?: number;
}

/**
 * Default animation configuration
 */
const DEFAULT_CONFIG: Required<ProgressBarAnimationConfig> = {
  translateX: "290%",
  duration: 3.5,
  ease: "linear",
  repeat: -1,
};

/**
 * Custom hook for creating animated progress bar effects
 * 
 * This hook creates a GSAP animation that moves an element horizontally
 * in a continuous loop, commonly used for progress bars or loading indicators.
 * 
 * @param config - Animation configuration options
 * @returns RefObject to attach to the element that should be animated
 * 
 * @example
 * ```tsx
 * const progressRef = useProgressBarAnimation({
 *   translateX: "300%",
 *   duration: 4,
 * });
 * 
 * return (
 *   <div className="progress-container">
 *     <div ref={progressRef} className="progress-bar" />
 *   </div>
 * );
 * ```
 */
export const useProgressBarAnimation = (
  config: ProgressBarAnimationConfig = {}
): RefObject<HTMLDivElement | null> => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animationConfig = { ...DEFAULT_CONFIG, ...config };

    // Create the GSAP animation
    const animation = gsap.to(element, {
      x: animationConfig.translateX,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      repeat: animationConfig.repeat,
    });

    // Cleanup function to kill the animation when component unmounts
    return () => {
      animation.kill();
    };
  }, [config]);

  return elementRef;
};
