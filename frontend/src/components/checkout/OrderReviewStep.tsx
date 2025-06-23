"use client";

import Image from 'next/image';
import { ShippingAddress, PaymentMethod, OrderSummary } from '@/types/product';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaEdit } from 'react-icons/fa';

interface OrderReviewStepProps {
  orderSummary: OrderSummary;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  onBack: () => void;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  isLoading: boolean;
}

export default function OrderReviewStep({
  orderSummary,
  shippingAddress,
  paymentMethod,
  onBack,
  onEditShipping,
  onEditPayment,
  onPlaceOrder,
  isLoading
}: OrderReviewStepProps) {
  const getPaymentIcon = () => {
    switch (paymentMethod.type) {
      case 'credit_card':
        return <FaCreditCard className="text-lg" />;
      case 'paypal':
        return <FaPaypal className="text-lg text-blue-600" />;
      case 'cash_on_delivery':
        return <FaMoneyBillWave className="text-lg text-green-600" />;
      default:
        return null;
    }
  };

  const getPaymentDisplay = () => {
    switch (paymentMethod.type) {
      case 'credit_card':
        return `**** **** **** ${paymentMethod.cardNumber?.slice(-4) || '****'}`;
      case 'paypal':
        return paymentMethod.paypalEmail;
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Review Your Order</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Items */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {orderSummary.items.map((item) => (
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
                  <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${orderSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${orderSummary.tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Shipping Address</h4>
              <button
                onClick={onEditShipping}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <FaEdit className="text-sm" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{shippingAddress.name}</p>
              <p>{shippingAddress.phone}</p>
              {shippingAddress.email && <p>{shippingAddress.email}</p>}
              <p className="text-gray-600 whitespace-pre-line">{shippingAddress.address}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Payment Method</h4>
              <button
                onClick={onEditPayment}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <FaEdit className="text-sm" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {getPaymentIcon()}
              <span className="text-sm">{getPaymentDisplay()}</span>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
              Your order will be processed and shipped within 1-3 business days.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={onPlaceOrder}
              disabled={isLoading}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Place Order - $${orderSummary.total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
