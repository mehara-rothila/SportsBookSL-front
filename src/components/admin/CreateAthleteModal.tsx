// src/components/admin/CreateAthleteModal.tsx
'use client';

import { useState, Fragment, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image'; // Using Next/Image for previews
import toast from 'react-hot-toast';
import * as athleteService from '@/services/athleteService'; // Adjust path

interface CreateAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAthlete: athleteService.Athlete) => void; // Callback after successful creation
}

const initialFormData: athleteService.AthleteFormData = {
    name: '',
    age: '', // Start as string for input binding
    sport: '',
    goalAmount: '', // Start as string for input binding
    story: '',
    location: '',
    achievements: '', // Comma-separated string
    isActive: true,
    isFeatured: false,
};

export default function CreateAthleteModal({ isOpen, onClose, onSuccess }: CreateAthleteModalProps) {
  const [formData, setFormData] = useState<athleteService.AthleteFormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setIsLoading(false); // Ensure loading state is also reset
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input visually
  };

  // Reset form when modal closes
   useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to allow closing animation
      const timer = setTimeout(() => {
        resetForm();
      }, 300); // Adjust delay ms as needed
      return () => clearTimeout(timer);
    }
   }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        // For age and goalAmount, allow typing but validate later
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null); // Clear previous file errors
    if (file) {
        if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { // Example: 5MB limit
            setError('Image file is too large (max 5MB).'); return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => { setImagePreview(reader.result as string); };
        reader.readAsDataURL(file);
    } else { setImageFile(null); setImagePreview(null); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.age || !formData.sport || !formData.goalAmount || !formData.story || !formData.location || !imageFile) {
      setError("Image and all required fields (*) must be filled."); return;
    }
    const ageNum = Number(formData.age);
    const goalNum = Number(formData.goalAmount);
    if (isNaN(ageNum) || ageNum <= 0 || !Number.isInteger(ageNum)) { setError("Age must be a valid positive whole number."); return; }
    if (isNaN(goalNum) || goalNum <= 0) { setError("Goal Amount must be a valid positive number."); return; }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating athlete...');

    try {
        // Send numeric values to service
        const dataToSend: athleteService.AthleteFormData = {
            ...formData,
            age: ageNum,
            goalAmount: goalNum
        };

        const newAthlete = await athleteService.createAdminAthlete(dataToSend, imageFile);
        toast.dismiss(loadingToast);
        onSuccess(newAthlete); // Call parent callback
        onClose(); // Close modal itself
        // Reset happens via useEffect on close
    } catch (err: any) {
        toast.dismiss(loadingToast);
        const errMsg = err.message || "Failed to create athlete profile.";
        setError(errMsg);
        toast.error(errMsg);
        console.error("Create Athlete Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}> {/* Prevent closing while loading */}
        <Transition.Child as={Fragment} /* Backdrop */ enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} /* Panel */ enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                 <div className="absolute top-0 right-0 pt-4 pr-4"> <button type="button" className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" onClick={onClose} disabled={isLoading}><span className="sr-only">Close</span><XMarkIcon className="h-6 w-6" aria-hidden="true" /></button> </div>
                 <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">Add New Athlete Profile</Dialog.Title>

                 <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                     {error && ( <div className="my-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">{error}</div> )}
                     {/* Grid Layout */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                         {/* Required Fields */}
                         <div><label htmlFor="ath-name-create" className="form-label">Full Name <span className="text-red-500">*</span></label><input type="text" id="ath-name-create" name="name" value={formData.name} onChange={handleChange} required className="input-field-admin mt-1"/></div>
                         <div><label htmlFor="ath-age-create" className="form-label">Age <span className="text-red-500">*</span></label><input type="number" id="ath-age-create" name="age" value={formData.age} onChange={handleChange} required min="1" className="input-field-admin mt-1"/></div>
                         <div><label htmlFor="ath-sport-create" className="form-label">Primary Sport <span className="text-red-500">*</span></label><input type="text" id="ath-sport-create" name="sport" value={formData.sport} onChange={handleChange} required className="input-field-admin mt-1"/></div>
                         <div><label htmlFor="ath-location-create" className="form-label">Location (City/Area) <span className="text-red-500">*</span></label><input type="text" id="ath-location-create" name="location" value={formData.location} onChange={handleChange} required className="input-field-admin mt-1"/></div>
                         <div className="md:col-span-2"><label htmlFor="ath-goal-create" className="form-label">Donation Goal (LKR) <span className="text-red-500">*</span></label><input type="number" id="ath-goal-create" name="goalAmount" value={formData.goalAmount} onChange={handleChange} required min="1" step="100" placeholder='e.g., 50000' className="input-field-admin mt-1"/></div>
                         <div className="md:col-span-2"><label htmlFor="ath-story-create" className="form-label">Athlete's Story <span className="text-red-500">*</span></label><textarea id="ath-story-create" name="story" value={formData.story} onChange={handleChange} required rows={4} className="input-field-admin mt-1" placeholder="Tell us about their journey..."/></div>
                         <div className="md:col-span-2"><label htmlFor="ath-achievements-create" className="form-label">Achievements (Optional)</label><input type="text" id="ath-achievements-create" name="achievements" value={formData.achievements} onChange={handleChange} className="input-field-admin mt-1"/><p className="mt-1 text-xs text-gray-500">Comma-separated (e.g., National Champion 2023, Provincial Gold Medalist)</p></div>
                         {/* Image Upload */}
                         <div className="md:col-span-2"> <label htmlFor="ath-image-create" className="form-label">Profile Image <span className="text-red-500">*</span></label> <div className="mt-1 flex items-center space-x-4"> {imagePreview ? ( <Image src={imagePreview} alt="Preview" width={64} height={64} className="h-16 w-16 rounded-md object-cover ring-1 ring-gray-300" /> ) : ( <span className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 text-gray-400 ring-1 ring-gray-300"><ArrowUpTrayIcon className="h-8 w-8" /></span> )} <input type="file" id="ath-image-create" ref={fileInputRef} onChange={handleImageChange} required accept="image/*" className="sr-only"/> <label htmlFor="ath-image-create" className="cursor-pointer rounded-md bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"> Select Photo </label> </div> </div>
                         {/* Status Flags */}
                         <div className="md:col-span-2 flex items-center space-x-6 pt-2"> <div className="flex items-center"><input id="ath-active-create" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/><label htmlFor="ath-active-create" className="ml-2 block text-sm text-gray-900">Active Campaign?</label></div> <div className="flex items-center"><input id="ath-featured-create" name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/><label htmlFor="ath-featured-create" className="ml-2 block text-sm text-gray-900">Featured Athlete?</label></div> </div>
                    </div>
                    {/* Actions */}
                     <div className="mt-6 flex justify-end space-x-3 border-t pt-4"> <button type="button" className="btn-secondary-outline" onClick={onClose} disabled={isLoading}> Cancel </button> <button type="submit" className="btn-primary" disabled={isLoading || !imageFile}> {isLoading ? 'Creating...' : 'Create Athlete'} </button> </div>
                 </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}