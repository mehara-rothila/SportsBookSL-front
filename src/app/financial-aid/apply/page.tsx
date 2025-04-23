'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Listbox, Transition, Disclosure } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { InformationCircleIcon, PaperClipIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';
import * as authService from '@/services/authService';
// Removed direct import of financialAidService as we use api.post

// --- Interfaces ---
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
}

interface SportOption {
  id: string;
  name: string;
}

interface LevelOption {
  id: string;
  name: string;
}

interface SportsInfo {
  primarySport: SportOption | null;
  skillLevel: LevelOption | null;
  yearsExperience: string;
  currentAffiliation: string;
  achievements: string;
}

interface FinancialNeed {
  description: string;
  requestedAmount: string;
  facilitiesNeeded: string[];
  monthlyUsage: string;
}

interface ReferenceInfo {
  name: string;
  relationship: string;
  contactInfo: string;
  organizationName: string;
}

interface SupportingInfo {
  previousAid: string;
  otherPrograms: string;
  additionalInfo: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  sportsInfo: SportsInfo;
  financialNeed: FinancialNeed;
  reference: ReferenceInfo;
  documents: File[];
  supportingInfo: SupportingInfo;
  terms: boolean;
}

// --- Static Options ---
const sportOptions: SportOption[] = [
  { id: 'cricket', name: 'Cricket' }, { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' }, { id: 'swimming', name: 'Swimming' },
  { id: 'tennis', name: 'Tennis' }, { id: 'badminton', name: 'Badminton' },
  { id: 'volleyball', name: 'Volleyball' }, { id: 'athletics', name: 'Athletics' },
  { id: 'rugby', name: 'Rugby' }, { id: 'hockey', name: 'Hockey' },
  { id: 'table-tennis', name: 'Table Tennis' }, { id: 'other', name: 'Other' }
];

const levelOptions: LevelOption[] = [
  { id: 'beginner', name: 'Beginner' }, { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }, { id: 'professional', name: 'Professional' }
];

const facilityTypes = [
  { id: 'cricket-ground', name: 'Cricket Ground' }, { id: 'football-field', name: 'Football Field' },
  { id: 'basketball-court', name: 'Basketball Court' }, { id: 'swimming-pool', name: 'Swimming Pool' },
  { id: 'tennis-court', name: 'Tennis Court' }, { id: 'badminton-court', name: 'Badminton Court' },
  { id: 'athletics-track', name: 'Athletics Track' }, { id: 'volleyball-court', name: 'Volleyball Court' },
  { id: 'indoor-gym', name: 'Indoor Gym' }, { id: 'practice-nets', name: 'Practice Nets' },
  { id: 'table-tennis-table', name: 'Table Tennis Facilities' }, { id: 'multi-purpose-hall', name: 'Multi-purpose Hall' }
];

export default function FinancialAidApplicationPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Check Auth ---
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login?redirect=/financial-aid/apply');
    }
  }, [router]);

  // Initial form state
  const [formData, setFormData] = useState<FormData>({
    personalInfo: { fullName: '', email: '', phone: '', dateOfBirth: '', address: '', city: '', postalCode: '' },
    sportsInfo: { primarySport: null, skillLevel: null, yearsExperience: '', currentAffiliation: '', achievements: '' },
    financialNeed: { description: '', requestedAmount: '', facilitiesNeeded: [], monthlyUsage: '' },
    reference: { name: '', relationship: '', contactInfo: '', organizationName: '' },
    documents: [],
    supportingInfo: { previousAid: '', otherPrograms: '', additionalInfo: '' },
    terms: false
  });

  // --- Validation ---
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.personalInfo.fullName) newErrors['fullName'] = 'Full name is required';
      if (!formData.personalInfo.email) newErrors['email'] = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) newErrors['email'] = 'Email is invalid';
      if (!formData.personalInfo.phone) newErrors['phone'] = 'Phone number is required';
      if (!formData.personalInfo.dateOfBirth) newErrors['dateOfBirth'] = 'Date of birth is required';
      if (!formData.personalInfo.address) newErrors['address'] = 'Address is required';
    }
    else if (step === 2) {
        if (!formData.sportsInfo.primarySport) newErrors['primarySport'] = 'Primary sport is required';
        if (!formData.sportsInfo.skillLevel) newErrors['skillLevel'] = 'Skill level is required';
        if (!formData.sportsInfo.yearsExperience) newErrors['yearsExperience'] = 'Years of experience is required';
        if (!formData.sportsInfo.achievements) newErrors['achievements'] = 'Achievements description is required';
    }
    else if (step === 3) {
        if (!formData.financialNeed.description) newErrors['needDescription'] = 'Financial need description is required';
        if (!formData.financialNeed.requestedAmount) newErrors['requestedAmount'] = 'Requested amount is required';
        else if (isNaN(Number(formData.financialNeed.requestedAmount))) newErrors['requestedAmount'] = 'Amount must be a number';
        if (formData.financialNeed.facilitiesNeeded.length === 0) newErrors['facilitiesNeeded'] = 'Select at least one facility type';
        if (!formData.financialNeed.monthlyUsage) newErrors['monthlyUsage'] = 'Expected monthly usage is required';
    }
    else if (step === 4) {
        if (!formData.reference.name) newErrors['referenceName'] = 'Reference name is required';
        if (!formData.reference.relationship) newErrors['referenceRelationship'] = 'Relationship is required';
        if (!formData.reference.contactInfo) newErrors['referenceContact'] = 'Contact info is required';
    }
    else if (step === 6) {
        if (!formData.terms) newErrors['terms'] = 'You must agree to the terms and conditions to submit.';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Navigation ---
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // --- Input Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const path = name.split('.');
    if (path.length === 2) {
      setFormData(prev => {
        // Get the section object (personalInfo, sportsInfo, etc.)
        const section = prev[path[0] as keyof FormData];
        
        // Check if section is an object before spreading
        if (section && typeof section === 'object' && !Array.isArray(section)) {
          return {
            ...prev,
            [path[0]]: {
              ...(section as object),
              [path[1]]: value
            }
          };
        }
        
        // Fallback if section is not an object
        return prev;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'terms') setFormData(prev => ({ ...prev, terms: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...newFiles].slice(0, 5) })); // Limit to 5 files
      // Clear file input value to allow re-uploading the same file
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
  };

  const toggleFacilitySelection = (facilityId: string) => {
    setFormData(prev => ({
      ...prev,
      financialNeed: {
        ...prev.financialNeed,
        facilitiesNeeded: prev.financialNeed.facilitiesNeeded.includes(facilityId)
          ? prev.financialNeed.facilitiesNeeded.filter(id => id !== facilityId)
          : [...prev.financialNeed.facilitiesNeeded, facilityId]
      }
    }));
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // --- Form Submission ---
  const handleSubmit = async () => {
    if (!validateStep(6)) {
        console.log("Final validation failed. Errors:", formErrors);
        setApiError("Please review the form and agree to the terms before submitting.");
        window.scrollTo(0, 0); // Scroll to top to show error
        return;
    }

    setIsSubmitting(true);
    setApiError(null);

    console.log('--- Submitting FormData State ---');
    console.log('Personal Info:', JSON.stringify(formData.personalInfo, null, 2));
    console.log('Sports Info:', JSON.stringify(formData.sportsInfo, null, 2));
    console.log('Financial Need:', JSON.stringify(formData.financialNeed, null, 2));
    console.log('Reference:', JSON.stringify(formData.reference, null, 2));
    console.log('Supporting Info:', JSON.stringify(formData.supportingInfo, null, 2));
    console.log('Terms:', formData.terms);
    console.log('Documents Count:', formData.documents.length);
    console.log('--- End FormData State ---');

    const dataToSend = new FormData();

    // Append text fields using the backend's expected format
    Object.entries(formData.personalInfo).forEach(([key, value]) => {
        dataToSend.append(`personalInfo[${key}]`, value);
    });
    dataToSend.append('sportsInfo[primarySport]', formData.sportsInfo.primarySport?.id || '');
    dataToSend.append('sportsInfo[skillLevel]', formData.sportsInfo.skillLevel?.id || '');
    dataToSend.append('sportsInfo[yearsExperience]', formData.sportsInfo.yearsExperience);
    dataToSend.append('sportsInfo[currentAffiliation]', formData.sportsInfo.currentAffiliation);
    dataToSend.append('sportsInfo[achievements]', formData.sportsInfo.achievements); // Key matches backend extraction

    dataToSend.append('financialNeed[description]', formData.financialNeed.description);
    dataToSend.append('financialNeed[requestedAmount]', formData.financialNeed.requestedAmount);
    formData.financialNeed.facilitiesNeeded.forEach(facility => {
        dataToSend.append('financialNeed[facilitiesNeeded]', facility); // Send as simple array element
    });
    dataToSend.append('financialNeed[monthlyUsage]', formData.financialNeed.monthlyUsage);

    Object.entries(formData.reference).forEach(([key, value]) => {
        dataToSend.append(`reference[${key}]`, value);
    });
    Object.entries(formData.supportingInfo).forEach(([key, value]) => {
        dataToSend.append(`supportingInfo[${key}]`, value);
    });

    // Append files
    formData.documents.forEach((file) => {
      dataToSend.append('documents', file); // Field name matches Multer middleware
    });

    // Append terms (as string 'true'/'false')
    dataToSend.append('terms', String(formData.terms));

    console.log('Submitting FormData...');

    try {
      const response = await api.post('/financial-aid/apply', dataToSend, {
        // No need to set Content-Type header manually for FormData
      });

      console.log('Application submitted successfully:', response.data);
      setSubmitted(true);
      window.scrollTo(0, 0);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      setApiError(message);
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Success Message Component ---
  if (submitted) {
    return (
        <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen pt-16 pb-12 flex flex-col items-center relative overflow-hidden">
          {/* Background Elements - Keep as is */}
          <div className="absolute inset-0">
            {/* Oval field */}
            <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
            <div className="absolute top-1/2 left-[20%] w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
              {/* Crease & Wickets */}
              <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
            </div>
            <div className="absolute top-1/2 right-[20%] w-40 h-96 bg-yellow-100/20 translate-x-1/2 -translate-y-1/2 border border-white/10">
              {/* Crease & Wickets */}
               <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
            </div>
            <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] rounded-full border-dashed border-4 border-white/20"></div>
            {/* Animated players - Keep as is */}
            <div className="absolute w-6 h-8 top-[30%] left-[10%] animate-fielder-move"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div></div></div>
            <div className="absolute w-6 h-8 top-[70%] right-[10%] animate-fielder-move animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div></div></div>
            <div className="absolute w-6 h-8 bottom-[40%] left-[5%] animate-fielder-move animation-delay-1000"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div></div></div>
            <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div><div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div></div></div>
            <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div><div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div></div></div>
            <div className="absolute w-8 h-12 top-[40%] right-[15%] animate-batsman-ready animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div><div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div></div></div>
            <div className="absolute w-8 h-12 bottom-[35%] right-[25%] animate-bowler-run animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div><div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div></div></div>
            <div className="absolute w-6 h-8 top-[35%] left-[15%] animate-wicketkeeper-ready"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div></div></div>
            <div className="absolute w-6 h-8 top-[35%] right-[15%] animate-wicketkeeper-ready animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div></div></div>
            <div className="absolute w-8 h-12 top-[55%] left-[18%] animate-nonstriker-ready"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div></div></div>
            <div className="absolute w-8 h-12 top-[55%] right-[18%] animate-nonstriker-ready animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div></div></div>
            <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[18%] animate-ball-trajectory"></div>
            <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] right-[18%] animate-ball-trajectory animation-delay-500"></div>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-2 rounded-lg border border-white/10 backdrop-blur-sm"><div className="text-white text-xs flex gap-6"><span className="text-blue-300">IND 186/3</span><span className="text-white/80">VS</span><span className="text-red-300">SL</span><span className="text-yellow-300 animate-pulse">(32.4 OVERS)</span></div></div>
          </div>

          {/* Success Message Content - Keep as is */}
          <div className="bg-white/20 backdrop-blur-sm shadow-lg rounded-lg max-w-3xl w-full p-8 border border-white/30 z-10 animate-fade-in-down">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600/40 backdrop-blur-sm">
                <CheckIcon className="h-8 w-8 text-emerald-200" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Application Submitted!</h2>
              <p className="mt-3 text-lg text-emerald-100">Thank you. We'll review it and contact you soon.</p>
              <p className="mt-1 text-sm text-emerald-200">Reference: <span className="font-medium">AID-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p>
            </div>
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-sm font-medium text-white">What happens next?</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-emerald-100">
                <li>Review within 7-10 business days.</li>
                <li>Email update on status.</li>
                <li>Instructions if approved.</li>
              </ul>
            </div>
            <div className="mt-6 flex items-center justify-center gap-x-6">
              <Link
                href="/financial-aid"
                className="group relative inline-flex items-center justify-center px-4 py-2 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/30 hover:shadow-xl hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  Return to Financial Aid
                </span>
                <span className="absolute inset-0 h-full w-full bg-white/[0.08] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
              </Link>
              <Link
                href="/profile"
                className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors"
              >
                Go to profile <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      );
  }

  // --- Main Form Render ---
  return (
    <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen relative overflow-hidden pt-24 pb-12">
      {/* Background Elements - Keep as is */}
        <div className="absolute inset-0">
            {/* Oval field */}
            <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
            <div className="absolute top-1/2 left-[20%] w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
              {/* Crease & Wickets */}
              <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
            </div>
            <div className="absolute top-1/2 right-[20%] w-40 h-96 bg-yellow-100/20 translate-x-1/2 -translate-y-1/2 border border-white/10">
              {/* Crease & Wickets */}
               <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1"><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div><div className="w-1 h-8 bg-white/80"></div></div>
            </div>
            <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] rounded-full border-dashed border-4 border-white/20"></div>
            {/* Animated players - Keep as is */}
            <div className="absolute w-6 h-8 top-[30%] left-[10%] animate-fielder-move"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div></div></div>
            <div className="absolute w-6 h-8 top-[70%] right-[10%] animate-fielder-move animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div></div></div>
            <div className="absolute w-6 h-8 bottom-[40%] left-[5%] animate-fielder-move animation-delay-1000"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div></div></div>
            <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div><div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div></div></div>
            <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div><div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div></div></div>
            <div className="absolute w-8 h-12 top-[40%] right-[15%] animate-batsman-ready animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div><div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div></div></div>
            <div className="absolute w-8 h-12 bottom-[35%] right-[25%] animate-bowler-run animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div><div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div></div></div>
            <div className="absolute w-6 h-8 top-[35%] left-[15%] animate-wicketkeeper-ready"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div></div></div>
            <div className="absolute w-6 h-8 top-[35%] right-[15%] animate-wicketkeeper-ready animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div><div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div></div></div>
            <div className="absolute w-8 h-12 top-[55%] left-[18%] animate-nonstriker-ready"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div></div></div>
            <div className="absolute w-8 h-12 top-[55%] right-[18%] animate-nonstriker-ready animation-delay-500"><div className="relative w-full h-full"><div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div><div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div></div></div>
            <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[18%] animate-ball-trajectory"></div>
            <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] right-[18%] animate-ball-trajectory animation-delay-500"></div>
        </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 mt-12 animate-fade-in-down">
        <div className="bg-white/20 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden border border-white/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 backdrop-blur-sm px-6 py-8 text-white border-b border-white/20">
            <h1 className="text-2xl font-bold">Financial Aid Application</h1>
            <p className="mt-2 text-emerald-100">Complete this form to apply for assistance with accessing sports facilities</p>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Step {currentStep} of 6</span>
              <span className="text-sm font-medium text-white">{Math.round((currentStep / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-emerald-900/50 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300 ease-in-out animate-pulse-slow" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
            </div>
          </div>

          {/* Form content */}
          <div className="px-6 py-8">
            {/* Display API Error if exists */}
            {apiError && (
              <div className="mb-6 rounded-md bg-red-900/50 backdrop-blur-sm p-4 border border-red-500/30 animate-fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">Submission Error</h3>
                    <div className="mt-2 text-sm text-red-200">
                      <p>{apiError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                 <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Full Name */}
                  <div className="sm:col-span-6">
                    <label htmlFor="personalInfo.fullName" className="block text-sm font-medium text-white">Full Name *</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="personalInfo.fullName"
                        id="personalInfo.fullName"
                        autoComplete="name"
                        value={formData.personalInfo.fullName}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {formErrors.fullName && (<p className="mt-1 text-sm text-red-400">{formErrors.fullName}</p>)}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-3">
                    <label htmlFor="personalInfo.email" className="block text-sm font-medium text-white">Email Address *</label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="personalInfo.email"
                        id="personalInfo.email"
                        autoComplete="email"
                        value={formData.personalInfo.email}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {formErrors.email && (<p className="mt-1 text-sm text-red-400">{formErrors.email}</p>)}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-3">
                    <label htmlFor="personalInfo.phone" className="block text-sm font-medium text-white">Phone Number *</label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="personalInfo.phone"
                        id="personalInfo.phone"
                        autoComplete="tel"
                        value={formData.personalInfo.phone}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {formErrors.phone && (<p className="mt-1 text-sm text-red-400">{formErrors.phone}</p>)}
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="sm:col-span-3">
                    <label htmlFor="personalInfo.dateOfBirth" className="block text-sm font-medium text-white">Date of Birth *</label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="personalInfo.dateOfBirth"
                        id="personalInfo.dateOfBirth"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.dateOfBirth ? 'border-red-500 ring-1 ring-red-500' : ''} appearance-none`} // Added appearance-none for better date picker styling
                        />
                        {formErrors.dateOfBirth && (<p className="mt-1 text-sm text-red-400">{formErrors.dateOfBirth}</p>)}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-6">
                      <label htmlFor="personalInfo.address" className="block text-sm font-medium text-white">Address *</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="personalInfo.address"
                          id="personalInfo.address"
                          autoComplete="street-address"
                          value={formData.personalInfo.address}
                          onChange={handleInputChange}
                          className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.address ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          />
                          {formErrors.address && (<p className="mt-1 text-sm text-red-400">{formErrors.address}</p>)}
                        </div>
                      </div>

                      {/* City */}
                      <div className="sm:col-span-3">
                        <label htmlFor="personalInfo.city" className="block text-sm font-medium text-white">City</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="personalInfo.city"
                            id="personalInfo.city"
                            autoComplete="address-level2"
                            value={formData.personalInfo.city}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                          />
                        </div>
                      </div>

                      {/* Postal Code */}
                      <div className="sm:col-span-3">
                        <label htmlFor="personalInfo.postalCode" className="block text-sm font-medium text-white">Postal Code</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="personalInfo.postalCode"
                            id="personalInfo.postalCode"
                            autoComplete="postal-code"
                            value={formData.personalInfo.postalCode}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Privacy Notice */}
                    <div className="mt-6 bg-blue-900/30 backdrop-blur-sm rounded-md p-4 border border-blue-500/30">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <InformationCircleIcon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-200">Privacy Notice</h3>
                          <div className="mt-2 text-sm text-blue-200">
                            <p>Your personal information will only be used for evaluating your application. See our <Link href="/privacy" className="underline text-blue-300 hover:text-blue-200">Privacy Policy</Link>.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Step 2: Sports Information */}
              {currentStep === 2 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-white mb-6">Sports Information</h2>
                  <div className="space-y-6">
                    {/* Primary Sport */}
                    <div>
                      <Listbox value={formData.sportsInfo.primarySport} onChange={(selected) => setFormData({ ...formData, sportsInfo: { ...formData.sportsInfo, primarySport: selected } })}>
                        {({ open }) => (
                          <>
                            <Listbox.Label className="block text-sm font-medium text-white">Primary Sport *</Listbox.Label>
                            <div className="relative mt-1">
                              <Listbox.Button className={`relative w-full cursor-default rounded-md border ${ formErrors.primarySport ? 'border-red-500 ring-1 ring-red-500' : 'border-white/30' } bg-white/10 backdrop-blur-sm py-2 pl-3 pr-10 text-left shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm text-white`}>
                                <span className="block truncate">{formData.sportsInfo.primarySport ? formData.sportsInfo.primarySport.name : 'Select a sport'}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon className="h-5 w-5 text-white/60" aria-hidden="true" />
                                </span>
                              </Listbox.Button>
                              <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-emerald-800/95 backdrop-blur-sm py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {sportOptions.map((sport) => (
                                    <Listbox.Option
                                      key={sport.id}
                                      className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-emerald-700 text-white' : 'text-emerald-100' }`}
                                      value={sport}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>
                                            {sport.name}
                                          </span>
                                          {selected ? (
                                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${ active ? 'text-white' : 'text-emerald-300' }`}>
                                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                      {formErrors.primarySport && (<p className="mt-1 text-sm text-red-400">{formErrors.primarySport}</p>)}
                    </div>

                    {/* Skill Level */}
                    <div>
                      <Listbox value={formData.sportsInfo.skillLevel} onChange={(selected) => setFormData({ ...formData, sportsInfo: { ...formData.sportsInfo, skillLevel: selected } })}>
                         {({ open }) => (
                          <>
                            <Listbox.Label className="block text-sm font-medium text-white">Skill Level *</Listbox.Label>
                            <div className="relative mt-1">
                              <Listbox.Button className={`relative w-full cursor-default rounded-md border ${ formErrors.skillLevel ? 'border-red-500 ring-1 ring-red-500' : 'border-white/30' } bg-white/10 backdrop-blur-sm py-2 pl-3 pr-10 text-left shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm text-white`}>
                                <span className="block truncate">{formData.sportsInfo.skillLevel ? formData.sportsInfo.skillLevel.name : 'Select skill level'}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon className="h-5 w-5 text-white/60" aria-hidden="true" />
                                </span>
                              </Listbox.Button>
                              <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-emerald-800/95 backdrop-blur-sm py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {levelOptions.map((level) => (
                                    <Listbox.Option
                                      key={level.id}
                                      className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-emerald-700 text-white' : 'text-emerald-100' }`}
                                      value={level}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>
                                            {level.name}
                                          </span>
                                          {selected ? (
                                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${ active ? 'text-white' : 'text-emerald-300' }`}>
                                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                      {formErrors.skillLevel && (<p className="mt-1 text-sm text-red-400">{formErrors.skillLevel}</p>)}
                    </div>

                    {/* Years Experience */}
                    <div>
                      <label htmlFor="sportsInfo.yearsExperience" className="block text-sm font-medium text-white">Years of Experience *</label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="sportsInfo.yearsExperience"
                          id="sportsInfo.yearsExperience"
                          min="0"
                          max="99"
                          value={formData.sportsInfo.yearsExperience}
                          onChange={handleInputChange}
                          className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.yearsExperience ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        />
                        {formErrors.yearsExperience && (<p className="mt-1 text-sm text-red-400">{formErrors.yearsExperience}</p>)}
                      </div>
                    </div>

                    {/* Affiliation */}
                    <div>
                      <label htmlFor="sportsInfo.currentAffiliation" className="block text-sm font-medium text-white">Current Team/Club/School (if any)</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="sportsInfo.currentAffiliation"
                          id="sportsInfo.currentAffiliation"
                          value={formData.sportsInfo.currentAffiliation}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                        />
                      </div>
                    </div>

                    {/* Achievements */}
                    <div>
                      <label htmlFor="sportsInfo.achievements" className="block text-sm font-medium text-white">Notable Achievements / Goals *</label>
                      <p className="mt-1 text-sm text-emerald-200">Briefly describe your significant achievements, competitions participated in, or your future goals in the sport.</p>
                      <div className="mt-2">
                        <textarea
                          id="sportsInfo.achievements"
                          name="sportsInfo.achievements"
                          rows={4}
                          value={formData.sportsInfo.achievements}
                          onChange={handleInputChange}
                          className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.achievements ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          />
                          {formErrors.achievements && (<p className="mt-1 text-sm text-red-400">{formErrors.achievements}</p>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Financial Need */}
                {currentStep === 3 && (
                  <div className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-white mb-6">Financial Need</h2>
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <label htmlFor="financialNeed.description" className="block text-sm font-medium text-white">Describe your financial need *</label>
                        <p className="mt-1 text-sm text-emerald-200">Explain why you need financial assistance to access sports facilities or training.</p>
                        <div className="mt-2">
                          <textarea
                            id="financialNeed.description"
                            name="financialNeed.description"
                            rows={5}
                            value={formData.financialNeed.description}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.needDescription ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          />
                          {formErrors.needDescription && (<p className="mt-1 text-sm text-red-400">{formErrors.needDescription}</p>)}
                        </div>
                      </div>

                      {/* Requested Amount */}
                      <div>
                        <label htmlFor="financialNeed.requestedAmount" className="block text-sm font-medium text-white">Requested Amount (LKR per month) *</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-emerald-200 sm:text-sm">Rs.</span>
                          </div>
                          <input
                            type="number" // Use number type for better input handling
                            name="financialNeed.requestedAmount"
                            id="financialNeed.requestedAmount"
                            min="0"
                            step="100" // Optional: allow increments of 100
                            value={formData.financialNeed.requestedAmount}
                            onChange={handleInputChange}
                            className={`focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-12 sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.requestedAmount ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            placeholder="0"
                          />
                        </div>
                        {formErrors.requestedAmount && (<p className="mt-1 text-sm text-red-400">{formErrors.requestedAmount}</p>)}
                        <p className="mt-2 text-sm text-emerald-200">Estimate the monthly cost of facilities/training you need aid for.</p>
                      </div>

                      {/* Facilities Needed */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">What types of facilities do you need access to? *</label>
                        {formErrors.facilitiesNeeded && (<p className="mb-2 text-sm text-red-400">{formErrors.facilitiesNeeded}</p>)}
                        <div className="mt-2 grid grid-cols-1 gap-y-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-x-4">
                          {facilityTypes.map((facility) => (
                            <div key={facility.id} className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={facility.id}
                                  name="facilitiesNeeded"
                                  type="checkbox"
                                  value={facility.id} // Ensure value is set if needed by backend differently
                                  checked={formData.financialNeed.facilitiesNeeded.includes(facility.id)}
                                  onChange={() => toggleFacilitySelection(facility.id)}
                                  className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-white/30 bg-white/10 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={facility.id} className="font-medium text-white hover:text-emerald-200 cursor-pointer">{facility.name}</label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Monthly Usage */}
                      <div>
                        <label htmlFor="financialNeed.monthlyUsage" className="block text-sm font-medium text-white">Expected usage frequency *</label>
                        <select
                          id="financialNeed.monthlyUsage"
                          name="financialNeed.monthlyUsage"
                          value={formData.financialNeed.monthlyUsage}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ${formErrors.monthlyUsage ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          >
                            <option value="" className="bg-emerald-800 text-white">Select frequency</option>
                            <option value="daily" className="bg-emerald-800 text-white">Daily</option>
                            <option value="frequently" className="bg-emerald-800 text-white">Frequently (3-4 times/week)</option>
                            <option value="regularly" className="bg-emerald-800 text-white">Regularly (1-2 times/week)</option>
                            <option value="occasionally" className="bg-emerald-800 text-white">Occasionally (2-3 times/month)</option>
                          </select>
                          {formErrors.monthlyUsage && (<p className="mt-1 text-sm text-red-400">{formErrors.monthlyUsage}</p>)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Reference */}
                  {currentStep === 4 && (
                    <div className="animate-fade-in">
                      <h2 className="text-xl font-semibold text-white mb-6">Reference Information</h2>
                      <p className="text-sm text-emerald-200 mb-6">Provide details of a coach, teacher, or mentor who can vouch for your dedication and potential.</p>
                      <div className="space-y-6">
                        {/* Ref Name */}
                        <div>
                          <label htmlFor="reference.name" className="block text-sm font-medium text-white">Reference Full Name *</label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="reference.name"
                              id="reference.name"
                              value={formData.reference.name}
                              onChange={handleInputChange}
                              className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.referenceName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            />
                            {formErrors.referenceName && (<p className="mt-1 text-sm text-red-400">{formErrors.referenceName}</p>)}
                          </div>
                        </div>

                        {/* Ref Relationship */}
                        <div>
                          <label htmlFor="reference.relationship" className="block text-sm font-medium text-white">Relationship to Applicant *</label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="reference.relationship"
                              id="reference.relationship"
                              placeholder="e.g., Coach, Teacher, Mentor"
                              value={formData.reference.relationship}
                              onChange={handleInputChange}
                              className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.referenceRelationship ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            />
                            {formErrors.referenceRelationship && (<p className="mt-1 text-sm text-red-400">{formErrors.referenceRelationship}</p>)}
                          </div>
                        </div>

                        {/* Ref Contact */}
                        <div>
                          <label htmlFor="reference.contactInfo" className="block text-sm font-medium text-white">Reference Contact (Email or Phone) *</label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="reference.contactInfo"
                              id="reference.contactInfo"
                              value={formData.reference.contactInfo}
                              onChange={handleInputChange}
                              className={`shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50 ${formErrors.referenceContact ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            />
                            {formErrors.referenceContact && (<p className="mt-1 text-sm text-red-400">{formErrors.referenceContact}</p>)}
                          </div>
                        </div>

                        {/* Ref Org */}
                        <div>
                          <label htmlFor="reference.organizationName" className="block text-sm font-medium text-white">Reference's Organization/Affiliation (if applicable)</label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="reference.organizationName"
                              id="reference.organizationName"
                              value={formData.reference.organizationName}
                              onChange={handleInputChange}
                              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Important Note */}
                      <div className="mt-8 bg-yellow-900/30 backdrop-blur-sm rounded-md p-4 border border-yellow-500/30">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-300">Verification</h3>
                            <div className="mt-2 text-sm text-yellow-200">
                              <p>We may contact your reference to verify the information provided.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Supporting Documents & Info */}
                  {currentStep === 5 && (
                    <div className="animate-fade-in">
                      <h2 className="text-xl font-semibold text-white mb-6">Supporting Documents & Information</h2>
                      <p className="text-sm text-emerald-200 mb-6">Optionally, upload documents like performance certificates, letters of recommendation, or proof of financial need (e.g., income statement, letter from guardian). You can also provide additional context below.</p>

                      {/* File Upload Area */}
                      <div>
                        <label className="block text-sm font-medium text-white">Upload Documents (Max 5 files)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/30 border-dashed rounded-md bg-emerald-900/30 backdrop-blur-sm hover:border-emerald-400 transition-colors">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-emerald-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-emerald-200 justify-center">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-emerald-800/50 rounded-md font-medium text-emerald-300 hover:text-emerald-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 px-3 py-1.5">
                                <span>Select files to upload</span>
                                <input id="file-upload" name="documents" type="file" ref={fileInputRef} className="sr-only" multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"/>
                              </label>
                              {/* <p className="pl-1 pt-1.5">or drag and drop</p> */}
                            </div>
                            <p className="text-xs text-emerald-300">PDF, DOC(X), PNG, JPG up to 10MB each</p>
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Files List */}
                      {formData.documents.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-white mb-3">Selected Documents ({formData.documents.length}/5)</h4>
                          <ul className="divide-y divide-white/10 border border-white/20 bg-emerald-900/30 backdrop-blur-sm rounded-md">
                            {formData.documents.map((file, index) => (
                              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm hover:bg-white/5">
                                <div className="w-0 flex-1 flex items-center">
                                  <PaperClipIcon className="flex-shrink-0 h-5 w-5 text-emerald-300" aria-hidden="true" />
                                  <span className="ml-2 flex-1 w-0 truncate text-white" title={file.name}>{file.name}</span>
                                </div>
                                <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                                  <span className="text-emerald-300 text-xs">{formatFileSize(file.size)}</span>
                                  <button type="button" onClick={() => removeFile(index)} className="font-medium text-red-400 hover:text-red-300 transition-colors" title="Remove file">
                                    <TrashIcon className="h-5 w-5" />
                                    <span className="sr-only">Remove</span>
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Additional Info Textareas */}
                      <div className="mt-8 space-y-6">
                        <div>
                          <label htmlFor="supportingInfo.previousAid" className="block text-sm font-medium text-white">Have you received financial aid or scholarships before? If yes, please provide details.</label>
                          <div className="mt-1">
                            <textarea
                              id="supportingInfo.previousAid"
                              name="supportingInfo.previousAid"
                              rows={2}
                              value={formData.supportingInfo.previousAid}
                              onChange={handleInputChange}
                              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                              placeholder="e.g., School sports scholarship 2022, Provincial grant..."
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="supportingInfo.otherPrograms" className="block text-sm font-medium text-white">Are you applying for or receiving support from other programs or organizations?</label>
                          <div className="mt-1">
                            <textarea
                              id="supportingInfo.otherPrograms"
                              name="supportingInfo.otherPrograms"
                              rows={2}
                              value={formData.supportingInfo.otherPrograms}
                              onChange={handleInputChange}
                              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                              placeholder="e.g., Applied for local club sponsorship..."
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="supportingInfo.additionalInfo" className="block text-sm font-medium text-white">Is there any other information you would like to share to support your application?</label>
                          <div className="mt-1">
                            <textarea
                              id="supportingInfo.additionalInfo"
                              name="supportingInfo.additionalInfo"
                              rows={3}
                              value={formData.supportingInfo.additionalInfo}
                              onChange={handleInputChange}
                              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-md placeholder-white/50"
                              placeholder="e.g., Specific training camp goals, unique circumstances..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Review and Submit */}
                  {currentStep === 6 && (
                    <div className="animate-fade-in">
                      <h2 className="text-xl font-semibold text-white mb-6">Review and Submit</h2>
                      <p className="text-sm text-emerald-200 mb-6">Please review all the information you've provided carefully before submitting your application.</p>
                      <div className="space-y-6">

                        {/* Review Sections (Condensed for brevity - show key info) */}
                        <div className="bg-emerald-900/40 backdrop-blur-sm shadow overflow-hidden sm:rounded-md border border-white/20">
                           <Disclosure>
                            {({ open }) => (
                                <>
                                <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-sm font-medium text-left text-white hover:bg-emerald-900/60 focus:outline-none focus-visible:ring focus-visible:ring-emerald-500 focus-visible:ring-opacity-75">
                                    <span>Personal Information</span>
                                    <ChevronUpDownIcon className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-emerald-300`} />
                                </Disclosure.Button>
                                <Transition
                                    enter="transition duration-100 ease-out"
                                    enterFrom="transform scale-95 opacity-0"
                                    enterTo="transform scale-100 opacity-100"
                                    leave="transition duration-75 ease-out"
                                    leaveFrom="transform scale-100 opacity-100"
                                    leaveTo="transform scale-95 opacity-0"
                                >
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm border-t border-white/10">
                                    <dl>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Name:</dt><dd className="text-white sm:col-span-2">{formData.personalInfo.fullName}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Email:</dt><dd className="text-white sm:col-span-2">{formData.personalInfo.email}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Phone:</dt><dd className="text-white sm:col-span-2">{formData.personalInfo.phone}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">DOB:</dt><dd className="text-white sm:col-span-2">{formData.personalInfo.dateOfBirth}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Address:</dt><dd className="text-white sm:col-span-2">{formData.personalInfo.address}</dd> </div>
                                    </dl>
                                </Disclosure.Panel>
                                </Transition>
                                </>
                            )}
                           </Disclosure>
                        </div>
                         <div className="bg-emerald-900/40 backdrop-blur-sm shadow overflow-hidden sm:rounded-md border border-white/20">
                           <Disclosure>
                            {({ open }) => (
                                <>
                                <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-sm font-medium text-left text-white hover:bg-emerald-900/60 focus:outline-none focus-visible:ring focus-visible:ring-emerald-500 focus-visible:ring-opacity-75">
                                    <span>Sports Information</span>
                                    <ChevronUpDownIcon className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-emerald-300`} />
                                </Disclosure.Button>
                                <Transition as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm border-t border-white/10">
                                     <dl>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Sport:</dt><dd className="text-white sm:col-span-2">{formData.sportsInfo.primarySport?.name}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Level:</dt><dd className="text-white sm:col-span-2">{formData.sportsInfo.skillLevel?.name}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Experience:</dt><dd className="text-white sm:col-span-2">{formData.sportsInfo.yearsExperience} years</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Achievements:</dt><dd className="text-white sm:col-span-2 whitespace-pre-wrap">{formData.sportsInfo.achievements}</dd> </div>
                                    </dl>
                                </Disclosure.Panel>
                                </Transition>
                                </>
                            )}
                           </Disclosure>
                        </div>
                         <div className="bg-emerald-900/40 backdrop-blur-sm shadow overflow-hidden sm:rounded-md border border-white/20">
                           <Disclosure>
                             {({ open }) => (
                                <>
                                <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-sm font-medium text-left text-white hover:bg-emerald-900/60 focus:outline-none focus-visible:ring focus-visible:ring-emerald-500 focus-visible:ring-opacity-75">
                                    <span>Financial Need</span>
                                    <ChevronUpDownIcon className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-emerald-300`} />
                                </Disclosure.Button>
                                <Transition as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm border-t border-white/10">
                                     <dl>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Description:</dt><dd className="text-white sm:col-span-2 whitespace-pre-wrap">{formData.financialNeed.description}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Amount:</dt><dd className="text-white sm:col-span-2">Rs. {formData.financialNeed.requestedAmount} / month</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Facilities:</dt><dd className="text-white sm:col-span-2">{formData.financialNeed.facilitiesNeeded.join(', ')}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Usage:</dt><dd className="text-white sm:col-span-2 capitalize">{formData.financialNeed.monthlyUsage}</dd> </div>
                                    </dl>
                                </Disclosure.Panel>
                                </Transition>
                                </>
                            )}
                           </Disclosure>
                        </div>
                         <div className="bg-emerald-900/40 backdrop-blur-sm shadow overflow-hidden sm:rounded-md border border-white/20">
                           <Disclosure>
                             {({ open }) => (
                                <>
                                <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-sm font-medium text-left text-white hover:bg-emerald-900/60 focus:outline-none focus-visible:ring focus-visible:ring-emerald-500 focus-visible:ring-opacity-75">
                                    <span>Reference</span>
                                    <ChevronUpDownIcon className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-emerald-300`} />
                                </Disclosure.Button>
                                <Transition as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm border-t border-white/10">
                                    <dl>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Name:</dt><dd className="text-white sm:col-span-2">{formData.reference.name}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Relationship:</dt><dd className="text-white sm:col-span-2">{formData.reference.relationship}</dd> </div>
                                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Contact:</dt><dd className="text-white sm:col-span-2">{formData.reference.contactInfo}</dd> </div>
                                        {formData.reference.organizationName && <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Organization:</dt><dd className="text-white sm:col-span-2">{formData.reference.organizationName}</dd> </div>}
                                    </dl>
                                </Disclosure.Panel>
                                </Transition>
                                </>
                            )}
                           </Disclosure>
                        </div>
                         <div className="bg-emerald-900/40 backdrop-blur-sm shadow overflow-hidden sm:rounded-md border border-white/20">
                           <Disclosure>
                            {({ open }) => (
                                <>
                                <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-sm font-medium text-left text-white hover:bg-emerald-900/60 focus:outline-none focus-visible:ring focus-visible:ring-emerald-500 focus-visible:ring-opacity-75">
                                    <span>Documents & Supporting Info</span>
                                    <ChevronUpDownIcon className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-emerald-300`} />
                                </Disclosure.Button>
                                <Transition as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm border-t border-white/10">
                                     {formData.documents.length > 0 ? (
                                        <>
                                        <p className="text-emerald-200 mb-2 font-medium">Uploaded Documents:</p>
                                          <ul className="border border-white/10 rounded-md divide-y divide-white/10 bg-emerald-900/20 mb-4">
                                            {formData.documents.map((file, index) => (
                                              <li key={index} className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                                                <div className="w-0 flex-1 flex items-center">
                                                  <PaperClipIcon className="flex-shrink-0 h-4 w-4 text-emerald-300" aria-hidden="true" />
                                                  <span className="ml-2 flex-1 w-0 truncate text-white" title={file.name}>{file.name}</span>
                                                </div>
                                                <span className="ml-4 flex-shrink-0 font-medium text-emerald-300 text-xs">{formatFileSize(file.size)}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </>
                                        ) : (
                                          <p className="text-sm text-emerald-200 mb-4">No documents uploaded.</p>
                                        )}
                                     <dl>
                                        {formData.supportingInfo.previousAid && <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Previous Aid:</dt><dd className="text-white sm:col-span-2 whitespace-pre-wrap">{formData.supportingInfo.previousAid}</dd> </div>}
                                        {formData.supportingInfo.otherPrograms && <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Other Programs:</dt><dd className="text-white sm:col-span-2 whitespace-pre-wrap">{formData.supportingInfo.otherPrograms}</dd> </div>}
                                        {formData.supportingInfo.additionalInfo && <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4"> <dt className="text-emerald-200">Additional Info:</dt><dd className="text-white sm:col-span-2 whitespace-pre-wrap">{formData.supportingInfo.additionalInfo}</dd> </div>}
                                    </dl>
                                </Disclosure.Panel>
                                </Transition>
                                </>
                            )}
                           </Disclosure>
                        </div>

                        {/* Terms Agreement */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={formData.terms}
                                onChange={handleCheckboxChange}
                                className={`focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-white/30 bg-white/10 rounded ${ formErrors.terms ? 'border-red-500 ring-1 ring-red-500' : '' }`}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="terms" className={`font-medium ${formErrors.terms ? 'text-red-400' : 'text-white'}`}>Declaration and Consent *</label>
                              <p className="text-emerald-200">By checking this box, I certify that all the information provided in this application is true, accurate, and complete to the best of my knowledge. I understand that providing false or misleading information may result in the rejection of my application or withdrawal of any aid granted. I consent to SportsBookSL verifying the information provided, including contacting the reference listed. I have read and agree to the platform's <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline">Terms and Conditions</Link> and <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline">Privacy Policy</Link>.</p>
                              {formErrors.terms && (<p className="mt-1 text-sm text-red-400">{formErrors.terms}</p>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="mt-10 pt-6 border-t border-white/10 flex justify-between">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="inline-flex items-center px-4 py-2 border border-white/30 shadow-sm text-sm font-medium rounded-md text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back
                      </button>
                    ) : (
                      <div></div> // Placeholder to keep button alignment
                    )}

                    {currentStep < 6 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/30 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="relative z-10 flex items-center">
                          Next Step
                          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="absolute inset-0 h-full w-full bg-white/[0.08] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.terms} // Disable if submitting OR terms not checked
                        className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-base font-medium text-white shadow-lg transition-all duration-300 hover:shadow-orange-500/30 hover:shadow-xl hover:scale-105 ${ (isSubmitting || !formData.terms) ? 'opacity-60 cursor-not-allowed' : 'hover:from-yellow-600 hover:to-orange-600' }`}
                      >
                        <span className="relative z-10 flex items-center">
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            'Submit Application'
                          )}
                        </span>
                        <span className="absolute inset-0 h-full w-full bg-white/[0.08] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CSS Animations - Keep as is */}
            <style jsx>{`
              @keyframes fielder-move { 0% { transform: translate(0, 0); } 25% { transform: translate(50px, 20px); } 50% { transform: translate(20px, 50px); } 75% { transform: translate(-30px, 20px); } 100% { transform: translate(0, 0); } }
              .animate-fielder-move { animation: fielder-move 12s ease-in-out infinite; }
              @keyframes batsman-ready { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
              .animate-batsman-ready { animation: batsman-ready 3s ease-in-out infinite; }
              @keyframes nonstriker-ready { 0% { transform: translateX(0); } 50% { transform: translateX(10px); } 100% { transform: translateX(0); } }
              .animate-nonstriker-ready { animation: nonstriker-ready 5s ease-in-out infinite; }
              @keyframes wicketkeeper-ready { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-5px) rotate(5deg); } }
              .animate-wicketkeeper-ready { animation: wicketkeeper-ready 2s ease-in-out infinite; }
              @keyframes bowler-run { 0% { transform: translateY(0); } 100% { transform: translateY(-100px); } }
              .animate-bowler-run { animation: bowler-run 5s ease-in-out infinite alternate; }
              @keyframes cricket-ball { 0% { transform: translate(0, 0); } 100% { transform: translate(-80px, -100px); } }
              .animate-cricket-ball { animation: cricket-ball 5s ease-in infinite alternate; }
              @keyframes bat-swing { 0%, 70%, 100% { transform: rotate(45deg); } 80%, 90% { transform: rotate(-45deg); } }
              .animate-bat-swing { animation: bat-swing 5s ease-in-out infinite; }
              @keyframes ball-trajectory { 0% { width: 0; opacity: 0.7; } 100% { width: 100%; opacity: 0; } }
              .animate-ball-trajectory { animation: ball-trajectory 5s ease-in infinite alternate; transform-origin: left; }
              @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
              .animate-float { animation: float 6s ease-in-out infinite; }
              @keyframes pulse-slow { 50% { opacity: .7; } }
              .animate-pulse-slow { animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
              @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
              .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
              @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
              .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
              .animation-delay-500 { animation-delay: 0.5s; }
              .animation-delay-1000 { animation-delay: 1s; }
              /* Style for date input */
              input[type="date"]::-webkit-calendar-picker-indicator {
                filter: invert(0.8) brightness(1.5); /* Adjust color to be visible on dark bg */
                cursor: pointer;
              }
              /* Disclosure component focus styles */
               .focus-visible\:ring-emerald-500:focus-visible {
                    --tw-ring-color: #10b981; /* Emerald-500 */
                }
                .focus-visible\:ring-opacity-75:focus-visible {
                     --tw-ring-opacity: 0.75;
                 }
            `}</style>
          </div>
        );
      }