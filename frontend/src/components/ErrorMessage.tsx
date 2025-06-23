import React from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

/**
 * Props for the ErrorMessage component
 */
export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Optional retry button text */
  retryText?: string;
  /** Optional CSS classes for the container */
  className?: string;
}

/**
 * ErrorMessage Component
 * 
 * A reusable error display component with optional retry functionality.
 * Provides consistent error messaging across the application.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = "Try Again",
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Error Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
        <FaExclamationTriangle className="w-8 h-8 text-red-600" />
      </div>

      {/* Error Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            inline-flex items-center gap-2 px-4 py-2 
            bg-blue-600 text-white font-medium rounded-lg
            hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-200
          "
          aria-label={`${retryText} - ${message}`}
        >
          <FaRedo className="w-4 h-4" />
          {retryText}
        </button>
      )}
    </div>
  );
};
