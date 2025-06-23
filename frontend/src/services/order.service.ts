import { apiClient } from '@/lib/api-client';
import { 
  CreateOrderRequest, 
  OrderResponse, 
  OrderItem,
  ShippingAddress,
  PaymentMethod 
} from '@/types/product';

/**
 * Order Service
 * Handles all order-related API calls
 */
export class OrderService {
  private static readonly ENDPOINTS = {
    ORDERS: '/Orders',
    ORDER_BY_ID: '/Orders',
  } as const;

  /**
   * Create a new order
   * @param orderData - Order creation data
   * @returns Promise<OrderResponse> - Order creation response with orderId and total
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>(this.ENDPOINTS.ORDERS, orderData);
  }

  /**
   * Get order by ID
   * @param orderId - Order ID
   * @returns Promise<any> - Order details (structure depends on backend implementation)
   */
  static async getOrderById(orderId: number): Promise<unknown> {
    return apiClient.get<unknown>(`${this.ENDPOINTS.ORDER_BY_ID}/${orderId}`);
  }

  /**
   * Get user orders (if backend supports this endpoint)
   * @param userId - User ID
   * @returns Promise<any[]> - Array of user orders
   */
  static async getUserOrders(userId: number): Promise<unknown[]> {
    try {
      return apiClient.get<unknown[]>(`${this.ENDPOINTS.ORDERS}/user/${userId}`);
    } catch (error) {
      console.warn('User orders endpoint not available:', error);
      return [];
    }
  }

  /**
   * Validate order data before submission
   * @param items - Cart items to validate
   * @param shippingAddress - Shipping address to validate
   * @returns Object with validation results
   */
  static validateOrderData(
    items: Array<{ id: number; quantity: number; title: string }>,
    shippingAddress: ShippingAddress
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate items
    if (!items || items.length === 0) {
      errors.push('Cart is empty');
    }

    items.forEach((item, index) => {
      if (!item.id || item.id <= 0) {
        errors.push(`Invalid product ID for item ${index + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.title || `item ${index + 1}`}`);
      }
    });

    // Validate shipping address
    if (!shippingAddress.name?.trim()) {
      errors.push('Name is required');
    }
    if (!shippingAddress.phone?.trim()) {
      errors.push('Phone number is required');
    }
    if (!shippingAddress.address?.trim()) {
      errors.push('Address is required');
    }

    // Validate phone format (basic validation)
    if (shippingAddress.phone && !/^[0-9+\-\s()]{9,15}$/.test(shippingAddress.phone)) {
      errors.push('Invalid phone number format');
    }

    // Validate email if provided
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate order totals
   * @param items - Cart items with price and quantity
   * @param shippingCost - Shipping cost (default: 2.99)
   * @param taxRate - Tax rate as decimal (default: 0.08 for 8%)
   * @returns Object with calculated totals
   */
  static calculateOrderTotals(
    items: Array<{ price: number; quantity: number }>,
    shippingCost: number = 2.99,
    taxRate: number = 0.08
  ) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + shippingCost + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shippingCost * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Transform cart items to order items format
   * @param cartItems - Cart items from CartContext
   * @returns Array of OrderItem objects
   */
  static transformCartToOrderItems(
    cartItems: Array<{ id: number; quantity: number }>
  ): OrderItem[] {
    return cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));
  }

  /**
   * Simulate payment processing (for demo purposes)
   * @param paymentMethod - Payment method details
   * @param amount - Amount to charge
   * @returns Promise<boolean> - Payment success status
   */
  static async processPayment(
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment validation
    if (paymentMethod.type === 'credit_card') {
      if (!paymentMethod.cardNumber || paymentMethod.cardNumber.length < 16) {
        return { success: false, error: 'Invalid card number' };
      }
      if (!paymentMethod.expiryDate || !paymentMethod.cvv) {
        return { success: false, error: 'Missing card details' };
      }
    }

    if (paymentMethod.type === 'paypal') {
      if (!paymentMethod.paypalEmail) {
        return { success: false, error: 'PayPal email required' };
      }
    }

    // Simulate random payment failure (5% chance)
    if (Math.random() < 0.05) {
      return { success: false, error: 'Payment declined by bank' };
    }

    // Success case
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Check stock availability for cart items
   * @param items - Cart items to check
   * @returns Promise with stock validation results
   */
  static async validateStock(
    items: Array<{ id: number; quantity: number; title: string }>
  ): Promise<{ isValid: boolean; outOfStockItems: string[] }> {
    try {
      // In a real implementation, this would check with the backend
      // For now, we'll simulate stock validation
      const outOfStockItems: string[] = [];

      // Simulate some items being out of stock (random for demo)
      items.forEach(item => {
        // 5% chance an item is out of stock
        if (Math.random() < 0.05) {
          outOfStockItems.push(item.title);
        }
      });

      return {
        isValid: outOfStockItems.length === 0,
        outOfStockItems
      };
    } catch (error) {
      console.error('Error validating stock:', error);
      return {
        isValid: false,
        outOfStockItems: ['Unable to validate stock availability']
      };
    }
  }
}

// Export default instance for convenience
export default OrderService;
