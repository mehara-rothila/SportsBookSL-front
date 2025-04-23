// src/app/admin/donations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as donationService from '@/services/donationService'; // Adjust path
import AdminDonationsTable from '@/components/admin/AdminDonationsTable'; // Adjust path
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Use the specific list item type
type AdminDonationListItem = donationService.AdminDonationListItem;

// Helper Components (Optional, could be global)
const LoadingIndicator = () => <div className="text-center py-16"><div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-3"></div><p className="text-gray-600 font-medium">Loading donations...</p></div>;
const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => <div className="text-center py-12 px-4 bg-red-50 text-red-700 rounded-lg border border-red-200 shadow"><p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p><p className="mb-4">{message}</p><button onClick={onRetry} className="btn-secondary-outline">Retry</button></div>;
const NoDataDisplay = ({ message }: { message: string }) => <div className="text-center py-16 px-6 bg-white rounded-lg shadow border border-gray-200"><p className="text-gray-500">{message}</p></div>;


export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<AdminDonationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit] = useState(20); // Donations might have more entries, increase limit

    // TODO: Add state for filters if implementing filtering UI
    // const [filters, setFilters] = useState({ status: '' });

    // Fetch Donations Function
    const fetchDonations = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const params: any = { page: currentPage, limit: limit };
            // if (filters.status) params.status = filters.status; // Add filters here if used
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
    }, [currentPage, limit]); // Add filters to dependency array if implemented

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donation Records</h1>
                 <button onClick={handleRefresh} disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 relative z-10">
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
             </div>

             {/* Filters Section (Optional) */}
             {/*
             <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
                <p>Filters placeholder</p>
             </div>
             */}

             {/* Display General Fetch Error */}
             {error && !loading && (<div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md shadow-sm">{error}</div>)}

            {/* Table/Content Area */}
            <div className="mt-6">
                 {loading && !donations.length ? (<LoadingIndicator />)
                 : error && !loading ? (<ErrorDisplay message={error} onRetry={handleRefresh} />)
                 : (
                    <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
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
                 <div className="mt-6 flex justify-center items-center space-x-1 sm:space-x-2 bg-white p-3 rounded-lg shadow border border-gray-200">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || loading} className="pagination-button"> Previous </button>
                    <span className="text-sm text-gray-700 px-2"> Page {currentPage} of {totalPages} <span className="hidden md:inline">({totalCount} total donations)</span> </span>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || loading} className="pagination-button"> Next </button>
                </div>
             )}
        </div>
     );
}