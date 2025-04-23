// src/components/reviews/ReviewList.tsx
'use client';

import { useState } from 'react';
import { StarIcon, HandThumbUpIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';

interface User {
  name: string;
  avatar?: string;
  _id?: string;
}

interface Review {
  _id?: string;
  id?: string;
  user: User;
  rating: number;
  reviewDate?: string;
  createdAt?: string; // Alternative date field
  content: string;
  tags?: string[]; // Optional tags to highlight aspects of the review
}

interface ReviewListProps {
  reviews: Review[];
  cricketTheme?: boolean; // Optional prop for cricket theme styling
}

export default function ReviewList({ reviews, cricketTheme = true }: ReviewListProps) {
  // Track helpful reviews for UI interaction
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Toggle helpful status
  const toggleHelpful = (reviewId: string) => {
    setHelpfulReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };
  
  // Generate stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating) 
                ? 'text-amber-400' 
                : cricketTheme ? 'text-gray-600/40' : 'text-gray-200'
            } transition-colors duration-300`}
          />
        ))}
      </div>
    );
  };
  
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${
        cricketTheme
          ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-white/10 text-white'
          : 'bg-gray-50 border border-gray-100 text-gray-600'
        } rounded-lg animate-fade-in`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full ${
          cricketTheme ? 'bg-emerald-900/60' : 'bg-gray-100'
        }`}>
          <ChatBubbleBottomCenterTextIcon className={`h-8 w-8 ${
            cricketTheme ? 'text-emerald-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-lg font-medium ${cricketTheme ? 'text-white' : 'text-gray-900'} mb-1`}>No reviews yet</h3>
        <p className={`${cricketTheme ? 'text-white/70' : 'text-gray-500'} max-w-md mx-auto`}>
          Be the first to share your experience.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review, index) => {
        const reviewId = review._id || review.id || `review-${index}`;
        const isHelpful = helpfulReviews.has(reviewId);
        
        return (
          <div 
            key={reviewId} 
            className={`group ${
              cricketTheme
                ? 'bg-gradient-to-br from-emerald-900/40 to-green-900/30 border border-white/10'
                : 'bg-white border border-gray-100'
            } rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in p-6`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <img
                  className={`h-12 w-12 rounded-full object-cover ${
                    cricketTheme
                      ? 'border-2 border-emerald-900/60 group-hover:border-emerald-500/60'
                      : 'border-2 border-gray-100 group-hover:border-primary-100'
                  } transition-colors duration-300`}
                  src={review.user?.avatar || '/images/default-avatar.png'}
                  alt={review.user?.name || "User"}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-avatar.png' }}
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex flex-wrap items-center justify-between">
                  <div>
                    <h4 className={`text-base font-semibold ${
                      cricketTheme
                        ? 'text-white group-hover:text-emerald-300'
                        : 'text-gray-900 group-hover:text-primary-700'
                    } transition-colors duration-300`}>
                      {review.user?.name || "Anonymous"}
                    </h4>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                      <time 
                        className={`ml-2 text-sm ${cricketTheme ? 'text-white/60' : 'text-gray-500'}`} 
                        dateTime={review.reviewDate || review.createdAt || ''}
                      >
                        {formatDate(review.reviewDate || review.createdAt)}
                      </time>
                    </div>
                  </div>
                  
                  {/* Animated indicator for new reviews - only for the first review */}
                  {index === 0 && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cricketTheme
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      New
                    </span>
                  )}
                </div>
                
                <div className={`mt-3 prose prose-sm max-w-none ${cricketTheme ? 'text-white/80' : 'text-gray-700'}`}>
                  <p className="leading-relaxed">{review.content}</p>
                </div>
                
                {/* Optional tag section */}
                {review.tags && review.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {review.tags.map(tag => (
                      <span 
                        key={tag} 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cricketTheme
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : 'bg-primary-50 text-primary-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className={`mt-4 flex items-center gap-4 pt-2 border-t ${
                  cricketTheme ? 'border-white/10' : 'border-gray-100'
                }`}>
                  <button 
                    onClick={() => toggleHelpful(reviewId)}
                    className={`inline-flex items-center text-sm ${
                      cricketTheme
                        ? isHelpful ? 'text-emerald-300' : 'text-white/60 hover:text-white'
                        : isHelpful ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <HandThumbUpIcon className={`h-4 w-4 mr-1.5 ${
                      cricketTheme ? 'text-emerald-400' : isHelpful ? 'text-primary-500' : 'text-gray-400'
                    } ${isHelpful ? 'scale-110' : ''} transition-transform duration-200`}/>
                    {isHelpful ? 'Helpful' : 'Mark as Helpful'}
                  </button>
                  <button className={`inline-flex items-center text-sm ${
                    cricketTheme
                      ? 'text-white/60 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  } transition-colors duration-200`}>
                    <ChatBubbleBottomCenterTextIcon className={`h-4 w-4 mr-1.5 ${
                      cricketTheme ? 'text-emerald-400' : 'text-gray-400'
                    }`}/>
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Cricket theme decorative elements */}
      {cricketTheme && (
        <div className="relative pointer-events-none">
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full opacity-30"></div>
          <div className="absolute -top-12 -left-8 w-32 h-32 bg-white/5 rounded-full opacity-20"></div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}