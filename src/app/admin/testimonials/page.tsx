// src/app/admin/testimonials/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as testimonialService from '@/services/testimonialService'; // Adjust path
import AdminTestimonialsTable from '@/components/admin/AdminTestimonialsTable'; // Adjust path
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal'; // Adjust path
import CreateTestimonialModal from '@/components/admin/CreateTestimonialModal'; // Adjust path
import EditTestimonialModal from '@/components/admin/EditTestimonialModal'; // Adjust path
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';

// Interface for testimonial data used in the page
type Testimonial = testimonialService.Testimonial;

// Helper Components
const LoadingRow = () => (<tr><td colSpan={6} className="text-center py-10"><div className="inline-block w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div><p className="mt-2 text-sm text-gray-500">Loading testimonials...</p></td></tr>);
const ErrorRow = ({ message }: { message: string | null }) => ( <tr> <td colSpan={6} className="text-center py-10 px-4"> <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 inline-block">Error: {message || 'An unknown error occurred'}</div> </td> </tr> );
// Updated NoDataMessage
const NoDataMessage = ({ message, onCreateClick }: { message: string; onCreateClick: () => void }) => (
    <tr>
         <td colSpan={6} className="text-center py-16 px-6 bg-gray-50">
             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-5-5m0 0l5-5m-5 5h12" /> </svg>
             <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
             <p className="mt-1 text-sm text-gray-500">Get started by adding the first one.</p>
             <div className="mt-6">
                 <button onClick={onCreateClick} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative z-10">
                     <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> New Testimonial
                </button>
             </div>
         </td>
     </tr>
);

export default function AdminTestimonialsPage() {
    // ... (State variables remain the same) ...
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [testimonialToEdit, setTestimonialToEdit] = useState<Testimonial | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [testimonialToDeleteId, setTestimonialToDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    // ... (fetchTestimonials, handleCreateSuccess, handleEditSuccess, confirmDeleteHandler, etc. remain the same) ...
    const fetchTestimonials = useCallback(async (showLoadingIndicator = true) => { if (showLoadingIndicator) setLoading(true); setError(null); try { const data = await testimonialService.getAllAdminTestimonials(); setTestimonials(data || []); } catch (err: any) { const fetchErrorMsg = err.message || 'Failed to load testimonials'; setError(fetchErrorMsg); toast.error(fetchErrorMsg); setTestimonials([]); } finally { if (showLoadingIndicator) setLoading(false); } }, []);
    useEffect(() => { fetchTestimonials(true); }, [fetchTestimonials]);
    const handleRefresh = () => { fetchTestimonials(true); }
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);
    const handleCreateSuccess = (newTestimonial: Testimonial) => { setTestimonials(prev => [newTestimonial, ...prev]); toast.success('Testimonial created successfully!'); };
    const openEditModal = (testimonial: Testimonial) => { setTestimonialToEdit(testimonial); setIsEditModalOpen(true); };
    const closeEditModal = () => { setIsEditModalOpen(false); setTestimonialToEdit(null); };
    const handleEditSuccess = (updatedTestimonial: Testimonial) => { setTestimonials(prev => prev.map(t => t._id === updatedTestimonial._id ? updatedTestimonial : t)); toast.success('Testimonial updated successfully!'); };
    const openDeleteModal = (testimonialId: string) => { setTestimonialToDeleteId(testimonialId); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { if (!isDeleting) { setIsDeleteModalOpen(false); setTestimonialToDeleteId(null); } };
    const confirmDeleteHandler = async () => { if (!testimonialToDeleteId) return; setIsDeleting(true); setError(null); try { await testimonialService.deleteAdminTestimonial(testimonialToDeleteId); closeDeleteModal(); toast.success('Testimonial deleted successfully!'); setTestimonials(prev => prev.filter(t => t._id !== testimonialToDeleteId)); } catch (err: any) { const deleteErrorMsg = `Error deleting testimonial: ${err.message}`; setError(deleteErrorMsg); toast.error(deleteErrorMsg); } finally { setIsDeleting(false); } };


  // --- Render ---
  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Testimonials</h1>
      </div>

       {/* Action Bar */}
       <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-3">
             <button onClick={handleRefresh} disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 relative z-10">
                 <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
             </button>
             <button onClick={openCreateModal} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative z-10">
                 <PlusIcon className="h-5 w-5 mr-2" /> Create New Testimonial
            </button>
        </div>

        {/* Error Display */}
        {error && !loading && !isDeleting && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md shadow-sm">
                {error}
            </div>
        )}

       {/* Loading / Error / Table Display */}
        <div className="mt-6">
            {loading ? (
                 <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"><table className="min-w-full"><thead><tr className='bg-gray-50'><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th></tr></thead><tbody><LoadingRow /></tbody></table></div>
            ) : error && !isDeleting ? ( // Use !isDeleting here too
                 <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"><table className="min-w-full"><thead><tr className='bg-gray-50'><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th><th className="px-4 py-3"></th></tr></thead><tbody><ErrorRow message={error} /></tbody></table></div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <AdminTestimonialsTable
                            testimonials={testimonials}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                         />
                         {/* Display NoDataMessage inside table structure if empty and not loading/error */}
                        {!loading && !error && testimonials.length === 0 && (
                           <table className="min-w-full"><tbody><NoDataMessage message="No testimonials created yet." onCreateClick={openCreateModal} /></tbody></table>
                        )}
                    </div>
                 </div>
            )}
        </div>

      {/* Render Modals */}
        <CreateTestimonialModal isOpen={isCreateModalOpen} onClose={closeCreateModal} onSave={handleCreateSuccess} />
        {testimonialToEdit && ( <EditTestimonialModal isOpen={isEditModalOpen} onClose={closeEditModal} testimonial={testimonialToEdit} onSave={handleEditSuccess} /> )}
        <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={confirmDeleteHandler} title="Delete Testimonial" message={`Are you sure you want to delete the testimonial by ${testimonialToDeleteId ? testimonials.find(t => t._id === testimonialToDeleteId)?.author : 'this author'}? This action cannot be undone.`} confirmButtonText="Yes, Delete Testimonial" isDeleting={isDeleting} />
    </div>
  );
}