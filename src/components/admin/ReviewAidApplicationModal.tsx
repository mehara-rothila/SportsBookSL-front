// src/components/admin/ReviewAidApplicationModal.tsx
'use client';

import { useState, useEffect, Fragment, FormEvent } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, CalendarDaysIcon, UserCircleIcon, CurrencyDollarIcon, InformationCircleIcon, ClipboardDocumentListIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import * as financialAidService from '@/services/financialAidService';

// Import the specific types from the service file
type ApplicationDetails = financialAidService.FinancialAidApplicationDetails;
type ApplicationStatus = ApplicationDetails['status'];

// --- FIXED: Define the type locally based on the service function's parameter ---
type AdminUpdateData = {
  status: ApplicationStatus;
  adminNotes?: string;
  approvedAmount?: number;
  validUntil?: string; // Expecting YYYY-MM-DD string from form
};
// --- End Fix ---

interface ReviewAidApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationDetails | null;
  isLoadingDetails: boolean; // To show loading state within modal
  onSaveSuccess: (updatedApplication: ApplicationDetails) => void; // Callback on successful save
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const possibleStatuses: ApplicationStatus[] = ['pending', 'approved', 'rejected', 'needs_info'];

// Helper function for classNames
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ReviewAidApplicationModal({
  isOpen,
  onClose,
  application,
  isLoadingDetails,
  onSaveSuccess
}: ReviewAidApplicationModalProps) {

  // State for editable fields by admin
  const [status, setStatus] = useState<ApplicationStatus>('pending');
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>(''); // Store as YYYY-MM-DD string
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Form-specific state
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Populate form when application data loads or changes
  useEffect(() => {
    if (application) {
      setStatus(application.status);
      setApprovedAmount(application.approvedAmount?.toString() || '');
      // Format existing date for input, or set empty if null/undefined
      setValidUntil(application.validUntil ? format(parseISO(application.validUntil), 'yyyy-MM-dd') : '');
      setAdminNotes(application.adminNotes || '');
      setFormError(null); // Clear errors when new data loads
    } else {
      // Reset form fields when no application is selected
      setStatus('pending');
      setApprovedAmount('');
      setValidUntil('');
      setAdminNotes('');
      setFormError(null);
    }
    setIsSaving(false); // Ensure saving state is reset
  }, [application]);

  // Helper functions for display
  const formatDate = (dateStr: string | Date | undefined, formatString = 'PPP') => {
    if(!dateStr) return 'N/A';
    try {
      // Handle potential Date objects or ISO strings
      const dateObj = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      return format(dateObj, formatString);
    } catch(e) {
      console.error("Date formatting error for:", dateStr, e);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const getStatusPill = (s: ApplicationStatus) => {
    switch (s) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/30">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
            <span className="h-2 w-2 rounded-full mr-1.5 bg-emerald-400 animate-pulse"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 ring-1 ring-red-400/30">
            Rejected
          </span>
        );
      case 'needs_info':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30">
            Needs Info
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 ring-1 ring-white/30">
            Unknown
          </span>
        );
    }
  };

  // Handle form submission
  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!application || isSaving) return;

    setFormError(null);

    // Client-side validation based on selected status
    if (status === 'approved') {
      if (!approvedAmount || Number(approvedAmount) <= 0) {
        setFormError("Approved Amount is required and must be positive when status is 'Approved'.");
        toast.error("Approved Amount is required.");
        return;
      }
      if (!validUntil) {
        setFormError("Valid Until date is required when status is 'Approved'.");
        toast.error("Valid Until date is required.");
        return;
      }
      try {
        // Basic check if it's a valid date string structure
        if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
             throw new Error('Invalid date format');
        }
        // Further check if parseISO works
        parseISO(validUntil + "T00:00:00.000Z"); // Add time to make it a valid ISO string for parsing
      } catch (dateError) {
        setFormError("Invalid date format for 'Valid Until'. Please use YYYY-MM-DD.");
        toast.error("Invalid date format for 'Valid Until'.");
        return;
      }
    }

    // Prepare data to send using the locally defined type
    const updateData: AdminUpdateData = {
      status: status,
       // Send number or undefined
      approvedAmount: status === 'approved' ? (approvedAmount ? Number(approvedAmount) : undefined) : undefined,
      // Send YYYY-MM-DD string or undefined
      validUntil: status === 'approved' ? (validUntil || undefined) : undefined,
      adminNotes: adminNotes || undefined, // Send string or undefined
    };

    // Remove undefined properties before sending if needed by backend, though usually handled
    // Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    setIsSaving(true);
    const loadingToast = toast.loading("Updating application...");

    try {
      const updatedApp = await financialAidService.updateAdminApplicationStatus(application._id, updateData);
      toast.dismiss(loadingToast);
      toast.success("Application updated successfully!");
      onSaveSuccess(updatedApp);
      onClose();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errMsg = err.message || "Failed to update application.";
      setFormError(errMsg);
      toast.error(`Update failed: ${errMsg}`);
      console.error("Save Application Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Detail Section components
  const DetailSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="pt-4 first:pt-0">
      <h4 className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2 flex items-center">
        <Icon className="w-4 h-4 mr-2 text-emerald-400"/>
        {title}
      </h4>
      <div className="space-y-2 pl-6 text-sm text-white/80">
        {children}
      </div>
    </div>
  );

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    value || value === 0 ? ( // Render even if value is 0
      <div className="flex flex-col sm:flex-row sm:items-baseline">
        <strong className="w-full sm:w-28 font-medium text-emerald-100 shrink-0 mb-0.5 sm:mb-0">{label}:</strong>
        <span className="break-words text-white/80">{value}</span>
      </div>
    ) : null
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isSaving && onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 text-left align-middle shadow-xl transition-all flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-emerald-900/30 border-b border-white/10">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white">
                    Review Financial Aid Application
                  </Dialog.Title>
                  <button
                    type="button"
                    className="p-1 rounded-md text-white/70 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 flex-grow overflow-y-auto max-h-[75vh] custom-scrollbar">
                  {isLoadingDetails ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-8 h-8 border-2 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin"></div>
                      <span className='ml-3 text-white/70'>Loading details...</span>
                    </div>
                  ) : !application ? (
                    <div className="text-center py-10 text-red-300">
                      Could not load application details. Please try again.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column: Application Details */}
                      <div className="space-y-6">
                        <DetailSection title="Applicant Info" icon={UserCircleIcon}>
                          <DetailItem label="Name" value={application.personalInfoSnapshot?.fullName || 'N/A'}/>
                          <DetailItem label="Email" value={application.personalInfoSnapshot?.email || 'N/A'}/>
                          <DetailItem label="Phone" value={application.personalInfoSnapshot?.phone || 'N/A'}/>
                          <DetailItem label="DOB" value={formatDate(application.personalInfoSnapshot?.dateOfBirth)}/>
                          <DetailItem label="Address" value={`${application.personalInfoSnapshot?.address || ''}, ${application.personalInfoSnapshot?.city || ''} ${application.personalInfoSnapshot?.postalCode || ''}`.replace(/^,|,$/g, '').trim() || 'N/A'}/>
                          <DetailItem label="Submitted" value={formatDate(application.submittedDate)}/>
                          <DetailItem label="Current Status" value={getStatusPill(application.status)}/>
                        </DetailSection>

                        <DetailSection title="Sports Background" icon={ClipboardDocumentListIcon}>
                          <DetailItem label="Primary Sport" value={application.sportsInfo?.primarySport || 'N/A'} />
                          <DetailItem label="Skill Level" value={application.sportsInfo?.skillLevel || 'N/A'} />
                          <DetailItem
                            label="Experience"
                            value={application.sportsInfo?.yearsExperience ? `${application.sportsInfo.yearsExperience} years` : 'N/A'}
                          />
                          <DetailItem label="Affiliation" value={application.sportsInfo?.currentAffiliation || 'N/A'} />
                          <DetailItem
                            label="Achievements"
                            value={application.sportsInfo?.achievements ?
                              <p className="whitespace-pre-wrap">{application.sportsInfo.achievements}</p> : 'None specified'}
                          />
                        </DetailSection>

                        <DetailSection title="Financial Need" icon={CurrencyDollarIcon}>
                          <DetailItem label="Requested Amount" value={formatCurrency(application.financialNeed?.requestedAmount)} />
                          <DetailItem label="Monthly Usage" value={application.financialNeed?.monthlyUsage || 'N/A'} />
                          <DetailItem label="Facilities Needed" value={application.financialNeed?.facilitiesNeeded?.join(', ') || 'N/A'} />
                          <DetailItem
                            label="Need Description"
                            value={application.financialNeed?.description ?
                              <p className="whitespace-pre-wrap">{application.financialNeed.description}</p> : 'None specified'}
                          />
                        </DetailSection>

                        <DetailSection title="Reference" icon={InformationCircleIcon}>
                           <DetailItem label="Name" value={application.reference?.name || 'N/A'} />
                           <DetailItem label="Relationship" value={application.reference?.relationship || 'N/A'} />
                           <DetailItem label="Contact Info" value={application.reference?.contactInfo || 'N/A'} />
                           <DetailItem label="Organization" value={application.reference?.organizationName || 'N/A'} />
                        </DetailSection>


                        {(application.status === 'approved' && (application.approvedAmount || application.validUntil)) && (
                          <DetailSection title="Approval Details" icon={CheckCircleIcon}>
                            <DetailItem label="Approved Amount" value={formatCurrency(application.approvedAmount)} />
                            <DetailItem label="Valid Until" value={formatDate(application.validUntil)}/>
                          </DetailSection>
                        )}

                        <DetailSection title="Supporting Information" icon={DocumentTextIcon}>
                          <DetailItem label="Previous Aid" value={application.supportingInfo?.previousAid || 'N/A'} />
                          <DetailItem label="Other Programs" value={application.supportingInfo?.otherPrograms || 'N/A'} />
                          <DetailItem
                            label="Additional Info"
                            value={application.supportingInfo?.additionalInfo ?
                              <p className="whitespace-pre-wrap">{application.supportingInfo.additionalInfo}</p> : 'None'}
                          />

                          {/* Document Links */}
                          {application.documentUrls && application.documentUrls.length > 0 ? (
                            <div className="pt-2">
                              <strong className="block font-medium text-emerald-100 mb-1">Documents:</strong>
                              <ul className='list-disc list-inside space-y-1 pl-1'>
                                {application.documentUrls.map((url, index) => (
                                  <li key={index}>
                                    <a
                                      href={`${BACKEND_BASE_URL}${url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                                    >
                                      View Document {index + 1}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <DetailItem label="Documents" value="None uploaded" />
                          )}
                        </DetailSection>

                        {/* Display current admin notes read-only */}
                        {application.adminNotes && (
                          <DetailSection title="Previous Admin Notes" icon={ChatBubbleBottomCenterTextIcon}>
                            <p className="whitespace-pre-wrap bg-white/5 p-3 rounded border border-white/20 text-white/80">
                              {application.adminNotes}
                            </p>
                          </DetailSection>
                        )}
                      </div>

                      {/* Right Column: Admin Action Form */}
                      <div>
                        <form
                          onSubmit={handleSave}
                          className="bg-emerald-900/30 backdrop-blur-sm p-4 rounded-lg border border-white/20 space-y-4 sticky top-4" // Added sticky
                        >
                          <h3 className="text-base font-semibold text-white border-b border-white/10 pb-2 mb-3">
                            Admin Action
                          </h3>

                          {/* Status Update */}
                          <div>
                            <label className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                              Update Status <span className='text-red-400'>*</span>
                            </label>
                            <RadioGroup value={status} onChange={setStatus} className="mt-1">
                              <RadioGroup.Label className="sr-only">Status</RadioGroup.Label>
                              <div className="grid grid-cols-2 gap-2">
                                {possibleStatuses.map((option) => (
                                  <RadioGroup.Option
                                    key={option}
                                    value={option}
                                    className={({ checked, active }) => classNames(
                                      checked
                                        ? 'border-transparent bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10',
                                      active ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-emerald-900/30' : '', // Added offset color
                                      'flex cursor-pointer items-center justify-center rounded-md border py-2 px-2 text-xs font-medium uppercase transition-all focus:outline-none'
                                    )}
                                  >
                                    <RadioGroup.Label as="span">{option.replace('_', ' ')}</RadioGroup.Label>
                                  </RadioGroup.Option>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Conditional Fields */}
                          <Transition
                            show={status === 'approved'}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <div className="space-y-3 pt-3 border-t border-white/10">
                              <div>
                                <label
                                  htmlFor="approvedAmount"
                                  className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1"
                                >
                                  Approved Amount (LKR) <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="number"
                                  id="approvedAmount"
                                  value={approvedAmount}
                                  onChange={(e) => setApprovedAmount(e.target.value)}
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  min="0"
                                  required={status === 'approved'}
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="validUntil"
                                  className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1"
                                >
                                  Valid Until Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="date"
                                  id="validUntil"
                                  value={validUntil}
                                  onChange={(e) => setValidUntil(e.target.value)}
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  min={format(new Date(), 'yyyy-MM-dd')} // Set min date to today
                                  required={status === 'approved'}
                                />
                              </div>
                            </div>
                          </Transition>

                          {/* Admin Notes */}
                          <div>
                            <label
                              htmlFor="adminNotes"
                              className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1"
                            >
                              Admin Notes
                            </label>
                            <textarea
                              id="adminNotes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              rows={4}
                              className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Add review notes..."
                            />
                          </div>

                          {/* Form Error Display */}
                          {formError && (
                            <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                              {formError}
                            </div>
                          )}

                          {/* Submit Button */}
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-900/30 disabled:opacity-50 transition-all duration-200" // Added offset color
                            disabled={isSaving || !application}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}