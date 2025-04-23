// src/app/admin/trainers/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import * as trainerService from '@/services/trainerService';
import CreateTrainerModal from '@/components/admin/CreateTrainerModal';
import EditTrainerModal from '@/components/admin/EditTrainerModal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

// Define type for list items
type AdminTrainerListItem = trainerService.AdminTrainerListItem;
type Trainer = trainerService.Trainer; // Full trainer type for editing

// --- Constants ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const DEFAULT_TRAINER_IMAGE = '/images/default-trainer.png';

// --- Helper Components ---
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading trainers...</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string | null }) => (
  <div className="text-center py-12 px-4 bg-red-900/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-500/30 shadow-inner">
    <p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p>
    <p className="mb-4">{message || 'An unknown error occurred'}</p>
  </div>
);

const NoDataMessage = ({ message, onCreateClick }: { message: string; onCreateClick: () => void }) => (
  <tr>
    <td colSpan={9} className="text-center py-16 px-6">
      <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p className="text-emerald-100/70 text-lg font-medium mb-1">{message}</p>
        <p className="text-white/50 text-sm">Add trainers to see them listed here</p>
        <div className="mt-6">
          <button 
            onClick={onCreateClick} 
            type="button" 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> New Trainer
          </button>
        </div>
      </div>
    </td>
  </tr>
);

