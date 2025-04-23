

// src/app/trainers/TrainerSelection.js

import { useState, useEffect } from 'react';
// No need for api directly, use the service
import * as trainerService from '@/services/trainerService';

// --- Icons --- (Keep existing icon imports)
import { UserCircleIcon, AcademicCapIcon, StarIcon } from '@heroicons/react/24/solid';

// --- Interfaces --- (Keep existing Trainer interface)
interface Trainer { _id: string; name: string; specialization: string; rating: number; hourlyRate: number; profileImage?: string; }

interface TrainerSelectionProps {
  facilityId: string; // ID of the facility to find associated trainers for
  onTrainerSelect: (trainerId: string | null) => void;
  selectedTrainerId?: string | null;
}

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-trainer.png';

export default function TrainerSelection({
  facilityId,
  onTrainerSelect,
  selectedTrainerId = null
}: TrainerSelectionProps) {
  // --- State ---
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(selectedTrainerId);

  // --- Fetch Associated Trainers ---
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the service to fetch trainers associated with the facility
        // The backend needs to support filtering by associatedFacilityId
        // If not, you might need a dedicated endpoint like /api/facilities/:id/trainers
        const params = { associatedFacilityId: facilityId, limit: 5 }; // Example params
        const data = await trainerService.getTrainers(params);
        setTrainers(data.trainers || []);
      } catch (err: any) {
        console.error('Error fetching associated trainers:', err);
        setError(typeof err === 'string' ? err : 'Failed to load trainers.');
        setTrainers([]); // Clear on error
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchTrainers();
    } else {
      // If no facilityId, don't fetch, maybe show a message or disable selection
      setLoading(false);
      setTrainers([]);
    }
  }, [facilityId]); // Re-fetch if facilityId changes

  // --- Helper Functions --- (Keep existing formatCurrency)
  const formatCurrency = (amount: number | undefined) => { /* ... */ return `Rs. ${amount.toLocaleString('en-LK')}`; };

  // --- Handlers --- (Keep existing handleTrainerSelect)
  const handleTrainerSelect = (trainerId: string | null) => { setSelected(trainerId); onTrainerSelect(trainerId); };

  // --- Render Loading State ---
  if (loading) { return ( /* ... Keep Loading Spinner ... */ <div className="bg-white rounded-lg p-4 text-center"><div className="flex justify-center items-center py-6"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div><p className="text-gray-500">Loading trainers...</p></div> ); }

  // --- Render Error State ---
  if (error) { return ( /* ... Keep Error Display ... */ <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200"><p className="text-red-700">{error}</p></div> ); }

  // --- Render Empty State ---
  if (trainers.length === 0) { return ( /* ... Keep Empty State ... */ <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"><p className="text-gray-600">No trainers associated with this facility.</p></div> ); }

  // --- Render Trainers ---
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* No Trainer Option */}
        <div className={`${ selected === null ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50' } rounded-lg border p-4 cursor-pointer transition-all duration-200`} onClick={() => handleTrainerSelect(null)}>
          <div className="flex items-center">
            <div className={`h-5 w-5 rounded-full border-2 ${selected === null ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'} mr-3 flex-shrink-0`}>{selected === null && ( <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> )}</div>
            <div><p className="font-medium text-gray-900">No trainer (self-practice)</p><p className="text-sm text-gray-500">Book without a trainer</p></div>
          </div>
        </div>

        {/* Trainer Options */}
        {trainers.map((trainer) => {
          const trainerImageUrl = trainer.profileImage ? `${BACKEND_BASE_URL}${trainer.profileImage}` : FALLBACK_IMAGE;
          return (
            <div key={trainer._id} className={`${ selected === trainer._id ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50' } rounded-lg border p-4 cursor-pointer transition-all duration-200`} onClick={() => handleTrainerSelect(trainer._id)}>
              <div className="flex items-start">
                <div className={`h-5 w-5 rounded-full border-2 ${selected === trainer._id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'} mt-1 mr-3 flex-shrink-0`}>{selected === trainer._id && ( <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> )}</div>
                <div className="flex flex-grow">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 mr-3 flex-shrink-0"><img src={trainerImageUrl} alt={trainer.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}/></div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start"><p className="font-medium text-gray-900">{trainer.name}</p><p className="text-sm font-bold text-indigo-600">{formatCurrency(trainer.hourlyRate)}/hr</p></div>
                    <p className="text-xs text-indigo-600 flex items-center mt-1"><AcademicCapIcon className="h-3.5 w-3.5 mr-1" />{trainer.specialization}</p>
                    <div className="flex items-center mt-1"><div className="flex">{[1, 2, 3, 4, 5].map((star) => (<StarIcon key={star} className={`h-3.5 w-3.5 ${ trainer.rating >= star ? 'text-yellow-400' : 'text-gray-300' }`}/>))}</div><span className="ml-1 text-xs text-gray-500">{trainer.rating.toFixed(1)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
