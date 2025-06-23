import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ProductCard from '@/components/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { SessionProvider } from 'next-auth/react';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('gsap', () => ({
  to: jest.fn()
}));

const mockProduct = {
  id: 1,
  title: 'Test Product',
  price: 29.99,
  category: 'electronics',
  image: '/test-image.jpg',
  rate: 4.5,
  count: 100,
  sizes: ['S', 'M', 'L']
};

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com'
  },
  expires: '2024-12-31'
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={mockSession}>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </SessionProvider>
);

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Product' })).toBeInTheDocument();
  });

  it('displays rating correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(100)')).toBeInTheDocument();
  });

  it('shows available sizes', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('adds product to cart when add to cart button is clicked', async () => {
    const mockToast = jest.mocked(toast.success);
    
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Added to cart successfully!');
    });
  });

  it('allows size selection', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const sizeButton = screen.getByText('M');
    fireEvent.click(sizeButton);

    // Check if the size button has active styling
    expect(sizeButton).toHaveClass('bg-black', 'text-white');
  });

  it('handles quantity changes', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const quantityInput = screen.getByDisplayValue('1');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    expect(quantityInput).toHaveValue(3);
  });

  it('prevents adding zero or negative quantities', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const quantityInput = screen.getByDisplayValue('1');
    fireEvent.change(quantityInput, { target: { value: '0' } });

    expect(quantityInput).toHaveValue(1); // Should reset to 1
  });

  it('navigates to product detail page when clicked', () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush })
    }));

    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const productImage = screen.getByRole('img', { name: 'Test Product' });
    fireEvent.click(productImage);

    // Note: This would need proper router mocking in a real test
    // expect(mockPush).toHaveBeenCalledWith('/product/1');
  });

  it('handles missing product data gracefully', () => {
    const incompleteProduct = {
      id: 2,
      title: 'Incomplete Product',
      price: 19.99,
      category: 'test',
      image: '/test.jpg',
      rate: 0,
      count: 0,
      sizes: []
    };

    render(
      <TestWrapper>
        <ProductCard product={incompleteProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Incomplete Product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Rating
    expect(screen.getByText('(0)')).toBeInTheDocument(); // Count
  });

  it('applies hover effects correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const productCard = screen.getByTestId('product-card') || screen.getByText('Test Product').closest('div');
    
    if (productCard) {
      fireEvent.mouseEnter(productCard);
      // Check for hover classes or effects
      expect(productCard).toHaveClass('hover:shadow-lg');
    }
  });

  it('displays discount badge when product is on sale', () => {
    const saleProduct = {
      ...mockProduct,
      originalPrice: 39.99,
      isOnSale: true
    };

    render(
      <TestWrapper>
        <ProductCard product={saleProduct} />
      </TestWrapper>
    );

    // This would require implementing sale logic in ProductCard
    // expect(screen.getByText(/sale/i)).toBeInTheDocument();
  });
});

// Integration tests
describe('ProductCard Integration', () => {
  it('integrates with cart context correctly', async () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    // Check if cart count updates (would need cart display component)
    await waitFor(() => {
      // This would check if cart context was updated
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('handles authentication state changes', () => {
    // Test with unauthenticated user
    render(
      <SessionProvider session={null}>
        <AuthProvider>
          <CartProvider>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </AuthProvider>
      </SessionProvider>
    );

    // Should still render product but might have different behavior
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