export default function AdminTrainersPage() {
    const [trainers, setTrainers] = useState<AdminTrainerListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [trainerToDeleteId, setTrainerToDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Trainers Function
    const fetchTrainers = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setIsLoading(true);
        setError(null);
        try {
            const data = await trainerService.getAllAdminTrainers();
            setTrainers(data.trainers || []);
        } catch (err: any) {
            const msg = err.message || 'Failed to fetch trainers.';
            setError(msg);
            toast.error(msg);
            console.error("Fetch Trainers Error:", err);
        } finally {
            if (showLoadingIndicator) setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchTrainers(); }, [fetchTrainers]);

    // Edit Handler
    const handleEdit = async (trainerId: string) => {
        setError(null);
        setSelectedTrainer(null);
        setIsEditModalOpen(true);
        try {
            const fullTrainerData = await trainerService.getAdminTrainerById(trainerId);
            setSelectedTrainer(fullTrainerData);
        } catch (err: any) {
            const msg = err.message || 'Failed to fetch trainer details.';
            setError(msg);
            toast.error(msg);
            console.error("Edit Trainer Fetch Error:", err);
            setIsEditModalOpen(false);
        }
    };

    // Delete Handler
    const openDeleteModal = (trainerId: string) => {
        setTrainerToDeleteId(trainerId);
        setIsDeleteModalOpen(true);
    };
    
    const closeDeleteModal = () => {
        if(!isDeleting) {
            setIsDeleteModalOpen(false);
            setTrainerToDeleteId(null);
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!trainerToDeleteId) return;
        setIsDeleting(true);
        setError(null);
        try {
            const trainerName = trainers.find(t => t._id === trainerToDeleteId)?.name || trainerToDeleteId;
            await trainerService.deleteTrainerByAdmin(trainerToDeleteId);
            setTrainers(prev => prev.filter(t => t._id !== trainerToDeleteId));
            toast.success(`Trainer "${trainerName}" deleted successfully.`);
        } catch (err: any) {
            const msg = err.message || 'Failed to delete trainer.';
            setError(msg);
            toast.error(msg);
            console.error("Delete Trainer Error:", err);
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };

    // Modal Close Handlers
    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedTrainer(null);
    };
    
    const handleSuccess = () => {
        handleModalClose();
        fetchTrainers(false);
    };
    
    const handleRefresh = () => {
        fetchTrainers(true);
    };

    // Image URL Helper
    const getFullImageUrl = (relativePath?: string): string => {
        if (!relativePath || relativePath === '/images/default-trainer.png') {
            return DEFAULT_TRAINER_IMAGE;
        }
        if (relativePath.startsWith('/uploads/')) {
            return `${BACKEND_BASE_URL}${relativePath}`;
        }
        console.warn(`Unexpected trainer image path: "${relativePath}"`);
        return DEFAULT_TRAINER_IMAGE;
    };

    return (
        <>
            {/* Using a faux header section outside the main content to fix spacing issues */}
            <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
                <h1 className="text-3xl font-bold text-white">Trainer Management</h1>
            </div>

            {/* Main content container */}
            <div className="relative w-full">
                {/* Action buttons - absolutely positioned relative to page top */}
                <div className="absolute top-[-80px] right-0 flex flex-col sm:flex-row justify-end items-center gap-3">
                    <button 
                        onClick={handleRefresh} 
                        disabled={isLoading} 
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-md text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 relative z-10 transition-all duration-200"
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add New Trainer
                    </button>
                </div>

                {/* Error Display */}
                {error && !isLoading && !isDeleting && (
                    <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-inner">
                        {error}
                    </div>
                )}

                {/* Table Section */}
                <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                    {isLoading && !trainers.length ? (
                        <LoadingIndicator />
                    ) : error && !isLoading && !trainers.length ? (
                        <ErrorDisplay message={error} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/15">
                                <thead className="bg-emerald-900/20 backdrop-blur-sm">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Specialization
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Rate (LKR/hr)
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
                                    {trainers.length === 0 && (
                                        <NoDataMessage 
                                            message="No trainers added yet." 
                                            onCreateClick={() => setIsCreateModalOpen(true)} 
                                        />
                                    )}
                                    
                                    {trainers.map((trainer) => {
                                        const imageUrl = getFullImageUrl(trainer.profileImage);
                                        return (
                                            <tr key={trainer._id} className="hover:bg-emerald-800/10 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 border border-emerald-500/20 shadow-md">
                                                        <img 
                                                            src={imageUrl} 
                                                            alt={trainer.name} 
                                                            className="h-full w-full object-cover" 
                                                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_TRAINER_IMAGE; }} 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-base font-medium text-white">{trainer.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-emerald-200/80">{trainer.specialization}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white/80">{trainer.location}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white/90">{trainer.hourlyRate?.toLocaleString() ?? 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white/70">
                                                        {trainer.rating?.toFixed(1) ?? 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        trainer.isActive === false 
                                                            ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30' 
                                                            : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                                                    }`}>
                                                        <span className={`h-2 w-2 rounded-full mr-1.5 ${
                                                            trainer.isActive === false ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
                                                        }`}></span>
                                                        {trainer.isActive === false ? 'Inactive' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white/70">
                                                        {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEdit(trainer._id)}
                                                            className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                                                            title="Edit Trainer"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(trainer._id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                                                            title="Delete Trainer"
                                                        >
                                                            {isDeleting && trainerToDeleteId === trainer._id ? (
                                                                <ArrowPathIcon className='h-5 w-5 animate-spin' />
                                                            ) : (
                                                                <TrashIcon className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <CreateTrainerModal 
                    isOpen={isCreateModalOpen} 
                    onClose={handleModalClose} 
                    onSuccess={handleSuccess} 
                />
                
                {selectedTrainer && (
                    <EditTrainerModal 
                        isOpen={isEditModalOpen} 
                        onClose={handleModalClose} 
                        onSuccess={handleSuccess} 
                        trainerToEdit={selectedTrainer} 
                    />
                )}
                
                <ConfirmDeleteModal 
                    isOpen={isDeleteModalOpen} 
                    onClose={closeDeleteModal} 
                    onConfirm={handleDeleteConfirm} 
                    title="Delete Trainer" 
                    message={`Are you sure you want to delete the trainer "${trainers.find(t=>t._id===trainerToDeleteId)?.name || ''}"? This cannot be undone.`} 
                    confirmButtonText="Yes, Delete Trainer" 
                    isDeleting={isDeleting} 
                />
            </div>
        </>
    );
}