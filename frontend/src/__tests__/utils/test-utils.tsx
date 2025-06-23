import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Mock session for testing
export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  },
  expires: '2024-12-31'
};

export const mockAdminSession = {
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  },
  expires: '2024-12-31'
};

// Test wrapper with all providers
interface AllTheProvidersProps {
  children: React.ReactNode;
  session?: { user?: { id?: string; name?: string; email?: string; role?: string } };
}

const AllTheProviders = ({ children, session = mockSession }: AllTheProvidersProps) => {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: { user?: { id?: string; name?: string; email?: string; role?: string } };
}

const customRender = (
  ui: React.ReactElement,
  { session, ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders session={session}>{children}</AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock product data
export const mockProduct = {
  id: 1,
  title: 'Test Product',
  price: 29.99,
  category: 'electronics',
  image: '/test-image.jpg',
  rate: 4.5,
  count: 100,
  sizes: ['S', 'M', 'L'],
  description: 'Test product description'
};

export const mockProducts = [
  mockProduct,
  {
    id: 2,
    title: 'Test Product 2',
    price: 39.99,
    category: 'clothing',
    image: '/test-image-2.jpg',
    rate: 4.0,
    count: 50,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Test product 2 description'
  },
  {
    id: 3,
    title: 'Test Product 3',
    price: 19.99,
    category: 'books',
    image: '/test-image-3.jpg',
    rate: 4.8,
    count: 200,
    sizes: [],
    description: 'Test product 3 description'
  }
];

// Mock order data
export const mockOrder = {
  id: 1,
  orderId: 1001,
  date: new Date().toISOString(),
  status: 'delivered' as const,
  total: 89.97,
  subtotal: 79.98,
  shipping: 5.99,
  tax: 4.00,
  items: [
    {
      id: 1,
      productId: 1,
      title: 'Test Product',
      quantity: 2,
      price: 29.99,
      image: '/test-image.jpg'
    }
  ],
  shippingAddress: {
    name: 'Test User',
    address: '123 Test St, Test City, TS 12345',
    phone: '1234567890',
    email: 'test@example.com'
  },
  paymentMethod: 'Credit Card ending in 4242'
};

// Mock notification data
export const mockNotification = {
  id: 'test-notification-1',
  type: 'order_update' as const,
  title: 'Test Notification',
  message: 'This is a test notification',
  timestamp: new Date().toISOString(),
  read: false,
  userId: 1,
  priority: 'medium' as const,
  actionUrl: '/test',
  actionText: 'View Test'
};

// Mock API responses
export const mockApiResponses = {
  products: {
    success: mockProducts,
    empty: [],
    error: new Error('Failed to fetch products')
  },
  product: {
    success: mockProduct,
    notFound: new Error('Product not found')
  },
  orders: {
    success: [mockOrder],
    empty: []
  },
  order: {
    success: mockOrder,
    notFound: new Error('Order not found')
  }
};

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 100));
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    }
  };
};

export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    }
  };
};

// Mock fetch responses
export const createMockFetch = (responses: Record<string, unknown>) => {
  return jest.fn((url: string) => {
    const response = responses[url];
    
    if (response instanceof Error) {
      return Promise.reject(response);
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    });
  });
};

// Form testing helpers
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react');
  
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  });
};

export const submitForm = async (form: HTMLFormElement) => {
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.submit(form);
};

// Async testing helpers
export const waitForAsync = (ms: number = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};
