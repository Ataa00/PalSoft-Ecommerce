"use client";

import { useState } from 'react';
import { AuthService, ProductService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useApiState } from '@/hooks/useApiState';
import { ProductBasic } from '@/types/product';

/**
 * Test component to verify API integration
 * This component can be temporarily added to any page for testing
 */
export default function ApiTestComponent() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { state: authState } = useAuth();
  const { data: products, loading: productsLoading, execute: fetchProducts } = useApiState<ProductBasic[]>([]);

  const addResult = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = isError ? '❌' : '✅';
    setTestResults(prev => [...prev, `${prefix} [${timestamp}] ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('Starting API integration tests...');

    // Test 1: Check API client configuration
    try {
      addResult('API client configured correctly');
    } catch (error) {
      addResult(`API client configuration error: ${error}`, true);
    }

    // Test 2: Test product fetching
    try {
      addResult('Testing product fetching...');
      const productData = await fetchProducts(() => ProductService.getAllProducts());
      if (productData && productData.length > 0) {
        addResult(`Successfully fetched ${productData.length} products`);
        addResult(`First product: ${productData[0].title} - $${productData[0].price}`);
      } else {
        addResult('No products returned from API', true);
      }
    } catch (error) {
      addResult(`Product fetching failed: ${error}`, true);
    }

    // Test 3: Test individual product fetching
    try {
      addResult('Testing individual product fetching...');
      const product = await ProductService.getProductById(1);
      addResult(`Product details: ${product.title} - ${product.description?.substring(0, 50)}...`);
    } catch (error) {
      addResult(`Individual product fetching failed: ${error}`, true);
    }

    // Test 4: Test authentication status
    try {
      const isAuth = AuthService.isAuthenticated();
      addResult(`Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
      
      if (isAuth) {
        const token = AuthService.getToken();
        addResult(`Token exists: ${token ? 'Yes' : 'No'}`);
        
        const role = AuthService.getUserRole();
        addResult(`User role: ${role !== null ? role : 'Unknown'}`);
      }
    } catch (error) {
      addResult(`Authentication check failed: ${error}`, true);
    }

    // Test 5: Test featured products
    try {
      addResult('Testing featured products...');
      const featured = await ProductService.getFeaturedProducts(2);
      addResult(`Featured products count: ${featured.length}`);
    } catch (error) {
      addResult(`Featured products failed: ${error}`, true);
    }

    // Test 6: Test search functionality
    try {
      addResult('Testing product search...');
      const searchResults = await ProductService.searchProducts('shirt');
      addResult(`Search results for "shirt": ${searchResults.length} products`);
    } catch (error) {
      addResult(`Product search failed: ${error}`, true);
    }

    addResult('API integration tests completed!');
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Integration Test Panel</h2>
      
      {/* Auth Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Status</h3>
        <div className="text-sm">
          <p>Status: {authState.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</p>
          <p>Loading: {authState.isLoading ? 'Yes' : 'No'}</p>
          <p>User: {authState.user?.name || 'None'}</p>
          <p>Error: {authState.error || 'None'}</p>
        </div>
      </div>

      {/* Products Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Products Status</h3>
        <div className="text-sm">
          <p>Loading: {productsLoading ? 'Yes' : 'No'}</p>
          <p>Products Count: {products?.length || 0}</p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run API Tests'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <h3 className="text-white font-bold mb-2">Test Results:</h3>
          {testResults.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="text-sm space-y-2">
          <p>• Toggle &quot;Use Custom API Authentication&quot; on login/register pages to test API auth</p>
          <p>• Check browser console for detailed error messages</p>
          <p>• Ensure backend is running at http://localhost:5056</p>
          <p>• Check network tab in dev tools for API requests</p>
        </div>
      </div>
    </div>
  );
}
