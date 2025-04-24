// src/app/profile/trainer-applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import * as trainerApplicationService from '@/services/trainerApplicationService';
import { TrainerApplication } from '@/services/trainerApplicationService';

// Image URL helper
const getImageUrl = (path: string | undefined | null): string => {
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
  const FALLBACK_IMAGE = '/images/default-trainer.png';
  
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${BACKEND_BASE_URL}${path}`;
  return FALLBACK_IMAGE;
};

export default function UserTrainerApplicationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [applications, setApplications] = useState<TrainerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/profile/trainer-applications');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch user's applications
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await trainerApplicationService.getUserApplications();
        setApplications(data);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to fetch your trainer applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/profile" className="text-white/80 hover:text-white flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-3xl font-extrabold text-white mt-4">My Trainer Applications</h1>
        </div>
        
        {isLoading ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/30 p-8 text-center">
            <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-white/80">Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/30 p-8">
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-red-200 text-sm mb-6">
              <svg className="h-5 w-5 inline mr-2 text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/30 p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-white/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">No Applications Yet</h2>
            <p className="text-white/70 mb-6">You haven't submitted any trainer applications yet.</p>
            <Link
              href="/trainer-registration"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Apply to Become a Trainer
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div 
                key={application._id}
                className="bg-white/20 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/30"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{application.name}</h2>
                    
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                      ${application.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30' : 
                        application.status === 'approved' ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 
                        'bg-red-600/20 text-red-300 border border-red-500/30'}`}
                    >
                      {application.status === 'pending' && (
                        <>
                          <ClockIcon className="h-4 w-4 mr-1.5" />
                          Pending Review
                        </>
                      )}
                      {application.status === 'approved' && (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                          Approved
                        </>
                      )}
                      {application.status === 'rejected' && (
                        <>
                          <XCircleIcon className="h-4 w-4 mr-1.5" />
                          Rejected
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="md:w-32">
                      <div className="h-32 w-32 rounded-xl overflow-hidden border border-white/30">
                        <img
                          src={getImageUrl(application.profileImage)}
                          alt={application.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-white/60">Specialization</p>
                          <p className="text-white font-medium">{application.specialization}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Location</p>
                          <p className="text-white font-medium">{application.location}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Hourly Rate</p>
                          <p className="text-white font-medium">Rs. {application.hourlyRate.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Applied On</p>
                          <p className="text-white font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-white/60 text-sm">Sports</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(Array.isArray(application.sports) 
                            ? application.sports 
                            : application.sports.split(',')
                          ).map((sport, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-800/40 text-emerald-200 border border-emerald-600/30"
                            >
                              {sport.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {application.status === 'rejected' && application.adminNotes && (
                        <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 text-sm">
                          <p className="font-medium text-white mb-1">Reason for Rejection:</p>
                          <p className="text-red-200 whitespace-pre-line">{application.adminNotes}</p>
                        </div>
                      )}
                      
                      {application.status === 'approved' && (
                        <div className="bg-green-900/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 text-sm">
                          <p className="font-medium text-white mb-1">Your application has been approved!</p>
                          <p className="text-green-200">Your trainer profile is now visible to users. You can now receive bookings.</p>
                          {application.adminNotes && (
                            <div className="mt-2 pt-2 border-t border-green-500/20">
                              <p className="text-white/80 whitespace-pre-line">{application.adminNotes}</p>
                            </div>
                          )}
                          <div className="mt-4">
                            <Link
                              href="/trainers"
                              className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-700/50 text-white hover:bg-green-700/70 transition-colors"
                            >
                              View Trainer Listings
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-8">
              <Link
                href="/trainer-registration"
                className="inline-flex items-center px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-sm font-medium rounded-md text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Submit Another Application
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}