// src/components/admin/EditFacilityModal.tsx
'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import * as facilityService from '@/services/facilityService'; // Adjust path if needed
import { XMarkIcon, PaperClipIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

// Use the detailed interface for the facility prop
type FacilityData = facilityService.FacilityDetails;

interface EditFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: FacilityData | null; // The facility being edited (full details)
  onSave: (updatedFacility: FacilityData) => void; // Callback after successful save
}

// Interface for operating hours state
interface OperatingHourState {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

// Initial empty state matching the service interface for form data
const initialFormData: Partial<facilityService.FacilityFormData> = {
    name: '', location: '', address: '', description: '', longDescription: '',
    sportTypes: '', amenities: '', pricePerHour: '', pricePerHourValue: 0,
    pricePerDay: undefined, contactPhone: '', contactEmail: '', contactWebsite: '',
    mapLat: undefined, mapLng: undefined, isNew: false, isPremium: false, isFeatured: false, isActive: true,
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function EditFacilityModal({ isOpen, onClose, facility, onSave }: EditFacilityModalProps) {
  const [formData, setFormData] = useState<Partial<facilityService.FacilityFormData>>(initialFormData);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // Only store NEW files to upload
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Show existing or new previews
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]); // Keep track of original paths
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clearExistingImages, setClearExistingImages] = useState(false); // Flag to clear images on save

  // State for operating hours
  const [hoursData, setHoursData] = useState<OperatingHourState[]>(
      daysOfWeek.map(day => ({ day, open: '', close: '', isClosed: true }))
  );

  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

  // Pre-fill form when the facility prop changes
  useEffect(() => {
    if (facility && isOpen) {
      console.log("Editing Facility Data:", facility);
      setFormData({
        name: facility.name || '',
        location: facility.location || '',
        address: facility.address || '',
        description: facility.description || '',
        longDescription: facility.longDescription || '',
        sportTypes: facility.sportTypes?.join(', ') || '',
        amenities: facility.amenities?.join(', ') || '',
        pricePerHour: facility.pricePerHour || '',
        pricePerHourValue: facility.pricePerHourValue || 0,
        pricePerDay: facility.pricePerDay ?? undefined, // Ensure it defaults to undefined if null/missing
        contactPhone: facility.contactInfo?.phone || '',
        contactEmail: facility.contactInfo?.email || '',
        contactWebsite: facility.contactInfo?.website || '',
        mapLat: facility.mapLocation?.lat ?? undefined, // Ensure it defaults to undefined if null/missing
        mapLng: facility.mapLocation?.lng ?? undefined, // Ensure it defaults to undefined if null/missing
        isNew: facility.isNew || false,
        isPremium: facility.isPremium || false,
        isFeatured: facility.isFeatured || false,
        isActive: facility.isActive === undefined ? true : facility.isActive,
      });
      const currentImageUrls = facility.images?.map(img => img.startsWith('http') ? img : `${BACKEND_BASE_URL}${img}`) || [];
      setExistingImagePaths(facility.images || []);
      setImagePreviews(currentImageUrls); // Show existing images
      setNewImageFiles([]); // Clear new files selection
      setClearExistingImages(false); // Reset clear flag
      setError(null);

      // Populate hoursData
      const initialHours = daysOfWeek.map(day => {
          const existing = facility?.operatingHours?.find(h => h.day === day);
          return {
              day: day,
              open: existing?.open || '',
              close: existing?.close || '',
              isClosed: !existing // Assume closed if no entry exists or if entry exists but has no time
          };
      });
      setHoursData(initialHours);

    } else if (!isOpen) {
        // Reset form when closed
        setFormData(initialFormData);
        setNewImageFiles([]);
        setImagePreviews([]);
        setExistingImagePaths([]);
        setError(null);
        setIsLoading(false);
        setClearExistingImages(false);
        setHoursData(daysOfWeek.map(day => ({ day, open: '', close: '', isClosed: true }))); // Reset hours
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [facility, isOpen, BACKEND_BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
         setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

   // Function to handle changes in operating hours inputs or checkbox
    const handleHoursChange = (index: number, field: 'open' | 'close' | 'isClosed', value: string | boolean) => {
        setHoursData(prev => {
            const newHours = [...prev];
            if (field === 'isClosed') {
                newHours[index].isClosed = !!value;
                // Optionally clear times if closed
                if (newHours[index].isClosed) {
                    newHours[index].open = '';
                    newHours[index].close = '';
                }
            } else if (field === 'open' || field === 'close') {
                newHours[index][field] = String(value);
                // Uncheck 'isClosed' if a time is entered
                if (String(value).trim() !== '') {
                     newHours[index].isClosed = false;
                }
            }
            return newHours;
        });
    };


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
        const selectedFiles = Array.from(files);
        if (selectedFiles.length > 5) {
            setError("Max 5 images allowed.");
            setNewImageFiles([]);
            setImagePreviews(existingImagePaths.map(p => p.startsWith('http') ? p : `${BACKEND_BASE_URL}${p}`)); // Revert preview
            if(fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        if(validFiles.length !== selectedFiles.length) {
            setError("Please select only image files.");
            if(fileInputRef.current) fileInputRef.current.value = "";
             return;
        }

        setNewImageFiles(validFiles); // Store new files
        setClearExistingImages(true); // Assume replacement if new files are selected

        // Generate previews for NEW files
        const newPreviewsArray: string[] = [];
        let filesRead = 0;
        if (validFiles.length === 0) {
            // If selection cleared, revert to existing images preview
            setImagePreviews(existingImagePaths.map(p => p.startsWith('http') ? p : `${BACKEND_BASE_URL}${p}`));
            setClearExistingImages(false); // Not clearing if no new files selected
            return;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviewsArray.push(reader.result as string);
                filesRead++;
                if (filesRead === validFiles.length) {
                    setImagePreviews(newPreviewsArray); // Show only new previews
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        // If file input is cleared completely
        setNewImageFiles([]);
        setImagePreviews(existingImagePaths.map(p => p.startsWith('http') ? p : `${BACKEND_BASE_URL}${p}`)); // Revert preview
        setClearExistingImages(false);
    }
  };

  const removeNewImagePreview = (index: number) => {
      const updatedFiles = newImageFiles.filter((_, i) => i !== index);
      const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
      setNewImageFiles(updatedFiles);
      setImagePreviews(updatedPreviews);

      // If all new previews removed, clear the file input and revert to showing existing images
      if (updatedFiles.length === 0) {
           if (fileInputRef.current) fileInputRef.current.value = "";
           setImagePreviews(existingImagePaths.map(p => p.startsWith('http') ? p : `${BACKEND_BASE_URL}${p}`));
           setClearExistingImages(false); // Since no new files are staged, don't clear existing
      }
  };

  const handleSubmit = async () => {
    if (!facility) return;
    setError(null);

    // Basic required field check
    if (!formData.name || !formData.location || !formData.address || !formData.description || !formData.sportTypes || !formData.pricePerHour || formData.pricePerHourValue === undefined || formData.pricePerHourValue < 0) {
      setError("Please fill in all required fields (*).");
      return;
    }

    // If replacing images, ensure new files are selected
    if (clearExistingImages && newImageFiles.length === 0 && existingImagePaths.length > 0) { // Also check if there were existing images to clear
        setError("Please select new images if you intend to replace the existing ones, or revert image changes.");
        return;
    }

    setIsLoading(true);

    // Prepare only changed data compared to the original facility object
    const dataToUpdate: Partial<facilityService.FacilityFormData> = {};
    (Object.keys(formData) as Array<keyof facilityService.FacilityFormData>).forEach(key => {
        let originalValue: any;
        // Extract original value based on potentially nested structure
        if (key === 'contactPhone') originalValue = facility.contactInfo?.phone;
        else if (key === 'contactEmail') originalValue = facility.contactInfo?.email;
        else if (key === 'contactWebsite') originalValue = facility.contactInfo?.website;
        else if (key === 'mapLat') originalValue = facility.mapLocation?.lat;
        else if (key === 'mapLng') originalValue = facility.mapLocation?.lng;
        else if (key === 'sportTypes') originalValue = facility.sportTypes?.join(', ');
        else if (key === 'amenities') originalValue = facility.amenities?.join(', ');
        else if (key === 'isActive' && facility[key] === undefined) originalValue = true; // Default original isActive to true if undefined
        else originalValue = facility[key as keyof FacilityData];

        // Handle comparison carefully for different types
        const formValue = formData[key];
        // Define default value for comparison based on type
        let defaultValue: string | number | boolean | undefined;
        if (typeof formValue === 'boolean') defaultValue = false;
        else if (typeof formValue === 'number') defaultValue = undefined; // Or 0 if that makes more sense
        else defaultValue = '';

        const originalCompValue = originalValue ?? defaultValue;
        const formCompValue = formValue ?? defaultValue;

        // Compare as strings for simplicity, ensures types like number/undefined are compared correctly
        if (String(formCompValue) !== String(originalCompValue)) {
             // --- FIXED LINE BELOW ---
             // Use type assertion 'as any' because TypeScript struggles with the dynamic key/value types here
             dataToUpdate[key] = formValue as any;
        }
    });

    // Prepare operating hours data for comparison and potential sending
     const operatingHoursToSave = hoursData
        .filter(h => !h.isClosed && h.open && h.close) // Only include valid, open hours
        .map(h => ({ day: h.day, open: h.open, close: h.close }));

    // Compare current state hours with original hours stringified for change detection
    const currentHoursString = JSON.stringify(operatingHoursToSave.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day))); // Sort for consistent comparison
    const originalHours = (facility.operatingHours || []).map(({ day, open, close }) => ({ day, open, close })); // Ensure same structure
    const originalHoursString = JSON.stringify(originalHours.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day))); // Sort for consistent comparison

    const hoursChanged = currentHoursString !== originalHoursString;

    // Only call API if text data changed OR new images were selected/cleared OR hours changed
    if (Object.keys(dataToUpdate).length === 0 && newImageFiles.length === 0 && !clearExistingImages && !hoursChanged) {
        setError("No changes detected.");
        setIsLoading(false);
        return;
    }

    try {
      // Add operating hours string to the data sent to the service ONLY IF they changed
      const finalDataToSend = {
          ...dataToUpdate,
          // Send the stringified JSON only if hours actually changed
          ...(hoursChanged && { operatingHours: currentHoursString }),
      };

      // Debug log before sending
      // console.log("Data being sent to updateFacilityByAdmin:", { facilityId: facility._id, data: finalDataToSend, images: newImageFiles, clearExisting: clearExistingImages });

      const updatedFacility = await facilityService.updateFacilityByAdmin(
          facility._id,
          finalDataToSend, // Send the prepared data object
          newImageFiles,
          clearExistingImages // This flag tells the backend whether to wipe old images
      );
      onSave(updatedFacility);
      onClose();
    } catch (err: any) {
      console.error("Error updating facility:", err);
      // Attempt to parse backend validation errors if possible
       let errorMessage = "Failed to update facility.";
       if (err.response?.data?.message) {
           errorMessage = err.response.data.message;
       } else if (err.message) {
           errorMessage = err.message;
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render null if modal is closed or no facility data (shouldn't happen if logic is correct)
  if (!isOpen || !facility) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}> {/* Prevent closing while loading */}
        {/* Backdrop */}
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-white border-b border-white/10 pb-4 mb-6 flex justify-between items-center"
                >
                  <span>Edit Facility: <span className="font-bold text-emerald-300">{facility.name}</span></span>
                   <button
                       type="button"
                       className="rounded-md p-1 text-emerald-400 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                       onClick={onClose}
                       disabled={isLoading}
                   >
                       <span className="sr-only">Close</span>
                       <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                   </button>
                </Dialog.Title>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">

                    {/* --- Basic Info Section --- */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Basic Information</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            {/* Name, Location, Address, Descriptions... */}
                            <div className="sm:col-span-6"> <label htmlFor="fac_name_edit" className="form-label-admin"> Facility Name <span className="text-red-400">*</span> </label> <input type="text" name="name" id="fac_name_edit" value={formData.name} onChange={handleChange} required className="input-field-admin"/> </div>
                            <div className="sm:col-span-3"> <label htmlFor="fac_location_edit" className="form-label-admin"> Location (City/Area) <span className="text-red-400">*</span> </label> <input type="text" name="location" id="fac_location_edit" value={formData.location} onChange={handleChange} required className="input-field-admin"/> </div>
                            <div className="sm:col-span-3"> <label htmlFor="fac_address_edit" className="form-label-admin"> Full Address <span className="text-red-400">*</span> </label> <input type="text" name="address" id="fac_address_edit" value={formData.address} onChange={handleChange} required className="input-field-admin"/> </div>
                            <div className="sm:col-span-6"> <label htmlFor="fac_description_edit" className="form-label-admin"> Short Description <span className="text-red-400">*</span> </label> <textarea name="description" id="fac_description_edit" value={formData.description} onChange={handleChange} rows={2} required className="input-field-admin"/> </div>
                            <div className="sm:col-span-6"> <label htmlFor="fac_longDescription_edit" className="form-label-admin"> Long Description </label> <textarea name="longDescription" id="fac_longDescription_edit" value={formData.longDescription} onChange={handleChange} rows={4} className="input-field-admin"/> </div>
                        </div>
                    </fieldset>

                    {/* --- Sports & Pricing Section --- */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Sports & Pricing</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            {/* Sport Types, Price Display, Price Value, Price Per Day... */}
                             <div className="sm:col-span-6"> <label htmlFor="fac_sportTypes_edit" className="form-label-admin"> Sport Types <span className="text-red-400">*</span> </label> <input type="text" name="sportTypes" id="fac_sportTypes_edit" value={formData.sportTypes} onChange={handleChange} required className="input-field-admin"/> <p className="input-help-text-admin">Comma-separated</p> </div>
                             <div className="sm:col-span-3"> <label htmlFor="fac_pricePerHour_edit" className="form-label-admin"> Price Display <span className="text-red-400">*</span> </label> <input type="text" name="pricePerHour" id="fac_pricePerHour_edit" value={formData.pricePerHour} onChange={handleChange} required className="input-field-admin"/> </div>
                             <div className="sm:col-span-3"> <label htmlFor="fac_pricePerHourValue_edit" className="form-label-admin"> Price Value (Number) <span className="text-red-400">*</span> </label> <input type="number" name="pricePerHourValue" id="fac_pricePerHourValue_edit" value={formData.pricePerHourValue} onChange={handleChange} required min="0" step="100" className="input-field-admin"/> </div>
                             <div className="sm:col-span-3"> <label htmlFor="fac_pricePerDay_edit" className="form-label-admin"> Price Per Day </label> <input type="number" name="pricePerDay" id="fac_pricePerDay_edit" value={formData.pricePerDay ?? ''} onChange={handleChange} min="0" step="1000" className="input-field-admin"/> </div>
                        </div>
                    </fieldset>

                    {/* --- Details & Features Section --- */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Details & Features</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            {/* Amenities, Flags... */}
                            <div className="sm:col-span-6"> <label htmlFor="fac_amenities_edit" className="form-label-admin"> Amenities </label> <input type="text" name="amenities" id="fac_amenities_edit" value={formData.amenities} onChange={handleChange} className="input-field-admin"/> <p className="input-help-text-admin">Comma-separated</p> </div>
                            <div className="sm:col-span-6"> <label className="form-label-admin"> Flags </label> <div className="mt-2 flex flex-wrap gap-4"> {/* isActive, isNew, isPremium, isFeatured Checkboxes */} <label className="checkbox-label-admin"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="checkbox-admin"/>Is Active?</label> <label className="checkbox-label-admin"><input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="checkbox-admin"/>Is New?</label> <label className="checkbox-label-admin"><input type="checkbox" name="isPremium" checked={formData.isPremium} onChange={handleChange} className="checkbox-admin"/>Is Premium?</label> <label className="checkbox-label-admin"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="checkbox-admin"/>Is Featured?</label> </div> </div>
                        </div>
                    </fieldset>

                    {/* --- Operating Hours Section --- */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Operating Hours</legend>
                        <div className="space-y-3 pt-2">
                            {hoursData.map((h, index) => (
                                <div key={h.day} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                                    <span className="text-sm font-medium text-white/90 col-span-1 sm:col-span-1">{h.day}</span>
                                    <input
                                        type="time"
                                        value={h.open}
                                        onChange={(e) => handleHoursChange(index, 'open', e.target.value)}
                                        disabled={h.isClosed}
                                        className={`col-span-1 rounded-md bg-white/5 border-white/20 shadow-sm px-2 py-1 text-white focus:ring-emerald-500 focus:border-emerald-500 text-sm ${h.isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <input
                                        type="time"
                                        value={h.close}
                                        onChange={(e) => handleHoursChange(index, 'close', e.target.value)}
                                        disabled={h.isClosed}
                                        className={`col-span-1 rounded-md bg-white/5 border-white/20 shadow-sm px-2 py-1 text-white focus:ring-emerald-500 focus:border-emerald-500 text-sm ${h.isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <div className="col-span-1 flex items-center justify-end">
                                         <input
                                             type="checkbox"
                                             checked={h.isClosed}
                                             onChange={(e) => handleHoursChange(index, 'isClosed', e.target.checked)}
                                             className="h-4 w-4 rounded border-white/30 bg-white/5 text-emerald-600 focus:ring-emerald-500"
                                             id={`closed-${h.day}-edit`}
                                         />
                                         <label htmlFor={`closed-${h.day}-edit`} className="ml-2 text-xs text-white/80 cursor-pointer">Closed</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    {/* --- Contact & Location Section --- */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Contact & Location</legend>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 pt-2">
                            {/* Contact Phone, Email, Website, Lat, Lng... */}
                            <div className="sm:col-span-3"> <label htmlFor="fac_contactPhone_edit" className="form-label-admin"> Contact Phone </label> <input type="tel" name="contactPhone" id="fac_contactPhone_edit" value={formData.contactPhone} onChange={handleChange} className="input-field-admin"/> </div>
                            <div className="sm:col-span-3"> <label htmlFor="fac_contactEmail_edit" className="form-label-admin"> Contact Email </label> <input type="email" name="contactEmail" id="fac_contactEmail_edit" value={formData.contactEmail} onChange={handleChange} className="input-field-admin"/> </div>
                            <div className="sm:col-span-6"> <label htmlFor="fac_contactWebsite_edit" className="form-label-admin"> Website URL </label> <input type="url" name="contactWebsite" id="fac_contactWebsite_edit" value={formData.contactWebsite} onChange={handleChange} placeholder="https://..." className="input-field-admin"/> </div>
                            <div className="sm:col-span-3"> <label htmlFor="fac_mapLat_edit" className="form-label-admin"> Map Latitude </label> <input type="number" name="mapLat" id="fac_mapLat_edit" value={formData.mapLat ?? ''} onChange={handleChange} step="any" className="input-field-admin"/> </div>
                            <div className="sm:col-span-3"> <label htmlFor="fac_mapLng_edit" className="form-label-admin"> Map Longitude </label> <input type="number" name="mapLng" id="fac_mapLng_edit" value={formData.mapLng ?? ''} onChange={handleChange} step="any" className="input-field-admin"/> </div>
                        </div>
                    </fieldset>

                    {/* --- Images Section --- */}
                    <fieldset className="border p-4 rounded-md border-white/20 bg-white/5 backdrop-blur-sm">
                        <legend className="text-lg font-medium text-emerald-200 px-2">Images</legend>
                        <div className="pt-2">
                            <label htmlFor="fac_images_edit" className="form-label-admin"> Upload New Images (Optional) </label>
                            <div className="flex items-center mt-1">
                              <label className="block w-full relative">
                                <input type="file" id="fac_images_edit" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                <div className="w-full h-10 flex items-center justify-center border border-white/20 rounded-md bg-white/5 text-white/70 hover:bg-white/10 transition-colors"> <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-emerald-400" /> <span>Select New Images</span> </div>
                              </label>
                            </div>
                            <p className="input-help-text-admin">Selecting new images will <span className='font-medium'>replace all</span> existing images. Max 5 files.</p>
                            {/* Image Previews */}
                            <h4 className="text-sm font-medium text-emerald-200 mt-4 mb-2">Current / New Previews:</h4>
                            {imagePreviews.length > 0 ? (
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {imagePreviews.map((previewUrl, index) => (
                                        <div key={previewUrl + index} className="relative group aspect-square">
                                            <img src={previewUrl} alt={`Preview ${index + 1}`} className="h-full w-full object-cover rounded-md border border-white/20"/>
                                            {/* Only show remove button for newly selected previews */}
                                            {clearExistingImages && newImageFiles.length > 0 && (
                                                <button type="button" onClick={() => removeNewImagePreview(index)} className="absolute top-0 right-0 m-1 p-0.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"> <XMarkIcon className="h-3 w-3"/> </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : ( <p className="text-xs text-white/60 mt-1">No images currently associated or selected.</p> )}
                             {/* Option to clear images (only relevant if NOT uploading new ones) */}
                             {newImageFiles.length === 0 && existingImagePaths.length > 0 && (
                                 <div className="mt-4 flex items-center">
                                     <input type="checkbox" id="clearImages_edit" name="clearImages" checked={clearExistingImages} onChange={(e) => setClearExistingImages(e.target.checked)} className="h-4 w-4 rounded border-white/30 bg-white/5 text-emerald-600 focus:ring-emerald-500"/>
                                     <label htmlFor="clearImages_edit" className="ml-2 text-sm text-red-300">Clear all existing images on save?</label>
                                 </div>
                             )}
                        </div>
                    </fieldset>

                    {/* Error Display */}
                    {error && ( <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30"> {error} </div> )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-end space-x-3 border-t border-white/10 pt-5">
                    <button type="button" className="btn-secondary-admin" onClick={onClose} disabled={isLoading}> Cancel </button>
                    <button type="submit" className="btn-primary-admin" disabled={isLoading}> {isLoading ? 'Saving...' : 'Save Changes'} </button>
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

// Example CSS classes (adjust as needed, maybe put in global CSS or use Tailwind directly)
/*
.form-label-admin { @apply block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1; }
.input-field-admin { @apply mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500; }
.input-help-text-admin { @apply mt-1 text-xs text-emerald-200/60; }
.checkbox-label-admin { @apply inline-flex items-center; }
.checkbox-admin { @apply rounded border-white/30 bg-white/5 text-emerald-600 shadow-sm focus:ring-emerald-500; }
.btn-primary-admin { @apply inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-900 disabled:opacity-50 transition-all duration-200; }
.btn-secondary-admin { @apply inline-flex justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-900 disabled:opacity-50 transition-all duration-200; }
.custom-scrollbar { @apply scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-emerald-900/50; }
*/