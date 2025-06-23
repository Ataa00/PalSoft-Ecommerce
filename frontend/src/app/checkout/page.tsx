"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderService } from "@/services";
import { useCartOperations } from "@/hooks/useCartOperations";
import { useCurrentUser } from "@/components/checkout/AuthGuard";
import { ShippingAddress, PaymentMethod, CheckoutStep, OrderSummary } from "@/types/product";
import AuthGuard from "@/components/checkout/AuthGuard";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import OrderReviewStep from "@/components/checkout/OrderReviewStep";
import toast from "react-hot-toast";

function CheckoutPageContent() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { cartItems, isEmpty, clearCart, getCartSummary, validateCartForCheckout, prepareOrderData } = useCartOperations();

  // Checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: currentUser.name || '',
    phone: '',
    address: '',
    email: currentUser.email || ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: ''
  });

  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  // Initialize order summary when cart changes
  useEffect(() => {
    if (!isEmpty) {
      setOrderSummary(getCartSummary());
    }
  }, [cartItems, isEmpty, getCartSummary]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isEmpty) {
      toast.error('Your cart is empty');
      router.push('/products');
    }
  }, [isEmpty, router]);

  // Step navigation handlers
  const handleNextStep = () => {
    switch (currentStep) {
      case 'shipping':
        setCurrentStep('payment');
        break;
      case 'payment':
        setCurrentStep('review');
        break;
      case 'review':
        handlePlaceOrder();
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'payment':
        setCurrentStep('shipping');
        break;
      case 'review':
        setCurrentStep('payment');
        break;
    }
  };

  const handleEditShipping = () => {
    setCurrentStep('shipping');
  };

  const handleEditPayment = () => {
    setCurrentStep('payment');
  };

  // Order placement handler
  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validate cart
      const cartValidation = validateCartForCheckout();
      if (!cartValidation.isValid) {
        toast.error(cartValidation.errors[0]);
        setIsLoading(false);
        return;
      }

      // Validate order data
      const orderValidation = OrderService.validateOrderData(cartItems, shippingAddress);
      if (!orderValidation.isValid) {
        toast.error(orderValidation.errors[0]);
        setIsLoading(false);
        return;
      }

      // Check stock availability
      const stockValidation = await OrderService.validateStock(cartItems);
      if (!stockValidation.isValid) {
        toast.error(`Out of stock: ${stockValidation.outOfStockItems.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Process payment (if not cash on delivery)
      if (paymentMethod.type !== 'cash_on_delivery') {
        const paymentResult = await OrderService.processPayment(paymentMethod);
        if (!paymentResult.success) {
          toast.error(paymentResult.error || 'Payment failed');
          setIsLoading(false);
          return;
        }
      }

      // Prepare order data
      const orderItems = prepareOrderData();
      const orderData = { items: orderItems };

      // Submit order to backend
      const response = await OrderService.createOrder(orderData);

      // Store order data for confirmation page
      localStorage.setItem('lastOrderData', JSON.stringify(response));

      // Clear cart
      clearCart();

      // Show success message
      toast.success('Order placed successfully!');

      // Redirect to confirmation page
      router.push(`/order-confirmation?status=success&orderId=${response.orderId}&total=${response.total}`);

    } catch (error: unknown) {
      console.error('Order placement error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmpty || !orderSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} />

        {/* Error Display */}
        {errors.general && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{errors.general}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentStep === 'shipping' && (
            <ShippingStep
              shippingAddress={shippingAddress}
              onShippingChange={setShippingAddress}
              onNext={handleNextStep}
              errors={errors}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentStep
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
              errors={errors}
            />
          )}

          {currentStep === 'review' && (
            <OrderReviewStep
              orderSummary={orderSummary}
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              onBack={handlePreviousStep}
              onEditShipping={handleEditShipping}
              onEditPayment={handleEditPayment}
              onPlaceOrder={handlePlaceOrder}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard requireAuth={true}>
      <CheckoutPageContent />
    </AuthGuard>
  );
}
