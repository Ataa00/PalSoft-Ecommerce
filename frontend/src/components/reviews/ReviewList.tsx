"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaStar, FaThumbsUp, FaUser, FaCheckCircle } from 'react-icons/fa';
import { Review, ReviewSummary } from '@/services/review.service';
import ReviewService from '@/services/review.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';

interface ReviewListProps {
  productId: number;
  className?: string;
}

export default function ReviewList({ productId, className = '' }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful'>('newest');

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ReviewService.getProductReviews(productId, currentPage, 5, sortBy);
      setReviews(response.reviews);
      setTotalPages(response.totalPages);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [productId, currentPage, sortBy]);

  const loadSummary = useCallback(async () => {
    try {
      const summaryData = await ReviewService.getReviewSummary(productId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load review summary:', error);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
    loadSummary();
  }, [loadReviews, loadSummary]);

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      await ReviewService.markHelpful(reviewId);
      // Update the helpful count locally
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    return (
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className={`${className}`}>
        <LoadingSpinner text="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Review Summary */}
      {summary && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Customer Reviews</h3>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-6 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {summary.averageRating.toFixed(1)}
                </div>
                <div className="mb-2">
                  {renderStars(Math.round(summary.averageRating), 'lg')}
                </div>
                <div className="text-sm text-gray-600">
                  {summary.totalReviews} reviews
                </div>
              </div>
              
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm w-8">{rating}</span>
                    <FaStar className="text-yellow-400 text-sm" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution] / summary.totalReviews) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold">
          Reviews ({summary?.totalReviews || 0})
        </h4>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={loadReviews}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{review.userName}</span>
                    {review.verified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <FaCheckCircle className="text-xs" />
                        <span className="text-xs">Verified Purchase</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(review.rating, 'sm')}
                    <span className="text-sm text-gray-600">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleMarkHelpful(review.id)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <FaThumbsUp className="text-xs" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {isLoading && reviews.length > 0 && (
        <div className="flex justify-center mt-4">
          <LoadingSpinner size="sm" text="Loading..." />
        </div>
      )}
    </div>
  );
}
