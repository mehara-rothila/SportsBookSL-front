// src/app/admin/bookings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as bookingService from '@/services/bookingService';
import AdminBookingsTable from '@/components/admin/AdminBookingsTable';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import UpdateBookingStatusModal from '@/components/admin/UpdateBookingStatusModal';
import BookingDetailModal from '@/components/admin/BookingDetailModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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

// Type for booking status - used for status update later
type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'no-show';

// Helper Components - Transparent Versions
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading bookings...</p>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="text-center py-12 px-4 bg-red-900/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-500/30 shadow-inner">
    <p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p>
    <p className="mb-4">{message}</p>
    <button 
      onClick={onRetry} 
      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/20 transition-all duration-200"
    >
      Retry
    </button>
  </div>
);

export default function AdminBookingsPage() {
  // Data & Loading State
  const [bookings, setBookings] = useState<AdminBookingListItem[]>([]);
  const [loading, setLoading] = useState(true); // For main list loading
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(15); // Items per page

  // Filter State
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    bookingType: '',
    search: '', // Currently searches bookingId (implement backend logic for names if needed)
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDeleteId, setBookingToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete action

  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [bookingToUpdateStatus, setBookingToUpdateStatus] = useState<{id: string; currentStatus: BookingStatus; bookingId?: string} | null>(null);
  // Note: isUpdating status lives within the UpdateBookingStatusModal itself

  // View Details Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bookingToView, setBookingToView] = useState<bookingService.Booking | null>(null); // Use detailed interface
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // Loading state for details


  // Fetch Bookings Function (memoized with useCallback)
  const fetchBookings = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    // Don't clear error here, let specific actions handle error display/clearing
    // setError(null);
    try {
      const params: any = { page: currentPage, limit: limit, };
      if (filters.status) params.status = filters.status;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.bookingType) params.bookingType = filters.bookingType;
      if (filters.search) params.search = filters.search;

      console.log("Fetching bookings with params:", params);
      const data = await bookingService.getAllAdminBookings(params);
      setBookings(data.bookings || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.count || 0);
      setError(null); // Clear error on successful fetch
      console.log("Fetched bookings count:", data.count);
    } catch (err: any) {
      const fetchErrorMsg = err.message || 'Failed to load bookings';
      setError(fetchErrorMsg); // Set error state for potential display
      toast.error(`Failed to load bookings: ${fetchErrorMsg}`); // Show toast error immediately
      setBookings([]); setTotalPages(1); setTotalCount(0); // Reset data on error
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  }, [currentPage, limit, filters]);

  // Effect to fetch data on load and when filters/page change
  useEffect(() => { fetchBookings(true); }, [fetchBookings]);

  // --- Event Handlers ---

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleRefresh = () => { fetchBookings(true); }

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages && page !== currentPage && !loading) { setCurrentPage(page); } }

  // --- Action Handlers (Modal Triggers & Implementations) ---

  // -- View Details Handlers --
  const handleViewDetails = async (bookingId: string) => {
    console.log("Opening details for:", bookingId);
    setIsLoadingDetails(true); setBookingToView(null); setError(null); setIsDetailModalOpen(true);
    try {
        const details = await bookingService.getBookingById(bookingId);
        setBookingToView(details);
    } catch (err: any) {
        const detailErrorMsg = `Error fetching booking details: ${err.message}`;
        setError(detailErrorMsg);
        setBookingToView(null);
        setIsDetailModalOpen(false); // Close modal on error
        toast.error(`Failed to fetch details: ${err.message}`); // Use toast instead of alert
    } finally {
        setIsLoadingDetails(false);
    }
  };

  const closeDetailModal = () => { setIsDetailModalOpen(false); setBookingToView(null); setError(null); }

  // -- Status Update Handlers --
  const openUpdateStatusModal = (bookingId: string, currentStatus: BookingStatus) => {
      const booking = bookings.find(b => b._id === bookingId);
      setBookingToUpdateStatus({ id: bookingId, currentStatus: currentStatus, bookingId: booking?.bookingId });
      setIsStatusModalOpen(true);
  };
  const closeUpdateStatusModal = () => { setIsStatusModalOpen(false); setBookingToUpdateStatus(null); }
  const handleStatusUpdateSuccess = () => {
       fetchBookings(false); // Refresh the list silently
       toast.success('Booking status updated successfully!'); // Toast notification on success
  }

  // -- Delete Handlers --
  const openDeleteModal = (bookingId: string) => { setBookingToDeleteId(bookingId); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { if (isDeleting) return; setIsDeleteModalOpen(false); setBookingToDeleteId(null); };

  const confirmDeleteHandler = async () => {
    if (!bookingToDeleteId) return;
    setIsDeleting(true); setError(null);
    try {
      await bookingService.deleteBookingByAdmin(bookingToDeleteId);
      closeDeleteModal();
      toast.success('Booking deleted successfully!'); // Use toast for success
      if (bookings.length === 1 && currentPage > 1) { setCurrentPage(prev => prev - 1); }
      else { fetchBookings(false); }
    } catch (err: any) {
      const deleteErrorMsg = `Error deleting booking: ${err.message}`;
      setError(deleteErrorMsg);
      toast.error(deleteErrorMsg); // Use toast for error
    } finally {
      setIsDeleting(false);
    }
  };
  // -- End Delete Handlers --


  // --- Render ---
  return (
    <>
      {/* Using a faux header section outside the main content to fix spacing issues */}
      <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
        <h1 className="text-3xl font-bold text-white">Booking Management</h1>
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

        {/* Error Display */}
        {error && !loading && !isDetailModalOpen && (
          <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-inner">
            {error}
          </div>
        )}

        {/* Filters Card */}
        <div className="mb-6 p-4 bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className='flex flex-col'>
              <label htmlFor="search-filter" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                Search Booking ID
              </label>
              <input 
                id="search-filter" 
                type="text" 
                name="search" 
                placeholder="Enter Booking ID..." 
                value={filters.search} 
                onChange={handleFilterChange} 
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-md shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className='flex flex-col'>
              <label htmlFor="status-filter" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                Booking Status
              </label>
              <select 
                id="status-filter" 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange} 
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>
            <div className='flex flex-col'>
              <label htmlFor="payment-filter" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <select 
                id="payment-filter" 
                name="paymentStatus" 
                value={filters.paymentStatus} 
                onChange={handleFilterChange} 
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className='flex flex-col'>
              <label htmlFor="type-filter" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                Booking Type
              </label>
              <select 
                id="type-filter" 
                name="bookingType" 
                value={filters.bookingType} 
                onChange={handleFilterChange} 
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Types</option>
                <option value="facility">Facility</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area: Loading/Error/Table */}
        <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
          {loading && !bookings.length && !error ? (
            <LoadingIndicator />
          ) : error && !loading && !isDetailModalOpen ? (
            <ErrorDisplay message={error} onRetry={handleRefresh} />
          ) : (
            <>
              {/* Table Wrapper */}
              <div className="overflow-x-auto">
                <AdminBookingsTable
                  bookings={bookings}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={openUpdateStatusModal}
                  onDelete={openDeleteModal}
                />
              </div>

              {/* Pagination Controls */}
              {!loading && !error && totalPages > 1 && (
                <div className="py-4 px-6 flex justify-center items-center space-x-1 sm:space-x-2 bg-white/5 backdrop-blur-sm border-t border-white/10">
                  <button 
                    onClick={() => goToPage(currentPage - 1)} 
                    disabled={currentPage === 1 || loading} 
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-md border border-white/20 disabled:opacity-50 transition-all duration-200"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/80 px-2">
                    Page {currentPage} of {totalPages}
                    <span className="hidden md:inline text-white/60 ml-1">({totalCount} total bookings)</span>
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
            </>
          )}
        </div>

        {/* Modals */}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteHandler}
          title="Confirm Booking Deletion"
          message={`Are you sure you want to permanently delete booking ${bookingToDeleteId ? (bookings.find(b => b._id === bookingToDeleteId)?.bookingId || bookingToDeleteId.slice(-6)) : ''}? This action cannot be undone.`}
          confirmButtonText="Yes, Delete Booking"
          isDeleting={isDeleting}
        />

        <UpdateBookingStatusModal
          isOpen={isStatusModalOpen}
          onClose={closeUpdateStatusModal}
          bookingInfo={bookingToUpdateStatus}
          onStatusUpdateSuccess={handleStatusUpdateSuccess}
        />

        <BookingDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          booking={bookingToView}
        />
      </div>
    </>
  );
}