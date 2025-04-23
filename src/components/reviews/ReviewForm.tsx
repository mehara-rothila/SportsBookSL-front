// src/components/reviews/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';

interface ReviewFormProps {
  targetId: string; // Facility ID or Trainer ID
  targetType: 'facility' | 'trainer';
  onSubmitSuccess: (newReview: any) => void; // Callback after successful submission
  onCancel: () => void; // Callback to close the form/modal
  cricketTheme?: boolean; // Optional flag for cricket theme styling
}

// Import the specific service functions
import * as reviewService from '@/services/reviewService'; // Import the entire service

export default function ReviewForm({ targetId, targetType, onSubmitSuccess, onCancel, cricketTheme = true }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingClick = (rate: number) => {
    setRating(rate);
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
    console.log(`Submitting review for ${targetType} ID: ${targetId}`, reviewData);

    try {
      let newReviewResponse; // Changed variable name for clarity
      if (targetType === 'facility') {
        newReviewResponse = await reviewService.addFacilityReview(targetId, reviewData);
        console.log('Facility review submitted:', newReviewResponse);
      } else { // targetType === 'trainer'
        newReviewResponse = await reviewService.addTrainerReview(targetId, reviewData);
        console.log('Trainer review submitted:', newReviewResponse);
      }
      
      // Check if the response contains the review object
      if (newReviewResponse && newReviewResponse.review) {
        // Pass the actual review object from the response
        onSubmitSuccess(newReviewResponse.review);
      } else {
        console.error('Review response missing review object:', newReviewResponse);
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
    <form onSubmit={handleSubmit} className={`space-y-6 p-1 ${cricketTheme ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/20 p-4 rounded-xl border border-white/10' : ''}`}>
      <div>
        <label className={`block text-sm font-medium ${cricketTheme ? 'text-white' : 'text-gray-700'} mb-2`}>Your Rating *</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(star)}
              className="focus:outline-none transition-transform duration-200 hover:scale-110"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <StarIcon
                className={`h-8 w-8 transition-colors duration-150 ${
                  (hoverRating || rating) >= star 
                    ? 'text-amber-400' 
                    : cricketTheme ? 'text-gray-600' : 'text-gray-300'
                } ${
                  rating >= star ? 'animate-pulse-once' : ''
                }`}
              />
            </button>
          ))}
          
          {/* Rating text indicator */}
          <span className={`ml-2 ${cricketTheme ? 'text-white' : 'text-gray-700'} text-sm font-medium min-w-[80px]`}>
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="review-content" className={`block text-sm font-medium ${cricketTheme ? 'text-white' : 'text-gray-700'} mb-1`}>
          Your Review *
        </label>
        <textarea
          id="review-content"
          name="content"
          rows={4}
          className={`block w-full rounded-md ${
            cricketTheme 
              ? 'bg-white/10 text-white border-white/20 focus:border-emerald-500 focus:ring-emerald-500 placeholder-white/50' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          } shadow-sm sm:text-sm transition-colors duration-200`}
          placeholder={`Share your experience with this ${targetType}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className={`${
          cricketTheme 
            ? 'bg-red-900/30 text-red-200 border border-red-500/30' 
            : 'bg-red-50 text-red-700'
        } p-3 rounded-md text-sm`}>
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <Button 
          type="button" 
          variant={cricketTheme ? "glass" : "outline"} 
          onClick={onCancel} 
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant={cricketTheme ? "gradient" : "primary"}
          isLoading={isLoading} 
          disabled={rating === 0 || !content.trim()}
        >
          Submit Review
        </Button>
      </div>
      
      <style jsx global>{`
        @keyframes pulse-once {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-pulse-once {
          animation: pulse-once 0.3s ease-in-out;
        }
      `}</style>
    </form>
  );
}