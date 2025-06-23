"use client";

import { FaSpinner } from 'react-icons/fa';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const colorClasses = {
    primary: 'text-black',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <FaSpinner className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
        {text && (
          <p className={`text-sm ${colorClasses[color]}`}>{text}</p>
        )}
      </div>
    </div>
  );
}

// Full page loading component
export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Button loading state
export function ButtonLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <FaSpinner className="animate-spin text-sm" />
      <span>{text}</span>
    </div>
  );
}
