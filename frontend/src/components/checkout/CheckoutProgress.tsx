"use client";

import { CheckoutStep } from '@/types/product';
import { FaShippingFast, FaCreditCard, FaClipboardCheck, FaCheck } from 'react-icons/fa';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    {
      key: 'shipping' as CheckoutStep,
      title: 'Shipping',
      icon: FaShippingFast,
      description: 'Delivery information'
    },
    {
      key: 'payment' as CheckoutStep,
      title: 'Payment',
      icon: FaCreditCard,
      description: 'Payment method'
    },
    {
      key: 'review' as CheckoutStep,
      title: 'Review',
      icon: FaClipboardCheck,
      description: 'Order confirmation'
    }
  ];

  const getStepStatus = (stepKey: CheckoutStep) => {
    const stepOrder = ['shipping', 'payment', 'review', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : status === 'current'
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {status === 'completed' ? (
                    <FaCheck className="text-sm" />
                  ) : (
                    <Icon className="text-sm" />
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      status === 'current'
                        ? 'text-black'
                        : status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-xs ${
                      status === 'current'
                        ? 'text-gray-600'
                        : status === 'completed'
                        ? 'text-green-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    getStepStatus(steps[index + 1].key) === 'completed' ||
                    (getStepStatus(step.key) === 'completed' && getStepStatus(steps[index + 1].key) === 'current')
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
