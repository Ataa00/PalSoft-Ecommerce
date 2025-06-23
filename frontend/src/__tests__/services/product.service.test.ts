import { jest } from '@jest/globals';
import { ProductService } from '@/services';
import { apiClient } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockApiClient = jest.mocked(apiClient);

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should fetch all products successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Test Product 1',
          price: 29.99,
          category: 'electronics',
          image: '/test1.jpg',
          rate: 4.5,
          count: 100
        },
        {
          id: 2,
          title: 'Test Product 2',
          price: 39.99,
          category: 'clothing',
          image: '/test2.jpg',
          rate: 4.0,
          count: 50
        }
      ];

      mockApiClient.get.mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts();

      expect(mockApiClient.get).toHaveBeenCalledWith('/Products');
      expect(result).toEqual(mockProducts);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(ProductService.getAllProducts()).rejects.toThrow('Failed to fetch products');
    });

    it('should return fallback data when API is unavailable', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network Error'));

      const result = await ProductService.getAllProducts();

      // Should return mock data as fallback
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getProductById', () => {
    it('should fetch a specific product successfully', async () => {
      const mockProduct = {
        id: 1,
        title: 'Test Product',
        price: 29.99,
        category: 'electronics',
        image: '/test.jpg',
        rate: 4.5,
        count: 100,
        description: 'Test description'
      };

      mockApiClient.get.mockResolvedValue(mockProduct);

      const result = await ProductService.getProductById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/Products/1');
      expect(result).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Product not found'));

      await expect(ProductService.getProductById(999)).rejects.toThrow('Failed to fetch product');
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by category successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Electronics Product',
          price: 29.99,
          category: 'electronics',
          image: '/test.jpg',
          rate: 4.5,
          count: 100
        }
      ];

      mockApiClient.get.mockResolvedValue(mockProducts);

      const result = await ProductService.getProductsByCategory('electronics');

      expect(mockApiClient.get).toHaveBeenCalledWith('/Products/category/electronics');
      expect(result).toEqual(mockProducts);
    });

    it('should handle empty category results', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await ProductService.getProductsByCategory('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Searched Product',
          price: 29.99,
          category: 'electronics',
          image: '/test.jpg',
          rate: 4.5,
          count: 100
        }
      ];

      mockApiClient.get.mockResolvedValue(mockProducts);

      const result = await ProductService.searchProducts('test query');

      expect(mockApiClient.get).toHaveBeenCalledWith('/Products/search?q=test%20query');
      expect(result).toEqual(mockProducts);
    });

    it('should handle empty search results', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await ProductService.searchProducts('nonexistent');

      expect(result).toEqual([]);
    });

    it('should encode search query properly', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await ProductService.searchProducts('test & special chars');

      expect(mockApiClient.get).toHaveBeenCalledWith('/Products/search?q=test%20%26%20special%20chars');
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const newProduct = {
        title: 'New Product',
        price: 49.99,
        category: 'electronics',
        image: '/new.jpg',
        description: 'New product description'
      };

      const createdProduct = {
        id: 3,
        ...newProduct,
        rate: 0,
        count: 0
      };

      mockApiClient.post.mockResolvedValue(createdProduct);

      const result = await ProductService.createProduct(newProduct);

      expect(mockApiClient.post).toHaveBeenCalledWith('/Products', newProduct);
      expect(result).toEqual(createdProduct);
    });

    it('should handle creation errors', async () => {
      const newProduct = {
        title: 'Invalid Product',
        price: -10, // Invalid price
        category: '',
        image: '',
        description: ''
      };

      mockApiClient.post.mockRejectedValue(new Error('Validation Error'));

      await expect(ProductService.createProduct(newProduct)).rejects.toThrow('Failed to create product');
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const updateData = {
        title: 'Updated Product',
        price: 59.99
      };

      const updatedProduct = {
        id: 1,
        title: 'Updated Product',
        price: 59.99,
        category: 'electronics',
        image: '/test.jpg',
        rate: 4.5,
        count: 100
      };

      mockApiClient.put.mockResolvedValue(updatedProduct);

      const result = await ProductService.updateProduct(1, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/Products/1', updateData);
      expect(result).toEqual(updatedProduct);
    });

    it('should handle update errors', async () => {
      mockApiClient.put.mockRejectedValue(new Error('Product not found'));

      await expect(ProductService.updateProduct(999, {})).rejects.toThrow('Failed to update product');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await ProductService.deleteProduct(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/Products/1');
    });

    it('should handle deletion errors', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Product not found'));

      await expect(ProductService.deleteProduct(999)).rejects.toThrow('Failed to delete product');
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = ['electronics', 'clothing', 'books'];

      mockApiClient.get.mockResolvedValue(mockCategories);

      const result = await ProductService.getCategories();

      expect(mockApiClient.get).toHaveBeenCalledWith('/Products/categories');
      expect(result).toEqual(mockCategories);
    });

    it('should return default categories on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const result = await ProductService.getCategories();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('validateProductData', () => {
    it('should validate correct product data', () => {
      const validProduct = {
        title: 'Valid Product',
        price: 29.99,
        category: 'electronics',
        image: '/valid.jpg',
        description: 'Valid description'
      };

      const result = ProductService.validateProductData(validProduct);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const invalidProduct = {
        title: '',
        price: 0,
        category: '',
        image: '',
        description: ''
      };

      const result = ProductService.validateProductData(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Price must be greater than 0');
      expect(result.errors).toContain('Category is required');
    });

    it('should detect invalid price values', () => {
      const invalidProduct = {
        title: 'Test Product',
        price: -10,
        category: 'electronics',
        image: '/test.jpg',
        description: 'Test'
      };

      const result = ProductService.validateProductData(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price must be greater than 0');
    });

    it('should detect title length violations', () => {
      const invalidProduct = {
        title: 'A'.repeat(201), // Too long
        price: 29.99,
        category: 'electronics',
        image: '/test.jpg',
        description: 'Test'
      };

      const result = ProductService.validateProductData(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be less than 200 characters');
    });
  });

  describe('formatProductForDisplay', () => {
    it('should format product data correctly', () => {
      const rawProduct = {
        id: 1,
        title: 'test product',
        price: 29.99,
        category: 'ELECTRONICS',
        image: '/test.jpg',
        rate: 4.5,
        count: 100
      };

      const result = ProductService.formatProductForDisplay(rawProduct);

      expect(result.title).toBe('Test Product'); // Title case
      expect(result.category).toBe('electronics'); // Lowercase
      expect(result.formattedPrice).toBe('$29.99');
      expect(result.ratingStars).toBe('★★★★☆');
    });

    it('should handle missing or invalid data', () => {
      const incompleteProduct = {
        id: 1,
        title: '',
        price: 0,
        category: '',
        image: '',
        rate: 0,
        count: 0
      };

      const result = ProductService.formatProductForDisplay(incompleteProduct);

      expect(result.title).toBe('Untitled Product');
      expect(result.category).toBe('uncategorized');
      expect(result.formattedPrice).toBe('$0.00');
      expect(result.ratingStars).toBe('☆☆☆☆☆');
    });
  });
});
