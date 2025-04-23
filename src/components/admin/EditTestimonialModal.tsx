// src/components/admin/EditTestimonialModal.tsx
'use client';

import { useState, useEffect, Fragment, useRef, ChangeEvent, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import * as testimonialService from '@/services/testimonialService';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-avatar.png';

// Helper function to get proper image URL
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

interface EditTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: testimonialService.Testimonial | null;
  onSave: (updatedTestimonial: testimonialService.Testimonial) => void;
}

export default function EditTestimonialModal({ isOpen, onClose, testimonial, onSave }: EditTestimonialModalProps) {
  const [formData, setFormData] = useState<Partial<testimonialService.TestimonialFormData>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (testimonial) {
      setFormData({
        content: testimonial.content || '',
        author: testimonial.author || '',
        role: testimonial.role || '',
        isActive: testimonial.isActive === undefined ? true : testimonial.isActive,
      });
      // Use helper function for image URL
      setImagePreview(getImageUrl(testimonial.imageUrl));
      setImageFile(null); // Clear any previously selected file
      setError(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setFormData({});
      setImageFile(null);
      setImagePreview(null);
      setError(null);
    }
  }, [testimonial]);

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
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Use helper function for original image
      setImagePreview(getImageUrl(testimonial?.imageUrl));
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!testimonial) return;
    setError(null);
    if (!formData.content || !formData.author) {
      setError("Content and Author are required.");
      return;
    }
    setIsLoading(true);
    try {
      const updatedTestimonial = await testimonialService.updateAdminTestimonial(testimonial._id, formData, imageFile);
      onSave(updatedTestimonial);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update testimonial.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !testimonial) return null;

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
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md text-white/70 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-3 mb-4"
                >
                  Edit Testimonial
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="edit-test-content" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Content <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="edit-test-content"
                      name="content"
                      value={formData.content || ''}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-test-author" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Author <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-test-author"
                      name="author"
                      value={formData.author || ''}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-test-role" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Author's Role (Optional)
                    </label>
                    <input
                      type="text"
                      id="edit-test-role"
                      name="role"
                      value={formData.role || ''}
                      onChange={handleChange}
                      placeholder="e.g., National Athlete, Head Coach"
                      className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-test-image" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                      Author Image (Optional: Upload new to replace)
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 border border-emerald-500/20 shadow-md">
                        <Image
                          src={imagePreview || FALLBACK_IMAGE}
                          alt="Current/Preview"
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                        />
                      </div>
                      
                      <div>
                        <input
                          type="file"
                          id="edit-test-image"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="sr-only"
                        />
                        <label
                          htmlFor="edit-test-image"
                          className="inline-flex items-center px-3 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none cursor-pointer transition-colors"
                        >
                          <ArrowUpTrayIcon className="h-4 w-4 mr-2 text-emerald-400" />
                          Change Image
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="edit-test-active"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive ?? false}
                      onChange={handleChange}
                      className="rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500"
                    />
                    <label htmlFor="edit-test-active" className="ml-2 text-sm text-white/80">
                      Is Active? (Visible on site)
                    </label>
                  </div>
                  
                  {error && (
                    <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                      {error}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end space-x-3 border-t border-white/10 pt-4">
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
                      {isLoading ? 'Saving...' : 'Save Changes'}
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