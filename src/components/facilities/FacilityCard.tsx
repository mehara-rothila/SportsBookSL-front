import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/facility-placeholder.jpg'; // Ensure this exists

// Interface matching data from GET /api/facilities
interface FacilitySummary {
  _id: string; // Use _id from MongoDB
  name: string;
  location: string;
  rating?: number; // Make optional as it might be 0 or missing initially
  reviewCount?: number; // Make optional
  sportTypes: string[]; // Array of strings
  images: string[]; // Array of image paths
  pricePerHour: string; // The display price string
  isNew?: boolean;
  isPremium?: boolean;
  // Add any other props you might pass from the listing page if needed
}

// Component Props
interface FacilityCardProps {
  facility: FacilitySummary;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Properly format the image URL to avoid duplication of https://
  const getImageUrl = (imagePath: string) => {
    // Check if the path already contains http/https
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if the backend URL ends with a slash
    const baseUrl = BACKEND_BASE_URL.endsWith('/') 
      ? BACKEND_BASE_URL.slice(0, -1) 
      : BACKEND_BASE_URL;
      
    // Check if the image path starts with a slash
    const formattedPath = imagePath.startsWith('/') 
      ? imagePath 
      : `/${imagePath}`;
    
    return `${baseUrl}${formattedPath}`;
  };

  // Construct the primary image URL
  const imageUrl = !imageError && facility.images && facility.images.length > 0
    ? getImageUrl(facility.images[0])
    : FALLBACK_IMAGE;

  // Handle potential missing rating/reviewCount
  const displayRating = facility.rating?.toFixed(1) ?? 'N/A';
  const displayReviewCount = facility.reviewCount ?? 0;

  return (
    <Link href={`/facilities/${facility._id}`} className="block group h-full">
      <div className="relative flex flex-col h-full overflow-hidden rounded-xl bg-gradient-to-b from-white to-emerald-50 shadow-md hover:shadow-lg hover:shadow-emerald-200/40 transition-all duration-300 transform hover:-translate-y-1 border border-emerald-100">
        {/* Image container */}
        <div className="relative h-56 overflow-hidden flex-shrink-0">
          {/* Use actual img element with onError instead of background image */}
          <img
            src={imageUrl}
            alt={facility.name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/70 via-emerald-800/30 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5">
            {facility.isNew && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1"></span>
                New
              </span>
            )}
            {facility.isPremium && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 shadow-sm">
                <svg className="h-3 w-3 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a.75.75 0 01.692.462l2.24 5.37 5.38.446a.75.75 0 01.423 1.311l-4.16 3.34 1.29 5.233a.75.75 0 01-1.114.813L10 16.914l-4.75 2.74a.75.75 0 01-1.114-.813l1.29-5.233-4.16-3.34a.75.75 0 01.423-1.311l5.38-.446 2.24-5.37A.75.75 0 0110 2z" clipRule="evenodd" />
                </svg>
                Premium
              </span>
            )}
          </div>

          {/* Sport tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
            {facility.sportTypes?.slice(0, 2).map((sport) => (
              <span
                key={sport}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm text-emerald-700 shadow-sm border border-emerald-100"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Heading and rating */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 truncate pr-2">
              {facility.name}
            </h3>
            <div className="flex-shrink-0 flex items-center bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5">
              <StarIcon className="w-4 h-4 text-amber-500"/>
              <span className="ml-1 text-sm font-medium text-gray-700">{displayRating}</span>
            </div>
          </div>

          {/* Review count */}
          <div className="text-xs text-gray-500 mb-2">
            ({displayReviewCount} reviews)
          </div>

          {/* Location with icon */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0 text-emerald-400"/>
            <span className="truncate">{facility.location}</span>
          </div>

          {/* Price - Use mt-auto to push to bottom */}
          <div className="mt-auto pt-3 border-t border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-600">Starting from</span>
              <div className="flex items-baseline">
                <span className="text-base font-bold text-emerald-700">{facility.pricePerHour || 'N/A'}</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg group-hover:shadow-sm transition-all duration-300">
              <div className="relative overflow-hidden rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300">
                <div className="px-3 py-1.5">
                  <span className="text-xs font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors duration-300">
                    View Details
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}