// src/components/admin/EditTrainerModal.tsx
import { useState, useEffect, Fragment, ChangeEvent, FormEvent, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import * as trainerService from '@/services/trainerService';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface EditTrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Callback after successful update
    trainerToEdit: trainerService.Trainer | null;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-trainer.png';

// Helper function to get proper image URL - FIXED to match pattern in page.tsx
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${BACKEND_BASE_URL}${path}`;
  // Default to fallback image for unexpected paths
  console.warn(`Unexpected trainer image path: "${path}"`);
  return FALLBACK_IMAGE;
};

export default function EditTrainerModal({ isOpen, onClose, onSuccess, trainerToEdit }: EditTrainerModalProps) {
    const [formData, setFormData] = useState<Partial<trainerService.TrainerFormData>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (trainerToEdit) {
            // Pre-fill form data when trainerToEdit changes
            setFormData({
                name: trainerToEdit.name,
                specialization: trainerToEdit.specialization,
                sports: trainerToEdit.sports?.join(', ') || '', // Join array for input
                location: trainerToEdit.location,
                hourlyRate: trainerToEdit.hourlyRate,
                experienceYears: trainerToEdit.experienceYears,
                bio: trainerToEdit.bio,
                languages: trainerToEdit.languages?.join(', ') || '', // Join array
                availability: trainerToEdit.availability?.join(', ') || '', // Join array
                isActive: trainerToEdit.isActive ?? true,
            });
            // Use helper function for image URL
            setImagePreview(getImageUrl(trainerToEdit.profileImage));
            setImageFile(null); // Reset file input
            setError(null);
            
            // Reset file input value when trainer changes
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            // Reset form if no trainer is selected
            resetForm();
        }
    }, [trainerToEdit]); // Dependency array includes trainerToEdit

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
         const { name, value, type } = e.target;
         if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
         } else {
             setFormData(prev => ({ ...prev, [name]: value }));
         }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Add validation for file type and size
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
                // Reset the file input
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            
            // Optional: Check file size (e.g., max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError('Image is too large. Maximum size is 5MB.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null); // Clear any errors when file is valid
        } else {
            // Use helper function for original image
            setImageFile(null);
            setImagePreview(getImageUrl(trainerToEdit?.profileImage));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!trainerToEdit) return;

        setIsLoading(true);
        setError(null);

        try {
             // Prepare data, ensuring numbers are numbers
            const dataToSend: Partial<trainerService.TrainerFormData> = {
                ...formData,
                hourlyRate: formData.hourlyRate !== undefined ? Number(formData.hourlyRate) || 0 : undefined,
                experienceYears: formData.experienceYears !== undefined ? Number(formData.experienceYears) || 0 : undefined,
            };
            
            // Keep strings as-is - the service will handle conversion to arrays
            // Type checking shows that the API expects these to remain as strings
            
            console.log('Submitting trainer update with image:', imageFile ? imageFile.name : 'No image');
            await trainerService.updateTrainerByAdmin(trainerToEdit._id, dataToSend, imageFile);
            setIsLoading(false);
            onSuccess(); // Call success callback
        } catch (err: any) {
            console.error("Update Trainer Error:", err);
            setError(err.message || 'Failed to update trainer.');
            setIsLoading(false);
        }
    };

     const resetForm = () => {
        setFormData({});
        setImageFile(null);
        setImagePreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const closeModal = () => {
        if (isLoading) return;
        // Resetting form state is handled by useEffect when trainerToEdit becomes null
        onClose();
    };

    if (!trainerToEdit) return null; // Don't render if no trainer selected

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal Content */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-4 flex justify-between items-center"
                                >
                                    Edit Trainer: <span className="font-bold text-emerald-300">{trainerToEdit.name}</span>
                                    <button onClick={closeModal} className="text-white/70 hover:text-white/90 transition-colors">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </Dialog.Title>
                                
                                <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
                                    {error && (
                                        <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                                            {error}
                                        </div>
                                    )}

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="edit-name" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Name <span className="text-red-400">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                id="edit-name" 
                                                value={formData.name ?? ''} 
                                                onChange={handleInputChange} 
                                                required 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Specialization */}
                                        <div>
                                            <label htmlFor="edit-specialization" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Specialization <span className="text-red-400">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="specialization" 
                                                id="edit-specialization" 
                                                value={formData.specialization ?? ''} 
                                                onChange={handleInputChange} 
                                                required 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Sports */}
                                        <div>
                                            <label htmlFor="edit-sports" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Sports (comma-separated) <span className="text-red-400">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="sports" 
                                                id="edit-sports" 
                                                value={formData.sports ?? ''} 
                                                onChange={handleInputChange} 
                                                required 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Location */}
                                        <div>
                                            <label htmlFor="edit-location" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Location <span className="text-red-400">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="location" 
                                                id="edit-location" 
                                                value={formData.location ?? ''} 
                                                onChange={handleInputChange} 
                                                required 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Hourly Rate */}
                                        <div>
                                            <label htmlFor="edit-hourlyRate" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Hourly Rate (LKR) <span className="text-red-400">*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                name="hourlyRate" 
                                                id="edit-hourlyRate" 
                                                value={formData.hourlyRate ?? ''} 
                                                onChange={handleInputChange} 
                                                required 
                                                min="0" 
                                                step="100" 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Experience Years */}
                                        <div>
                                            <label htmlFor="edit-experienceYears" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Experience (Years) <span className="text-red-400">*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                name="experienceYears" 
                                                id="edit-experienceYears" 
                                                value={formData.experienceYears ?? ''} 
                                                onChange={handleInputChange} 
                                                required 
                                                min="0" 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Languages */}
                                        <div>
                                            <label htmlFor="edit-languages" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Languages (comma-separated)
                                            </label>
                                            <input 
                                                type="text" 
                                                name="languages" 
                                                id="edit-languages" 
                                                value={formData.languages ?? ''} 
                                                onChange={handleInputChange} 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        
                                        {/* Availability */}
                                        <div>
                                            <label htmlFor="edit-availability" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                                Availability (comma-separated)
                                            </label>
                                            <input 
                                                type="text" 
                                                name="availability" 
                                                id="edit-availability" 
                                                value={formData.availability ?? ''} 
                                                onChange={handleInputChange} 
                                                className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label htmlFor="edit-bio" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                            Bio <span className="text-red-400">*</span>
                                        </label>
                                        <textarea 
                                            name="bio" 
                                            id="edit-bio" 
                                            value={formData.bio ?? ''} 
                                            onChange={handleInputChange} 
                                            required 
                                            rows={4} 
                                            className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        ></textarea>
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label htmlFor="edit-profileImage" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                            Profile Image (Upload new to replace)
                                        </label>
                                        <div className="flex items-center mt-1">
                                            <label className="block w-full relative">
                                                <input
                                                    type="file"
                                                    name="profileImage"
                                                    id="edit-profileImage"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="w-full h-10 flex items-center justify-center border border-white/20 rounded-md bg-white/5 text-white/70 hover:bg-white/10 transition-colors">
                                                    <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-emerald-400" />
                                                    <span>Select New Profile Image</span>
                                                </div>
                                            </label>
                                        </div>
                                        
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <p className="text-xs text-emerald-200/60 mb-2">Current/Preview Image:</p>
                                                <div className="h-24 w-24 rounded-md overflow-hidden border border-white/20">
                                                    <Image 
                                                        src={imagePreview} 
                                                        alt="Image Preview" 
                                                        width={100} 
                                                        height={100} 
                                                        className="h-full w-full object-cover" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Is Active Toggle */}
                                    <div className="flex items-center">
                                        <input
                                            id="edit-isActive"
                                            name="isActive"
                                            type="checkbox"
                                            checked={formData.isActive ?? true}
                                            onChange={handleInputChange}
                                            className="rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                        />
                                        <label htmlFor="edit-isActive" className="ml-2 text-sm text-white/80">
                                            Active Trainer
                                        </label>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-8 flex justify-end space-x-3 border-t border-white/10 pt-5">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isLoading}
                                            className="inline-flex justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </div>
                                            ) : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}