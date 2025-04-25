// src/components/admin/AdminDonationsTable.tsx
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { EyeIcon } from '@heroicons/react/24/outline';

// Import the specific type from the service file
import type { AdminDonationListItem } from '@/services/donationService';

interface AdminDonationsTableProps {
  donations: AdminDonationListItem[];
  onViewDetails?: (donationId: string) => void; // Optional details view later
}

export default function AdminDonationsTable({
  donations,
  onViewDetails,
}: AdminDonationsTableProps) {

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-LK')}`;

  const formatDateString = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      // Format to match AdminBookingsTable
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      console.warn("Could not parse date string:", dateStr);
      return dateStr; // Fallback to original string if parsing fails
    }
  };

  const getPaymentStatusBadge = (status: AdminDonationListItem['paymentStatus'] | undefined) => {
    switch (status) {
      case 'succeeded': 
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
            <span className="h-2 w-2 rounded-full mr-1.5 bg-emerald-400 animate-pulse"></span>
            Succeeded
          </span>
        );
      case 'pending': 
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/30">
            <span className="h-2 w-2 rounded-full mr-1.5 bg-yellow-400 animate-pulse"></span>
            Pending
          </span>
        );
      case 'failed': 
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-300 ring-1 ring-red-500/30">
            <span className="h-2 w-2 rounded-full mr-1.5 bg-red-400"></span>
            Failed
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 ring-1 ring-white/20">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Safely access populated user/athlete data
  const getDonorName = (donation: AdminDonationListItem) => {
    if (donation.isAnonymous) 
      return <span className="italic text-emerald-200/60">Anonymous</span>;
    return donation.donorUser?.email ?? 'Unknown User';
  };
  
  const getAthleteName = (donation: AdminDonationListItem) => {
    return donation.athlete?.name ?? 'Unknown Athlete';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <table className="min-w-full divide-y divide-white/15 bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
        <thead className="bg-emerald-900/20 backdrop-blur-sm">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Donor
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Athlete
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Gateway
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
          {donations.length > 0 ? (
            donations.map((donation) => (
              <tr key={donation._id} className="hover:bg-emerald-800/10 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-white/80">
                    {getDonorName(donation)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-medium text-emerald-300">
                    {getAthleteName(donation)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-white">{formatCurrency(donation.amount)}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-white/80">{formatDateString(donation.donationDate ?? donation.createdAt)}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  {getPaymentStatusBadge(donation.paymentStatus)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-white/80 capitalize">{donation.paymentGateway || 'N/A'}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  {onViewDetails && (
                    <button 
                      onClick={() => onViewDetails(donation._id)} 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                      aria-label="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-emerald-100/70 text-lg font-medium mb-1">No donations found</p>
                  <p className="text-white/50 text-sm">No donations found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}