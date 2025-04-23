// src/components/admin/CreateTestimonialModal.tsx
'use client';

import { useState, Fragment, useRef, ChangeEvent, FormEvent, useEffect } from 'react'; // <--- ADD useEffect HERE
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import * as testimonialService from '@/services/testimonialService'; // Adjust path

interface CreateTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTestimonial: testimonialService.Testimonial) => void;
}

const initialFormData: testimonialService.TestimonialFormData = {
    content: '',
    author: '',
    role: '',
    isActive: true,
};

export default function CreateTestimonialModal({ isOpen, onClose, onSave }: CreateTestimonialModalProps) {
  const [formData, setFormData] = useState<testimonialService.TestimonialFormData>(initialFormData);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reset form when modal closes (ensure cleanup)
   useEffect(() => {
    if (!isOpen) { resetForm(); }
   }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        // Basic validation (optional: size, type)
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.'); return;
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
    if (!formData.content || !formData.author) { setError("Content and Author are required."); return; }
    setIsLoading(true);
    try {
        const newTestimonial = await testimonialService.createAdminTestimonial(formData, imageFile);
        onSave(newTestimonial);
        onClose(); // Close modal on success
        // Reset happens via useEffect on close
    } catch (err: any) { setError(err.message || "Failed to create testimonial."); }
    finally { setIsLoading(false); }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} /* Backdrop */ enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child as={Fragment} /* Panel */ enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
          <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
             <div className="absolute top-0 right-0 pt-4 pr-4">
                <button type="button" className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" onClick={onClose}>
                    <span className="sr-only">Close</span><XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
             </div>
            <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">Create New Testimonial</Dialog.Title>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
               <div>
                    <label htmlFor="create-test-content" className="block text-sm font-medium text-gray-700">Content <span className="text-red-500">*</span></label>
                    <textarea id="create-test-content" name="content" value={formData.content} onChange={handleChange} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="create-test-author" className="block text-sm font-medium text-gray-700">Author <span className="text-red-500">*</span></label>
                    <input type="text" id="create-test-author" name="author" value={formData.author} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="create-test-role" className="block text-sm font-medium text-gray-700">Author's Role (Optional)</label>
                    <input type="text" id="create-test-role" name="role" value={formData.role || ''} onChange={handleChange} placeholder="e.g., National Athlete, Head Coach" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor="create-test-image" className="block text-sm font-medium text-gray-700">Author Image (Optional)</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {imagePreview ? (
                             <Image src={imagePreview} alt="Preview" width={64} height={64} className="h-16 w-16 rounded-full object-cover ring-1 ring-gray-300" />
                        ) : (
                             <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400"><ArrowUpTrayIcon className="h-8 w-8" /></span>
                        )}
                         <input type="file" id="create-test-image" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="sr-only"/>
                         <label htmlFor="create-test-image" className="cursor-pointer rounded-md bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                           Change
                         </label>
                     </div>
                </div>
                 <div className="flex items-center">
                    <input id="create-test-active" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                    <label htmlFor="create-test-active" className="ml-2 block text-sm text-gray-900">Is Active? (Visible on site)</label>
                 </div>
                {error && ( <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p> )}
                 <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button type="button" className="btn-secondary-outline" onClick={onClose} disabled={isLoading}> Cancel </button>
                    <button type="submit" className="btn-primary" disabled={isLoading}> {isLoading ? 'Creating...' : 'Create Testimonial'} </button>
                </div>
            </form>
          </Dialog.Panel>
        </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}