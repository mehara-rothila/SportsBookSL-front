// src/app/admin/financial-aid/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as financialAidService from '@/services/financialAidService';
import AdminFinancialAidTable from '@/components/admin/AdminFinancialAidTable';
import ReviewAidApplicationModal from '@/components/admin/ReviewAidApplicationModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Types for the list and details
// Line 12 - Corrected type name using the exported interface
type AdminAidApplicationListItem = financialAidService.FinancialAidApplicationSummary;
type FinancialAidApplicationDetails = financialAidService.FinancialAidApplicationDetails;

export default function AdminFinancialAidPage() {
    const [applications, setApplications] = useState<AdminAidApplicationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit] = useState(15);
    const [filterStatus, setFilterStatus] = useState('');

    // Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [applicationToReview, setApplicationToReview] = useState<FinancialAidApplicationDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Fetch Applications Function
    const fetchApplications = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const params: any = { page: currentPage, limit: limit };
            if (filterStatus) params.status = filterStatus;
            const data = await financialAidService.getAllAdminApplications(params);
            setApplications(data.applications || []);
            setTotalPages(data.pages || 1);
            setTotalCount(data.count || 0);
        } catch (err: any) {
            const msg = err.message || 'Failed to load applications';
            setError(msg);
            toast.error(msg);
            setApplications([]);
            setTotalPages(1);
            setTotalCount(0);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [currentPage, limit, filterStatus]);

    useEffect(() => {
        fetchApplications(true);
    }, [fetchApplications]);

    // --- Handlers ---
    const handleRefresh = () => fetchApplications(true);
    
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages && !loading) setCurrentPage(page);
    }
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    // --- Review Modal Handlers ---
    const openReviewModal = async (applicationId: string) => {
        if (!applicationId) return;
        setError(null);
        setIsLoadingDetails(true);
        setApplicationToReview(null);
        setIsReviewModalOpen(true);
        try {
            const details = await financialAidService.getAdminApplicationById(applicationId);
            setApplicationToReview(details);
        } catch (err: any) {
            const msg = err.message || "Failed to load application details";
            setError(msg);
            toast.error(msg);
            setIsReviewModalOpen(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };
    
    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        setApplicationToReview(null);
        setError(null);
    };
    
    const handleReviewSaveSuccess = (updatedApplication: FinancialAidApplicationDetails) => {
        // Update the list optimistically
        setApplications(prev => prev.map(app => app._id === updatedApplication._id ? {
            ...app,
            status: updatedApplication.status,
            financialNeed: updatedApplication.financialNeed
        } : app));
        toast.success(`Application ${updatedApplication._id.slice(-6)} updated.`);
    };

    // --- Render ---
    return (
        <>
            {/* Using a faux header section outside the main content to fix spacing issues */}
            <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
                <h1 className="text-3xl font-bold text-white">Financial Aid Applications</h1>
            </div>

            {/* Main content container */}
            <div className="relative w-full">
                {/* Action buttons - absolutely positioned relative to page top */}
                <div className="absolute top-[-80px] right-0 flex flex-col sm:flex-row justify-end items-center gap-3">
                    <button 
                        onClick={handleRefresh} 
                        disabled={loading} 
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-md text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 relative z-10 transition-all duration-200"
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="status-filter" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                Filter by Status
                            </label>
                            <select 
                                id="status-filter" 
                                name="status" 
                                value={filterStatus} 
                                onChange={handleFilterChange} 
                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="needs_info">Needs Info</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && !loading && (
                    <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-inner">
                        {error}
                    </div>
                )}

                {/* Table/Content Area */}
                <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                    {loading && !applications.length ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                            <p className="text-white/80 font-medium">Loading applications...</p>
                        </div>
                    ) : error && !loading ? (
                        <div className="text-center py-12 px-4 bg-red-900/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-500/30 shadow-inner">
                            <p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p>
                            <p className="mb-4">{error}</p>
                            <button 
                                onClick={handleRefresh} 
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/20 transition-all duration-200"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {applications.length === 0 && !loading ? (
                                <div className="text-center py-16 px-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                    </svg>
                                    <p className="text-emerald-100/70 text-lg font-medium mb-1">No applications match the current filters.</p>
                                    <p className="text-white/50 text-sm">Try adjusting your filters or check back later</p>
                                </div>
                            ) : (
                                <AdminFinancialAidTable applications={applications} onReview={openReviewModal} />
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && !error && totalPages > 1 && (
                    <div className="mt-6 py-4 px-6 flex justify-center items-center space-x-1 sm:space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                        <button 
                            onClick={() => goToPage(currentPage - 1)} 
                            disabled={currentPage === 1 || loading} 
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-md border border-white/20 disabled:opacity-50 transition-all duration-200"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-white/80 px-2">
                            Page {currentPage} of {totalPages}
                            <span className="hidden md:inline text-white/60 ml-1">({totalCount} total applications)</span>
                        </span>
                        <button 
                            onClick={() => goToPage(currentPage + 1)} 
                            disabled={currentPage === totalPages || loading} 
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-md border border-white/20 disabled:opacity-50 transition-all duration-200"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Render Modals */}
                <ReviewAidApplicationModal
                    isOpen={isReviewModalOpen}
                    onClose={closeReviewModal}
                    application={applicationToReview}
                    isLoadingDetails={isLoadingDetails}
                    onSaveSuccess={handleReviewSaveSuccess}
                />
            </div>
        </>
    );
}