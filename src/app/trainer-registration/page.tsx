// src/app/trainer-registration/page.tsx
'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import * as trainerApplicationService from '@/services/trainerApplicationService';

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
    return null;
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Add validation for file type and size
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
      setError(null);
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
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const applicationData = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate) || 0,
        experienceYears: Number(formData.experienceYears) || 0,
      };

      await trainerApplicationService.submitTrainerApplication(applicationData, imageFile);
      setSuccessMessage('Your trainer application has been submitted successfully! We will review it and get back to you soon.');
      // Reset form
      setFormData({
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
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Become a Trainer</h1>
          <p className="mt-4 text-xl text-emerald-100">Join our platform and help athletes reach their potential</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-800/40 backdrop-blur-sm p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Trainer Application</h2>
            <p className="mt-1 text-sm text-emerald-100">Please fill out the form below to apply as a sports trainer</p>
          </div>

          {successMessage ? (
            <div className="p-8">
              <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-6 text-center">
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
                <div className="bg-red-900/30 border border-red-500/30 rounded-md p-4 text-red-200 text-sm">
                  <ExclamationCircleIcon className="h-5 w-5 inline mr-2" />
                  {error}
                </div>
              )}

              <div className="bg-emerald-900/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-sm text-white mb-6">
                <InformationCircleIcon className="h-5 w-5 inline mr-2 text-emerald-400" />
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
                <div>
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
                <label htmlFor="profileImage" className="block text-sm font-medium text-white mb-1">
                  Profile Image
                </label>
                <div className="mt-1 flex items-center">
                  <label className="relative flex-1 cursor-pointer bg-white/5 backdrop-blur-sm rounded-md p-2 border border-dashed border-white/30 hover:border-emerald-400 transition-colors">
                    <div className="text-center p-4">
                      <svg className="mx-auto h-12 w-12 text-white/40" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m-12-4h.01M20 20h4m4 0h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-white/60">Click to upload a profile photo</p>
                      <p className="mt-1 text-xs text-white/40">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      name="profileImage"
                      id="profileImage"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                      className="sr-only"
                    />
                  </label>
                </div>
                
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-emerald-200/60 mb-2">Preview:</p>
                    <div className="h-24 w-24 rounded-md overflow-hidden border border-white/20">
                      <img 
                        src={imagePreview} 
                        alt="Image Preview" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}