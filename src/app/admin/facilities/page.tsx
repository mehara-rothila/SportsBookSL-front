// src/app/admin/facilities/page.tsx
'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import * as facilityService from '@/services/facilityService';
import CreateFacilityModal from '@/components/admin/CreateFacilityModal';
import EditFacilityModal from '@/components/admin/EditFacilityModal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// --- Interface for Admin Facility List Item ---
interface AdminFacilityListItem {
    _id: string;
    name: string;
    location: string;
    sportTypes: string[];
    pricePerHour?: string;
    rating?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    images?: string[];
    createdAt?: string;
}

// --- Constants ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/facility-placeholder.jpg';

// --- Helper Components ---
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading facilities...</p>
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
    <td colSpan={8} className="text-center py-16 px-6">
      <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <p className="text-emerald-100/70 text-lg font-medium mb-1">{message}</p>
        <p className="text-white/50 text-sm">Add facilities to see them listed here</p>
        <div className="mt-6">
          <button 
            onClick={onCreateClick} 
            type="button" 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> New Facility
          </button>
        </div>
      </div>
    </td>
  </tr>
);

// FIXED: Improved image URL helper function to handle both relative and absolute URLs
const getImageUrl = (path?: string): string => {
  if (!path) return FALLBACK_IMAGE;
  
  // If already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For relative paths from backend
  if (path.startsWith('/')) {
    return `${BACKEND_BASE_URL}${path}`;
  }
  
  return FALLBACK_IMAGE;
};

