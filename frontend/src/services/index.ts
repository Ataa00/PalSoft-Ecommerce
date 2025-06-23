// Service exports for easy importing
export { default as AuthService } from './auth.service';
export { default as ProductService } from './product.service';
export { default as OrderService } from './order.service';
export { default as CartService } from './cart.service';
export { default as ReviewService } from './review.service';

// Re-export API client utilities
export { apiClient, TokenManager, ApiError } from '@/lib/api-client';
export type { ApiErrorType } from '@/lib/api-client';

// Re-export types
export type {
  Product,
  ProductBasic,
  ProductSize,
  ProductSizeBasic,
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OrderItem,
  CreateOrderRequest,
  OrderResponse,
  ShippingAddress,
  PaymentMethod,
  OrderSummary,
  CheckoutStep,
  ApiResponse,
  ApiError as ApiErrorInterface,
} from '@/types/product';
