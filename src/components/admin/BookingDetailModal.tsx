// src/components/admin/BookingDetailModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon, CalendarDaysIcon, ClockIcon, UserCircleIcon, BuildingOfficeIcon,
    AcademicCapIcon, CurrencyDollarIcon, CubeIcon, TruckIcon,
    ChatBubbleLeftEllipsisIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Import the detailed Booking interface (adjust path if necessary)
import type { Booking } from '@/services/bookingService';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailModalProps) {

  // Helper function to format currency
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // Helper function to format dates (including error handling)
   const formatDate = (dateInput: string | Date | undefined) => {
        if (!dateInput) return 'N/A';
        try {
            return format(new Date(dateInput), 'PPP (EEEE)'); // e.g., Sep 23, 2024 (Monday)
        } catch (e) {
            console.error("Error formatting date:", e);
            // Fallback for potentially invalid date strings from backend
            return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
        }
    };

   // Helper to safely access potentially populated user/facility/trainer data
    const getUserName = (user: Booking['user']) => typeof user === 'object' && user !== null ? user.name : 'N/A';
    const getUserEmail = (user: Booking['user']) => typeof user === 'object' && user !== null ? user.email : 'N/A';
    const getFacilityName = (facility: Booking['facility']) => typeof facility === 'object' && facility !== null ? facility.name : 'N/A';
    const getTrainerName = (trainer: Booking['trainer']) => typeof trainer === 'object' && trainer !== null ? trainer.name : 'N/A';

    const getStatusColorClass = (status: Booking['status'] | undefined) => {
        switch (status) {
          case 'upcoming': return 'text-emerald-300 bg-emerald-900/50';
          case 'completed': return 'text-green-300 bg-green-900/50';
          case 'cancelled': return 'text-red-300 bg-red-900/50';
          case 'no-show': return 'text-yellow-300 bg-yellow-900/50';
          default: return 'text-gray-300 bg-gray-900/50';
        }
    };
    const getPaymentStatusColorClass = (status: Booking['paymentStatus'] | undefined) => {
        switch (status) {
          case 'paid': return 'text-green-300 bg-green-900/50';
          case 'pending': return 'text-yellow-300 bg-yellow-900/50';
          case 'failed': return 'text-red-300 bg-red-900/50';
          case 'refunded': return 'text-gray-300 bg-gray-900/50';
          default: return 'text-gray-300 bg-gray-900/50';
        }
    };


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-emerald-900/80 backdrop-blur-md p-0 text-left align-middle shadow-xl transition-all border border-white/20">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-emerald-950/60 border-b border-emerald-700/30">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white">
                       Booking Details (<span className='font-mono text-emerald-300 text-base'>{booking?.bookingId || booking?._id?.slice(-8)}</span>)
                    </Dialog.Title>
                     <button type="button" className="rounded-md p-1 text-emerald-400 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" onClick={onClose}>
                         <span className="sr-only">Close</span>
                         <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                     </button>
                </div>

                {/* Body */}
                {!booking ? (
                    <div className="p-6 text-center text-emerald-300/80">
                      <div className="inline-block w-8 h-8 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                      <p>Loading details...</p>
                    </div>
                ) : (
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

                    {/* Main Details & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-emerald-700/30">
                       <div>
                            <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><CalendarDaysIcon className="w-4 h-4 mr-1.5"/> Date & Time</dt>
                            <dd className="mt-1 text-sm text-white font-medium">{formatDate(booking.date)}</dd>
                            <dd className="mt-1 text-sm text-emerald-100/80">{booking.timeSlot} ({booking.durationHours}hr)</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1.5"/> Booking Status</dt>
                            <dd className="mt-1"><span className={`px-3 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusColorClass(booking.status)} backdrop-blur-sm capitalize border border-white/10`}>{booking.status}</span></dd>
                        </div>
                        <div>
                             <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><CreditCardIcon className="w-4 h-4 mr-1.5"/> Payment Status</dt>
                             <dd className="mt-1"><span className={`px-3 py-1 rounded-full text-xs font-semibold leading-tight ${getPaymentStatusColorClass(booking.paymentStatus)} backdrop-blur-sm capitalize border border-white/10`}>{booking.paymentStatus}</span></dd>
                        </div>
                    </div>

                     {/* User Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                             <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><UserCircleIcon className="w-4 h-4 mr-1.5"/> User</dt>
                             <dd className="mt-1 text-sm text-white font-semibold">{getUserName(booking.user)}</dd>
                             <dd className="mt-0 text-sm text-emerald-100/80 break-words">{getUserEmail(booking.user)}</dd>
                        </div>
                        <div>
                             <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><UserGroupIcon className="w-4 h-4 mr-1.5"/> Participants</dt>
                             <dd className="mt-1 text-sm text-white">{booking.participants}</dd>
                        </div>
                    </div>

                     {/* Booking Target Details */}
                    <div>
                        {booking.bookingType === 'facility' && (
                             <div>
                                <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><BuildingOfficeIcon className="w-4 h-4 mr-1.5"/> Facility</dt>
                                <dd className="mt-1 text-sm text-white font-semibold">{getFacilityName(booking.facility)}</dd>
                                {/* Add location/address if available */}
                                {typeof booking.facility === 'object' && booking.facility?.location && <dd className="text-sm text-emerald-100/80">{booking.facility.location}</dd>}
                            </div>
                        )}
                         {booking.bookingType === 'trainer' && (
                             <div>
                                <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><AcademicCapIcon className="w-4 h-4 mr-1.5"/> Trainer</dt>
                                <dd className="mt-1 text-sm text-white font-semibold">{getTrainerName(booking.trainer)}</dd>
                                {/* Add specialization if available */}
                                {typeof booking.trainer === 'object' && booking.trainer?.specialization && <dd className="text-sm text-emerald-100/80">{booking.trainer.specialization}</dd>}
                                {/* --- FIXED LINE BELOW: Added typeof check for booking.facility --- */}
                                {typeof booking.trainer === 'object' && booking.trainer?._id && typeof booking.facility === 'object' && booking.facility?._id && (
                                   <dd className="text-xs text-emerald-300/70 mt-1 italic">(Session potentially at: {getFacilityName(booking.facility)})</dd>
                                )}
                            </div>
                         )}
                    </div>


                     {/* Equipment */}
                    {(booking.rentedEquipment && booking.rentedEquipment.length > 0) && (
                         <div className="border-t border-emerald-700/30 pt-4">
                            <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><CubeIcon className="w-4 h-4 mr-1.5"/> Rented Equipment</dt>
                            <ul className="mt-1 list-disc list-inside space-y-1 pl-1 text-emerald-100/80">
                                {booking.rentedEquipment.map((item, index) => (
                                    <li key={index} className="text-sm">
                                        {item.quantity}x {item.equipmentName} (@ {formatCurrency(item.pricePerItemPerHour)}/item/hr)
                                    </li>
                                ))}
                            </ul>
                        </div>
                     )}

                    {/* Transportation */}
                    {booking.needsTransportation && (
                         <div className="border-t border-emerald-700/30 pt-4">
                            <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><TruckIcon className="w-4 h-4 mr-1.5"/> Transportation Requested</dt>
                            <dd className="mt-1 text-sm text-green-300 font-medium">Yes</dd>
                         </div>
                    )}

                     {/* Special Requests */}
                    {booking.specialRequests && (
                         <div className="border-t border-emerald-700/30 pt-4">
                            <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1.5"/> Special Requests</dt>
                            <dd className="mt-1 text-sm text-emerald-100/80 whitespace-pre-wrap">{booking.specialRequests}</dd>
                        </div>
                     )}

                     {/* Cost Breakdown */}
                     <div className="border-t border-emerald-700/30 pt-4">
                         <dt className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider flex items-center"><CurrencyDollarIcon className="w-4 h-4 mr-1.5"/> Cost Breakdown</dt>
                         <dl className="mt-2 space-y-1 text-sm">
                            {booking.facilityCost > 0 && <div className="flex justify-between"><dt className="text-emerald-100/80">Facility:</dt><dd className="text-white">{formatCurrency(booking.facilityCost)}</dd></div>}
                            {booking.trainerCost > 0 && <div className="flex justify-between"><dt className="text-emerald-100/80">Trainer:</dt><dd className="text-white">{formatCurrency(booking.trainerCost)}</dd></div>}
                            {booking.equipmentCost > 0 && <div className="flex justify-between"><dt className="text-emerald-100/80">Equipment:</dt><dd className="text-white">{formatCurrency(booking.equipmentCost)}</dd></div>}
                            {booking.transportationCost > 0 && <div className="flex justify-between"><dt className="text-emerald-100/80">Transportation:</dt><dd className="text-white">{formatCurrency(booking.transportationCost)}</dd></div>}
                             <div className="flex justify-between pt-2 border-t border-dashed border-emerald-700/30 mt-2">
                                 <dt className="font-semibold text-white">Total Cost:</dt>
                                 <dd className="font-semibold text-emerald-300">{formatCurrency(booking.totalCost)}</dd>
                             </div>
                         </dl>
                     </div>

                      {/* Timestamps */}
                     <div className="text-right text-xs text-emerald-300/50 pt-4">
                         <p>Booking Created: {formatDate(booking.createdAt)}</p>
                     </div>

                </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}