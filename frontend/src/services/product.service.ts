import { apiClient } from '@/lib/api-client';
import { Product, ProductBasic } from '@/types/product';
import CacheService from './cache.service';

/**
 * Product Service
 * Handles all product-related API calls
 */
export class ProductService {
  private static readonly ENDPOINTS = {
    PRODUCTS: '/Product',
    PRODUCT_BY_ID: '/Product',
  } as const;

  /**
   * Get all products (basic info without description)
   * @returns Promise<ProductBasic[]> - Array of all products with basic info
   */
  static async getAllProducts(): Promise<ProductBasic[]> {
    const cacheKey = 'products_all';

    return CacheService.cacheApiCall(
      cacheKey,
      async () => apiClient.get<ProductBasic[]>(this.ENDPOINTS.PRODUCTS),
      { ttl: 5 * 60 * 1000, storage: 'localStorage' } // Cache for 5 minutes
    );
  }

  /**
   * Get product by ID
   * @param productId - Product ID
   * @returns Promise<Product> - Product details
   */
  static async getProductById(productId: number): Promise<Product> {
    const cacheKey = `product_${productId}`;

    return CacheService.cacheApiCall(
      cacheKey,
      async () => apiClient.get<Product>(`${this.ENDPOINTS.PRODUCT_BY_ID}/${productId}`),
      { ttl: 10 * 60 * 1000, storage: 'localStorage' } // Cache for 10 minutes
    );
  }

  /**
   * Get products by category
   * @param category - Product category
   * @returns Promise<ProductBasic[]> - Array of products in the category
   */
  static async getProductsByCategory(category: string): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search products by title (basic search without description)
   * @param searchTerm - Search term
   * @returns Promise<ProductBasic[]> - Array of matching products
   */
  static async searchProducts(searchTerm: string): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();
    const term = searchTerm.toLowerCase();

    return allProducts.filter(product =>
      product.title.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }

  /**
   * Get featured products (products with high ratings)
   * @param limit - Maximum number of products to return
   * @returns Promise<ProductBasic[]> - Array of featured products
   */
  static async getFeaturedProducts(limit: number = 4): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();

    return allProducts
      .filter(product => product.rate >= 4.0) // High-rated products
      .sort((a, b) => b.rate - a.rate) // Sort by rating descending
      .slice(0, limit);
  }

  /**
   * Get products with new tag
   * @returns Promise<ProductBasic[]> - Array of new products
   */
  static async getNewProducts(): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.filter(product => product.tag === 'new');
  }

  /**
   * Get unique categories from all products
   * @returns Promise<string[]> - Array of unique categories
   */
  static async getCategories(): Promise<string[]> {
    const allProducts = await this.getAllProducts();
    const categories = new Set(allProducts.map(product => product.category));
    return Array.from(categories);
  }

  /**
   * Get products within a price range
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @returns Promise<ProductBasic[]> - Array of products within price range
   */
  static async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );
  }

  /**
   * Get products sorted by price
   * @param ascending - Sort order (true for ascending, false for descending)
   * @returns Promise<ProductBasic[]> - Array of products sorted by price
   */
  static async getProductsSortedByPrice(ascending: boolean = true): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.sort((a, b) =>
      ascending ? a.price - b.price : b.price - a.price
    );
  }

  /**
   * Get products sorted by rating
   * @param ascending - Sort order (true for ascending, false for descending)
   * @returns Promise<ProductBasic[]> - Array of products sorted by rating
   */
  static async getProductsSortedByRating(ascending: boolean = false): Promise<ProductBasic[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.sort((a, b) =>
      ascending ? a.rate - b.rate : b.rate - a.rate
    );
  }

  /**
   * Check if product is available (has stock)
   * @param productId - Product ID
   * @returns Promise<boolean> - True if product has stock
   */
  static async isProductAvailable(productId: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      return product.sizes.some(size => size.quantity > 0);
    } catch (error) {
      console.error('Error checking product availability:', error);
      return false;
    }
  }

  /**
   * Get available sizes for a product
   * @param productId - Product ID
   * @returns Promise<string[]> - Array of available sizes
   */
  static async getAvailableSizes(productId: number): Promise<string[]> {
    try {
      const product = await this.getProductById(productId);
      return product.sizes
        .filter(size => size.quantity > 0)
        .map(size => size.size);
    } catch (error) {
      console.error('Error getting available sizes:', error);
      return [];
    }
  }

  /**
   * Get stock quantity for a specific product size
   * @param productId - Product ID
   * @param size - Product size
   * @returns Promise<number> - Stock quantity for the size
   */
  static async getStockQuantity(productId: number, size: string): Promise<number> {
    try {
      const product = await this.getProductById(productId);
      const productSize = product.sizes.find(s => s.size === size);
      return productSize?.quantity || 0;
    } catch (error) {
      console.error('Error getting stock quantity:', error);
      return 0;
    }
  }
}

// Export default instance for convenience
export default ProductService;
