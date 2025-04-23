// src/components/admin/EditAthleteModal.tsx
'use client';

import { useState, useEffect, Fragment, useRef, ChangeEvent, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import * as athleteService from '@/services/athleteService';

interface EditAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedAthlete: athleteService.Athlete) => void;
  athleteToEdit: athleteService.Athlete | null;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-athlete.png';

// Helper function to get proper image URL
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

export default function EditAthleteModal({ isOpen, onClose, onSuccess, athleteToEdit }: EditAthleteModalProps) {
  const [formData, setFormData] = useState<Partial<athleteService.AthleteFormData>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when athleteToEdit data is available
  useEffect(() => {
    if (athleteToEdit) {
      setFormData({
        name: athleteToEdit.name,
        age: athleteToEdit.age,
        sport: athleteToEdit.sport,
        goalAmount: athleteToEdit.goalAmount,
        story: athleteToEdit.story,
        location: athleteToEdit.location,
        achievements: athleteToEdit.achievements?.join(', ') || '',
        isActive: athleteToEdit.isActive ?? true,
        isFeatured: athleteToEdit.isFeatured ?? false,
      });
      // Use the helper function instead of direct concatenation
      setImagePreview(getImageUrl(athleteToEdit.image));
      setImageFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setFormData({});
      setImageFile(null);
      setImagePreview(null);
      setError(null);
    }
  }, [athleteToEdit]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB).');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If selection cancelled, revert preview to original/current image
      setImagePreview(getImageUrl(athleteToEdit?.image));
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!athleteToEdit) return;
    setError(null);

    // Basic Validation
    if (!formData.name || !formData.age || !formData.sport || !formData.goalAmount || !formData.story || !formData.location) {
      setError("All required fields (*) must be filled.");
      return;
    }
    const ageNum = Number(formData.age);
    const goalNum = Number(formData.goalAmount);
    if (isNaN(ageNum) || ageNum <= 0 || !Number.isInteger(ageNum)) {
      setError("Age must be a valid positive whole number.");
      return;
    }
    if (isNaN(goalNum) || goalNum <= 0) {
      setError("Goal Amount must be a valid positive number.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Updating athlete...');

    try {
      // Prepare data, convert numbers
      const dataToUpdate: Partial<athleteService.AthleteFormData> = {
        ...formData,
        age: ageNum,
        goalAmount: goalNum
      };

      const updatedAthlete = await athleteService.updateAdminAthlete(athleteToEdit._id, dataToUpdate, imageFile);
      toast.dismiss(loadingToast);
      onSuccess(updatedAthlete);
      onClose();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errMsg = err.message || "Failed to update athlete profile.";
      setError(errMsg);
      toast.error(errMsg);
      console.error("Update Athlete Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !athleteToEdit) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}>
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
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button 
                    type="button" 
                    className="rounded-md text-white/70 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" 
                    onClick={onClose} 
                    disabled={isLoading}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-3 mb-4"
                >
                  Edit Athlete: <span className="font-bold text-emerald-300">{athleteToEdit.name}</span>
                </Dialog.Title>
                
                {error && (
                  <div className="my-4 p-3 bg-red-900/40 backdrop-blur-sm text-red-200 border border-red-500/30 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Required Fields */}
                    <div>
                      <label htmlFor="ath-name-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="ath-name-edit" 
                        name="name" 
                        value={formData.name || ''} 
                        onChange={handleChange} 
                        required 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="ath-age-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Age <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="number" 
                        id="ath-age-edit" 
                        name="age" 
                        value={formData.age || ''} 
                        onChange={handleChange} 
                        required 
                        min="1" 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="ath-sport-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Primary Sport <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="ath-sport-edit" 
                        name="sport" 
                        value={formData.sport || ''} 
                        onChange={handleChange} 
                        required 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="ath-location-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Location <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="ath-location-edit" 
                        name="location" 
                        value={formData.location || ''} 
                        onChange={handleChange} 
                        required 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="ath-goal-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Donation Goal (LKR) <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="number" 
                        id="ath-goal-edit" 
                        name="goalAmount" 
                        value={formData.goalAmount || ''} 
                        onChange={handleChange} 
                        required 
                        min="1" 
                        step="100" 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="ath-story-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Athlete's Story <span className="text-red-400">*</span>
                      </label>
                      <textarea 
                        id="ath-story-edit" 
                        name="story" 
                        value={formData.story || ''} 
                        onChange={handleChange} 
                        required 
                        rows={4} 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="ath-achievements-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Achievements (Optional)
                      </label>
                      <input 
                        type="text" 
                        id="ath-achievements-edit" 
                        name="achievements" 
                        value={formData.achievements || ''} 
                        onChange={handleChange} 
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="Comma-separated"
                      />
                      <p className="mt-1 text-xs text-emerald-200/60">Comma-separated list of achievements</p>
                    </div>
                    
                    {/* Image Upload */}
                    <div className="md:col-span-2 mt-2">
                      <label htmlFor="ath-image-edit" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-2">
                        Profile Image
                      </label>
                      <div className="flex items-center space-x-5">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white/10 border border-white/20 shadow-md">
                          {imagePreview ? (
                            <Image 
                              src={imagePreview} 
                              alt="Preview" 
                              width={80} 
                              height={80} 
                              className="h-full w-full object-cover" 
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-white/5">
                              <UserCircleIcon className="h-12 w-12 text-emerald-300/50" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <input 
                            type="file" 
                            id="ath-image-edit" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="sr-only"
                          />
                          <label 
                            htmlFor="ath-image-edit" 
                            className="inline-flex items-center px-3 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none cursor-pointer transition-colors"
                          >
                            <ArrowUpTrayIcon className="h-4 w-4 mr-2 text-emerald-400" />
                            {imageFile ? 'Change Photo' : 'Upload New Photo'}
                          </label>
                          <p className="mt-1 text-xs text-emerald-200/60">
                            {imageFile ? imageFile.name : 'Upload a new image to replace the current one'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Flags */}
                    <div className="md:col-span-2 pt-3 flex items-center space-x-8"> 
                      <div className="flex items-center">
                        <input 
                          id="ath-active-edit" 
                          name="isActive" 
                          type="checkbox" 
                          checked={formData.isActive ?? false} 
                          onChange={handleChange} 
                          className="h-5 w-5 rounded border-white/30 bg-white/5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="ath-active-edit" className="ml-2 text-sm text-white/80">
                          Active Campaign
                        </label>
                      </div> 
                      <div className="flex items-center">
                        <input 
                          id="ath-featured-edit" 
                          name="isFeatured" 
                          type="checkbox" 
                          checked={formData.isFeatured ?? false} 
                          onChange={handleChange} 
                          className="h-5 w-5 rounded border-white/30 bg-white/5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="ath-featured-edit" className="ml-2 text-sm text-white/80">
                          Featured Athlete
                        </label>
                      </div> 
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-8 flex justify-end space-x-4 border-t border-white/10 pt-4"> 
                    <button 
                      type="button" 
                      className="inline-flex justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200" 
                      onClick={onClose} 
                      disabled={isLoading}
                    > 
                      Cancel 
                    </button> 
                    <button 
                      type="submit" 
                      className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200" 
                      disabled={isLoading}
                    > 
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
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