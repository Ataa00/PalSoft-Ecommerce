import React, { RefObject, ReactNode } from "react";

/**
 * Props for the SectionHeader component
 */
export interface SectionHeaderProps {
  /** Main title text */
  title: string;
  /** Subtitle text displayed below the header */
  subtitle: string;
  /** Ref for the animated progress bar element */
  progressRef: RefObject<HTMLDivElement | null>;
  /** Click handler for the action button */
  onActionClick: () => void;
  /** Icon to display in the action button */
  actionIcon: ReactNode;
  /** Accessible label for the action button */
  actionLabel: string;
  /** Optional CSS classes for the container */
  className?: string;
}

/**
 * SectionHeader Component
 * 
 * A reusable header component that includes:
 * - An animated progress bar
 * - Section title and subtitle
 * - An action button with icon
 * 
 * Commonly used across different product sections to maintain consistency.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  progressRef,
  onActionClick,
  actionIcon,
  actionLabel,
  className = "",
}) => {
  return (
    <>
      {/* Header with Progress Bar and Action Button */}
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${className}`}>
        {/* Animated Progress Bar */}
        <div className="w-full lg:flex-1 h-[6px] bg-gray-300 relative rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="absolute top-0 left-[-60%] h-full w-[60%] bg-gradient-to-r from-gray-700 via-gray-900 to-transparent opacity-70"
          />
        </div>

        {/* Header Text + Action Button */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-2xl tracking-wide">
            {title}
          </span>
          <button
            onClick={onActionClick}
            aria-label={actionLabel}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-300 text-lg font-medium text-gray-800 hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {actionIcon}
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <h2 className="text-2xl font-medium py-8 tracking-wide">
        &ldquo;{subtitle}&rdquo;
      </h2>
    </>
  );
};
