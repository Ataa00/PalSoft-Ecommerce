import { useCart } from '@/context/CartContext';
import { OrderService } from '@/services';
import { OrderSummary } from '@/types/product';

/**
 * Custom hook for cart operations and order processing
 */
export function useCartOperations() {
  const { state, dispatch } = useCart();

  /**
   * Clear the entire cart
   */
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  /**
   * Get cart summary with totals
   */
  const getCartSummary = (shippingCost: number = 2.99, taxRate: number = 0.08): OrderSummary => {
    const items = state.items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      subtotal: item.price * item.quantity
    }));

    const totals = OrderService.calculateOrderTotals(state.items, shippingCost, taxRate);

    return {
      items,
      ...totals
    };
  };

  /**
   * Get cart items count
   */
  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Get cart total value
   */
  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /**
   * Check if cart is empty
   */
  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  /**
   * Validate cart for checkout
   */
  const validateCartForCheckout = () => {
    const errors: string[] = [];

    if (isCartEmpty()) {
      errors.push('Your cart is empty');
    }

    // Check for invalid quantities
    state.items.forEach((item) => {
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.title}`);
      }
      if (item.price <= 0) {
        errors.push(`Invalid price for ${item.title}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Prepare order data for API submission
   */
  const prepareOrderData = () => {
    return OrderService.transformCartToOrderItems(state.items);
  };

  /**
   * Add item to cart with validation
   */
  const addToCart = (product: { id: number; title: string; price: number; image?: string }) => {
    try {
      // Create a compatible product object with default values for required fields
      const compatibleProduct = {
        ...product,
        category: 'default', // Default category
        rate: 0, // Default rating
        count: 0, // Default count
        sizes: [], // Default empty sizes array
        image: product.image || '' // Ensure image is always a string
      };
      dispatch({ type: 'ADD_ITEM', payload: compatibleProduct });
      return { success: true, message: 'Item added to cart' };
    } catch {
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId: number) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
      return { success: true, message: 'Item removed from cart' };
    } catch {
      return { success: false, message: 'Failed to remove item from cart' };
    }
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (productId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      } else {
        dispatch({ type: 'SET_QUANTITY', payload: { id: productId, quantity } });
      }
      return { success: true, message: 'Quantity updated' };
    } catch {
      return { success: false, message: 'Failed to update quantity' };
    }
  };

  /**
   * Increase item quantity
   */
  const increaseQuantity = (productId: number) => {
    try {
      dispatch({ type: 'INCREASE_QUANTITY', payload: productId });
      return { success: true, message: 'Quantity increased' };
    } catch {
      return { success: false, message: 'Failed to increase quantity' };
    }
  };

  /**
   * Decrease item quantity
   */
  const decreaseQuantity = (productId: number) => {
    try {
      dispatch({ type: 'DECREASE_QUANTITY', payload: productId });
      return { success: true, message: 'Quantity decreased' };
    } catch {
      return { success: false, message: 'Failed to decrease quantity' };
    }
  };

  /**
   * Save cart state to localStorage (for backup)
   */
  const saveCartToStorage = () => {
    try {
      localStorage.setItem('cart_backup', JSON.stringify(state.items));
      return { success: true, message: 'Cart saved' };
    } catch {
      return { success: false, message: 'Failed to save cart' };
    }
  };

  /**
   * Restore cart from localStorage backup
   */
  const restoreCartFromStorage = () => {
    try {
      const backup = localStorage.getItem('cart_backup');
      if (backup) {
        const items = JSON.parse(backup);
        dispatch({ type: 'CLEAR_CART' });
        items.forEach((item: { id: number; title: string; price: number; image?: string }) => {
          // Create a compatible product object with default values for required fields
          const compatibleItem = {
            ...item,
            category: 'default', // Default category
            rate: 0, // Default rating
            count: 0, // Default count
            sizes: [], // Default empty sizes array
            image: item.image || '' // Ensure image is always a string
          };
          dispatch({ type: 'ADD_ITEM', payload: compatibleItem });
        });
        localStorage.removeItem('cart_backup');
        return { success: true, message: 'Cart restored' };
      }
      return { success: false, message: 'No backup found' };
    } catch {
      return { success: false, message: 'Failed to restore cart' };
    }
  };

  return {
    // State
    cartItems: state.items,
    cartCount: getCartCount(),
    cartTotal: getCartTotal(),
    isEmpty: isCartEmpty(),
    
    // Operations
    clearCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    
    // Utilities
    getCartSummary,
    validateCartForCheckout,
    prepareOrderData,
    saveCartToStorage,
    restoreCartFromStorage,
  };
}
