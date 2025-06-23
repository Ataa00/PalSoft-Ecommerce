"use client";

import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { CreateReviewRequest } from '@/services/review.service';
import ReviewService from '@/services/review.service';
import { useCurrentUser } from '@/components/checkout/AuthGuard';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function ReviewForm({
  productId,
  onReviewSubmitted,
  onCancel,
  className = ''
}: ReviewFormProps) {
  const currentUser = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateReviewRequest>({
    productId,
    rating: 0,
    title: '',
    comment: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleInputChange = (field: keyof CreateReviewRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const validation = ReviewService.validateReview(formData);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes('Rating')) errorMap.rating = error;
        else if (error.includes('title')) errorMap.title = error;
        else if (error.includes('comment')) errorMap.comment = error;
      });
      setErrors(errorMap);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser.isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await ReviewService.createReview(formData);
      
      toast.success('Review submitted successfully!');
      
      // Reset form
      setFormData({
        productId,
        rating: 0,
        title: '',
        comment: ''
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="text-2xl focus:outline-none transition-colors"
          >
            <FaStar
              className={
                star <= (hoveredRating || formData.rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Select rating'}
        </span>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Write a Review</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          {renderStars()}
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Summarize your review in a few words"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Comment *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={5}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && (
              <p className="text-red-500 text-sm">{errors.comment}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {formData.comment.length}/1000
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be honest and helpful to other customers</li>
            <li>• Focus on the product&apos;s features and your experience</li>
            <li>• Avoid inappropriate language or personal information</li>
            <li>• Reviews are public and can be seen by everyone</li>
          </ul>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {!currentUser.isAuthenticated && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            You must be logged in to submit a review.{' '}
            <a href="/login" className="font-medium underline hover:no-underline">
              Sign in here
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
