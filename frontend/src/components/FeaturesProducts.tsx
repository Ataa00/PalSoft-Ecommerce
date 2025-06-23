"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import { useProgressBarAnimation } from "@/hooks/useProgressBarAnimation";
import { ProductGrid } from "./ProductGrid";
import { SectionHeader } from "./SectionHeader";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

/**
 * FeaturesProducts Component
 *
 * Displays a curated selection of featured products in a responsive grid layout.
 * Includes an animated progress bar and interactive elements.
 *
 * Features:
 * - Fetches featured products from API
 * - Displays loading and error states
 * - Animated progress bar
 * - Responsive grid layout with varying card sizes
 * - Accessible design with proper ARIA labels
 */
export default function FeaturesProducts() {
  const { products, loading, error } = useFeaturedProducts();
  const progressRef = useProgressBarAnimation({
    translateX: "290%",
    duration: 3.5,
  });

  const handleAddMoreClick = (): void => {
    // TODO: Implement add more functionality
    console.log("Add more products clicked");
  };

  if (loading) {
    return (
      <section className="py-5 px-6">
        <LoadingSpinner message="Loading featured products..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5 px-6">
        <ErrorMessage
          message="Failed to load featured products"
          onRetry={() => window.location.reload()}
        />
      </section>
    );
  }

  return (
    <section className="py-5 px-6">
      <SectionHeader
        title="Features Products"
        subtitle="Top picks curated for you"
        progressRef={progressRef}
        onActionClick={handleAddMoreClick}
        actionIcon={<FaPlus className="text-2xl" />}
        actionLabel="Add more products"
      />

      <ProductGrid products={products} variant="featured" />
    </section>
  );
}