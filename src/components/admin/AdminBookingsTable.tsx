// src/components/admin/AdminBookingsTable.tsx
import { format } from 'date-fns';
import Link from 'next/link';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Interface matching the list item from the service
interface AdminBookingListItem {
    _id: string;
    bookingId?: string;
    user: { _id: string; name: string; email: string; };
    facility?: { _id: string; name: string; };
    trainer?: { _id: string; name: string; };
    date: string;
    timeSlot: string;
    totalCost: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
    bookingType?: 'facility' | 'trainer';
    createdAt?: string;
}

interface AdminBookingsTableProps {
  bookings: AdminBookingListItem[];
  onViewDetails: (bookingId: string) => void; // Placeholder for potential detail view
  onUpdateStatus: (bookingId: string, currentStatus: AdminBookingListItem['status']) => void; // Pass current status too
  onDelete: (bookingId: string) => void;
}

export default function AdminBookingsTable({
  bookings,
  onViewDetails,
  onUpdateStatus,
  onDelete,
}: AdminBookingsTableProps) {

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-LK')}`;
  const formatDateString = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr; // Return original if formatting fails
    }
  };

  const getStatusBadge = (status: AdminBookingListItem['status']) => {
    switch (status) {
      case 'upcoming': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-200"><ClockIcon className="w-3 h-3 mr-1" />Upcoming</span>;
      case 'completed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-200"><CheckCircleIcon className="w-3 h-3 mr-1" />Completed</span>;
      case 'cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-200"><XCircleIcon className="w-3 h-3 mr-1" />Cancelled</span>;
      case 'no-show': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-200"><ExclamationTriangleIcon className="w-3 h-3 mr-1" />No-Show</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/50 text-gray-200">{status}</span>;
    }
  };

   const getPaymentStatusBadge = (status: AdminBookingListItem['paymentStatus']) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-200"><ClockIcon className="w-3 h-3 mr-1" />Pending</span>;
      case 'paid': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-200"><CurrencyDollarIcon className="w-3 h-3 mr-1" />Paid</span>;
      case 'failed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-200"><XCircleIcon className="w-3 h-3 mr-1" />Failed</span>;
      case 'refunded': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/50 text-gray-200">Refunded</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/50 text-gray-200">{status}</span>;
    }
  };

  const getTargetName = (booking: AdminBookingListItem) => {
      if (booking.bookingType === 'facility' && booking.facility) return booking.facility.name;
      if (booking.bookingType === 'trainer' && booking.trainer) return booking.trainer.name;
      return 'N/A';
  }
  const getTargetLink = (booking: AdminBookingListItem) => {
        if (booking.bookingType === 'facility' && booking.facility) return `/facilities/${booking.facility._id}`;
        if (booking.bookingType === 'trainer' && booking.trainer) return `/trainers/${booking.trainer._id}`;
        return '#';
  }

  return (
    <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-emerald-900/30 backdrop-blur-sm">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Booking ID</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">User</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Facility/Trainer</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Date & Time</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Total Cost</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Payment</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-emerald-200 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/10">
          {bookings.map((booking) => (
            <tr key={booking._id} className="hover:bg-emerald-800/10 transition-colors duration-150">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-white/80">{booking.bookingId || booking._id.slice(-6)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{booking.user?.name || 'N/A'}</div>
                  <div className="text-xs text-emerald-200/70">{booking.user?.email || 'N/A'}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80 capitalize">{booking.bookingType || 'N/A'}</td>
               <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-300 hover:text-emerald-200">
                 <Link href={getTargetLink(booking)}>
                    {getTargetName(booking)}
                 </Link>
               </td>
              <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-white">{formatDateString(booking.date)}</div>
                  <div className="text-xs text-emerald-200/70">{booking.timeSlot}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">{formatCurrency(booking.totalCost)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{getPaymentStatusBadge(booking.paymentStatus)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {/* Action buttons */}
                <button onClick={() => onViewDetails(booking._id)} className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-white/10 transition-colors" title="View Details">
                  <EyeIcon className="h-4 w-4"/>
                </button>
                <button onClick={() => onUpdateStatus(booking._id, booking.status)} className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-white/10 transition-colors" title="Update Status">
                   <PencilIcon className="h-4 w-4"/>
                </button>
                <button onClick={() => onDelete(booking._id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/10 transition-colors" title="Delete Booking">
                   <TrashIcon className="h-4 w-4"/>
                </button>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
             <tr>
                <td colSpan={9} className="text-center py-10 text-emerald-100/70">No bookings found matching your criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}