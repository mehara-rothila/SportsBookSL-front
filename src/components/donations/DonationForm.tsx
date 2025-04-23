'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
// Import the specific service function
import { makeDonation } from '@/services/donationService'; // Adjust path if needed

interface DonationFormProps {
  athleteId?: string;
  athleteName?: string;
  defaultAmount?: number;
}

const donationOptions = [
  { value: 1000, label: 'Rs. 1,000', description: 'Provides transportation for 1 week' },
  { value: 2500, label: 'Rs. 2,500', description: 'Covers facility access for 1 week' },
  { value: 5000, label: 'Rs. 5,000', description: 'Covers basic equipment rental' },
  { value: 10000, label: 'Rs. 10,000', description: 'Provides comprehensive training support' },
  { value: 'custom', label: 'Custom Amount', description: 'Choose your own amount' }
];

export default function DonationForm({ athleteId, athleteName, defaultAmount }: DonationFormProps) {
  // Find default option or fallback
  const initialOption = donationOptions.find(opt => opt.value === defaultAmount) || donationOptions[2]; // Default to 5000 if not found
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const [customAmount, setCustomAmount] = useState(defaultAmount && initialOption.value === 'custom' ? String(defaultAmount) : '');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalDonationAmount, setFinalDonationAmount] = useState<number>(0); // Store amount for success message

  const donationAmount = selectedOption.value === 'custom'
    ? parseInt(customAmount) || 0
    : (typeof selectedOption.value === 'number' ? selectedOption.value : 0); // Ensure number

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!athleteId) {
        setError("Cannot process donation: Athlete ID is missing.");
        return;
    }

    // Validate donation amount
    let finalAmount = 0;
    if (selectedOption.value === 'custom') {
        finalAmount = parseInt(customAmount) || 0;
        if (finalAmount < 100) { // Example minimum custom amount
             setError("Please enter a valid custom amount (minimum Rs. 100).");
             return;
        }
    } else if (typeof selectedOption.value === 'number') {
        finalAmount = selectedOption.value;
    }

    if (finalAmount <= 0) {
        setError("Please select or enter a valid donation amount.");
        return;
    }

    // Validate donor info
    if (!isAnonymous && !donorName.trim()) {
        setError("Please enter your name or choose to donate anonymously.");
        return;
    }
     if (!donorEmail.trim()) {
        setError("Please enter your email address.");
        return;
    }
    if (!/\S+@\S+\.\S+/.test(donorEmail)) {
        setError("Please enter a valid email address.");
        return;
    }


    setIsLoading(true);
    setFinalDonationAmount(finalAmount); // Store for success message

    const donationData = {
        amount: finalAmount,
        isAnonymous: isAnonymous,
        donorName: isAnonymous ? undefined : donorName.trim(), // Send name only if not anonymous
        donorEmail: donorEmail.trim(), // Always send email
        message: message.trim() || undefined, // Send message if provided
    };

    console.log("Submitting Simplified Donation Data:", donationData);

    try {
      // *** Call the donation service function ***
      const response = await makeDonation(athleteId, donationData);

      console.log("Simplified Donation response:", response);
      setIsComplete(true); // Show success view

    } catch (err: any) {
      console.error('Error submitting simplified donation:', err);
      setError(typeof err === 'string' ? err : (err.message || 'Donation failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  if (isComplete) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-800/60 backdrop-blur-sm mb-6 border border-emerald-500/30">
                <CheckCircleIcon className="h-10 w-10 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-white/90 mb-6">Your generous contribution of <span className="font-medium text-emerald-300">Rs. {finalDonationAmount.toLocaleString()}</span> has been recorded and will make a real difference for {athleteName}.</p>
              <div className="bg-emerald-900/40 backdrop-blur-sm p-4 text-left mb-6 rounded-xl border border-white/20 shadow-inner">
                  <h3 className="font-medium text-white mb-2">What Happens Next?</h3>
                  <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-start"><CheckCircleIcon className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0" /><span>Confirmation email sent to {donorEmail} (simulated)</span></li>
                      <li className="flex items-start"><CheckCircleIcon className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0" /><span>Athlete's raised amount updated</span></li>
                      <li className="flex items-start"><CheckCircleIcon className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0" /><span>You may receive impact updates</span></li>
                  </ul>
              </div>
              <div className="flex space-x-4 justify-center">
                  <Link href="/donations" className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]">See Other Athletes</Link>
                  <button 
                    type="button" 
                    onClick={() => { setIsComplete(false); /* Reset other fields if needed */ }} 
                    className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-white/20 transition-all duration-300"
                  >
                    Make Another Donation
                  </button>
              </div>
          </div>
      </div>
    );
  }

  // --- Main Form Rendering ---
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-4 text-white">
        <h2 className="text-xl font-semibold">Make a Donation</h2>
        <p className="text-emerald-100 text-sm">Support talented athletes like {athleteName || 'this athlete'}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && ( // Display error message
            <div className="mb-4 p-3 bg-red-900/40 backdrop-blur-sm text-red-200 border border-red-500/30 rounded-lg text-sm">
                {error}
            </div>
        )}
        {athleteName && (
          <div className="mb-6 bg-emerald-900/40 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-inner">
            <p className="text-white/90">Donating to support <span className="font-medium text-white">{athleteName}</span></p>
          </div>
        )}

        {/* Donation Amount Selection (Radio Group) */}
        <div className="mb-6">
          <h3 className="font-medium text-white mb-3">Select Donation Amount</h3>
          <RadioGroup value={selectedOption} onChange={setSelectedOption}>
            <div className="space-y-3">
              {donationOptions.map((option) => (
                <RadioGroup.Option key={option.value.toString()} value={option} className={({ active, checked }) => `${ active ? 'ring-2 ring-offset-2 ring-emerald-500' : '' } ${ checked ? 'bg-emerald-800/60 border-emerald-600/50' : 'bg-white/10 border-white/20' } relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all backdrop-blur-sm shadow-sm`}>
                  {({ active, checked }) => (
                    <>
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <RadioGroup.Label as="span" className={`block text-sm font-medium ${checked ? 'text-white' : 'text-white/90'}`}>
                            {option.label}
                          </RadioGroup.Label>
                          <RadioGroup.Description as="span" className={`mt-1 flex items-center text-sm ${checked ? 'text-emerald-200' : 'text-white/70'}`}>
                            {option.description}
                          </RadioGroup.Description>
                        </span>
                      </span>
                      {checked && <CheckCircleIcon className="h-5 w-5 text-emerald-400" aria-hidden="true" />}
                      <span className={`${ active ? 'border' : 'border-2' } ${ checked ? 'border-emerald-500' : 'border-transparent' } pointer-events-none absolute -inset-px rounded-lg`} aria-hidden="true" />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
             {/* Custom Amount Input */}
             {selectedOption.value === 'custom' && (
                <div className="mt-4">
                    <label htmlFor="customAmount" className="sr-only">Custom Amount</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-white/70 sm:text-sm">Rs.</span>
                        </div>
                        <input 
                          type="number" 
                          name="customAmount" 
                          id="customAmount" 
                          className="block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 pl-10 pr-4 text-white placeholder:text-white/50 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm sm:leading-6" 
                          placeholder="Enter amount (min 100)" 
                          value={customAmount} 
                          onChange={(e) => setCustomAmount(e.target.value)} 
                          min="100"
                        />
                    </div>
                </div>
            )}
          </RadioGroup>
        </div>

        {/* Donor Information */}
        <div className="mb-6">
          <h3 className="font-medium text-white mb-3">Your Information</h3>
          <div className="space-y-4">
            {/* Name Input (Disabled if Anonymous) */}
            <div>
                <label htmlFor="donor-name" className="block text-sm font-medium leading-6 text-white">Your Name</label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="donor-name"
                        id="donor-name"
                        className={`block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm sm:leading-6 ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="John Doe"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        required={!isAnonymous} // Required only if not anonymous
                        disabled={isAnonymous}
                    />
                </div>
            </div>
            {/* Email Input (Always Required) */}
            <div>
                <label htmlFor="donor-email" className="block text-sm font-medium leading-6 text-white">Email Address *</label>
                 <div className="mt-1">
                    <input
                        type="email"
                        name="donor-email"
                        id="donor-email"
                        className="block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm sm:leading-6"
                        placeholder="john@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        required // Always required
                    />
                </div>
            </div>
            {/* Anonymous Checkbox */}
            <div className="relative flex gap-x-3">
                <div className="flex h-6 items-center">
                    <input
                        id="anonymous"
                        name="anonymous"
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/30 bg-white/10 text-emerald-600 focus:ring-emerald-500"
                        checked={isAnonymous}
                        onChange={() => setIsAnonymous(!isAnonymous)}
                    />
                </div>
                <div className="text-sm leading-6">
                    <label htmlFor="anonymous" className="font-medium text-white">Make this donation anonymous</label>
                    <p className="text-white/70">Your name will not be displayed publicly.</p>
                </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium leading-6 text-white">Message (Optional)</label>
          <div className="mt-1">
            <textarea 
              id="message" 
              name="message" 
              rows={3} 
              className="block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm sm:leading-6" 
              placeholder="Your message of encouragement..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Donation Summary */}
        <div className="bg-emerald-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20 shadow-inner">
          <h3 className="font-medium text-white mb-2">Donation Summary</h3>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/80">Donation Amount</span>
            <span className="text-sm font-medium text-emerald-200">Rs. {donationAmount.toLocaleString()}</span>
          </div>
          <div className="border-t border-white/20 pt-2 mt-2 flex justify-between">
            <span className="font-medium text-white">Total</span>
            <span className="font-medium text-emerald-200">Rs. {donationAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            disabled={isLoading || (selectedOption.value === 'custom' && (!customAmount || parseInt(customAmount) < 100)) || !donorEmail} // Disable if loading or invalid amount or no email
            className={`w-full rounded-xl py-3 px-4 text-white font-medium flex items-center justify-center transition-all shadow-md ${ isLoading || (selectedOption.value === 'custom' && (!customAmount || parseInt(customAmount) < 100)) || !donorEmail ? 'bg-emerald-700/40 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transform hover:translate-y-[-2px]' }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>Processing...
            </> 
          ) : (
            <>
              Complete Donation
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
        {/* Terms and Privacy */}
        <p className="mt-3 text-xs text-white/70 text-center">
          By donating, you agree to our <Link href="/terms" className="text-emerald-300 hover:text-emerald-200 underline">Terms</Link> and <Link href="/privacy" className="text-emerald-300 hover:text-emerald-200 underline">Privacy Policy</Link>
        </p>
      </form>
    </div>
  );
}