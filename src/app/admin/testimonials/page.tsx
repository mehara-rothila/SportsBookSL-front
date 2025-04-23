// src/app/admin/testimonials/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as testimonialService from '@/services/testimonialService';
import AdminTestimonialsTable from '@/components/admin/AdminTestimonialsTable';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import CreateTestimonialModal from '@/components/admin/CreateTestimonialModal';
import EditTestimonialModal from '@/components/admin/EditTestimonialModal';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';

// Interface for testimonial data used in the page
type Testimonial = testimonialService.Testimonial;

// Helper Components
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading testimonials...</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string | null }) => (
  <div className="text-center py-12 px-4 bg-red-900/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-500/30 shadow-inner">
    <p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p>
    <p className="mb-4">{message || 'An unknown error occurred'}</p>
  </div>
);

// Updated NoDataMessage with emerald styling
const NoDataMessage = ({ message, onCreateClick }: { message: string; onCreateClick: () => void }) => (
  <tr>
    <td colSpan={6} className="text-center py-16 px-6">
      <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        <p className="text-emerald-100/70 text-lg font-medium mb-1">{message}</p>
        <p className="text-white/50 text-sm">Get started by adding the first one.</p>
        <div className="mt-6">
          <button 
            onClick={onCreateClick} 
            type="button" 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> New Testimonial
          </button>
        </div>
      </div>
    </td>
  </tr>
);

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [testimonialToEdit, setTestimonialToEdit] = useState<Testimonial | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testimonialToDeleteId, setTestimonialToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch testimonials function - with better error handling
  const fetchTestimonials = useCallback(async (showLoadingIndicator = true) => { 
    if (showLoadingIndicator) setLoading(true); 
    setError(null); 
    try { 
      const data = await testimonialService.getAllAdminTestimonials(); 
      setTestimonials(data || []); 
    } catch (err: any) { 
      const fetchErrorMsg = err.message || 'Failed to load testimonials'; 
      setError(fetchErrorMsg); 
      toast.error(fetchErrorMsg); 
      setTestimonials([]); 
    } finally { 
      if (showLoadingIndicator) setLoading(false); 
    } 
  }, []);
  
  useEffect(() => { 
    fetchTestimonials(true); 
  }, [fetchTestimonials]);
  
  const handleRefresh = () => { 
    fetchTestimonials(true); 
  };
  
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  
  const handleCreateSuccess = (newTestimonial: Testimonial) => { 
    setTestimonials(prev => [newTestimonial, ...prev]); 
    toast.success('Testimonial created successfully!'); 
  };
  
  const openEditModal = (testimonial: Testimonial) => { 
    setTestimonialToEdit(testimonial); 
    setIsEditModalOpen(true); 
  };
  
  const closeEditModal = () => { 
    setIsEditModalOpen(false); 
    setTestimonialToEdit(null); 
  };
  
  const handleEditSuccess = (updatedTestimonial: Testimonial) => { 
    setTestimonials(prev => prev.map(t => t._id === updatedTestimonial._id ? updatedTestimonial : t)); 
    toast.success('Testimonial updated successfully!'); 
  };
  
  const openDeleteModal = (testimonialId: string) => { 
    setTestimonialToDeleteId(testimonialId); 
    setIsDeleteModalOpen(true); 
  };
  
  const closeDeleteModal = () => { 
    if (!isDeleting) { 
      setIsDeleteModalOpen(false); 
      setTestimonialToDeleteId(null); 
    } 
  };
  
  const confirmDeleteHandler = async () => { 
    if (!testimonialToDeleteId) return; 
    
    setIsDeleting(true); 
    setError(null); 
    
    try { 
      await testimonialService.deleteAdminTestimonial(testimonialToDeleteId); 
      setTestimonials(prev => prev.filter(t => t._id !== testimonialToDeleteId)); 
      toast.success('Testimonial deleted successfully!'); 
    } catch (err: any) { 
      const deleteErrorMsg = `Error deleting testimonial: ${err.message}`; 
      setError(deleteErrorMsg); 
      toast.error(deleteErrorMsg); 
    } finally { 
      setIsDeleting(false); 
      closeDeleteModal();
    } 
  };

  // --- Render ---
  return (
    <div className="p-4 md:p-6">
      {/* Using a faux header section outside the main content to fix spacing issues */}
      <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
        <h1 className="text-3xl font-bold text-white">Testimonial Management</h1>
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
          <button 
            onClick={openCreateModal} 
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add New Testimonial
          </button>
        </div>

        {/* Error Display */}
        {error && !loading && !isDeleting && (
          <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-inner">
            {error}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
          {loading && !testimonials.length ? (
            <LoadingIndicator />
          ) : error && !loading && !testimonials.length ? (
            <ErrorDisplay message={error} />
          ) : (
            <div className="overflow-x-auto">
              <AdminTestimonialsTable
                testimonials={testimonials}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
              {/* Display NoDataMessage inside table structure if empty and not loading/error */}
              {!loading && !error && testimonials.length === 0 && (
                <table className="min-w-full">
                  <tbody>
                    <NoDataMessage message="No testimonials created yet." onCreateClick={openCreateModal} />
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateTestimonialModal 
          isOpen={isCreateModalOpen} 
          onClose={closeCreateModal} 
          onSave={handleCreateSuccess} 
        />
        
        {testimonialToEdit && (
          <EditTestimonialModal 
            isOpen={isEditModalOpen} 
            onClose={closeEditModal} 
            testimonial={testimonialToEdit} 
            onSave={handleEditSuccess} 
          />
        )}
        
        <ConfirmDeleteModal 
          isOpen={isDeleteModalOpen} 
          onClose={closeDeleteModal} 
          onConfirm={confirmDeleteHandler} 
          title="Delete Testimonial" 
          message={`Are you sure you want to delete the testimonial by ${testimonialToDeleteId ? testimonials.find(t => t._id === testimonialToDeleteId)?.author : 'this author'}? This action cannot be undone.`} 
          confirmButtonText="Yes, Delete Testimonial" 
          isDeleting={isDeleting} 
        />
      </div>
    </div>
  );
}