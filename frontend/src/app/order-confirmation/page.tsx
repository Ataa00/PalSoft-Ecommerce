"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaShoppingBag, FaHome } from 'react-icons/fa';
import { OrderResponse } from '@/types/product';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();

  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get order data from URL parameters or localStorage
    const orderId = searchParams.get('orderId');
    const total = searchParams.get('total');
    const status = searchParams.get('status');

    if (status === 'success' && orderId && total) {
      setOrderData({
        message: 'Order created successfully',
        orderId: parseInt(orderId),
        total: parseFloat(total)
      });
    } else if (status === 'error') {
      setError(searchParams.get('error') || 'An error occurred while processing your order');
    } else {
      // Try to get from localStorage (fallback)
      const storedOrderData = localStorage.getItem('lastOrderData');
      if (storedOrderData) {
        try {
          const parsed = JSON.parse(storedOrderData);
          setOrderData(parsed);
          // Clear the stored data
          localStorage.removeItem('lastOrderData');
        } catch {
          setError('Invalid order data');
        }
      } else {
        setError('No order information found');
      }
    }

    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Order Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <Link
              href="/checkout"
              className="block w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <FaTimesCircle className="text-6xl text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-4">No Order Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find any order information. Please check your email for order confirmation.
          </p>
          <Link
            href="/"
            className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Order Number</span>
              <span className="font-semibold">#{orderData.orderId}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Order Date</span>
              <span className="font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold text-lg">${orderData.total.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Status</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What&apos;s Next?</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• You will receive an email confirmation shortly</li>
            <li>• Your order will be processed within 1-2 business days</li>
            <li>• You&apos;ll receive a tracking number once your order ships</li>
            <li>• Estimated delivery: 3-5 business days</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <FaHome className="text-sm" />
            <span>Continue Shopping</span>
          </Link>

          <Link
            href="/orders"
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <FaShoppingBag className="text-sm" />
            <span>View Orders</span>
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <FaShoppingBag className="text-sm" />
            <span>Browse Products</span>
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Need help with your order?</p>
          <p>
            Contact us at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
              support@example.com
            </a>{' '}
            or call{' '}
            <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-800">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
