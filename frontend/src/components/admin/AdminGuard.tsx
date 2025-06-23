"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { useCurrentUser } from '@/components/checkout/AuthGuard';
import { UserRole } from '@/types/product';
import Link from 'next/link';
import { FaSpinner, FaShieldAlt } from 'react-icons/fa';

interface AdminGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AdminGuard({ children, requireAdmin = true }: AdminGuardProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { state: authState } = useAuth();
  const currentUser = useCurrentUser();
  const [isChecking, setIsChecking] = useState(true);

  const checkUserIsAdmin = useCallback((): boolean => {
    // Check NextAuth session for admin role
    if (session?.user && 'role' in session.user) {
      return session.user.role === 'admin';
    }

    // Check custom auth state for admin role
    if (authState.user && 'role' in authState.user) {
      return authState.user.role === UserRole.Admin;
    }

    // For demo purposes, check if user email contains 'admin'
    // In production, this should be properly validated from backend
    const userEmail = currentUser.email.toLowerCase();
    return userEmail.includes('admin') || userEmail === 'admin@example.com';
  }, [session, authState.user, currentUser.email]);

  const checkAdminAccess = useCallback(() => {
      // If admin access is not required, show content immediately
      if (!requireAdmin) {
        setIsChecking(false);
        return;
      }

      // Check if user is authenticated first
      if (sessionStatus === 'loading' || authState.isLoading) {
        return; // Still loading
      }

      if (!currentUser.isAuthenticated) {
        // User is not authenticated, redirect to login
        router.push('/login?redirect=/admin');
        return;
      }

      // Check if user has admin role
      const isAdmin = checkUserIsAdmin();

      if (!isAdmin) {
        // User is authenticated but not admin, redirect to unauthorized page
        router.push('/unauthorized');
        return;
      }

      // User is authenticated and is admin
      setIsChecking(false);
    }, [sessionStatus, authState.isLoading, currentUser.isAuthenticated, router, requireAdmin, checkUserIsAdmin]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  // Show loading state while checking admin access
  if (isChecking || sessionStatus === 'loading' || authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // If admin access is not required or user is admin, show content
  if (!requireAdmin || checkUserIsAdmin()) {
    return <>{children}</>;
  }

  // Show unauthorized message (fallback, should not reach here due to redirect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access the admin dashboard.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Sign In as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

// Hook to check if current user is admin
export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  const { state: authState } = useAuth();
  const currentUser = useCurrentUser();

  // Check NextAuth session for admin role
  if (session?.user && 'role' in session.user) {
    return session.user.role === 'admin';
  }

  // Check custom auth state for admin role
  if (authState.user && 'role' in authState.user) {
    return authState.user.role === UserRole.Admin;
  }

  // For demo purposes, check if user email contains 'admin'
  // In production, this should be properly validated from backend
  if (currentUser.isAuthenticated) {
    const userEmail = currentUser.email.toLowerCase();
    return userEmail.includes('admin') || userEmail === 'admin@example.com';
  }

  return false;
}
