// src/app/admin/donations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as donationService from '@/services/donationService'; // Adjust path
import AdminDonationsTable from '@/components/admin/AdminDonationsTable'; // Adjust path
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Use the specific list item type
type AdminDonationListItem = donationService.AdminDonationListItem;

// Helper Components (Styled to match emerald theme)
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading donations...</p>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="text-center py-12 px-4 bg-red-900/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-500/30 shadow-inner">
    <p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p>
    <p className="mb-4">{message}</p>
    <button 
      onClick={onRetry} 
      className="inline-flex items-center px-4 py-2 border border-red-300/50 text-sm font-medium rounded-md text-red-100 bg-red-800/50 hover:bg-red-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
    >
      Retry
    </button>
  </div>
);

const NoDataDisplay = ({ message }: { message: string }) => (
  <div className="text-center py-16 px-6 bg-emerald-800/20 backdrop-blur-sm rounded-lg border border-emerald-500/20 shadow-inner">
    <p className="text-emerald-100/70">{message}</p>
  </div>
);

export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<AdminDonationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit] = useState(20); // Donations might have more entries, increase limit

    // Fetch Donations Function
    const fetchDonations = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const params: any = { page: currentPage, limit: limit };
            console.log("Admin page: Fetching donations with params:", params);
            const data = await donationService.getAllAdminDonations(params);
            setDonations(data.donations || []);
            setTotalPages(data.pages || 1);
            setTotalCount(data.count || 0);
        } catch (err: any) {
            const msg = err.message || 'Failed to load donations';
            setError(msg); toast.error(msg);
            setDonations([]); setTotalPages(1); setTotalCount(0);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [currentPage, limit]);

    useEffect(() => {
        fetchDonations(true); // Initial fetch
    }, [fetchDonations]);

    // --- Handlers ---
    const handleRefresh = () => { fetchDonations(true); };
    const goToPage = (page: number) => { if (page >= 1 && page <= totalPages && page !== currentPage && !loading) { setCurrentPage(page); } };
    const handleViewDetails = (donationId: string) => { console.log("View donation details:", donationId); toast.error("Donation detail view not implemented yet."); /* TODO: Implement Detail Modal/Page */ };

    // --- Render ---
     return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Donation Records</h1>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-md text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 relative z-10 transition-all duration-200"
                >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Display General Fetch Error */}
            {error && !loading && (
                <div className="mb-4 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-sm">
                    {error}
                </div>
            )}

            {/* Table/Content Area */}
            <div className="mt-6">
                {loading && !donations.length ? (<LoadingIndicator />)
                : error && !loading ? (<ErrorDisplay message={error} onRetry={handleRefresh} />)
                : (
                    <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            {donations.length === 0 && !loading ? (
                            <NoDataDisplay message="No donations have been recorded yet." />
                            ) : (
                                <AdminDonationsTable
                                donations={donations}
                                onViewDetails={handleViewDetails}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && !error && totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-1 sm:space-x-2 bg-emerald-800/30 backdrop-blur-sm p-3 rounded-lg border border-emerald-500/20 shadow-inner">
                    <button 
                        onClick={() => goToPage(currentPage - 1)} 
                        disabled={currentPage === 1 || loading} 
                        className="inline-flex items-center px-3 py-1.5 border border-emerald-500/30 text-sm font-medium rounded-md text-emerald-200 bg-emerald-700/50 hover:bg-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-emerald-100/80 px-2">
                        Page {currentPage} of {totalPages} <span className="hidden md:inline">({totalCount} total donations)</span>
                    </span>
                    <button 
                        onClick={() => goToPage(currentPage + 1)} 
                        disabled={currentPage === totalPages || loading} 
                        className="inline-flex items-center px-3 py-1.5 border border-emerald-500/30 text-sm font-medium rounded-md text-emerald-200 bg-emerald-700/50 hover:bg-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
     );
}