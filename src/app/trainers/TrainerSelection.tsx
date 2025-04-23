// src/app/trainers/TrainerSelection.tsx

import { useState, useEffect } from 'react';
// Import the service and the specific Trainer type
import * as trainerService from '@/services/trainerService';
import type { Trainer } from '@/services/trainerService'; // Use 'import type' for type-only imports

// --- Icons ---
import { UserCircleIcon, AcademicCapIcon, StarIcon } from '@heroicons/react/24/solid';

// --- REMOVED Local Interface ---
// interface Trainer { _id: string; name: string; specialization: string; rating: number; hourlyRate: number; profileImage?: string; }

interface TrainerSelectionProps {
  facilityId: string; // ID of the facility to find associated trainers for
  onTrainerSelect: (trainerId: string | null) => void;
  selectedTrainerId?: string | null;
}

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-trainer.png'; // Ensure this image exists in public/images

export default function TrainerSelection({
  facilityId,
  onTrainerSelect,
  selectedTrainerId = null
}: TrainerSelectionProps) {
  // --- State ---
  // Use the imported Trainer type here
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(selectedTrainerId);

  // --- Fetch Associated Trainers ---
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      setError(null);
      setTrainers([]); // Clear previous trainers
      try {
        // Use the service to fetch trainers associated with the facility
        const params = { associatedFacilityId: facilityId, limit: 5 }; // Example params
        const data = await trainerService.getTrainers(params);
        // data.trainers now correctly matches the type expected by setTrainers
        setTrainers(data.trainers || []);
      } catch (err: any) {
        console.error('Error fetching associated trainers:', err);
        const message = err.response?.data?.message || err.message || 'Failed to load trainers.';
        setError(message);
        setTrainers([]); // Ensure trainers is empty on error
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchTrainers();
    } else {
      // If no facilityId, don't fetch
      setLoading(false);
      setTrainers([]);
    }
  }, [facilityId]); // Re-fetch if facilityId changes

  // Update internal selected state if prop changes
  useEffect(() => {
    setSelected(selectedTrainerId);
  }, [selectedTrainerId]);

  // --- Helper Functions ---
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return 'N/A'; // Handle undefined/null
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // --- Handlers ---
  const handleTrainerSelect = (trainerId: string | null) => {
    setSelected(trainerId);
    onTrainerSelect(trainerId);
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 text-center shadow border border-gray-200">
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500">Loading trainers...</p>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200 shadow">
        <p className="text-sm text-red-700 font-medium">Could not load trainers</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  // --- Render Empty State ---
  if (trainers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow">
        <p className="text-sm text-gray-600">No trainers currently associated with this facility.</p>
      </div>
    );
  }

  // --- Render Trainers ---
  return (
    <div className="space-y-3"> {/* Reduced spacing slightly */}
      {/* No Trainer Option */}
      <div
        className={`
          rounded-lg border p-4 cursor-pointer transition-all duration-200 shadow-sm
          ${selected === null
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 ring-1 ring-indigo-400 shadow-md'
            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }
        `}
        onClick={() => handleTrainerSelect(null)}
        role="radio"
        aria-checked={selected === null}
        tabIndex={0} // Make it focusable
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleTrainerSelect(null)} // Keyboard selection
      >
        <div className="flex items-center">
          {/* Custom Radio Circle */}
          <div className={`h-5 w-5 rounded-full border-2 ${selected === null ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400 bg-white'} mr-3 flex-shrink-0 flex items-center justify-center`}>
            {selected === null && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="3" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">No trainer (self-practice)</p>
            <p className="text-sm text-gray-500">Book the facility without a dedicated trainer.</p>
          </div>
        </div>
      </div>

      {/* Trainer Options */}
      {trainers.map((trainer) => {
        // Construct image URL safely, handling potential missing base URL or absolute URLs
        const trainerImageUrl = trainer.profileImage
            ? (trainer.profileImage.startsWith('http') || trainer.profileImage.startsWith('/') ? trainer.profileImage : `${BACKEND_BASE_URL}/${trainer.profileImage}`)
            : FALLBACK_IMAGE;
        // Handle potentially missing rating
        const displayRating = trainer.rating !== undefined && trainer.rating !== null ? trainer.rating.toFixed(1) : 'N/A';

        return (
          <div
            key={trainer._id}
            className={`
              rounded-lg border p-4 cursor-pointer transition-all duration-200 shadow-sm
              ${selected === trainer._id
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 ring-1 ring-indigo-400 shadow-md'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }
            `}
            onClick={() => handleTrainerSelect(trainer._id)}
            role="radio"
            aria-checked={selected === trainer._id}
            tabIndex={0} // Make it focusable
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleTrainerSelect(trainer._id)} // Keyboard selection
          >
            <div className="flex items-start">
              {/* Custom Radio Circle */}
              <div className={`h-5 w-5 rounded-full border-2 ${selected === trainer._id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400 bg-white'} mt-1 mr-3 flex-shrink-0 flex items-center justify-center`}>
                {selected === trainer._id && (
                   <svg className="h-3 w-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                     <circle cx="8" cy="8" r="3" />
                   </svg>
                )}
              </div>
              <div className="flex flex-grow items-center"> {/* Aligned items center */}
                <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 mr-4 flex-shrink-0 bg-gray-100"> {/* Added bg color */}
                  <img
                    src={trainerImageUrl}
                    alt={trainer.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">{trainer.name}</p>
                    <p className="text-sm font-semibold text-indigo-600 whitespace-nowrap">{formatCurrency(trainer.hourlyRate)}/hr</p>
                  </div>
                  <p className="text-xs text-indigo-700 flex items-center mt-1">
                    <AcademicCapIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    {trainer.specialization}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} className={`h-4 w-4 ${ (trainer.rating ?? 0) >= star ? 'text-yellow-400' : 'text-gray-300' }`} /> // Use ?? 0 for safe comparison
                      ))}
                    </div>
                    <span className="ml-1.5 text-xs text-gray-500">{displayRating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}