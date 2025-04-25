// src/components/reviews/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { PencilIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface ReviewFormProps {
  targetId: string;
  targetType: 'facility' | 'trainer';
  onSubmitSuccess: (newReview: any) => void;
  onCancel: () => void;
  facilityName?: string; // Optional facility name to display
}

import * as reviewService from '@/services/reviewService';

export default function ReviewForm({ 
  targetId, 
  targetType, 
  onSubmitSuccess, 
  onCancel,
  facilityName
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(0);

  const handleRatingClick = (rate: number) => {
    setRating(rate);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !content.trim()) {
      setError('Please provide both a rating and a comment.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const reviewData = { rating, content };

    try {
      let newReviewResponse;
      if (targetType === 'facility') {
        newReviewResponse = await reviewService.addFacilityReview(targetId, reviewData);
      } else {
        newReviewResponse = await reviewService.addTrainerReview(targetId, reviewData);
      }
      
      if (newReviewResponse && newReviewResponse.review) {
        onSubmitSuccess(newReviewResponse.review);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error(`Error submitting ${targetType} review:`, err);
      setError(err.message || `Failed to submit review. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-50/90 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden max-w-lg w-full mx-auto border border-green-300/50">
      {/* Header */}
      <div className="flex justify-between items-center bg-green-700 text-white px-6 py-4">
        <h2 className="text-xl font-bold">
          Write a Review {facilityName ? `for ${facilityName}` : ''}
        </h2>
        <button 
          onClick={onCancel}
          className="text-white hover:text-green-100 transition-colors"
          aria-label="Close review form"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-green-100/80">
        {/* Header Banner */}
        <div className="bg-green-600/20 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center border border-green-500/30">
          <div className="bg-green-600 rounded-full p-2 mr-3">
            <PencilIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-green-800 font-semibold">Share Your Experience</h3>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <label htmlFor="rating" className="block text-green-800 font-medium mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`transition-transform duration-150 hover:scale-110 focus:outline-none`}
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <StarIcon 
                  className={`w-10 h-10 ${
                    (hoverRating || rating) >= star 
                      ? 'text-green-600' 
                      : 'text-green-200'
                  } drop-shadow-md`} 
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getRatingBadgeColor(rating)}`}>
                {getRatingText(rating)}
              </span>
            </div>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label htmlFor="review-content" className="block text-green-800 font-medium mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-content"
            rows={4}
            className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-green-900 placeholder-green-700/50"
            placeholder={`Share your experience with this ${targetType}...`}
            value={content}
            onChange={handleContentChange}
            maxLength={500}
          ></textarea>
          <div className="flex justify-end mt-1 text-xs text-green-700">
            {charCount}/500 characters
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <XMarkIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-white/70 backdrop-blur-sm border border-green-300 text-green-700 font-medium hover:bg-white/90 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium 
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'} 
              transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md`}
            disabled={isLoading || rating === 0 || !content.trim()}
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper functions
function getRatingText(rating: number): string {
  switch(rating) {
    case 1: return "Poor";
    case 2: return "Fair";
    case 3: return "Good";
    case 4: return "Very Good";
    case 5: return "Excellent";
    default: return "";
  }
}

function getRatingBadgeColor(rating: number): string {
  switch(rating) {
    case 1: return "bg-red-100/80 text-red-800 border border-red-200";
    case 2: return "bg-orange-100/80 text-orange-800 border border-orange-200";
    case 3: return "bg-yellow-100/80 text-yellow-800 border border-yellow-200";
    case 4: return "bg-green-100/80 text-green-800 border border-green-200";
    case 5: return "bg-green-100/80 text-green-800 border border-green-200";
    default: return "bg-gray-100/80 text-gray-800 border border-gray-200";
  }
}