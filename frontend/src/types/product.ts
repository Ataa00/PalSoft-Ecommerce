// Product size information for list response (no id field)
export type ProductSizeBasic = {
  size: string; // e.g. "S", "M", "L", "XL", "XXL"
  quantity: number;
};

// Product size information for detailed response (with id field)
export type ProductSize = {
  id: number;
  size: string; // e.g. "S", "M", "L", "XL", "XXL"
  quantity: number;
};

// Product type for list response (no description)
export type ProductBasic = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rate: number;
  count: number;
  sizes: ProductSizeBasic[];
  tag?: string; // Frontend-specific field for UI purposes
};

// Product type for detailed response (with description and full size info)
export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rate: number;
  count: number;
  sizes: ProductSize[];
  tag?: string; // Frontend-specific field for UI purposes
};

export type NavItem = {
  item: string;
  href: string;
};

export type Category = {
  category: string;
  image: string;
};

// Authentication types
export enum UserRole {
  User = 0,
  Admin = 1,
}

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterRequest = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

// Order types
export type OrderItem = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  items: OrderItem[];
};

export type OrderResponse = {
  message: string;
  orderId: number;
  total: number;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  email?: string;
};

export type PaymentMethod = {
  type: 'credit_card' | 'paypal' | 'cash_on_delivery';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  paypalEmail?: string;
};

export type OrderSummary = {
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    image: string;
    subtotal: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

// API Response types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type ApiError = {
  message: string;
  status: number;
  details?: string;
};
