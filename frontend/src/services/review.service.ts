import { apiClient } from '@/lib/api-client';

/**
 * Review interface
 */
export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  verified: boolean;
}

/**
 * Create review request
 */
export interface CreateReviewRequest {
  productId: number;
  rating: number;
  title: string;
  comment: string;
}

/**
 * Update review request
 */
export interface UpdateReviewRequest {
  rating: number;
  title: string;
  comment: string;
}

/**
 * Review summary interface
 */
export interface ReviewSummary {
  productId: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Review Service
 * Handles all review-related API calls
 */
export class ReviewService {
  private static readonly ENDPOINTS = {
    REVIEWS: '/Reviews',
    PRODUCT_REVIEWS: '/Reviews/product',
    USER_REVIEWS: '/Reviews/user',
    REVIEW_SUMMARY: '/Reviews/summary',
    HELPFUL: '/Reviews/helpful'
  } as const;

  /**
   * Get reviews for a product
   * @param productId - Product ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param sortBy - Sort criteria (default: 'newest')
   * @returns Promise<Review[]> - Product reviews
   */
  static async getProductReviews(
    productId: number,
    page: number = 1,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful' = 'newest'
  ): Promise<{ reviews: Review[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      return await apiClient.get<{
        reviews: Review[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${this.ENDPOINTS.PRODUCT_REVIEWS}/${productId}?${params}`);
    } catch (error) {
      console.error('Failed to get product reviews:', error);
      // Return mock data for demo
      return this.getMockProductReviews(productId, page, limit);
    }
  }

  /**
   * Get review summary for a product
   * @param productId - Product ID
   * @returns Promise<ReviewSummary> - Review summary
   */
  static async getReviewSummary(productId: number): Promise<ReviewSummary> {
    try {
      return await apiClient.get<ReviewSummary>(`${this.ENDPOINTS.REVIEW_SUMMARY}/${productId}`);
    } catch (error) {
      console.error('Failed to get review summary:', error);
      // Return mock data for demo
      return this.getMockReviewSummary(productId);
    }
  }

  /**
   * Create a new review
   * @param review - Review data
   * @returns Promise<Review> - Created review
   */
  static async createReview(review: CreateReviewRequest): Promise<Review> {
    try {
      return await apiClient.post<Review>(this.ENDPOINTS.REVIEWS, review);
    } catch (error) {
      console.error('Failed to create review:', error);
      throw new Error('Failed to submit review');
    }
  }

  /**
   * Update an existing review
   * @param reviewId - Review ID
   * @param review - Updated review data
   * @returns Promise<Review> - Updated review
   */
  static async updateReview(reviewId: number, review: UpdateReviewRequest): Promise<Review> {
    try {
      return await apiClient.put<Review>(`${this.ENDPOINTS.REVIEWS}/${reviewId}`, review);
    } catch (error) {
      console.error('Failed to update review:', error);
      throw new Error('Failed to update review');
    }
  }

  /**
   * Delete a review
   * @param reviewId - Review ID
   * @returns Promise<void>
   */
  static async deleteReview(reviewId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.ENDPOINTS.REVIEWS}/${reviewId}`);
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw new Error('Failed to delete review');
    }
  }

  /**
   * Get user's reviews
   * @param userId - User ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Promise<Review[]> - User reviews
   */
  static async getUserReviews(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      return await apiClient.get<{
        reviews: Review[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${this.ENDPOINTS.USER_REVIEWS}/${userId}?${params}`);
    } catch (error) {
      console.error('Failed to get user reviews:', error);
      return { reviews: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Mark review as helpful
   * @param reviewId - Review ID
   * @returns Promise<void>
   */
  static async markHelpful(reviewId: number): Promise<void> {
    try {
      await apiClient.post(`${this.ENDPOINTS.HELPFUL}/${reviewId}`);
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      throw new Error('Failed to mark review as helpful');
    }
  }

  /**
   * Check if user can review product
   * @param userId - User ID
   * @param productId - Product ID
   * @returns Promise<boolean> - Can review
   */
  static async canUserReview(userId: number, productId: number): Promise<boolean> {
    try {
      const response = await apiClient.get<{ canReview: boolean }>(
        `/Reviews/can-review/${userId}/${productId}`
      );
      return response.canReview;
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      return true; // Default to allowing reviews for demo
    }
  }

  /**
   * Validate review data
   * @param review - Review data to validate
   * @returns Validation result
   */
  static validateReview(review: Partial<CreateReviewRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!review.rating || review.rating < 1 || review.rating > 5) {
      errors.push('Rating must be between 1 and 5 stars');
    }

    if (!review.title || review.title.trim().length < 3) {
      errors.push('Review title must be at least 3 characters');
    }

    if (!review.comment || review.comment.trim().length < 10) {
      errors.push('Review comment must be at least 10 characters');
    }

    if (review.title && review.title.length > 100) {
      errors.push('Review title must be less than 100 characters');
    }

    if (review.comment && review.comment.length > 1000) {
      errors.push('Review comment must be less than 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate mock product reviews for demo
   */
  private static getMockProductReviews(productId: number, page: number, limit: number) {
    const mockReviews: Review[] = [
      {
        id: 1,
        productId,
        userId: 1,
        userName: 'John Doe',
        rating: 5,
        title: 'Excellent product!',
        comment: 'This product exceeded my expectations. Great quality and fast shipping.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 12,
        verified: true
      },
      {
        id: 2,
        productId,
        userId: 2,
        userName: 'Jane Smith',
        rating: 4,
        title: 'Good value for money',
        comment: 'Solid product with good build quality. Would recommend to others.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 8,
        verified: true
      },
      {
        id: 3,
        productId,
        userId: 3,
        userName: 'Mike Johnson',
        rating: 3,
        title: 'Average product',
        comment: 'It\'s okay, nothing special but does the job. Could be better for the price.',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 3,
        verified: false
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = mockReviews.slice(startIndex, endIndex);

    return {
      reviews: paginatedReviews,
      total: mockReviews.length,
      page,
      totalPages: Math.ceil(mockReviews.length / limit)
    };
  }

  /**
   * Generate mock review summary for demo
   */
  private static getMockReviewSummary(productId: number): ReviewSummary {
    return {
      productId,
      totalReviews: 15,
      averageRating: 4.2,
      ratingDistribution: {
        5: 8,
        4: 4,
        3: 2,
        2: 1,
        1: 0
      }
    };
  }
}

export default ReviewService;
