"use client";

import { useState } from 'react';
import { ShippingAddress } from '@/types/product';

interface ShippingStepProps {
  shippingAddress: ShippingAddress;
  onShippingChange: (address: ShippingAddress) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export default function ShippingStep({
  shippingAddress,
  onShippingChange,
  onNext,
  errors
}: ShippingStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    onShippingChange({
      ...shippingAddress,
      [field]: value
    });
    
    // Clear local error when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{9,15}$/.test(shippingAddress.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!shippingAddress.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email format';
    }

    setLocalErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const allErrors = { ...errors, ...localErrors };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Shipping Information</h2>
      
      <div className="space-y-4">
        {/* Name Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={shippingAddress.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
              allErrors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {allErrors.name && (
            <p className="text-red-500 text-sm mt-1">{allErrors.name}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={shippingAddress.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
              allErrors.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
          {allErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{allErrors.phone}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={shippingAddress.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black ${
              allErrors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {allErrors.email && (
            <p className="text-red-500 text-sm mt-1">{allErrors.email}</p>
          )}
        </div>

        {/* Address Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipping Address *
          </label>
          <textarea
            value={shippingAddress.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={4}
            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black resize-none ${
              allErrors.address
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter your complete shipping address"
          />
          {allErrors.address && (
            <p className="text-red-500 text-sm mt-1">{allErrors.address}</p>
          )}
        </div>
      </div>

      <button
        onClick={validateAndProceed}
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mt-6"
      >
        Continue to Payment
      </button>
    </div>
  );
}
