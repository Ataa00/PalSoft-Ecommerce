# API Integration Documentation

This document explains how to use the API integration layer implemented for the e-commerce application frontend.

## Overview

The API integration provides a complete service layer for interacting with the .NET backend API at `http://localhost:5056/api`. It includes:

- Centralized HTTP client with error handling
- JWT token management
- Authentication services
- Product services
- React context for state management
- Error handling components
- Custom hooks for API state management

## Architecture

```
src/
├── lib/
│   └── api-client.ts          # Core HTTP client and token management
├── services/
│   ├── auth.service.ts        # Authentication API calls
│   ├── product.service.ts     # Product API calls
│   └── index.ts              # Service exports
├── context/
│   └── AuthContext.tsx       # Authentication state management
├── hooks/
│   ├── useApiState.ts        # API state management hooks
│   └── useFeaturedProducts.ts # Updated to use API
├── components/
│   └── ApiErrorBoundary.tsx  # Error handling components
└── types/
    └── product.ts            # Updated type definitions
```

## Usage Examples

### Authentication

#### Using the Auth Service directly:
```typescript
import { AuthService } from '@/services';

// Register a new user
await AuthService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Login
const response = await AuthService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Get current user
const user = await AuthService.getCurrentUser();

// Check if authenticated
const isAuth = AuthService.isAuthenticated();

// Logout
AuthService.logout();
```

#### Using the Auth Context:
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { state, login, register, logout } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // User is now logged in
    } catch (error) {
      // Handle error
    }
  };

  if (state.loading) return <div>Loading...</div>;
  if (state.error) return <div>Error: {state.error}</div>;
  
  return (
    <div>
      {state.isAuthenticated ? (
        <div>Welcome, {state.user?.name}!</div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Products

#### Using the Product Service:
```typescript
import { ProductService } from '@/services';

// Get all products
const products = await ProductService.getAllProducts();

// Get product by ID
const product = await ProductService.getProductById(1);

// Get featured products
const featured = await ProductService.getFeaturedProducts(4);

// Search products
const results = await ProductService.searchProducts('shirt');

// Get products by category
const categoryProducts = await ProductService.getProductsByCategory('men');
```

#### Using with API State Hook:
```typescript
import { useApiState } from '@/hooks/useApiState';
import { ProductService } from '@/services';

function ProductList() {
  const { data: products, loading, error, execute } = useApiState([]);

  useEffect(() => {
    execute(() => ProductService.getAllProducts());
  }, [execute]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### Error Handling

#### Using Error Boundary:
```typescript
import { ApiErrorBoundary } from '@/components/ApiErrorBoundary';

function App() {
  return (
    <ApiErrorBoundary>
      <MyComponent />
    </ApiErrorBoundary>
  );
}
```

#### Custom Error Components:
```typescript
import { NetworkError, AuthError } from '@/components/ApiErrorBoundary';

// For network issues
<NetworkError onRetry={() => refetch()} />

// For authentication issues
<AuthError onLogin={() => router.push('/login')} />
```

## API Endpoints

### Authentication Endpoints
- `POST /api/Users/register` - User registration
- `POST /api/Users/login` - User login (returns JWT token)
- `GET /api/Users/{id}` - Get user details (requires auth)

### Product Endpoints
- `GET /api/Product` - Get all products
- `GET /api/Product/{id}` - Get product by ID

## Configuration

### API Base URL
The API base URL is configured in `src/lib/api-client.ts`:
```typescript
const API_CONFIG = {
  baseURL: 'http://localhost:5056/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### JWT Token Storage
Tokens are automatically stored in localStorage and included in authenticated requests.

## Type Definitions

### Updated Product Types

**ProductBasic (for list responses):**
```typescript
export type ProductBasic = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rate: number;
  count: number;
  sizes: ProductSizeBasic[];
  tag?: string;
};

export type ProductSizeBasic = {
  size: string;
  quantity: number;
};
```

**Product (for detailed responses):**
```typescript
export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rate: number;
  count: number;
  sizes: ProductSize[];
  tag?: string;
};

export type ProductSize = {
  id: number;
  size: string;
  quantity: number;
};
```

### User Types
```typescript
export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export enum UserRole {
  User = 0,
  Admin = 1,
}
```

## Integration with NextAuth

The implementation maintains compatibility with NextAuth while adding custom API authentication. The login page includes a toggle to switch between authentication methods.

## Error Handling

The API client includes comprehensive error handling:
- Network timeouts
- HTTP status code handling
- JWT token expiration
- Automatic token refresh
- User-friendly error messages

## Best Practices

1. **Always use the service layer** instead of calling the API client directly
2. **Use the Auth Context** for authentication state management
3. **Wrap components in ApiErrorBoundary** for error handling
4. **Use the useApiState hook** for managing API call states
5. **Handle loading and error states** in your components
6. **Check authentication status** before making authenticated requests

## Testing

### Automated Testing Component
A test component has been created at `src/components/ApiTestComponent.tsx` that can be temporarily added to any page for comprehensive API testing.

### Manual Testing Steps
1. **Backend Setup**: Ensure the .NET backend is running at `http://localhost:5056`

2. **Authentication Testing**:
   - Use the login page with "Use Custom API Authentication" toggle enabled
   - Try logging in with existing credentials
   - Use the register page with "Use Custom API Registration" toggle enabled
   - Test invalid credentials and error handling

3. **Product API Testing**:
   - Verify that product lists load from the API
   - Check individual product details
   - Test search and filtering functionality

4. **JWT Token Testing**:
   - Check browser localStorage for stored tokens
   - Verify token expiration handling
   - Test authenticated vs unauthenticated requests

### API Response Verification
The implementation now correctly handles:
- **Registration**: Returns only HTTP status code (201 Created)
- **Login**: Returns `{ "token": "JWT_STRING" }`
- **User Details**: Returns full user object
- **Products List**: Returns array without description field
- **Product Details**: Returns object with description field
- **JWT Claims**: Uses Microsoft identity claims format
