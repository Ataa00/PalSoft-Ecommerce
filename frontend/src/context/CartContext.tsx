"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Product, ProductBasic } from "@/types/product";
import { CartService } from "@/services/cart.service";
import { useAuth } from "./AuthContext";

// Cart item type that can work with both Product and ProductBasic
type CartItem = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rate: number;
  count: number;
  quantity: number;
  // Optional fields that might not be present in ProductBasic
  description?: string;
  sizes?: Array<{ id?: number; size: string; quantity: number }>;
  tag?: string;
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncEnabled: boolean;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: Product | ProductBasic }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "INCREASE_QUANTITY"; payload: number }
  | { type: "DECREASE_QUANTITY"; payload: number }
  | { type: "SET_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SYNCING"; payload: boolean }
  | { type: "SET_SYNC_TIME"; payload: number }
  | { type: "SET_SYNC_ENABLED"; payload: boolean }
  | { type: "SYNC_CART"; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  syncCart: () => Promise<void>;
  enableSync: () => void;
  disableSync: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM":
      const exist = state.items.find((item) => item.id === action.payload.id);
      if (exist) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        // Convert Product or ProductBasic to CartItem
        const cartItem: CartItem = {
          id: action.payload.id,
          title: action.payload.title,
          price: action.payload.price,
          category: action.payload.category,
          image: action.payload.image,
          rate: action.payload.rate,
          count: action.payload.count,
          quantity: 1,
          description: 'description' in action.payload ? action.payload.description : undefined,
          sizes: action.payload.sizes,
          tag: action.payload.tag,
        };
        return {
          ...state,
          items: [...state.items, cartItem],
        };
      }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "INCREASE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    case "DECREASE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    case "SET_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SYNCING":
      return { ...state, isSyncing: action.payload };
    case "SET_SYNC_TIME":
      return { ...state, lastSyncTime: action.payload };
    case "SET_SYNC_ENABLED":
      return { ...state, syncEnabled: action.payload };
    case "SYNC_CART":
      return {
        ...state,
        items: action.payload,
        lastSyncTime: Date.now(),
        isSyncing: false
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
    isSyncing: false,
    lastSyncTime: null,
    syncEnabled: true
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const { state: authState } = useAuth();

 
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed: CartItem[] = JSON.parse(storedCart);
        dispatch({ type: "CLEAR_CART" });
        // Directly set the items instead of using ADD_ITEM action
        parsed.forEach((item: CartItem) => {
          // Create a compatible payload for ADD_ITEM
          const payload = {
            id: item.id,
            title: item.title,
            price: item.price,
            category: item.category,
            image: item.image,
            rate: item.rate,
            count: item.count,
            sizes: item.sizes || [],
            tag: item.tag,
          };
          dispatch({ type: "ADD_ITEM", payload });
        });
      } catch (e) {
        console.error("Invalid cart data in localStorage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Sync cart with backend
  const syncCart = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user || !state.syncEnabled) {
      return;
    }

    try {
      dispatch({ type: "SET_SYNCING", payload: true });

      // Check if cart service is available
      const isAvailable = await CartService.isServiceAvailable();
      if (!isAvailable) {
        console.warn('Cart service not available, skipping sync');
        return;
      }

      // Convert local items to API format
      const apiItems = state.items.map(CartService.convertToAPIFormat);

      // Sync with backend
      const syncedCart = await CartService.syncCart(authState.user.id, apiItems);

      // Convert back to local format and update state
      const localItems = syncedCart.items.map(CartService.convertFromAPIFormat);
      dispatch({ type: "SYNC_CART", payload: localItems });

    } catch (error) {
      console.error('Failed to sync cart:', error);
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false });
    }
  }, [authState.isAuthenticated, authState.user, state.syncEnabled, state.items]);

  // Enable cart sync
  const enableSync = () => {
    dispatch({ type: "SET_SYNC_ENABLED", payload: true });
  };

  // Disable cart sync
  const disableSync = () => {
    dispatch({ type: "SET_SYNC_ENABLED", payload: false });
  };

  // Auto-sync when user logs in
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && state.syncEnabled && isHydrated) {
      syncCart();
    }
  }, [authState.isAuthenticated, authState.user, state.syncEnabled, isHydrated, syncCart]);

  // Periodic sync (every 5 minutes)
  useEffect(() => {
    if (!state.syncEnabled || !authState.isAuthenticated) return;

    const interval = setInterval(() => {
      syncCart();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [state.syncEnabled, authState.isAuthenticated, syncCart]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, isHydrated]);

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      syncCart,
      enableSync,
      disableSync
    }}>
      {isHydrated ? children : null}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
