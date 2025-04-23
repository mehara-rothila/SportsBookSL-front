// src/app/admin/categories/page.tsx
'use client';

import { useState, useEffect, Fragment, useCallback } from 'react'; // Added useCallback
import Link from 'next/link';
import Image from 'next/image'; // Using Next.js Image for potential optimization later
import * as categoryService from '@/services/categoryService'; // Adjust path if needed
import CreateCategoryModal from '@/components/admin/CreateCategoryModal'; // Adjust path if needed
import EditCategoryModal from '@/components/admin/EditCategoryModal';   // Adjust path if needed
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal'; // <--- Import Delete Modal
import toast from 'react-hot-toast'; // <--- Import toast
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Adjusted icons

// --- Interface ---
// Re-import or define if not globally available
interface Category {
    _id: string;
    name: string;
    description: string;
    imageSrc: string;
    slug: string;
    iconSvg?: string;
    createdAt?: string;
    updatedAt?: string;
}

// --- Constants ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/facility-placeholder.jpg'; // Use a relevant fallback

// --- Helper Components ---
const LoadingRow = () => (<tr><td colSpan={5} className="text-center py-10"><div className="inline-block w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div><p className="mt-2 text-sm text-white/80">Loading categories...</p></td></tr>);
const ErrorRow = ({ message }: { message: string | null }) => ( <tr> <td colSpan={5} className="text-center py-10 px-4"> <div className="text-red-600 bg-red-900/20 backdrop-blur-sm p-4 rounded-lg border border-red-500/30 inline-block">Error: {message || 'An unknown error occurred'}</div> </td> </tr> );
// Pass onCreateClick to NoDataMessage
const NoDataMessage = ({ message, onCreateClick }: { message: string; onCreateClick: () => void }) => (
    <tr>
        <td colSpan={5} className="text-center py-16 px-6 bg-white/5 backdrop-blur-sm">
            <svg className="mx-auto h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> </svg>
            <h3 className="mt-2 text-sm font-medium text-white">{message}</h3>
            <p className="mt-1 text-sm text-white/70">Get started by adding the first one.</p>
            <div className="mt-6">
                 <button onClick={onCreateClick} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> New Category
                </button>
            </div>
        </td>
    </tr>
);

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // <-- Delete modal state
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null); // <-- ID to delete
    const [isDeleting, setIsDeleting] = useState(false); // <-- Deleting loading state


    // --- Fetch Categories ---
    const fetchCategories = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setLoading(true);
        setError(null);
        try {
            const data = await categoryService.getCategories(); // Using public route for now
            // If you have an admin route like getAllAdminCategories, use that instead
            // const data = await categoryService.getAllAdminCategories();
            setCategories(data || []);
        } catch (err: any) {
             const msg = err.message || 'Failed to load categories.';
             setError(msg);
             toast.error(msg); // Show error toast
             console.error("Error fetching categories:", err); }
        finally {
            if (showLoadingIndicator) setLoading(false);
        }
    }, []); // Empty dependency array - fetches once on mount

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    // --- Action Handlers ---
    const handleOpenCreateModal = () => { setSelectedCategory(null); setShowCreateModal(true); };
    const handleCloseCreateModal = () => setShowCreateModal(false);
    const handleCreateSave = (newCategory: Category) => {
        setCategories(prev => [newCategory, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`Category "${newCategory.name}" created successfully!`);
    };

    const handleOpenEditModal = (category: Category) => { setSelectedCategory(category); setShowEditModal(true); };
    const handleCloseEditModal = () => { setSelectedCategory(null); setShowEditModal(false); };
    const handleEditSave = (updatedCategory: Category) => {
        setCategories(prev => prev.map(cat => cat._id === updatedCategory._id ? updatedCategory : cat).sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`Category "${updatedCategory.name}" updated successfully!`);
    };

    // --- Delete Handlers ---
    const openDeleteModal = (categoryId: string) => { setCategoryToDeleteId(categoryId); setShowDeleteModal(true); };
    const closeDeleteModal = () => { if (!isDeleting) { setCategoryToDeleteId(null); setShowDeleteModal(false); }};
    const handleDeleteConfirm = async () => {
        if (!categoryToDeleteId) return;
        setError(null); setIsDeleting(true);
        try {
            const categoryName = categories.find(c => c._id === categoryToDeleteId)?.name || categoryToDeleteId;
            await categoryService.deleteCategory(categoryToDeleteId); // Assuming admin service delete exists
            setCategories(prev => prev.filter(cat => cat._id !== categoryToDeleteId));
            toast.success(`Category "${categoryName}" deleted successfully.`);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to delete category.';
            setError(errorMsg);
            toast.error(`Error: ${errorMsg}`);
        } finally { setIsDeleting(false); closeDeleteModal(); } // Close modal regardless
    };

    const handleRefresh = () => { fetchCategories(true); };


    return (
        <div className="p-4 md:p-6">
            {/* Page Header */}
             <div className="mb-6">
                 <h1 className="text-2xl sm:text-3xl font-bold text-white">Category Management</h1>
             </div>

             {/* Action Bar */}
             <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-3">
                 <button onClick={handleRefresh} disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-md text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 relative z-10">
                      <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                 </button>
                  <button
                      onClick={handleOpenCreateModal} // Correct handler assigned
                      type="button" // Explicit button type
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative z-10" // Added z-index just in case
                 >
                     <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Create New Category
                 </button>
             </div>

            {/* Display general error if needed */}
            {error && !loading && !isDeleting && (
                <div className="mb-4 p-4 bg-red-900/20 backdrop-blur-sm text-red-100 border border-red-500/30 rounded-md shadow-sm"> {error} </div>
            )}

            {/* Table/Content Area */}
            <div className="mt-6">
                {loading ? (
                    <div className="bg-white/5 backdrop-blur-sm shadow-md rounded-lg overflow-hidden border border-white/10"><table className="min-w-full"><thead><tr className='bg-emerald-900/30'><th className="px-6 py-3"></th><th className="px-6 py-3"></th><th className="px-6 py-3"></th><th className="px-6 py-3"></th><th className="px-6 py-3"></th></tr></thead><tbody><LoadingRow /></tbody></table></div>
                ) : error && !isDeleting ? (
                    <div className="bg-white/5 backdrop-blur-sm shadow-md rounded-lg overflow-hidden border border-white/10"><table className="min-w-full"><thead><tr className='bg-emerald-900/30'><th className="px-6 py-3"></th><th className="px-6 py-3"></th><th className="px-6 py-3"></th><th className="px-6 py-3"></th><th className="px-6 py-3"></th></tr></thead><tbody><ErrorRow message={error} /></tbody></table></div>
                ) : (
                    <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-emerald-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider w-16">Image</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Slug</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Description</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent divide-y divide-white/10">
                                    {/* Conditional Rendering of No Data Message */}
                                    {!loading && !error && categories.length === 0 && <NoDataMessage message="No categories created yet." onCreateClick={handleOpenCreateModal} />}
                                    {/* Map Categories */}
                                    {!loading && !error && categories.map((category) => (
                                        <tr key={category._id} className={`hover:bg-white/5 transition-colors duration-150 ${isDeleting && categoryToDeleteId === category._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-md object-cover bg-emerald-900/20" src={`${BACKEND_BASE_URL}${category.imageSrc}`} alt={category.name} width={40} height={40} onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm font-medium text-white">{category.name}</div> </td>
                                            <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-white/70 font-mono">{category.slug}</div> </td>
                                            <td className="px-6 py-4"> <div className="text-sm text-white/80 line-clamp-2 max-w-xs" title={category.description}>{category.description}</div> </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => handleOpenEditModal(category)} className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-800/30 transition-colors disabled:opacity-50" disabled={isDeleting && categoryToDeleteId === category._id} title="Edit Category"> <PencilIcon className='h-4 w-4'/> </button>
                                                <button onClick={() => openDeleteModal(category._id)} className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-900/30 transition-colors disabled:opacity-50" disabled={isDeleting && categoryToDeleteId === category._id} title="Delete Category"> {isDeleting && categoryToDeleteId === category._id ? <ArrowPathIcon className='h-4 w-4 animate-spin'/> : <TrashIcon className='h-4 w-4'/>} </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Render Modals */}
             <CreateCategoryModal isOpen={showCreateModal} onClose={handleCloseCreateModal} onSave={handleCreateSave} />
             {selectedCategory && ( // Conditionally render Edit Modal only when a category is selected
                <EditCategoryModal isOpen={showEditModal} onClose={handleCloseEditModal} category={selectedCategory} onSave={handleEditSave} />
             )}
            <ConfirmDeleteModal isOpen={showDeleteModal} onClose={closeDeleteModal} onConfirm={handleDeleteConfirm} title="Delete Category" message={`Are you sure you want to delete the category "${categoryToDeleteId ? categories.find(c => c._id === categoryToDeleteId)?.name : ''}"? This may affect linked facilities/trainers.`} confirmButtonText="Yes, Delete Category" isDeleting={isDeleting} />

        </div>
    );
}