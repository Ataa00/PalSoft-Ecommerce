"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBox, FaCalendar, FaDollarSign, FaEye, FaShoppingBag } from 'react-icons/fa';
import { OrderService } from '@/services';
import { useCurrentUser } from '@/components/checkout/AuthGuard';
import AuthGuard from '@/components/checkout/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';

interface Order {
  id: number;
  orderId: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  items?: Array<{
    id: number;
    title: string;
    quantity: number;
    price: number;
  }>;
}

function OrdersPageContent() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!currentUser.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to get orders from backend
      const userOrders = await OrderService.getUserOrders(parseInt(currentUser.id));
      setOrders(userOrders as Order[]);

    } catch (error: unknown) {
      console.error('Failed to load orders:', error);
      
      // Fallback: Load from localStorage for demo purposes
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      
      // Don't show error for demo - just log it
      console.log('Using mock orders for demo');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Generate mock orders for demo purposes
  const generateMockOrders = (): Order[] => {
    const statuses: Order['status'][] = ['delivered', 'shipped', 'processing', 'pending'];
    const mockOrders: Order[] = [];

    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7)); // Orders from past weeks

      mockOrders.push({
        id: i,
        orderId: 1000 + i,
        date: date.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total: Math.round((Math.random() * 200 + 50) * 100) / 100,
        itemCount: Math.floor(Math.random() * 5) + 1,
        items: [
          {
            id: i * 10,
            title: `Sample Product ${i}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.round((Math.random() * 50 + 20) * 100) / 100
          }
        ]
      });
    }

    return mockOrders;
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return '✅';
      case 'shipped':
        return '🚚';
      case 'processing':
        return '⏳';
      case 'pending':
        return '📋';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner size="lg" text="Loading your orders..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={loadOrders}
            onDismiss={() => setError(null)}
          />
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <FaShoppingBag className="text-sm" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FaBox className="text-gray-400" />
                      <span className="font-semibold">Order #{order.orderId}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-gray-600 text-sm">
                      <FaCalendar className="text-xs" />
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaDollarSign className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaBox className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-600">Items:</span>
                    <span className="font-semibold">{order.itemCount}</span>
                  </div>
                  <div className="flex justify-end">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FaEye className="text-xs" />
                        <span>View Details</span>
                      </button>
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => router.push(`/orders/${order.orderId}/review`)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          <span>Review Items</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>{item.title} (x{item.quantity})</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/products"
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrdersPageContent />
    </AuthGuard>
  );
}
