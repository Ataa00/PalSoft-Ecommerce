import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { CartProvider, useCart } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { SessionProvider } from 'next-auth/react';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com'
  },
  expires: '2024-12-31'
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={mockSession}>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </SessionProvider>
);

const mockProduct = {
  id: 1,
  title: 'Test Product',
  price: 29.99,
  category: 'electronics',
  image: '/test.jpg',
  rate: 4.5,
  count: 100,
  sizes: ['S', 'M', 'L']
};

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      expect(result.current.state.items).toEqual([]);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.isSyncing).toBe(false);
    });

    it('should load cart from localStorage on initialization', () => {
      const savedCart = [
        { ...mockProduct, quantity: 2 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      expect(result.current.state.items).toEqual(savedCart);
    });
  });

  describe('ADD_ITEM action', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      expect(result.current.state.items).toHaveLength(1);
      expect(result.current.state.items[0]).toEqual({
        ...mockProduct,
        quantity: 1
      });
    });

    it('should increase quantity if item already exists', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item first time
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Add same item again
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      expect(result.current.state.items).toHaveLength(1);
      expect(result.current.state.items[0].quantity).toBe(2);
    });

    it('should handle different sizes as separate items', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      const productSizeM = { ...mockProduct, selectedSize: 'M' };
      const productSizeL = { ...mockProduct, selectedSize: 'L' };

      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: productSizeM
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: productSizeL
        });
      });

      expect(result.current.state.items).toHaveLength(2);
    });
  });

  describe('REMOVE_ITEM action', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item first
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Remove item
      act(() => {
        result.current.dispatch({
          type: 'REMOVE_ITEM',
          payload: mockProduct.id
        });
      });

      expect(result.current.state.items).toHaveLength(0);
    });

    it('should not affect cart if item does not exist', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.dispatch({
          type: 'REMOVE_ITEM',
          payload: 999 // Non-existent ID
        });
      });

      expect(result.current.state.items).toHaveLength(0);
    });
  });

  describe('INCREASE_QUANTITY action', () => {
    it('should increase item quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item first
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Increase quantity
      act(() => {
        result.current.dispatch({
          type: 'INCREASE_QUANTITY',
          payload: mockProduct.id
        });
      });

      expect(result.current.state.items[0].quantity).toBe(2);
    });

    it('should not affect non-existent items', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.dispatch({
          type: 'INCREASE_QUANTITY',
          payload: 999
        });
      });

      expect(result.current.state.items).toHaveLength(0);
    });
  });

  describe('DECREASE_QUANTITY action', () => {
    it('should decrease item quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item with quantity 2
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
        result.current.dispatch({
          type: 'INCREASE_QUANTITY',
          payload: mockProduct.id
        });
      });

      // Decrease quantity
      act(() => {
        result.current.dispatch({
          type: 'DECREASE_QUANTITY',
          payload: mockProduct.id
        });
      });

      expect(result.current.state.items[0].quantity).toBe(1);
    });

    it('should remove item when quantity reaches 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Decrease quantity to 0
      act(() => {
        result.current.dispatch({
          type: 'DECREASE_QUANTITY',
          payload: mockProduct.id
        });
      });

      expect(result.current.state.items).toHaveLength(0);
    });
  });

  describe('SET_QUANTITY action', () => {
    it('should set specific quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item first
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Set quantity to 5
      act(() => {
        result.current.dispatch({
          type: 'SET_QUANTITY',
          payload: { id: mockProduct.id, quantity: 5 }
        });
      });

      expect(result.current.state.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add item first
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Set quantity to 0
      act(() => {
        result.current.dispatch({
          type: 'SET_QUANTITY',
          payload: { id: mockProduct.id, quantity: 0 }
        });
      });

      expect(result.current.state.items).toHaveLength(0);
    });
  });

  describe('CLEAR_CART action', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add multiple items
      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: { ...mockProduct, id: 2, title: 'Product 2' }
        });
      });

      // Clear cart
      act(() => {
        result.current.dispatch({
          type: 'CLEAR_CART'
        });
      });

      expect(result.current.state.items).toHaveLength(0);
    });
  });

  describe('Sync functionality', () => {
    it('should handle sync state changes', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.dispatch({
          type: 'SET_SYNCING',
          payload: true
        });
      });

      expect(result.current.state.isSyncing).toBe(true);

      act(() => {
        result.current.dispatch({
          type: 'SET_SYNCING',
          payload: false
        });
      });

      expect(result.current.state.isSyncing).toBe(false);
    });

    it('should update sync time', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      const timestamp = Date.now();

      act(() => {
        result.current.dispatch({
          type: 'SET_SYNC_TIME',
          payload: timestamp
        });
      });

      expect(result.current.state.lastSyncTime).toBe(timestamp);
    });

    it('should sync cart items', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      const syncedItems = [
        { ...mockProduct, quantity: 3 },
        { ...mockProduct, id: 2, title: 'Synced Product', quantity: 1 }
      ];

      act(() => {
        result.current.dispatch({
          type: 'SYNC_CART',
          payload: syncedItems
        });
      });

      expect(result.current.state.items).toEqual(syncedItems);
      expect(result.current.state.isSyncing).toBe(false);
      expect(result.current.state.lastSyncTime).toBeGreaterThan(0);
    });
  });

  describe('localStorage integration', () => {
    it('should save cart to localStorage when items change', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_ITEM',
          payload: mockProduct
        });
      });

      // Should save to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cart',
        JSON.stringify([{ ...mockProduct, quantity: 1 }])
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.dispatch({
            type: 'ADD_ITEM',
            payload: mockProduct
          });
        });
      }).not.toThrow();
    });
  });
});
