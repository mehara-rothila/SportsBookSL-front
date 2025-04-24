// src/app/admin/trainer-applications/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, Tab } from '@headlessui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
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

// Status Badge Component
const StatusBadge = ({ status }: { status: TrainerApplication['status'] }) => {
  let bgColor = '';
  let textColor = '';
  let icon = null;
  let label = '';

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-500/20';
      textColor = 'text-yellow-300';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      label = 'Pending Review';
      break;
    case 'approved':
      bgColor = 'bg-green-500/20';
      textColor = 'text-green-300';
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      label = 'Approved';
      break;
    case 'rejected':
      bgColor = 'bg-red-500/20';
      textColor = 'text-red-300';
      icon = <XCircleIcon className="h-4 w-4 mr-1" />;
      label = 'Rejected';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {label}
    </span>
  );
};

export default function AdminTrainerApplicationsPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  
  const [applications, setApplications] = useState<TrainerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('pending');
  
  // Selected application states
  const [selectedApplication, setSelectedApplication] = useState<TrainerApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin authentication
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login?redirect=/admin/trainer-applications');
    }
  }, [loading, isAdmin, router]);

  // Fetch applications based on current tab
  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const status = currentTab !== 'all' ? currentTab as 'pending' | 'approved' | 'rejected' : undefined;
      const response = await trainerApplicationService.getAllApplications(1, 50, status);
      setApplications(response.applications || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to fetch trainer applications');
    } finally {
      setIsLoading(false);
    }
  }, [currentTab, isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // View application details
  const handleViewDetails = (application: TrainerApplication) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  // Open approve dialog
  const handleOpenApprove = (application: TrainerApplication) => {
    setSelectedApplication(application);
    setAdminNotes('');
    setIsApproveOpen(true);
  };

  // Open reject dialog
  const handleOpenReject = (application: TrainerApplication) => {
    setSelectedApplication(application);
    setRejectReason('');
    setIsRejectOpen(true);
  };

  // Approve application
  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    setActionLoading(true);
    try {
      await trainerApplicationService.approveApplication(selectedApplication._id, adminNotes);
      fetchApplications();
      setIsApproveOpen(false);
    } catch (err: any) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject application
  const handleReject = async () => {
    if (!selectedApplication || !rejectReason) return;
    
    setActionLoading(true);
    try {
      await trainerApplicationService.rejectApplication(selectedApplication._id, rejectReason);
      fetchApplications();
      setIsRejectOpen(false);
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      setError(err.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  // UI Components
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ArrowPathIcon className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
        <h1 className="text-3xl font-bold text-white">Trainer Applications</h1>
      </div>

      <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
        {/* Tabs */}
        <Tab.Group onChange={(index) => setCurrentTab(['pending', 'approved', 'rejected', 'all'][index])}>
          <Tab.List className="flex bg-emerald-900/20 backdrop-blur-sm border-b border-white/10">
            <Tab className={({ selected }) => `px-4 py-3 text-sm font-medium focus:outline-none ${selected ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/70 hover:text-white'}`}>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                Pending
              </div>
            </Tab>
            <Tab className={({ selected }) => `px-4 py-3 text-sm font-medium focus:outline-none ${selected ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/70 hover:text-white'}`}>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Approved
              </div>
            </Tab>
            <Tab className={({ selected }) => `px-4 py-3 text-sm font-medium focus:outline-none ${selected ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/70 hover:text-white'}`}>
              <div className="flex items-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                Rejected
              </div>
            </Tab>
            <Tab className={({ selected }) => `px-4 py-3 text-sm font-medium focus:outline-none ${selected ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/70 hover:text-white'}`}>
              <div className="flex items-center">
                All
              </div>
            </Tab>
          </Tab.List>
        </Tab.Group>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/20 backdrop-blur-sm text-red-200 border-b border-red-500/30 text-sm">
            <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-white/80">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-emerald-900/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 max-w-md mx-auto">
              <ClockIcon className="h-12 w-12 text-emerald-400/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No {currentTab !== 'all' ? currentTab : ''} applications found</h3>
              <p className="text-white/70 mb-4">There are currently no trainer applications in this category.</p>
              <button
                onClick={fetchApplications}
                className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-white/10"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-emerald-900/20 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Sports
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Rate (LKR)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Applied
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/10">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-emerald-800/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border border-white/20">
                          <img
                            src={getImageUrl(application.profileImage)}
                            alt={application.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{application.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {application.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {Array.isArray(application.sports) 
                        ? application.sports.join(', ')
                        : application.sports}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {application.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {application.hourlyRate.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="p-1.5 rounded-full bg-white/5 text-emerald-400 hover:bg-white/10 hover:text-white"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApprove(application)}
                              className="p-1.5 rounded-full bg-white/5 text-green-400 hover:bg-white/10 hover:text-white"
                              title="Approve Application"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            
                            <button
                              onClick={() => handleOpenReject(application)}
                              className="p-1.5 rounded-full bg-white/5 text-red-400 hover:bg-white/10 hover:text-white"
                              title="Reject Application"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <Dialog
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-3xl rounded-xl bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 shadow-xl w-full">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-semibold text-white">
                    Trainer Application Details
                  </Dialog.Title>
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="text-white/70 hover:text-white bg-white/5 rounded-full p-1.5"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Application Details */}
                <div className="space-y-6">
                  {/* Header with Image and Status */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="sm:w-36">
                      <div className="h-32 w-32 rounded-lg overflow-hidden border border-white/20">
                        <img
                          src={getImageUrl(selectedApplication.profileImage)}
                          alt={selectedApplication.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{selectedApplication.name}</h3>
                      <div className="flex items-center mb-3">
                        <StatusBadge status={selectedApplication.status} />
                        <span className="ml-3 text-white/60 text-sm">
                          Applied {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/60">Specialization</p>
                          <p className="text-white">{selectedApplication.specialization}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Location</p>
                          <p className="text-white">{selectedApplication.location}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Hourly Rate</p>
                          <p className="text-white">Rs. {selectedApplication.hourlyRate.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Experience</p>
                          <p className="text-white">{selectedApplication.experienceYears} years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-emerald-300 mb-2">Bio</h4>
                    <p className="text-white/80 whitespace-pre-line text-sm">{selectedApplication.bio}</p>
                  </div>
                  
                  {/* Sports, Languages, Availability */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <h4 className="text-sm font-medium text-emerald-300 mb-2">Sports</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedApplication.sports) 
                          ? selectedApplication.sports 
                          : selectedApplication.sports.split(',')
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
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <h4 className="text-sm font-medium text-emerald-300 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedApplication.languages && (
                          Array.isArray(selectedApplication.languages)
                            ? selectedApplication.languages
                            : selectedApplication.languages.split(',')
                        )).map((lang, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80"
                          >
                            {lang.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <h4 className="text-sm font-medium text-emerald-300 mb-2">Availability</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedApplication.availability && (
                          Array.isArray(selectedApplication.availability)
                            ? selectedApplication.availability
                            : selectedApplication.availability.split(',')
                        )).map((day, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80"
                          >
                            {day.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Admin Notes - if any */}
                  {selectedApplication.adminNotes && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <h4 className="text-sm font-medium text-emerald-300 mb-2">Admin Notes</h4>
                      <p className="text-white/80 text-sm whitespace-pre-line">{selectedApplication.adminNotes}</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setIsDetailsOpen(false)}
                      className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-white/10"
                    >
                      Close
                    </button>
                    
                    {selectedApplication.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setIsDetailsOpen(false);
                            handleOpenReject(selectedApplication);
                          }}
                          className="px-4 py-2 border border-red-500/30 rounded-md text-sm font-medium text-red-300 bg-red-800/20 hover:bg-red-800/40"
                        >
                          <XCircleIcon className="h-4 w-4 inline mr-2" />
                          Reject
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsDetailsOpen(false);
                            handleOpenApprove(selectedApplication);
                          }}
                          className="px-4 py-2 border border-green-500/30 rounded-md text-sm font-medium text-green-300 bg-green-800/20 hover:bg-green-800/40"
                        >
                          <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}

      {/* Approve Application Modal */}
      {selectedApplication && (
        <Dialog
          open={isApproveOpen}
          onClose={() => !actionLoading && setIsApproveOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-lg rounded-xl bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 shadow-xl w-full">
                <Dialog.Title className="text-lg font-semibold text-white flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  Approve Trainer Application
                </Dialog.Title>
                
                <div className="mt-4">
                  <p className="text-white/80 mb-4">
                    You are about to approve <span className="font-semibold text-white">{selectedApplication.name}</span>'s 
                    trainer application. This will create a trainer profile and allow them to be booked by users.
                  </p>
                  
                  <div className="mb-4">
                    <label htmlFor="adminNotes" className="block text-sm font-medium text-emerald-200 mb-1">
                      Admin Notes (Optional)
                    </label>
                    <textarea 
                      id="adminNotes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any notes or feedback for the applicant"
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => !actionLoading && setIsApproveOpen(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-4 py-2 border border-green-500/30 rounded-md text-sm font-medium text-green-300 bg-green-800/20 hover:bg-green-800/40 disabled:opacity-50 flex items-center"
                    >
                      {actionLoading ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Confirm Approval
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}

      {/* Reject Application Modal */}
      {selectedApplication && (
        <Dialog
          open={isRejectOpen}
          onClose={() => !actionLoading && setIsRejectOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-lg rounded-xl bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 shadow-xl w-full">
                <Dialog.Title className="text-lg font-semibold text-white flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                  Reject Trainer Application
                </Dialog.Title>
                
                <div className="mt-4">
                  <p className="text-white/80 mb-4">
                    You are about to reject <span className="font-semibold text-white">{selectedApplication.name}</span>'s 
                    trainer application. Please provide a reason for the rejection.
                  </p>
                  
                  <div className="mb-4">
                    <label htmlFor="rejectReason" className="block text-sm font-medium text-emerald-200 mb-1">
                      Rejection Reason <span className="text-red-400">*</span>
                    </label>
                    <textarea 
                      id="rejectReason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      required
                      placeholder="Explain why the application is being rejected"
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {!rejectReason && (
                      <p className="mt-1 text-xs text-red-300">A reason is required for rejection</p>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => !actionLoading && setIsRejectOpen(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectReason}
                      className="px-4 py-2 border border-red-500/30 rounded-md text-sm font-medium text-red-300 bg-red-800/20 hover:bg-red-800/40 disabled:opacity-50 flex items-center"
                    >
                      {actionLoading ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Confirm Rejection
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}