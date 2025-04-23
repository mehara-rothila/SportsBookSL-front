// src/app/admin/athletes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as athleteService from '@/services/athleteService'; // Adjust path
import AdminAthletesTable from '@/components/admin/AdminAthletesTable'; // Adjust path
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal'; // Adjust path
import CreateAthleteModal from '@/components/admin/CreateAthleteModal'; // Adjust path
import EditAthleteModal from '@/components/admin/EditAthleteModal';   // Adjust path
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';

// Import specific type for the list items
type AdminAthleteListItem = athleteService.AdminAthleteListItem;
// Import the full type for editing
type Athlete = athleteService.Athlete;

// Helper Components - Transparent Versions
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading athletes...</p>
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

const NoDataDisplay = ({ message, onCreateClick }: { message: string, onCreateClick: () => void }) => (
  <div className="text-center py-16 px-6 bg-white/5 backdrop-blur-sm rounded-lg shadow border border-white/10">
    <svg className="mx-auto h-12 w-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-white">{message}</h3>
    <p className="mt-1 text-sm text-emerald-200/70">Add the first one to get started.</p>
    <div className="mt-6">
      <button 
        onClick={onCreateClick} 
        type="button" 
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10"
      >
        <PlusIcon className="-ml-1 mr-2 h-5 w-5"/> Add Athlete
      </button>
    </div>
  </div>
);

export default function AdminAthletesPage() {
    const [athletes, setAthletes] = useState<AdminAthleteListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [athleteToEdit, setAthleteToEdit] = useState<Athlete | null>(null); // Use full Athlete type
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [athleteToDeleteId, setAthleteToDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Athletes
    const fetchAthletes = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true); setError(null);
        try {
            const data = await athleteService.getAllAdminAthletes();
            setAthletes(data || []);
        } catch (err: any) { const msg = err.message || 'Failed to load athletes'; setError(msg); toast.error(msg); setAthletes([]); }
        finally { if (showLoading) setLoading(false); }
    }, []);

    useEffect(() => { fetchAthletes(); }, [fetchAthletes]);

    // Handlers
    const handleRefresh = () => fetchAthletes(true);
    const openCreateModal = () => { setIsCreateModalOpen(true); };
    const closeCreateModal = () => { setIsCreateModalOpen(false); };
    const handleCreateSuccess = (newAthlete: Athlete) => { fetchAthletes(false); toast.success(`Athlete "${newAthlete.name}" created.`); };

    const openEditModal = async (athleteId: string) => {
         setError(null); setAthleteToEdit(null); setIsEditModalOpen(true);
         try {
            const fullData = await athleteService.getAdminAthleteById(athleteId);
            setAthleteToEdit(fullData);
         } catch (err: any) { const msg = err.message || 'Failed to load athlete details'; setError(msg); toast.error(msg); setIsEditModalOpen(false); }
    };
    const closeEditModal = () => { setAthleteToEdit(null); setIsEditModalOpen(false); };
    const handleEditSuccess = (updatedAthlete: Athlete) => { fetchAthletes(false); toast.success(`Athlete "${updatedAthlete.name}" updated.`); };

    const openDeleteModal = (id: string) => { setAthleteToDeleteId(id); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { if (!isDeleting) { setAthleteToDeleteId(null); setIsDeleteModalOpen(false); }};
    const handleDeleteConfirm = async () => {
        if (!athleteToDeleteId) return; setIsDeleting(true); setError(null);
        try {
            const athleteName = athletes.find(a => a._id === athleteToDeleteId)?.name || athleteToDeleteId;
            await athleteService.deleteAdminAthlete(athleteToDeleteId);
            toast.success(`Athlete "${athleteName}" deleted.`); fetchAthletes(false);
        } catch (err: any) { const msg = err.message || 'Failed to delete athlete.'; setError(msg); toast.error(msg); }
        finally { setIsDeleting(false); closeDeleteModal(); }
    };

    return (
        <>
            {/* Using a faux header section outside the main content to fix spacing issues */}
            <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
                <h1 className="text-3xl font-bold text-white">Athlete Management</h1>
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
                        type="button" 
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add New Athlete
                    </button>
                </div>

                {/* Error Display */}
                {error && !loading && !isDeleting && (
                    <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-inner">
                        {error}
                    </div>
                )}

                {/* Athletes Table or Content Section */}
                <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                    {loading ? (
                        <LoadingIndicator />
                    ) : error ? (
                        <ErrorDisplay message={error} onRetry={handleRefresh} />
                    ) : (
                        <>
                            {!athletes || athletes.length === 0 ? (
                                <NoDataDisplay message="No athlete profiles found." onCreateClick={openCreateModal}/>
                            ) : (
                                <AdminAthletesTable 
                                    athletes={athletes} 
                                    onEdit={openEditModal} 
                                    onDelete={openDeleteModal} 
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Modals */}
                <CreateAthleteModal isOpen={isCreateModalOpen} onClose={closeCreateModal} onSuccess={handleCreateSuccess} />
                {athleteToEdit && (
                    <EditAthleteModal 
                        isOpen={isEditModalOpen} 
                        onClose={closeEditModal} 
                        onSuccess={handleEditSuccess} 
                        athleteToEdit={athleteToEdit} 
                    />
                )}
                <ConfirmDeleteModal 
                    isOpen={isDeleteModalOpen} 
                    onClose={closeDeleteModal} 
                    onConfirm={handleDeleteConfirm} 
                    title="Delete Athlete" 
                    message={`Are you sure you want to delete the athlete "${athleteToDeleteId ? athletes.find(a => a._id === athleteToDeleteId)?.name : ''}"? Their profile and donation progress will be removed.`} 
                    confirmButtonText="Yes, Delete Athlete" 
                    isDeleting={isDeleting} 
                />
            </div>
        </>
    );
}