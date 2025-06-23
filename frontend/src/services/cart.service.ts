import { apiClient } from '@/lib/api-client';

/**
 * Cart item interface for API communication
 */
export interface CartItemAPI {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  title: string;
  image: string;
  category: string;
}

/**
 * Cart API response interface
 */
export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemAPI[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add item to cart request
 */
export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

/**
 * Update cart item request
 */
export interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
}

/**
 * Cart Service for API integration
 * Handles persistent cart storage and synchronization with backend
 */
export class CartService {
  private static readonly ENDPOINTS = {
    CART: '/Cart',
    CART_ITEMS: '/Cart/items',
    CART_ITEM: '/Cart/item',
    CART_SYNC: '/Cart/sync',
    CART_CLEAR: '/Cart/clear'
  } as const;

  /**
   * Get user's cart from backend
   * @param userId - User ID
   * @returns Promise<CartResponse> - User's cart data
   */
  static async getCart(userId: number): Promise<CartResponse> {
    try {
      return await apiClient.get<CartResponse>(`${this.ENDPOINTS.CART}/${userId}`);
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw new Error('Failed to retrieve cart');
    }
  }

  /**
   * Add item to cart
   * @param userId - User ID
   * @param item - Item to add
   * @returns Promise<CartResponse> - Updated cart
   */
  static async addToCart(userId: number, item: AddToCartRequest): Promise<CartResponse> {
    try {
      return await apiClient.post<CartResponse>(
        `${this.ENDPOINTS.CART}/${userId}/items`,
        item
      );
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  }

  /**
   * Update cart item quantity
   * @param userId - User ID
   * @param item - Item to update
   * @returns Promise<CartResponse> - Updated cart
   */
  static async updateCartItem(userId: number, item: UpdateCartItemRequest): Promise<CartResponse> {
    try {
      return await apiClient.put<CartResponse>(
        `${this.ENDPOINTS.CART}/${userId}/items/${item.productId}`,
        { quantity: item.quantity }
      );
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw new Error('Failed to update cart item');
    }
  }

  /**
   * Remove item from cart
   * @param userId - User ID
   * @param productId - Product ID to remove
   * @returns Promise<CartResponse> - Updated cart
   */
  static async removeFromCart(userId: number, productId: number): Promise<CartResponse> {
    try {
      return await apiClient.delete<CartResponse>(
        `${this.ENDPOINTS.CART}/${userId}/items/${productId}`
      );
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  /**
   * Clear entire cart
   * @param userId - User ID
   * @returns Promise<void>
   */
  static async clearCart(userId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.ENDPOINTS.CART}/${userId}`);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  /**
   * Sync local cart with backend
   * @param userId - User ID
   * @param localCartItems - Local cart items to sync
   * @returns Promise<CartResponse> - Synced cart
   */
  static async syncCart(userId: number, localCartItems: CartItemAPI[]): Promise<CartResponse> {
    try {
      return await apiClient.post<CartResponse>(
        `${this.ENDPOINTS.CART_SYNC}/${userId}`,
        { items: localCartItems }
      );
    } catch (error) {
      console.error('Failed to sync cart:', error);
      throw new Error('Failed to sync cart');
    }
  }

  /**
   * Get cart summary (totals, item count, etc.)
   * @param cartItems - Cart items
   * @returns Cart summary object
   */
  static getCartSummary(cartItems: CartItemAPI[]) {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return {
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Validate cart items (check stock, prices, etc.)
   * @param cartItems - Cart items to validate
   * @returns Promise<ValidationResult>
   */
  static async validateCart(cartItems: CartItemAPI[]): Promise<{
    isValid: boolean;
    errors: string[];
    updatedItems?: CartItemAPI[];
  }> {
    try {
      const response = await apiClient.post<{
        isValid: boolean;
        errors: string[];
        updatedItems?: CartItemAPI[];
      }>('/Cart/validate', { items: cartItems });

      return response;
    } catch (error) {
      console.error('Failed to validate cart:', error);
      return {
        isValid: false,
        errors: ['Failed to validate cart items']
      };
    }
  }

  /**
   * Convert local cart item to API format
   * @param localItem - Local cart item
   * @returns CartItemAPI - API formatted item
   */
  static convertToAPIFormat(localItem: { id: number; quantity: number; price: number; title: string; category: string; image: string }): CartItemAPI {
    return {
      id: localItem.id,
      productId: localItem.id,
      quantity: localItem.quantity,
      price: localItem.price,
      title: localItem.title,
      image: localItem.image,
      category: localItem.category
    };
  }

  /**
   * Convert API cart item to local format
   * @param apiItem - API cart item
   * @returns Local cart item format
   */
  static convertFromAPIFormat(apiItem: CartItemAPI): { id: number; title: string; price: number; category: string; image: string; rate: number; count: number; quantity: number; sizes: Array<{ id?: number; size: string; quantity: number }> } {
    return {
      id: apiItem.productId,
      title: apiItem.title,
      price: apiItem.price,
      category: apiItem.category,
      image: apiItem.image,
      rate: 0, // Default rating
      count: 0, // Default count
      quantity: apiItem.quantity,
      sizes: [] // Default sizes
    };
  }

  /**
   * Merge local and remote cart items
   * @param localItems - Local cart items
   * @param remoteItems - Remote cart items
   * @returns Merged cart items
   */
  static mergeCartItems(localItems: { id: number; quantity: number }[], remoteItems: CartItemAPI[]): { id: number; quantity: number }[] {
    const merged = [...localItems];
    
    remoteItems.forEach(remoteItem => {
      const existingIndex = merged.findIndex(item => item.id === remoteItem.productId);
      
      if (existingIndex >= 0) {
        // Item exists locally, use higher quantity
        merged[existingIndex].quantity = Math.max(
          merged[existingIndex].quantity,
          remoteItem.quantity
        );
      } else {
        // Item doesn't exist locally, add it
        merged.push(this.convertFromAPIFormat(remoteItem));
      }
    });

    return merged;
  }

  /**
   * Check if cart service is available
   * @returns Promise<boolean> - Service availability
   */
  static async isServiceAvailable(): Promise<boolean> {
    try {
      await apiClient.get('/Cart/health');
      return true;
    } catch (error) {
      console.warn('Cart service is not available:', error);
      return false;
    }
  }
}

export default CartService;
