// src/components/admin/CreateFacilityModal.tsx
'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import * as facilityService from '@/services/facilityService'; // Assuming FacilityFormData is exported here
import { PlusIcon, XMarkIcon, PaperClipIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CreateFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFacility: facilityService.FacilityDetails) => void;
}

// --- FIXED: Use the correct type name FacilityFormData ---
const initialFormData: facilityService.FacilityFormData = {
    name: '',
    location: '',
    address: '',
    description: '',
    longDescription: '',
    sportTypes: '', // Keep as string for input, convert in service if needed
    amenities: '', // Keep as string for input, convert in service if needed
    pricePerHour: '', // String for display
    pricePerHourValue: 0, // Number for backend/filtering
    pricePerDay: undefined,
    contactPhone: '',
    contactEmail: '',
    contactWebsite: '',
    mapLat: undefined,
    mapLng: undefined,
    isNew: false,
    isPremium: false,
    isFeatured: false,
    // Add any other fields defined in FacilityFormData if missing
};

export default function CreateFacilityModal({ isOpen, onClose, onSave }: CreateFacilityModalProps) {
  // --- FIXED: Use the correct type name FacilityFormData ---
  const [formData, setFormData] = useState<facilityService.FacilityFormData>(initialFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setImageFiles([]);
      setImagePreviews([]);
      setError(null);
      setIsLoading(false);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
         // Handle empty string for optional numbers, otherwise convert to number
         setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    }
     else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
        const selectedFiles = Array.from(files);
        if (selectedFiles.length > 5) {
            setError("You can upload a maximum of 5 images.");
            setImageFiles([]);
            setImagePreviews([]);
             if(fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        if(validFiles.length !== selectedFiles.length) {
            setError("Please select only image files.");
             if(fileInputRef.current) fileInputRef.current.value = "";
             return;
        }

        setImageFiles(validFiles);

        const newPreviews: string[] = [];
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length) {
                    setImagePreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
        if (validFiles.length === 0) {
            setImagePreviews([]);
        }
    } else {
        setImageFiles([]);
        setImagePreviews([]);
    }
  };

  const removeImage = (index: number) => {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      if (imageFiles.length === 1 && fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleSubmit = async () => {
    setError(null);
    // Basic required field check - Ensure checks match FacilityFormData fields
    if (!formData.name || !formData.location || !formData.address || !formData.description || !formData.sportTypes || !formData.pricePerHour || formData.pricePerHourValue === undefined || formData.pricePerHourValue < 0 || imageFiles.length === 0) {
      setError("Please fill in all required fields (*) and upload at least one image.");
      return;
    }

    setIsLoading(true);

    try {
      // Pass the formData (which should now match FacilityFormData type)
      const newFacility = await facilityService.createFacility(formData, imageFiles);
      onSave(newFacility);
      onClose();
    } catch (err: any) {
      console.error("Error creating facility:", err);
      setError(err.message || "Failed to create facility.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment}>
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-4 mb-6">
                  Create New Facility
                </Dialog.Title>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">

                    {/* Basic Info Section */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Basic Information</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            <div className="sm:col-span-6">
                                <label htmlFor="fac_name" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Facility Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  id="fac_name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  required
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_location" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Location (City/Area) <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="location"
                                  id="fac_location"
                                  value={formData.location}
                                  onChange={handleChange}
                                  required
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_address" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Full Address <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="address"
                                  id="fac_address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  required
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="fac_description" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Short Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                  name="description"
                                  id="fac_description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  rows={2}
                                  required
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="fac_longDescription" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Long Description
                                </label>
                                <textarea
                                  name="longDescription"
                                  id="fac_longDescription"
                                  value={formData.longDescription}
                                  onChange={handleChange}
                                  rows={4}
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Sports & Pricing Section */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Sports & Pricing</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            <div className="sm:col-span-6">
                                <label htmlFor="fac_sportTypes" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Sport Types <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="sportTypes"
                                  id="fac_sportTypes"
                                  value={formData.sportTypes}
                                  onChange={handleChange}
                                  required
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <p className="mt-1 text-xs text-emerald-200/60">Comma-separated (e.g., Cricket, Swimming)</p>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_pricePerHour" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Price Display (e.g., Rs. 5,000/hr) <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="pricePerHour"
                                  id="fac_pricePerHour"
                                  value={formData.pricePerHour}
                                  onChange={handleChange}
                                  required
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_pricePerHourValue" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Price Value (Number only) <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="number"
                                  name="pricePerHourValue"
                                  id="fac_pricePerHourValue"
                                  value={formData.pricePerHourValue} // Directly use the number state
                                  onChange={handleChange}
                                  required
                                  min="0"
                                  step="100"
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <p className="mt-1 text-xs text-emerald-200/60">e.g., 5000 (for filtering)</p>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_pricePerDay" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Price Per Day (Optional)
                                </label>
                                <input
                                  type="number"
                                  name="pricePerDay"
                                  id="fac_pricePerDay"
                                  value={formData.pricePerDay ?? ''} // Handle undefined for input
                                  onChange={handleChange}
                                  min="0"
                                  step="1000"
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Details & Features Section */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Details & Features</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            <div className="sm:col-span-6">
                                <label htmlFor="fac_amenities" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Amenities
                                </label>
                                <input
                                  type="text"
                                  name="amenities"
                                  id="fac_amenities"
                                  value={formData.amenities}
                                  onChange={handleChange}
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <p className="mt-1 text-xs text-emerald-200/60">Comma-separated (e.g., Parking, Wifi)</p>
                            </div>
                            <div className="sm:col-span-6">
                                <label className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Flags
                                </label>
                                <div className="mt-2 space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                          type="checkbox"
                                          name="isNew"
                                          checked={formData.isNew}
                                          onChange={handleChange}
                                          className="rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                        />
                                        <span className="ml-2 text-sm text-white/80">Is New?</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                          type="checkbox"
                                          name="isPremium"
                                          checked={formData.isPremium}
                                          onChange={handleChange}
                                          className="rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                        />
                                        <span className="ml-2 text-sm text-white/80">Is Premium?</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                          type="checkbox"
                                          name="isFeatured"
                                          checked={formData.isFeatured}
                                          onChange={handleChange}
                                          className="rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                        />
                                        <span className="ml-2 text-sm text-white/80">Is Featured?</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Contact & Location Section */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Contact & Location</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_contactPhone" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Contact Phone
                                </label>
                                <input
                                  type="tel"
                                  name="contactPhone"
                                  id="fac_contactPhone"
                                  value={formData.contactPhone}
                                  onChange={handleChange}
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_contactEmail" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Contact Email
                                </label>
                                <input
                                  type="email"
                                  name="contactEmail"
                                  id="fac_contactEmail"
                                  value={formData.contactEmail}
                                  onChange={handleChange}
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="fac_contactWebsite" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Website URL
                                </label>
                                <input
                                  type="url"
                                  name="contactWebsite"
                                  id="fac_contactWebsite"
                                  value={formData.contactWebsite}
                                  onChange={handleChange}
                                  placeholder="https://..."
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_mapLat" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Map Latitude
                                </label>
                                <input
                                  type="number"
                                  name="mapLat"
                                  id="fac_mapLat"
                                  value={formData.mapLat ?? ''} // Handle undefined for input
                                  onChange={handleChange}
                                  step="any"
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="fac_mapLng" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                                  Map Longitude
                                </label>
                                <input
                                  type="number"
                                  name="mapLng"
                                  id="fac_mapLng"
                                  value={formData.mapLng ?? ''} // Handle undefined for input
                                  onChange={handleChange}
                                  step="any"
                                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Images Section */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Images</legend>
                        <div className="pt-2">
                            <label htmlFor="fac_images" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                              Facility Images (Select up to 5) <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center mt-1">
                              <label className="block w-full relative">
                                <input
                                  type="file"
                                  id="fac_images"
                                  ref={fileInputRef}
                                  onChange={handleImageChange}
                                  required
                                  multiple
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-full h-10 flex items-center justify-center border border-white/20 rounded-md bg-white/5 text-white/70 hover:bg-white/10 transition-colors">
                                  <PaperClipIcon className="h-5 w-5 mr-2 text-emerald-400" />
                                  <span>Select Images</span>
                                </div>
                              </label>
                            </div>
                            <p className="mt-1 text-xs text-emerald-200/60">First image will be the main display image.</p>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {imagePreviews.map((previewUrl, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img
                                              src={previewUrl}
                                              alt={`Preview ${index + 1}`}
                                              className="h-full w-full object-cover rounded-md border border-white/20"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => removeImage(index)}
                                              className="absolute top-0 right-0 m-1 p-0.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <XMarkIcon className="h-3 w-3"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Error Display */}
                    {error && (
                      <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-end space-x-3 border-t border-white/10 pt-5">
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
                      {isLoading ? 'Creating...' : 'Create Facility'}
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