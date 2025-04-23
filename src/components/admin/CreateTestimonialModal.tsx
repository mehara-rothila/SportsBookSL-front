// src/components/admin/CreateTestimonialModal.tsx
'use client';

import { useState, Fragment, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import * as testimonialService from '@/services/testimonialService';

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

const FALLBACK_IMAGE = '/images/default-avatar.png';

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
        // Enhanced validation for file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        if (!validImageTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        
        // Check file size (max 5MB)
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
    } else { 
        setImageFile(null); 
        setImagePreview(null); 
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.content || !formData.author) { 
        setError("Content and Author are required."); 
        return; 
    }
    
    setIsLoading(true);
    
    try {
        console.log('Creating testimonial with image:', imageFile ? imageFile.name : 'No image');
        const newTestimonial = await testimonialService.createAdminTestimonial(formData, imageFile);
        onSave(newTestimonial);
        onClose(); // Close modal on success
        // Reset happens via useEffect on close
    } catch (err: any) { 
        setError(err.message || "Failed to create testimonial."); 
    } finally { 
        setIsLoading(false); 
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-4 flex justify-between items-center"
                >
                  Create New Testimonial
                  <button onClick={onClose} className="text-white/70 hover:text-white/90 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
                  {error && (
                    <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="content" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Content <span className="text-red-400">*</span>
                    </label>
                    <textarea 
                      id="content" 
                      name="content" 
                      value={formData.content} 
                      onChange={handleChange} 
                      required 
                      rows={4} 
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="author" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Author <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="author" 
                      name="author" 
                      value={formData.author} 
                      onChange={handleChange} 
                      required 
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Author's Role (Optional)
                    </label>
                    <input 
                      type="text" 
                      id="role" 
                      name="role" 
                      value={formData.role || ''} 
                      onChange={handleChange} 
                      placeholder="e.g., National Athlete, Head Coach" 
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="authorImage" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Author Image (Optional)
                    </label>
                    <div className="flex items-center mt-1">
                      <label className="block w-full relative">
                        <input
                          type="file"
                          name="authorImage"
                          id="authorImage"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full h-10 flex items-center justify-center border border-white/20 rounded-md bg-white/5 text-white/70 hover:bg-white/10 transition-colors">
                          <PaperClipIcon className="h-5 w-5 mr-2 text-emerald-400" />
                          <span>Select Author Image</span>
                        </div>
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-3">
                        <p className="text-xs text-emerald-200/60 mb-2">Preview:</p>
                        <div className="h-24 w-24 rounded-full overflow-hidden border border-white/20">
                          <img 
                            src={imagePreview} 
                            alt="Image Preview" 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-white/80">
                      Is Active? (Visible on site)
                    </label>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-3 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={onClose}
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
                          Creating...
                        </div>
                      ) : 'Create Testimonial'}
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