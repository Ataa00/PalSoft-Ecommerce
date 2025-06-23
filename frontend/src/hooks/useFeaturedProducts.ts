import { useState, useEffect } from "react";
import { ProductBasic } from "@/types/product";
import ProductService from "@/services/product.service";
import { ApiError } from "@/lib/api-client";

/**
 * Configuration for featured products
 */
const FEATURED_PRODUCTS_CONFIG = {
  maxProducts: 4,
} as const;

/**
 * Transformed product type for featured products display
 */
export interface FeaturedProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  tag?: string;
}

/**
 * Hook return type
 */
interface UseFeaturedProductsReturn {
  products: FeaturedProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Transform raw product data to featured product format
 */
const transformToFeaturedProduct = (product: ProductBasic): FeaturedProduct => ({
  id: product.id.toString(),
  title: product.title,
  price: product.price,
  image: product.image, // API guarantees this field in basic response
  category: product.category,
  tag: product.tag,
});

/**
 * Custom hook for fetching and managing featured products
 * 
 * @returns Object containing products, loading state, error state, and refetch function
 */
export const useFeaturedProducts = (): UseFeaturedProductsReturn => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await ProductService.getFeaturedProducts(FEATURED_PRODUCTS_CONFIG.maxProducts);

      const featuredProducts = data.map(transformToFeaturedProduct);
      setProducts(featuredProducts);
    } catch (err) {
      let errorMessage = "An unknown error occurred";

      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Error fetching featured products:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = (): void => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch,
  };
};
