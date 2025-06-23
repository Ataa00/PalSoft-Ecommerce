import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FeaturedProduct } from "@/hooks/useFeaturedProducts";

/**
 * Grid layout variants
 */
export type GridVariant = "featured" | "standard";

/**
 * Props for the ProductGrid component
 */
export interface ProductGridProps {
  /** Array of products to display */
  products: FeaturedProduct[];
  /** Grid layout variant */
  variant?: GridVariant;
  /** Optional CSS classes for the container */
  className?: string;
}

/**
 * Grid span configuration for featured layout
 * Maps product index to CSS grid classes
 */
const FEATURED_GRID_SPANS: Record<number, string> = {
  0: "lg:col-span-2 lg:row-span-1",
  1: "lg:col-span-2 lg:row-start-2 lg:row-span-1", 
  2: "lg:col-start-3 lg:row-span-2",
  3: "lg:col-start-4 lg:row-span-2",
};

/**
 * Get grid span classes for featured layout
 */
const getFeaturedGridSpan = (index: number): string => {
  return FEATURED_GRID_SPANS[index] || "";
};

/**
 * Determine if product should use tall image layout
 */
const shouldUseTallLayout = (index: number, variant: GridVariant): boolean => {
  return variant === "featured" && (index === 2 || index === 3);
};

/**
 * ProductCard Component
 * Individual product card within the grid
 */
interface ProductCardProps {
  product: FeaturedProduct;
  index: number;
  variant: GridVariant;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, variant }) => {
  const gridSpanClass = variant === "featured" ? getFeaturedGridSpan(index) : "";
  const useTallLayout = shouldUseTallLayout(index, variant);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`
        rounded-xl overflow-hidden bg-white shadow-sm flex flex-col 
        transform transition-all hover:scale-105 duration-300
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${gridSpanClass}
      `}
      aria-label={`View details for ${product.title}`}
    >
      {/* Product Image Container */}
      <div className="relative h-full">
        {useTallLayout ? (
          <Image
            src={product.image}
            alt={product.title}
            width={700}
            height={700}
            className="w-full h-[700px] object-contain"
            priority={index < 2} // Prioritize loading for first two images
          />
        ) : (
          <div className="relative h-[300px] sm:h-[400px] lg:h-full">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain w-full h-full"
              priority={index < 2}
            />
          </div>
        )}
        
        {/* Product Tag */}
        {product.tag && (
          <span className="absolute top-3 right-3 bg-white text-gray-800 text-lg px-5 py-2 rounded shadow-sm font-medium">
            {product.tag}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4">
        <h3 className="font-medium text-xl tracking-wider truncate mb-1">
          {product.title}
        </h3>
        <p className="text-gray-600 text-xl font-medium">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

/**
 * ProductGrid Component
 * 
 * Displays a responsive grid of product cards with different layout variants.
 * The featured variant uses a complex grid layout with varying card sizes.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  variant = "standard",
  className = "",
}) => {
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products available</p>
      </div>
    );
  }

  const gridClasses = variant === "featured" 
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className={`${gridClasses} ${className}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          variant={variant}
        />
      ))}
    </div>
  );
};
