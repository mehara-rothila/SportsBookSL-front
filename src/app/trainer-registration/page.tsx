// src/app/trainer-registration/page.tsx
'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'; // --- DEMO FILL --- Added SparklesIcon
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import * as trainerApplicationService from '@/services/trainerApplicationService';

// --- DEMO FILL --- Define Demo Trainer Data ---
const demoTrainerFormData = {
    name: 'Ravi Fernando',
    specialization: 'Cricket Fast Bowling Coach',
    sports: 'Cricket',
    location: 'Galle, Sri Lanka',
    hourlyRate: '2500', // Needs to be a string initially for the input
    experienceYears: '8', // Needs to be a string initially for the input
    bio: 'Former national-level fast bowler with 8 years of coaching experience. Focused on developing pace, technique, and match awareness for aspiring cricketers. Proven track record of helping bowlers increase their speed and accuracy.',
    languages: 'English, Sinhala',
    availability: 'Weekends, Tuesday evenings, Thursday evenings',
    certifications: 'ICC Level 2 Coaching Certificate, First Aid Certified',
};
// --- END DEMO FILL ---

export default function TrainerRegistrationPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    sports: '',
    location: '',
    hourlyRate: '',
    experienceYears: '',
    bio: '',
    languages: '',
    availability: '',
    certifications: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/login?redirect=/trainer-registration');
    return null; // Important: Render nothing while redirecting
  }

  // --- DEMO FILL --- Handler function ---
  const fillWithDemoData = () => {
    setFormData(demoTrainerFormData);
    // Clear image and errors
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input visually
    }
    setError(null);
    setSuccessMessage(null); // Clear success message if shown
  };
  // --- END DEMO FILL ---

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (!validImageTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WEBP, JPG)');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setImageFile(null); // Clear invalid file
        setImagePreview(null);
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image is too large. Maximum size is 5MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setImageFile(null); // Clear invalid file
        setImagePreview(null);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null); // Clear previous errors on valid file selection
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Validate form data
    if (!formData.name || !formData.specialization || !formData.sports ||
        !formData.location || !formData.hourlyRate || !formData.experienceYears || !formData.bio) {
      setError('Please fill in all required fields marked with *');
      setIsSubmitting(false);
      window.scrollTo(0, 0); // Scroll to top to show error
      return;
    }

    // Additional specific validations (e.g., numeric fields)
    if (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) < 0) {
      setError('Hourly rate must be a valid positive number.');
      setIsSubmitting(false);
      window.scrollTo(0, 0);
      return;
    }
    if (isNaN(Number(formData.experienceYears)) || Number(formData.experienceYears) < 0) {
        setError('Experience years must be a valid positive number.');
        setIsSubmitting(false);
        window.scrollTo(0, 0);
        return;
    }


    try {
      // Prepare data, ensuring numbers are numbers
      const applicationData = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate), // Convert to number for API
        experienceYears: Number(formData.experienceYears), // Convert to number for API
      };

      await trainerApplicationService.submitTrainerApplication(applicationData, imageFile);
      setSuccessMessage('Your trainer application has been submitted successfully! We will review it and get back to you soon.');
      // Reset form
      setFormData({
        name: '', specialization: '', sports: '', location: '', hourlyRate: '',
        experienceYears: '', bio: '', languages: '', availability: '', certifications: '',
      });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      window.scrollTo(0, 0); // Scroll to top to show success message

    } catch (err: any) {
      console.error("Submission Error:", err);
      const message = err.response?.data?.message || err.message || 'Failed to submit application. Please check your connection and try again.';
      setError(message);
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state or null if redirecting
  if (authLoading) {
      return (
          <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 to-emerald-900">
              <ArrowPathIcon className="animate-spin h-8 w-8 text-white" />
              <span className="ml-3 text-white">Loading...</span>
          </div>
      );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Become a Trainer</h1>
          <p className="mt-4 text-xl text-emerald-100">Join our platform and help athletes reach their potential</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden relative">
          {/* --- DEMO FILL --- Add button near header --- */}
           {!successMessage && ( // Only show demo fill if not successful yet
            <div className="absolute top-4 right-4 z-20">
                <button
                    type="button"
                    onClick={fillWithDemoData}
                    title="Fill form with demo data"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600/70 backdrop-blur-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-emerald-900 transition-colors duration-200"
                >
                    <SparklesIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                    Demo Fill
                </button>
            </div>
           )}
          {/* --- END DEMO FILL --- */}

          {/* Header */}
          <div className="bg-emerald-800/40 backdrop-blur-sm p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Trainer Application</h2>
            <p className="mt-1 text-sm text-emerald-100">Please fill out the form below to apply as a sports trainer</p>
          </div>

          {successMessage ? (
            <div className="p-8">
              <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-6 text-center animate-fade-in">
                <CheckCircleIcon className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Application Submitted!</h3>
                <p className="text-emerald-100 mb-6">{successMessage}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Go to Profile
                  </Link>
                  <Link
                    href="/trainers"
                    className="inline-flex items-center justify-center px-5 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Explore Trainers
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-md p-4 text-red-200 text-sm animate-fade-in">
                  <ExclamationCircleIcon className="h-5 w-5 inline mr-2 align-text-bottom" />
                  {error}
                </div>
              )}

              <div className="bg-emerald-900/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-sm text-white mb-6">
                <InformationCircleIcon className="h-5 w-5 inline mr-2 text-emerald-400 align-text-bottom" />
                Your application will be reviewed by our administrators. Once approved, your profile will appear in the trainers list.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your full name as a trainer"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-white mb-1">
                    Specialization <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    id="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Cricket Batting Coach"
                  />
                </div>

                {/* Sports */}
                <div>
                  <label htmlFor="sports" className="block text-sm font-medium text-white mb-1">
                    Sports (comma-separated) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="sports"
                    id="sports"
                    value={formData.sports}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Cricket, Tennis, Badminton"
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-white mb-1">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Colombo, Sri Lanka"
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-white mb-1">
                    Hourly Rate (LKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    id="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="100"
                    placeholder="e.g., 2000"
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-white mb-1">
                    Experience (Years) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    id="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="e.g., 5"
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Languages */}
                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-white mb-1">
                    Languages (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="languages"
                    id="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    placeholder="e.g., English, Sinhala, Tamil"
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-white mb-1">
                    Availability (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="availability"
                    id="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Monday, Wednesday, Friday"
                    className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Certifications */}
                <div className="md:col-span-2"> {/* Make certifications full width on medium screens */}
                    <label htmlFor="certifications" className="block text-sm font-medium text-white mb-1">
                        Certifications (comma-separated)
                    </label>
                    <input
                        type="text"
                        name="certifications"
                        id="certifications"
                        value={formData.certifications}
                        onChange={handleInputChange}
                        placeholder="e.g., Level 2 Cricket Coach, CPR Certified"
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
              </div>


              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-white mb-1">
                  Bio <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us about your coaching philosophy, experience, and achievements"
                  className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Profile Image (Optional, max 5MB)
                </label>
                <div className="mt-1 flex items-center gap-4">
                    <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <svg className="h-12 w-12 text-white/30" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <label htmlFor="profileImage" className="cursor-pointer bg-white/10 backdrop-blur-sm py-2 px-3 border border-white/20 rounded-md shadow-sm text-sm leading-4 font-medium text-white hover:bg-white/20 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 focus-within:ring-offset-emerald-900">
                        <span>{imageFile ? 'Change photo' : 'Upload photo'}</span>
                        <input
                            id="profileImage"
                            name="profileImage"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                            className="sr-only"
                        />
                    </label>
                    {imageFile && (
                        <button
                            type="button"
                            onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="ml-2 py-2 px-3 border border-red-500/30 rounded-md shadow-sm text-sm leading-4 font-medium text-red-300 bg-red-900/20 hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Remove
                        </button>
                    )}
                </div>
                 <p className="mt-2 text-xs text-emerald-200/80">Recommended: Square image (e.g., 400x400 pixels). Max 5MB.</p>
              </div>


              {/* Submit Button */}
              <div className="pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Trainer Application'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* CSS Animation */}
       <style jsx>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
}