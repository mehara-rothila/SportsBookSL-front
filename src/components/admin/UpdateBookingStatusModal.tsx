// src/components/admin/UpdateBookingStatusModal.tsx
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as bookingService from '@/services/bookingService';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'no-show';

interface UpdateBookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingInfo: { id: string; currentStatus: BookingStatus; bookingId?: string } | null;
  onStatusUpdateSuccess: () => void;
}

const possibleStatuses: BookingStatus[] = ['upcoming', 'completed', 'cancelled', 'no-show'];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UpdateBookingStatusModal({
  isOpen,
  onClose,
  bookingInfo,
  onStatusUpdateSuccess,
}: UpdateBookingStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-select the current status when the modal opens
    if (bookingInfo) {
      setSelectedStatus(bookingInfo.currentStatus);
      setError(null);
      setIsUpdating(false);
    }
  }, [bookingInfo]);

  const handleConfirmUpdate = async () => {
    if (!bookingInfo || !selectedStatus || isUpdating) return;

    setIsUpdating(true);
    setError(null);

    try {
      await bookingService.updateBookingStatusByAdmin(bookingInfo.id, selectedStatus);
      onStatusUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      setError(err.message || 'Failed to update booking status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't render if no booking info provided
  if (!bookingInfo) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isUpdating && onClose()}>
        {/* Backdrop */}
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

        {/* Modal Content */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md text-white/70 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                    onClick={onClose}
                    disabled={isUpdating}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-3">
                  Update Booking Status
                </Dialog.Title>
                
                <div className="mt-4">
                  <p className="text-sm text-white/80">
                    Select the new status for Booking ID: <span className="font-mono text-emerald-300">{bookingInfo.bookingId || bookingInfo.id.slice(-6)}</span>
                  </p>
                  <p className="text-sm text-white/80 mt-1">
                    Current Status: <span className={`font-medium ${
                      bookingInfo.currentStatus === 'completed' ? 'text-emerald-300' :
                      bookingInfo.currentStatus === 'cancelled' ? 'text-red-300' :
                      bookingInfo.currentStatus === 'upcoming' ? 'text-blue-300' : 'text-yellow-300'
                    }`}>{bookingInfo.currentStatus}</span>
                  </p>
                </div>

                {/* Status Selection */}
                <div className="mt-5">
                  <RadioGroup value={selectedStatus} onChange={setSelectedStatus}>
                    <RadioGroup.Label className="sr-only">Booking Status</RadioGroup.Label>
                    <div className="space-y-2">
                      {possibleStatuses.map((statusOption) => (
                        <RadioGroup.Option
                          key={statusOption}
                          value={statusOption}
                          className={({ active, checked }) =>
                            `${active ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}
                            ${checked 
                              ? 'bg-emerald-700/30 border-emerald-400/30 text-white' 
                              : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                            }
                            relative flex cursor-pointer rounded-lg border px-5 py-3 shadow-sm focus:outline-none transition-all duration-200`
                          }
                        >
                          {({ checked }) => (
                            <>
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <RadioGroup.Label as="p" className={`font-medium ${checked ? 'text-white' : 'text-white/80'}`}>
                                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                    </RadioGroup.Label>
                                  </div>
                                </div>
                                {checked && (
                                  <div className="flex-shrink-0 text-emerald-400">
                                    <CheckCircleIcon className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                    onClick={onClose}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                    onClick={handleConfirmUpdate}
                    disabled={isUpdating || selectedStatus === bookingInfo.currentStatus}
                  >
                    {isUpdating ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : 'Confirm Status Update'}
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