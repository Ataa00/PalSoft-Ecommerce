"use client";

import { useState } from 'react';
import { PaymentMethod } from '@/types/product';
import { FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa';

interface PaymentStepProps {
  paymentMethod: PaymentMethod;
  onPaymentChange: (payment: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

export default function PaymentStep({
  paymentMethod,
  onPaymentChange,
  onNext,
  onBack,
  errors
}: PaymentStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handlePaymentTypeChange = (type: PaymentMethod['type']) => {
    onPaymentChange({
      type,
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paypalEmail: ''
    });
    setLocalErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    onPaymentChange({
      ...paymentMethod,
      [field]: value
    });
    
    // Clear local error when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod.type === 'credit_card') {
      if (!paymentMethod.cardNumber || paymentMethod.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      if (!paymentMethod.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentMethod.expiryDate)) {
        newErrors.expiryDate = 'Valid expiry date is required (MM/YY)';
      }
      if (!paymentMethod.cvv || paymentMethod.cvv.length < 3) {
        newErrors.cvv = 'Valid CVV is required';
      }
    }

    if (paymentMethod.type === 'paypal') {
      if (!paymentMethod.paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentMethod.paypalEmail)) {
        newErrors.paypalEmail = 'Valid PayPal email is required';
      }
    }

    setLocalErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const allErrors = { ...errors, ...localErrors };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Payment Method</h2>
      
      {/* Payment Type Selection */}
      <div className="space-y-3 mb-6">
        <div
          onClick={() => handlePaymentTypeChange('credit_card')}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod.type === 'credit_card'
              ? 'border-black bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <FaCreditCard className="text-xl text-gray-600" />
            <span className="font-medium">Credit Card</span>
          </div>
        </div>

        <div
          onClick={() => handlePaymentTypeChange('paypal')}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod.type === 'paypal'
              ? 'border-black bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <FaPaypal className="text-xl text-blue-600" />
            <span className="font-medium">PayPal</span>
          </div>
        </div>

        <div
          onClick={() => handlePaymentTypeChange('cash_on_delivery')}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod.type === 'cash_on_delivery'
              ? 'border-black bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <FaMoneyBillWave className="text-xl text-green-600" />
            <span className="font-medium">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {paymentMethod.type === 'credit_card' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number *
            </label>
            <input
              type="text"
              value={paymentMethod.cardNumber || ''}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
                allErrors.cardNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {allErrors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{allErrors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="text"
                value={paymentMethod.expiryDate || ''}
                onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
                  allErrors.expiryDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="MM/YY"
                maxLength={5}
              />
              {allErrors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{allErrors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                value={paymentMethod.cvv || ''}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
                  allErrors.cvv
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="123"
                maxLength={4}
              />
              {allErrors.cvv && (
                <p className="text-red-500 text-sm mt-1">{allErrors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {paymentMethod.type === 'paypal' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Email *
            </label>
            <input
              type="email"
              value={paymentMethod.paypalEmail || ''}
              onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
                allErrors.paypalEmail
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="your-email@example.com"
            />
            {allErrors.paypalEmail && (
              <p className="text-red-500 text-sm mt-1">{allErrors.paypalEmail}</p>
            )}
          </div>
        </div>
      )}

      {paymentMethod.type === 'cash_on_delivery' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            You will pay in cash when your order is delivered to your address.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={validateAndProceed}
          className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  );
}
