// src/components/admin/AdminAthletesTable.tsx
import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Type for the athlete list item
interface AdminAthleteListItem {
  _id: string;
  name: string;
  image?: string;
  sport?: string;
  location?: string;
  goalAmount?: number;
  raisedAmount?: number;
  isActive: boolean;
  // Add other fields as needed
}

interface AdminAthletesTableProps {
  athletes: AdminAthleteListItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-athlete.png';

const AdminAthletesTable: React.FC<AdminAthletesTableProps> = ({ 
  athletes, 
  onEdit, 
  onDelete 
}) => {
  // Calculate percentage raised
  const calculatePercentage = (raised?: number, goal?: number) => {
    if (!raised || !goal || goal <= 0) return 0;
    const percentage = Math.round((raised / goal) * 100);
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  // Get image URL
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) return FALLBACK_IMAGE;
    return imagePath.startsWith('http') ? imagePath : `${BACKEND_BASE_URL}${imagePath}`;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <table className="min-w-full divide-y divide-white/15 bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
        <thead className="bg-emerald-900/20 backdrop-blur-sm">
          <tr>
            <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider w-16">
              Profile
            </th>
            <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Athlete Info
            </th>
            <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Funding
            </th>
            <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Progress
            </th>
            <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-4 py-4 text-right text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
          {athletes && athletes.length > 0 ? (
            athletes.map((athlete) => {
              const percentage = calculatePercentage(athlete.raisedAmount, athlete.goalAmount);
              
              return (
                <tr key={athlete._id} className="hover:bg-emerald-800/10 transition-colors">
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-white/10 border border-emerald-500/20 shadow-md">
                      <img
                        src={getImageUrl(athlete.image)}
                        alt={athlete.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-base font-medium text-white mb-1">{athlete.name}</div>
                      <div className="text-sm text-emerald-200/80">{athlete.sport || 'No sport specified'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm text-white/80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {athlete.location || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-white/90 font-medium">Goal: {formatCurrency(athlete.goalAmount)}</div>
                      <div className="text-emerald-300">Raised: {formatCurrency(athlete.raisedAmount)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-emerald-200 font-medium">
                        {percentage}% of goal reached
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      athlete.isActive 
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30' 
                        : 'bg-red-600/20 text-red-300 ring-1 ring-red-500/30'
                    }`}>
                      <span className={`h-2 w-2 rounded-full mr-1.5 ${
                        athlete.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                      }`}></span>
                      {athlete.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => window.location.href = `/admin/athletes/${athlete._id}`}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(athlete._id)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                        title="Edit Athlete"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(athlete._id)}
                        className="text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                        title="Delete Athlete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-emerald-100/70 text-lg font-medium mb-1">No athletes found</p>
                  <p className="text-white/50 text-sm">Add athletes to see them listed here</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAthletesTable;