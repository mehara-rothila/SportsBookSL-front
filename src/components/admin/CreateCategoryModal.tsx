// src/components/admin/CreateCategoryModal.tsx
'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import * as categoryService from '@/services/categoryService'; // Adjust path if needed

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCategory: categoryService.Category) => void; // Callback after successful creation
}

export default function CreateCategoryModal({ isOpen, onClose, onSave }: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconSvg, setIconSvg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSlug('');
      setDescription('');
      setIconSvg('');
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Add validation if needed (size, type)
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-generate or suggest slug based on name, force lowercase, replace spaces with hyphens
    const value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(value);
  };

   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-generate slug from name if slug field is empty
    if (!slug) {
        setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name || !slug || !description || !imageFile) {
      setError("Name, Slug, Description, and Image are required.");
      return;
    }
     if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    setIsLoading(true);
    const categoryData: categoryService.CategoryFormData = { name, slug, description, iconSvg };

    try {
      const newCategory = await categoryService.createCategory(categoryData, imageFile);
      onSave(newCategory); // Pass the new category back to the parent
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error("Error creating category:", err);
      setError(err.message || "Failed to create category.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} /* Backdrop */ >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} /* Modal Panel */ >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-3 mb-4">
                  Create New Category
                </Dialog.Title>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="mt-4 space-y-4">
                    {/* Form Fields */}
                    <div>
                      <label htmlFor="create-cat-name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                      <input type="text" id="create-cat-name" value={name} onChange={handleNameChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor="create-cat-slug" className="block text-sm font-medium text-gray-700">Slug <span className="text-red-500">*</span></label>
                      <input type="text" id="create-cat-slug" value={slug} onChange={handleSlugChange} required pattern="[a-z0-9-]+" title="Lowercase letters, numbers, hyphens only" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                      <p className="mt-1 text-xs text-gray-500">Unique URL identifier (auto-generated from name, can be edited).</p>
                    </div>
                    <div>
                      <label htmlFor="create-cat-desc" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                      <textarea id="create-cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor="create-cat-svg" className="block text-sm font-medium text-gray-700">Icon SVG (Optional)</label>
                      <textarea id="create-cat-svg" value={iconSvg} onChange={(e) => setIconSvg(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono text-xs" placeholder="<svg>...</svg>"/>
                    </div>
                    <div>
                      <label htmlFor="create-cat-image" className="block text-sm font-medium text-gray-700">Image <span className="text-red-500">*</span></label>
                      <input type="file" id="create-cat-image" ref={fileInputRef} onChange={handleImageChange} required accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-auto rounded-md object-cover"/>}
                    </div>

                    {/* Error Display */}
                    {error && ( <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p> )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button type="button" className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" onClick={onClose} disabled={isLoading}> Cancel </button>
                    <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50" disabled={isLoading}> {isLoading ? 'Creating...' : 'Create Category'} </button>
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