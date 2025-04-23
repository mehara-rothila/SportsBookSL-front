// src/components/admin/AdminFinancialAidTable.tsx
import { format, parseISO } from 'date-fns';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

// --- FIXED: Import the correct type using a named import ---
import type { FinancialAidApplicationSummary } from '@/services/financialAidService';

interface AdminFinancialAidTableProps {
  // --- FIXED: Use the correct type ---
  applications: FinancialAidApplicationSummary[];
  onReview: (applicationId: string) => void; // Callback to open the review modal/page
}

export default function AdminFinancialAidTable({
  applications,
  onReview,
}: AdminFinancialAidTableProps) {

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return 'N/A';
    // Note: FinancialAidApplicationSummary doesn't seem to have requestedAmount.
    // Assuming it might come from somewhere else or needs adjustment based on actual data.
    // If requestedAmount is needed here, it might imply the table needs FinancialAidApplicationDetails
    // or FinancialAidApplicationSummary needs updating.
    // For now, keeping the function signature, but be aware of potential mismatch.
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const formatDateString = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // --- FIXED: Use the correct type for status lookup ---
  const getStatusBadge = (status: FinancialAidApplicationSummary['status'] | undefined) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/30">
            <ClockIcon className="w-3 h-3 mr-1" />
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
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'needs_info':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Needs Info
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

  return (
    <table className="min-w-full divide-y divide-white/15">
      <thead className="bg-emerald-900/20 backdrop-blur-sm">
        <tr>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Applicant
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Date Submitted
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Primary Sport
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Requested Amt (LKR) {/* See note in formatCurrency */}
          </th>
          <th scope="col" className="px-4 py-4 text-center text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Status
          </th>
          <th scope="col" className="px-4 py-4 text-right text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
        {/* Ensure the data accessed here exists on FinancialAidApplicationSummary */}
        {applications.map((app) => (
          <tr key={app._id} className="hover:bg-emerald-800/10 transition-colors duration-150">
            <td className="px-4 py-4 whitespace-nowrap">
              {/* FinancialAidApplicationSummary doesn't have applicantUser, name, email */}
              {/* You might need to adjust the service/backend or the component */}
              <div className="text-base font-medium text-white">{/* app.applicantUser?.name ?? */} 'N/A'}</div>
              <div className="text-xs text-emerald-200/80">{/* app.applicantUser?.email ?? */} 'N/A'}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm text-white/70">{formatDateString(app.submittedDate /*?? app.createdAt*/)}</div> {/* createdAt likely not in Summary */}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm text-white/70">{app.sportsInfo?.primarySport || 'N/A'}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {/* FinancialAidApplicationSummary doesn't have financialNeed or requestedAmount */}
              <div className="text-base font-medium text-white/90">{/* formatCurrency(app.financialNeed?.requestedAmount) */} 'N/A'}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-center">
              {getStatusBadge(app.status)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-right">
              <button
                onClick={() => onReview(app._id)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                title="Review Application"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </td>
          </tr>
        ))}
        {applications.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-10 text-white/60">
              No financial aid applications found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}