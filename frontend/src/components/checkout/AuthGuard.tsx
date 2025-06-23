"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FaLock, FaSpinner } from 'react-icons/fa';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { state: authState } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // If auth is not required, show content immediately
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }

      // Check if NextAuth session exists or custom auth is active
      const isNextAuthAuthenticated = sessionStatus === 'authenticated' && session;
      const isCustomAuthAuthenticated = authState.isAuthenticated && authState.user;

      if (sessionStatus === 'loading' || authState.isLoading) {
        // Still loading, keep checking state
        return;
      }

      if (isNextAuthAuthenticated || isCustomAuthAuthenticated) {
        // User is authenticated, show content
        setIsChecking(false);
      } else {
        // User is not authenticated, redirect to login
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    };

    checkAuth();
  }, [sessionStatus, session, authState, router, requireAuth]);

  // Show loading state while checking authentication
  if (isChecking || sessionStatus === 'loading' || authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If auth is not required or user is authenticated, show content
  if (!requireAuth || sessionStatus === 'authenticated' || authState.isAuthenticated) {
    return <>{children}</>;
  }

  // Show login prompt (fallback, should not reach here due to redirect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <FaLock className="text-6xl text-gray-400 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access the checkout process.
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/"
            className="block text-blue-600 hover:text-blue-800 text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// Hook to get current user information from either auth system
export function useCurrentUser() {
  const { data: session } = useSession();
  const { state: authState } = useAuth();

  if (session?.user) {
    return {
      id: session.user.id,
      name: session.user.name || '',
      email: session.user.email || '',
      isAuthenticated: true,
      source: 'nextauth' as const
    };
  }

  if (authState.isAuthenticated && authState.user) {
    return {
      id: authState.user.id.toString(),
      name: authState.user.name,
      email: authState.user.email,
      isAuthenticated: true,
      source: 'custom' as const
    };
  }

  return {
    id: null,
    name: '',
    email: '',
    isAuthenticated: false,
    source: null
  };
}
