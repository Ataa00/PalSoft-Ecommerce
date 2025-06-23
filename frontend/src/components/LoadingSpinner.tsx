import React from "react";

/**
 * Props for the LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Size variant for the spinner */
  size?: "small" | "medium" | "large";
  /** Optional CSS classes for the container */
  className?: string;
}

/**
 * Size configuration for spinner variants
 */
const SPINNER_SIZES = {
  small: "w-6 h-6",
  medium: "w-8 h-8", 
  large: "w-12 h-12",
} as const;

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner with optional message and size variants.
 * Uses CSS animations for smooth rotation effect.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = "medium",
  className = "",
}) => {
  const spinnerSizeClass = SPINNER_SIZES[size];

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Spinner */}
      <div
        className={`
          ${spinnerSizeClass} 
          border-4 border-gray-200 border-t-gray-600 
          rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      
      {/* Loading Message */}
      {message && (
        <p className="mt-4 text-gray-600 text-lg font-medium">
          {message}
        </p>
      )}
      
      {/* Screen reader text */}
      <span className="sr-only">Loading content...</span>
    </div>
  );
};
