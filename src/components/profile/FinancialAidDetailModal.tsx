// src/components/profile/FinancialAidDetailModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, CalendarDaysIcon, UserCircleIcon, CurrencyDollarIcon, InformationCircleIcon, ClipboardDocumentListIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
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

  const formatDate = (dateStr: string | Date | undefined, formatString = 'PPP') => { if (!dateStr) return 'N/A'; try { return format(parseISO(String(dateStr)), formatString); } catch (e) { console.error("Date format error:", e); return 'Invalid Date'; } };
  const formatCurrency = (amount: number | undefined | null) => { if (amount === undefined || amount === null) return 'N/A'; return `Rs. ${amount.toLocaleString('en-LK')}`; };
  // --- FIXED LINE BELOW: Use the imported type name ---
  const getStatusPill = (status: FinancialAidApplicationDetails['status'] | undefined) => { switch (status) { case 'pending': return <span className="chip-yellow">Pending</span>; case 'approved': return <span className="chip-green">Approved</span>; case 'rejected': return <span className="chip-red">Rejected</span>; case 'needs_info': return <span className="chip-blue">Needs Info</span>; default: return <span className="chip-gray">Unknown</span>; }};
  const DetailSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => ( <div className="pt-4 first:pt-0"><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Icon className="w-4 h-4 mr-2 text-gray-400"/>{title}</h4><div className="space-y-2 pl-6 text-sm text-gray-800">{children}</div></div> );
  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => ( value || value === 0 ? <div className="flex flex-col sm:flex-row sm:items-baseline"><strong className="w-full sm:w-28 font-medium text-gray-600 shrink-0 mb-0.5 sm:mb-0">{label}:</strong><span className="break-words">{value}</span></div> : null );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/30 backdrop-blur-sm" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-0 text-left align-middle shadow-xl transition-all">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200"><Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">Financial Aid Application Details</Dialog.Title><button type="button" className="p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500" onClick={onClose}><span className="sr-only">Close</span><XMarkIcon className="h-6 w-6" /></button></div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {isLoading ? (<div className="text-center py-10 text-gray-500">Loading details...</div>) :
               !application ? (<div className="text-center py-10 text-red-600">Could not load application details.</div>) :
               (
                <div className="space-y-6">
                     <DetailSection title="Application Status" icon={InformationCircleIcon}>
                         <DetailItem label="Submitted" value={formatDate(application.submittedDate ?? application.createdAt)}/>
                         <DetailItem label="Status" value={getStatusPill(application.status)}/>
                         {application.status === 'approved' && <DetailItem label="Approved Amount" value={formatCurrency(application.approvedAmount)}/>}
                         {application.status === 'approved' && <DetailItem label="Valid Until" value={formatDate(application.validUntil)}/>}
                     </DetailSection>

                      <DetailSection title="Personal Info Snapshot" icon={UserCircleIcon}>
                         <DetailItem label="Full Name" value={application.personalInfoSnapshot?.fullName || 'N/A'}/>
                         <DetailItem label="Email" value={application.personalInfoSnapshot?.email || 'N/A'}/>
                         <DetailItem label="Phone" value={application.personalInfoSnapshot?.phone || 'N/A'}/>
                         <DetailItem label="DOB" value={formatDate(application.personalInfoSnapshot?.dateOfBirth)}/>
                         <DetailItem label="Address" value={`${application.personalInfoSnapshot?.address || ''}, ${application.personalInfoSnapshot?.city || ''}${application.personalInfoSnapshot?.postalCode ? ', ' + application.personalInfoSnapshot.postalCode : ''}`.replace(/^,|,$/g, '').trim() || 'N/A'}/>
                     </DetailSection>

                    <DetailSection title="Sports Background" icon={ClipboardDocumentListIcon}>
                        <DetailItem label="Primary Sport" value={application.sportsInfo?.primarySport || 'N/A'} />
                        <DetailItem label="Skill Level" value={application.sportsInfo?.skillLevel || 'N/A'} />
                        <DetailItem label="Experience" value={application.sportsInfo?.yearsExperience !== undefined ? `${application.sportsInfo.yearsExperience} years` : 'N/A'} />
                        <DetailItem label="Affiliation" value={application.sportsInfo?.currentAffiliation || 'N/A'} />
                        <DetailItem label="Achievements" value={application.sportsInfo?.achievements ? <p className="whitespace-pre-wrap">{application.sportsInfo.achievements}</p> : 'None'} />
                     </DetailSection>

                    <DetailSection title="Financial Need" icon={CurrencyDollarIcon}>
                         <DetailItem label="Requested" value={formatCurrency(application.financialNeed?.requestedAmount)} />
                         <DetailItem label="Monthly Usage" value={application.financialNeed?.monthlyUsage || 'N/A'} />
                         <DetailItem label="Facilities Needed" value={application.financialNeed?.facilitiesNeeded?.join(', ') || 'N/A'} />
                         <DetailItem label="Description" value={application.financialNeed?.description ? <p className="whitespace-pre-wrap">{application.financialNeed.description}</p> : 'None'} />
                    </DetailSection>

                    <DetailSection title="Reference" icon={ShieldCheckIcon}> {/* Changed Icon */}
                         <DetailItem label="Name" value={application.reference?.name || 'N/A'} />
                         <DetailItem label="Relationship" value={application.reference?.relationship || 'N/A'} />
                         <DetailItem label="Contact" value={application.reference?.contactInfo || 'N/A'} />
                         <DetailItem label="Organization" value={application.reference?.organizationName || 'N/A'} />
                    </DetailSection>

                     <DetailSection title="Documents" icon={DocumentTextIcon}>
                        {application.documentUrls && application.documentUrls.length > 0 ? (
                             <ul className='list-disc list-inside space-y-1'> {application.documentUrls.map((url, index) => ( <li key={index}><a href={`${BACKEND_BASE_URL}${url}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Document {index + 1}</a></li> ))} </ul>
                         ) : ( <DetailItem label="Documents" value="None uploaded" /> )}
                     </DetailSection>

                     {/* Optionally display admin notes if desired */}
                     {application.adminNotes && (
                         <DetailSection title="Admin Notes (Internal)" icon={ChatBubbleBottomCenterTextIcon}>
                              <p className="whitespace-pre-wrap bg-gray-100 p-2 rounded border border-gray-200 text-gray-600">{application.adminNotes}</p>
                         </DetailSection>
                     )}

                 </div> // end space-y-6
               )}
             </div>
            <div className="px-6 py-3 bg-gray-50 border-t flex justify-end"><button onClick={onClose} className="btn-secondary-outline">Close</button></div>
          </Dialog.Panel>
        </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}

// Chip styles (ensure these are in your global CSS or defined via Tailwind)
/*
.chip-yellow { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800; }
.chip-green { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800; }
.chip-red { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800; }
.chip-blue { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800; }
.chip-gray { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800; }
.btn-secondary-outline { @apply inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2; }
*/