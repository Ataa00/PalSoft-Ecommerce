"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User, LoginRequest, UserRole } from "@/types/product";
import AuthService from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";

// Auth State Types
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Context Type
type AuthContextType = {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
};

// Create Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "AUTH_START" });
        
        if (AuthService.isAuthenticated()) {
          const user = await AuthService.getCurrentUser();
          if (user) {
            dispatch({ type: "AUTH_SUCCESS", payload: user });
          } else {
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      dispatch({ type: "AUTH_START" });
      
      await AuthService.login(credentials);
      const user = await AuthService.getCurrentUser();
      
      if (user) {
        dispatch({ type: "AUTH_SUCCESS", payload: user });
      } else {
        throw new Error("Failed to get user details after login");
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Login failed. Please try again.";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => {
    try {
      dispatch({ type: "AUTH_START" });
      
      await AuthService.register(userData);
      
      // After successful registration, automatically log in
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Registration failed. Please try again.";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, [login]);

  // Logout function
  const logout = useCallback(() => {
    AuthService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      if (AuthService.isAuthenticated()) {
        const user = await AuthService.getCurrentUser();
        if (user) {
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } else {
        dispatch({ type: "AUTH_LOGOUT" });
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return AuthService.isAdmin();
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