export default function AdminFacilitiesPage() {
    const [facilities, setFacilities] = useState<AdminFacilityListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<facilityService.FacilityDetails | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Fetch Facilities ---
    const fetchFacilities = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setLoading(true);
        setError(null);
        try {
            const data = await facilityService.getAllAdminFacilities();
            setFacilities(data.facilities || []);
        } catch (err: any) {
            const msg = err.message || 'Failed to load facilities.';
            setError(msg);
            toast.error(msg);
            console.error("Error fetching facilities:", err);
        } finally {
            if (showLoadingIndicator) setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchFacilities(); 
    }, [fetchFacilities]);

    // --- Action Handlers ---
    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };
    
    const closeCreateModal = () => setShowCreateModal(false);
    
    const handleCreateSave = (newFacility: facilityService.FacilityDetails) => {
        const newItem: AdminFacilityListItem = {
            _id: newFacility._id,
            name: newFacility.name,
            location: newFacility.location,
            sportTypes: newFacility.sportTypes,
            pricePerHour: newFacility.pricePerHour,
            rating: newFacility.rating,
            isActive: newFacility.isActive,
            isFeatured: newFacility.isFeatured,
            images: newFacility.images,
            createdAt: newFacility.createdAt
        };
        setFacilities(prev => [newItem, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Facility created successfully!");
    };

    const handleOpenEditModal = async (facilitySummary: AdminFacilityListItem) => {
        setError(null);
        setSelectedFacility(null);
        setShowEditModal(true);
        try {
            const fullFacilityData = await facilityService.getAdminFacilityById(facilitySummary._id);
            setSelectedFacility(fullFacilityData);
        } catch (err: any) {
            const msg = err.message || "Could not load facility details.";
            console.error("Error fetching facility details for edit:", err);
            setError(msg);
            toast.error(msg);
            setShowEditModal(false);
        }
    };
    
    const closeEditModal = () => { 
        setShowEditModal(false); 
        setSelectedFacility(null); 
    };
    
    const handleEditSave = (updatedFacility: facilityService.FacilityDetails) => {
        const updatedItem: AdminFacilityListItem = {
            _id: updatedFacility._id,
            name: updatedFacility.name,
            location: updatedFacility.location,
            sportTypes: updatedFacility.sportTypes,
            pricePerHour: updatedFacility.pricePerHour,
            rating: updatedFacility.rating,
            isActive: updatedFacility.isActive,
            isFeatured: updatedFacility.isFeatured,
            images: updatedFacility.images,
            createdAt: updatedFacility.createdAt
        };
        setFacilities(prev => prev.map(f => f._id === updatedItem._id ? updatedItem : f).sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Facility updated successfully!");
    };

    const openDeleteModal = (facilityId: string) => { 
        setDeletingId(facilityId); 
        setShowDeleteModal(true); 
    };
    
    const closeDeleteModal = () => { 
        if (!isDeleting) { 
            setShowDeleteModal(false); 
            setDeletingId(null); 
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        setError(null);
        setIsDeleting(true);
        try {
            const facilityToDelete = facilities.find(f => f._id === deletingId);
            const response = await facilityService.deleteFacilityByAdmin(deletingId);
            console.log(response.message);
            setFacilities(prev => prev.filter(f => f._id !== deletingId));
            toast.success(`Facility "${facilityToDelete?.name || deletingId}" deleted.`);
        } catch (err: any) {
            console.error("Error deleting facility:", err);
            const errorMsg = err.message || 'Failed to delete facility.';
            setError(errorMsg);
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    const handleRefresh = () => { 
        fetchFacilities(true); 
    };

    return (
        <>
            {/* Using a faux header section outside the main content to fix spacing issues */}
            <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
                <h1 className="text-3xl font-bold text-white">Facility Management</h1>
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
                        onClick={handleOpenCreateModal} 
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10 transition-all duration-200"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Create New Facility
                    </button>
                </div>

                {/* Display General Fetch Error */}
                {error && !loading && !deletingId && !showEditModal && (
                    <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-inner">
                        {error}
                    </div>
                )}

                {/* Table Card */}
                <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/15">
                            <thead className="bg-emerald-900/20 backdrop-blur-sm">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider w-16">
                                        Image
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Sports
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Price/Hr
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
                                {loading && !facilities.length && (
                                    <tr>
                                        <td colSpan={8}>
                                            <LoadingIndicator />
                                        </td>
                                    </tr>
                                )}
                                {!loading && error && (
                                    <tr>
                                        <td colSpan={8}>
                                            <ErrorDisplay message={error} />
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && facilities.length === 0 && 
                                    <NoDataMessage message="No facilities created yet" onCreateClick={handleOpenCreateModal} />
                                }

                                {/* Table Rows */}
                                {!loading && !error && facilities.map((facility) => {
                                    // FIXED: Use the improved image URL helper function
                                    const imageUrl = (facility.images && facility.images.length > 0) 
                                        ? getImageUrl(facility.images[0]) 
                                        : FALLBACK_IMAGE;
                                    return (
                                        <tr key={facility._id} className={`hover:bg-emerald-800/10 transition-colors duration-150 ${deletingId === facility._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-10 w-10 rounded-md overflow-hidden bg-white/10 border border-emerald-500/20 shadow-md">
                                                    <img 
                                                        className="h-full w-full object-cover" 
                                                        src={imageUrl} 
                                                        alt={facility.name} 
                                                        width={40} 
                                                        height={40} 
                                                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-base font-medium text-white">{facility.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white/80">{facility.location}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-emerald-200/80 line-clamp-2 max-w-[150px]">
                                                    {facility.sportTypes?.join(', ') || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white/90">{facility.pricePerHour || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className='flex flex-col gap-1'>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        facility.isActive 
                                                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30' 
                                                            : 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30'
                                                    }`}>
                                                        <span className={`h-2 w-2 rounded-full mr-1.5 ${facility.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                                                        {facility.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {facility.isFeatured && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/30">
                                                            <StarIcon className="w-3 h-3 mr-1"/> Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-white/70">
                                                {facility.rating !== undefined ? facility.rating.toFixed(1) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end space-x-3">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(facility)} 
                                                        className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                                                        disabled={!!deletingId} 
                                                        title="Edit Facility"
                                                    >
                                                        <PencilIcon className='h-5 w-5'/>
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteModal(facility._id)} 
                                                        className="text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                                                        disabled={!!deletingId} 
                                                        title="Delete Facility"
                                                    >
                                                        {deletingId === facility._id ? 
                                                            <ArrowPathIcon className='h-5 w-5 animate-spin'/> : 
                                                            <TrashIcon className='h-5 w-5'/>
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Render Modals */}
                <CreateFacilityModal 
                    isOpen={showCreateModal} 
                    onClose={closeCreateModal} 
                    onSave={handleCreateSave} 
                />
                <EditFacilityModal 
                    isOpen={showEditModal} 
                    onClose={closeEditModal} 
                    facility={selectedFacility} 
                    onSave={handleEditSave} 
                />
                <ConfirmDeleteModal 
                    isOpen={showDeleteModal} 
                    onClose={closeDeleteModal} 
                    onConfirm={handleDeleteConfirm} 
                    title="Delete Facility" 
                    message="Are you sure you want to delete this facility? This will also remove associated images and cannot be undone."
                    confirmButtonText="Yes, Delete Facility" 
                    isDeleting={isDeleting} 
                />
            </div>
        </>
    );
}