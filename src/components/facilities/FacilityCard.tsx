// src/components/facilities/FacilityCard.tsx (or wherever it lives)

import Link from 'next/link';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'; // Assuming you use these

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
  // Construct the primary image URL
  const imageUrl = (facility.images && facility.images.length > 0)
    ? `${BACKEND_BASE_URL}${facility.images[0]}`
    : FALLBACK_IMAGE;

  // Handle potential missing rating/reviewCount
  const displayRating = facility.rating?.toFixed(1) ?? 'N/A';
  const displayReviewCount = facility.reviewCount ?? 0;

  return (
    <Link href={`/facilities/${facility._id}`} className="block group h-full"> {/* Ensure link takes full height */}
      <div className="relative flex flex-col h-full overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
        {/* Image container */}
        <div className="relative h-56 overflow-hidden flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
            // Add onError directly to the style's element if needed, though background fallback is harder
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5">
            {facility.isNew && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 shadow-sm">
                New
              </span>
            )}
            {facility.isPremium && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 shadow-sm">
                Premium
              </span>
            )}
          </div>

          {/* Sport tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
            {facility.sportTypes?.slice(0, 2).map((sport) => ( // Show max 2 sports
              <span
                key={sport}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm text-primary-700 shadow-sm border border-primary-100"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 flex flex-col flex-grow"> {/* Use flex-grow */}
          {/* Heading and rating */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 truncate pr-2">
              {facility.name}
            </h3>
            <div className="flex-shrink-0 flex items-center bg-amber-50 rounded-lg px-2 py-0.5">
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
            <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-400"/>
            <span className="truncate">{facility.location}</span>
          </div>

          {/* Price - Use mt-auto to push to bottom */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Starting from</span>
              <div className="flex items-baseline">
                <span className="text-base font-bold text-gray-900">{facility.pricePerHour || 'N/A'}</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg group-hover:shadow-sm transition-all duration-300">
              <div className="relative overflow-hidden rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors duration-300">
                <div className="px-3 py-1.5">
                  <span className="text-xs font-medium text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                    View Details
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}