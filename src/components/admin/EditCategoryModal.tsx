// src/components/admin/EditCategoryModal.tsx
'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import * as categoryService from '@/services/categoryService'; // Adjust path if needed

// Interface for the category data
interface Category {
    _id: string;
    name: string;
    description: string;
    imageSrc: string;
    slug: string;
    iconSvg?: string;
}

// Interface for the props the modal accepts
interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null; // The category being edited
  onSave: (updatedCategory: Category) => void; // Function to call after successful save
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

// Helper function to get proper image URL
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

export default function EditCategoryModal({ isOpen, onClose, category, onSave }: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconSvg, setIconSvg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when the category prop changes
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setDescription(category.description || '');
      setIconSvg(category.iconSvg || '');
      // Use helper function for image URL
      setImagePreview(category.imageSrc ? getImageUrl(category.imageSrc) : null);
      setImageFile(null);
      setError(null);
    } else {
        setName(''); setSlug(''); setDescription(''); setIconSvg(''); setImageFile(null); setImagePreview(null);
    }
  }, [category]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Add validation if needed
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      // Use helper function for original image
      setImagePreview(category?.imageSrc ? getImageUrl(category.imageSrc) : null);
      setImageFile(null);
    }
  };

   const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(value);
  };

  const handleSubmit = async () => {
    if (!category) return;
    setError(null);
    if (!name || !slug || !description) { setError("Name, Slug, and Description are required."); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setError('Slug can only contain lowercase letters, numbers, and hyphens.'); return; }

    setIsLoading(true);

    const categoryData: Partial<categoryService.CategoryFormData> = {};
    if (name !== category.name) categoryData.name = name;
    if (slug !== category.slug) categoryData.slug = slug;
    if (description !== category.description) categoryData.description = description;
    if (iconSvg !== (category.iconSvg || '')) categoryData.iconSvg = iconSvg;

    if (Object.keys(categoryData).length === 0 && !imageFile) {
        setError("No changes detected."); setIsLoading(false); return;
    }

    try {
      const updatedCategory = await categoryService.updateCategory(category._id, categoryData, imageFile);
      onSave(updatedCategory);
      onClose();
    } catch (err: any) { setError(err.message || "Failed to update category."); }
    finally { setIsLoading(false); }
  };

  if (!isOpen || !category) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      {/* Use Dialog without 'as' prop */}
      <Dialog className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment} // Keep Fragment here
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Wrap backdrop in a div */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment} // Keep Fragment here
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Dialog.Panel renders a div by default, which is fine */}
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-3 mb-4">
                  Edit Category: <span className="font-bold text-primary-700">{category.name}</span>
                </Dialog.Title>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="mt-4 space-y-4">
                        {/* Form Fields */}
                        <div>
                            <label htmlFor="edit-cat-name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                            <input type="text" id="edit-cat-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="edit-cat-slug" className="block text-sm font-medium text-gray-700">Slug <span className="text-red-500">*</span></label>
                            <input type="text" id="edit-cat-slug" value={slug} onChange={handleSlugChange} required pattern="[a-z0-9-]+" title="Lowercase letters, numbers, hyphens only" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                            <p className="mt-1 text-xs text-gray-500">Unique URL identifier.</p>
                        </div>
                        <div>
                            <label htmlFor="edit-cat-desc" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                            <textarea id="edit-cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="edit-cat-svg" className="block text-sm font-medium text-gray-700">Icon SVG (Optional)</label>
                            <textarea id="edit-cat-svg" value={iconSvg} onChange={(e) => setIconSvg(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono text-xs" placeholder="<svg>...</svg>"/>
                        </div>
                        <div>
                            <label htmlFor="edit-cat-image" className="block text-sm font-medium text-gray-700">Change Image (Optional)</label>
                            <input type="file" id="edit-cat-image" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-auto rounded-md object-cover border"/>}
                            {!imagePreview && <p className="text-xs text-gray-500 mt-1">No image selected or available.</p>}
                        </div>

                        {/* Error Display */}
                        {error && ( <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p> )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                        <button type="button" className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" onClick={onClose} disabled={isLoading}> Cancel </button>
                        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50" disabled={isLoading}> {isLoading ? 'Saving...' : 'Save Changes'} </button>
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