import { useState, useCallback } from 'react';
import { ApiError } from '@/lib/api-client';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiStateReturn<T> extends ApiState<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Custom hook for managing API call states
 * @param initialData - Initial data value
 * @returns Object with state and control functions
 */
export function useApiState<T>(initialData: T | null = null): UseApiStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        
        // Handle specific error types
        if (err.status === 401) {
          errorMessage = 'Authentication required. Please log in.';
        } else if (err.status === 403) {
          errorMessage = 'Access denied. You do not have permission to perform this action.';
        } else if (err.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (err.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('API call failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
}

/**
 * Hook for managing paginated API calls
 */
export interface PaginatedApiState<T> extends ApiState<T[]> {
  page: number;
  hasMore: boolean;
  totalCount: number;
}

export interface UsePaginatedApiStateReturn<T> extends PaginatedApiState<T> {
  loadMore: (apiCall: (page: number) => Promise<{ data: T[]; hasMore: boolean; totalCount: number }>) => Promise<void>;
  reset: () => void;
  setPage: (page: number) => void;
}

export function usePaginatedApiState<T>(initialPage: number = 1): UsePaginatedApiStateReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadMore = useCallback(async (
    apiCall: (page: number) => Promise<{ data: T[]; hasMore: boolean; totalCount: number }>
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(page);
      
      if (page === 1) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setPage(prev => prev + 1);
    } catch (err) {
      let errorMessage = 'Failed to load data';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Paginated API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setPage(initialPage);
    setHasMore(true);
    setTotalCount(0);
  }, [initialPage]);

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    totalCount,
    loadMore,
    reset,
    setPage,
  };
}

/**
 * Hook for managing form submission states
 */
export interface FormApiState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseFormApiStateReturn extends FormApiState {
  submit: <T>(apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setError: (error: string) => void;
  setSuccess: (success: boolean) => void;
}

export function useFormApiState(): UseFormApiStateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await apiCall();
      setSuccess(true);
      return result;
    } catch (err) {
      let errorMessage = 'Submission failed';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Form submission failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
    setError,
    setSuccess,
  };
}
