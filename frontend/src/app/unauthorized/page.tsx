"use client";

import Link from 'next/link';
import { FaShieldAlt, FaHome, FaSignInAlt } from 'react-icons/fa';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page. This area is restricted to administrators only.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <FaHome className="text-sm" />
            <span>Go to Home</span>
          </Link>
          
          <Link
            href="/login"
            className="flex items-center justify-center space-x-2 w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <FaSignInAlt className="text-sm" />
            <span>Sign In</span>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need admin access?</strong> Contact your system administrator or use an admin account to access this area.
          </p>
        </div>
      </div>
    </div>
  );
}
