// src/components/profile/FinancialAidDetailModal.tsx
'use client';

import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CalendarDaysIcon, 
  UserCircleIcon, 
  CurrencyDollarIcon, 
  InformationCircleIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import type { FinancialAidApplicationDetails } from '@/services/financialAidService'; // Adjust path

interface FinancialAidDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: FinancialAidApplicationDetails | null;
  isLoading: boolean;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

export default function FinancialAidDetailModal({
  isOpen,
  onClose,
  application,
  isLoading
}: FinancialAidDetailModalProps) {

  const formatDate = (dateStr: string | Date | undefined, formatString = 'PPP') => { 
    if (!dateStr) return 'N/A'; 
    try { 
      return format(parseISO(String(dateStr)), formatString); 
    } catch (e) { 
      console.error("Date format error:", e); 
      return 'Invalid Date'; 
    } 
  };
  
  const formatCurrency = (amount: number | undefined | null) => { 
    if (amount === undefined || amount === null) return 'N/A'; 
    return `Rs. ${amount.toLocaleString('en-LK')}`; 
  };
  
  const getStatusPill = (status: FinancialAidApplicationDetails['status'] | undefined) => { 
    switch (status) { 
      case 'pending': 
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        ); 
      case 'approved': 
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        ); 
      case 'rejected': 
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm">
            <XMarkIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        ); 
      case 'needs_info': 
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
            <InformationCircleIcon className="w-3 h-3 mr-1" />
            Needs Info
          </span>
        ); 
      default: 
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
            Unknown
          </span>
        );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle transition-all shadow-2xl">
                {/* Tennis Court-Themed Header */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-600 overflow-hidden">
                    {/* Tennis Court Lines */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 transform -translate-y-1/2"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 transform -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full border-2 border-white/30 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  
                  <div className="relative px-6 py-5 flex justify-between items-center">
                    <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center">
                      <DocumentTextIcon className="h-6 w-6 mr-2 text-emerald-300" />
                      Financial Aid Application
                    </Dialog.Title>
                    <button
                      type="button"
                      className="p-1.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Wave Divider */}
                  <div className="absolute -bottom-5 left-0 right-0 h-8 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-10 text-white">
                      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
                    </svg>
                  </div>
                </div>

                {/* Content with scrolling */}
                <div className="p-6 pt-8 max-h-[65vh] overflow-y-auto bg-white custom-scrollbar">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-emerald-600">
                      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-emerald-800 font-medium">Loading application details...</p>
                    </div>
                  ) : !application ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <XMarkIcon className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        We couldn't load the application details. Please try again or contact support if the problem persists.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Application Status Section */}
                      <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-4 flex items-center border-b border-emerald-100 pb-2">
                          <InformationCircleIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Application Status
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                            <div className="text-xs text-emerald-700 mb-1">Submitted On</div>
                            <div className="font-medium flex items-center">
                              <CalendarDaysIcon className="w-4 h-4 mr-1.5 text-emerald-600" />
                              {formatDate(application.submittedDate ?? application.createdAt)}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                            <div className="text-xs text-emerald-700 mb-1">Current Status</div>
                            <div className="font-medium">
                              {getStatusPill(application.status)}
                            </div>
                          </div>
                          
                          {application.status === 'approved' && (
                            <>
                              <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                                <div className="text-xs text-emerald-700 mb-1">Approved Amount</div>
                                <div className="font-medium flex items-center">
                                  <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-emerald-600" />
                                  {formatCurrency(application.approvedAmount)}
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                                <div className="text-xs text-emerald-700 mb-1">Valid Until</div>
                                <div className="font-medium flex items-center">
                                  <CalendarDaysIcon className="w-4 h-4 mr-1.5 text-emerald-600" />
                                  {formatDate(application.validUntil)}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </section>

                      {/* Personal Info Section */}
                      <section className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center border-b border-gray-100 pb-2">
                          <UserCircleIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Personal Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Full Name</div>
                            <div className="font-medium text-gray-900">{application.personalInfoSnapshot?.fullName || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Email Address</div>
                            <div className="font-medium text-gray-900 break-all">{application.personalInfoSnapshot?.email || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Phone Number</div>
                            <div className="font-medium text-gray-900">{application.personalInfoSnapshot?.phone || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Date of Birth</div>
                            <div className="font-medium text-gray-900">{formatDate(application.personalInfoSnapshot?.dateOfBirth)}</div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="text-gray-500 text-xs mb-1">Address</div>
                            <div className="font-medium text-gray-900">
                              {`${application.personalInfoSnapshot?.address || ''}, ${application.personalInfoSnapshot?.city || ''}${application.personalInfoSnapshot?.postalCode ? ', ' + application.personalInfoSnapshot.postalCode : ''}`.replace(/^,|,$/g, '').trim() || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Sports Background Section */}
                      <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-4 flex items-center border-b border-emerald-100 pb-2">
                          <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Sports Background
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Primary Sport</div>
                            <div className="font-medium text-gray-900 flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                              {application.sportsInfo?.primarySport || 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Skill Level</div>
                            <div className="font-medium text-gray-900">{application.sportsInfo?.skillLevel || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Experience</div>
                            <div className="font-medium text-gray-900">{application.sportsInfo?.yearsExperience !== undefined ? `${application.sportsInfo.yearsExperience} years` : 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Affiliation</div>
                            <div className="font-medium text-gray-900">{application.sportsInfo?.currentAffiliation || 'N/A'}</div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="text-emerald-700 text-xs mb-1">Achievements</div>
                            <div className="bg-white rounded-lg p-3 border border-emerald-100 whitespace-pre-wrap text-gray-800 max-h-32 overflow-y-auto">
                              {application.sportsInfo?.achievements || 'None specified'}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Financial Need Section */}
                      <section className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center border-b border-gray-100 pb-2">
                          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Financial Need
                        </h4>
                        
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Requested Amount</div>
                              <div className="font-medium text-gray-900 text-lg">{formatCurrency(application.financialNeed?.requestedAmount)}</div>
                            </div>
                            
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Monthly Usage</div>
                              <div className="font-medium text-gray-900">{application.financialNeed?.monthlyUsage || 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Facilities Needed</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {application.financialNeed?.facilitiesNeeded?.length ? (
                                application.financialNeed.facilitiesNeeded.map((facility, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    {facility}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">None specified</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Description of Need</div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 whitespace-pre-wrap text-gray-800 max-h-32 overflow-y-auto">
                              {application.financialNeed?.description || 'None provided'}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Reference Section */}
                      <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-4 flex items-center border-b border-emerald-100 pb-2">
                          <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Reference
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Name</div>
                            <div className="font-medium text-gray-900">{application.reference?.name || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Relationship</div>
                            <div className="font-medium text-gray-900">{application.reference?.relationship || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Contact</div>
                            <div className="font-medium text-gray-900">{application.reference?.contactInfo || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-emerald-700 text-xs mb-1">Organization</div>
                            <div className="font-medium text-gray-900">{application.reference?.organizationName || 'N/A'}</div>
                          </div>
                        </div>
                      </section>

                      {/* Documents Section */}
                      <section className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center border-b border-gray-100 pb-2">
                          <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Supporting Documents
                        </h4>
                        
                        {application.documentUrls && application.documentUrls.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {application.documentUrls.map((url, index) => (
                              <a 
                                key={index} 
                                href={`${BACKEND_BASE_URL}${url}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                              >
                                <DocumentTextIcon className="h-8 w-8 text-emerald-500 mr-3 flex-shrink-0" />
                                <div className="flex-grow">
                                  <div className="font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors">
                                    Document {index + 1}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{url.split('/').pop()}</div>
                                </div>
                                <ArrowDownTrayIcon className="h-5 w-5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">No documents uploaded</p>
                          </div>
                        )}
                      </section>

                      {/* Admin Notes Section (if available) */}
                      {application.adminNotes && (
                        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center border-b border-gray-200 pb-2">
                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                            Admin Notes
                          </h4>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-800">
                            {application.adminNotes}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer with close button */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 border border-emerald-300 text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}