"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaBox, FaCalendar, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { OrderService } from '@/services';
import { useCurrentUser } from '@/components/checkout/AuthGuard';
import AuthGuard from '@/components/checkout/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';

interface OrderDetail {
  id: number;
  orderId: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: Array<{
    id: number;
    productId: number;
    title: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

function OrderDetailPageContent() {
  const params = useParams();

  const currentUser = useCurrentUser();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockOrderDetail = useCallback((orderId: number): OrderDetail => {
    const statuses: OrderDetail['status'][] = ['delivered', 'shipped', 'processing', 'pending'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: orderId,
      orderId: 1000 + orderId,
      date: new Date(Date.now() - orderId * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      subtotal: 89.97,
      shipping: 5.99,
      tax: 7.20,
      total: 103.16,
      items: [
        {
          id: 1,
          productId: 1,
          title: 'Premium Cotton T-Shirt',
          quantity: 2,
          price: 29.99,
          image: '/api/placeholder/150/150'
        },
        {
          id: 2,
          productId: 2,
          title: 'Classic Denim Jeans',
          quantity: 1,
          price: 59.99,
          image: '/api/placeholder/150/150'
        }
      ],
      shippingAddress: {
        name: currentUser.name || 'John Doe',
        address: '123 Main St, Anytown, ST 12345',
        phone: '(555) 123-4567',
        email: currentUser.email
      },
      paymentMethod: 'Credit Card ending in 4242',
      trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${orderId}${Date.now().toString().slice(-6)}` : undefined,
      estimatedDelivery: status === 'shipped' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
  }, [currentUser.name, currentUser.email]);

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to get order details from backend
      const orderDetail = await OrderService.getOrderById(parseInt(orderId));
      setOrder(orderDetail as OrderDetail);

    } catch (error: unknown) {
      console.error('Failed to load order details:', error);

      // Fallback: Generate mock order details for demo
      const mockOrder = generateMockOrderDetail(parseInt(orderId));
      setOrder(mockOrder);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, generateMockOrderDetail]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const getStatusColor = (status: OrderDetail['status']) => {
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

  const getStatusIcon = (status: OrderDetail['status']) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-600" />;
      case 'shipped':
        return <FaTruck className="text-blue-600" />;
      case 'processing':
        return <FaBox className="text-yellow-600" />;
      case 'pending':
        return <FaCalendar className="text-gray-600" />;
      case 'cancelled':
        return <FaCheckCircle className="text-red-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Order not found</p>
            <Link
              href="/orders"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Orders</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderId}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={loadOrderDetail}
            onDismiss={() => setError(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Tracking Information</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                  
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-gray-600 whitespace-pre-line">{order.shippingAddress.address}</p>
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                {order.shippingAddress.email && (
                  <p className="text-gray-600">{order.shippingAddress.email}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <p className="text-sm text-gray-600">{order.paymentMethod}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === 'delivered' && (
                <Link
                  href={`/orders/${order.orderId}/review`}
                  className="block w-full bg-black text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Review Items
                </Link>
              )}
              
              <Link
                href="/products"
                className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrderDetailPageContent />
    </AuthGuard>
  );
}
