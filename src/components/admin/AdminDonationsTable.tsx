// src/components/admin/AdminDonationsTable.tsx
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon, GiftIcon } from '@heroicons/react/24/outline';

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
      // Format to include date and time
      return format(parseISO(dateStr), 'MMM d, yyyy, h:mm a');
    } catch {
      console.warn("Could not parse date string:", dateStr);
      return dateStr; // Fallback to original string if parsing fails
    }
  };

  const getPaymentStatusBadge = (status: AdminDonationListItem['paymentStatus'] | undefined) => {
    switch (status) {
      case 'succeeded': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
            <span className="h-2 w-2 rounded-full mr-1.5 bg-emerald-400 animate-pulse"></span>
            Succeeded
          </span>
        );
      case 'pending': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/30">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'failed': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 ring-1 ring-red-400/30">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 ring-1 ring-white/30">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Safely access populated user/athlete data
  const getDonorName = (donation: AdminDonationListItem) => {
    if (donation.isAnonymous) 
      return <span className="italic text-white/60">Anonymous</span>;
    return donation.donorUser?.name ?? 'Unknown User';
  };
  
  const getAthleteName = (donation: AdminDonationListItem) => {
    return donation.athlete?.name ?? 'Unknown Athlete';
  };

  return (
    <table className="min-w-full divide-y divide-white/15">
      <thead className="bg-emerald-900/20 backdrop-blur-sm">
        <tr>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Donor
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Athlete
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Amount
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Date
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Status
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Gateway
          </th>
          <th scope="col" className="relative px-4 py-4">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
        {donations.map((donation) => (
          <tr key={donation._id} className="hover:bg-emerald-800/10 transition-colors duration-150">
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-base font-medium text-white">{getDonorName(donation)}</div>
              {!donation.isAnonymous && (
                <div className="text-xs text-emerald-200/80">{donation.donorUser?.email ?? 'N/A'}</div>
              )}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <Link 
                href={`/admin/athletes/${donation.athlete?._id || ''}`} 
                className="text-base text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
              >
                {getAthleteName(donation)}
              </Link>
              <div className="text-xs text-white/70">{donation.athlete?.sport || ''}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-base font-medium text-white/90">{formatCurrency(donation.amount)}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm text-white/70">{formatDateString(donation.donationDate ?? donation.createdAt)}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {getPaymentStatusBadge(donation.paymentStatus)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm text-white/70 capitalize">{donation.paymentGateway || 'N/A'}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-right">
              {/* View Details button if implemented */}
              {onViewDetails && (
                <button 
                  onClick={() => onViewDetails(donation._id)} 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full" 
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              )}
            </td>
          </tr>
        ))}
        {donations.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center py-10 text-white/60">
              No donations found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}