'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import * as trainerService from '@/services/trainerService';
import * as authService from '@/services/authService';

// --- Import Icons ---
import {
  ChevronLeftIcon, CalendarDaysIcon, CreditCardIcon, UserCircleIcon,
  ClockIcon, CurrencyDollarIcon, InformationCircleIcon, MapPinIcon,
  BuildingOffice2Icon, LockClosedIcon, ShieldCheckIcon, UserGroupIcon
} from '@heroicons/react/24/solid';

// --- Interfaces ---
interface TrainerInfo {
  _id: string;
  name: string;
  location: string;
  specialization: string;
  hourlyRate: number;
  profileImage: string;
  associatedFacilities?: {
    _id: string;
    name: string;
    location: string;
  }[];
}

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-trainer.png';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const trainerId = typeof params.id === 'string' ? params.id : undefined;

  // --- State ---
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [participants, setParticipants] = useState<number>(1);
  const [sessionHours, setSessionHours] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState({ cardHolder: '', cardNumber: '', expiration: '', cvc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Available time slots
  const availableTimeSlots = [
    '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00',
    '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
    '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
    '19:00 - 20:00'
  ];

  // --- Check Authentication ---
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      const currentPath = `/trainers/${trainerId}/book`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      setIsAuthChecked(true);
    }
  }, [router, trainerId]);

  // --- Fetch Trainer Data ---
  useEffect(() => {
    if (!isAuthChecked || !trainerId) {
        if (!trainerId && isAuthChecked) {
             setError("Trainer ID is missing or invalid.");
             setLoading(false);
        }
        return;
    }

    const fetchTrainerInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await trainerService.getTrainerById(trainerId);
        setTrainer({
          _id: data._id, name: data.name, location: data.location,
          specialization: data.specialization, hourlyRate: data.hourlyRate,
          profileImage: data.profileImage, associatedFacilities: data.associatedFacilities
        });
      } catch (err: any) {
        console.error('Error fetching trainer info:', err);
        setError(typeof err === 'string' ? err : 'Failed to load trainer details.');
        setTrainer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerInfo();
  }, [trainerId, isAuthChecked]);

  // --- Calculations ---
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const sessionCost = useMemo(() => {
    if (!trainer) return 0;
    return trainer.hourlyRate * sessionHours;
  }, [trainer, sessionHours]);

  const totalCost = useMemo(() => sessionCost, [sessionCost]);

  // --- Event Handlers ---
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  // --- Submit Booking ---
  const handleSubmitBooking = async () => {
    if (!trainer || !selectedDate || !selectedTime || !termsAgreed || !paymentDetails.cardHolder || !paymentDetails.cardNumber || !paymentDetails.expiration || !paymentDetails.cvc) {
      setError('Please complete all required fields (Date, Time, Payment Info) and agree to terms.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const bookingData = {
      date: selectedDate,
      timeSlot: selectedTime,
      facility: selectedFacility || undefined,
      participants: participants,
      sessionHours: sessionHours,
      specialRequests: specialRequests,
    };

    console.log("Submitting Trainer Booking Data to API:", bookingData);

    try {
      const response = await trainerService.bookSession(trainer._id, bookingData);
      console.log('Booking successful response:', response);

      const newBookingId = response?._id || response?.booking?._id || response?.bookingId;

      if (!newBookingId) {
          console.error("Booking ID not found in API response:", response);
          setError("Booking created, but confirmation failed. Please contact support.");
          setIsSubmitting(false);
          return;
      }

      router.push(`/bookings/confirmation?id=${newBookingId}&type=trainer`);

    } catch (err: any) {
      console.error('Error submitting booking:', err);
      setError(typeof err === 'string' ? err : (err.message || 'Booking failed. Please check details or try again.'));
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---

  // Show loading while checking auth or fetching data
  if (!isAuthChecked || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
        <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="ml-4 text-xl font-semibold text-white">Loading...</p>
      </div>
    );
  }

  // Show error if fetching failed
  if (error && !trainer) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-4 text-center">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center border border-white/30"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2"/> Go Back
        </button>
      </div>
    );
  }

  // Should not happen if auth redirect works, but good fallback
  if (!trainer) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Could Not Load Trainer</h2>
        <p className="text-emerald-100 mb-4 text-center">Please ensure you are logged in and the trainer ID is correct.</p>
        <Link href="/trainers" className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30">Back to Trainers</Link>
      </div>
    );
  }

  const trainerImageUrl = trainer.profileImage ? `${BACKEND_BASE_URL}${trainer.profileImage}` : FALLBACK_IMAGE;

  // --- Main Return JSX ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 relative overflow-hidden pb-16">
      {/* Cricket Stadium Background */}
      <div className="absolute inset-0">
        {/* Oval field */}
        <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
        
        {/* Pitch - LEFT SIDE */}
        <div className="absolute top-1/2 left-[20%] w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
          {/* Crease markings */}
          <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
          
          {/* Wickets */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
          </div>
          
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
          </div>
        </div>
        
        {/* Second pitch - RIGHT SIDE */}
        <div className="absolute top-1/2 right-[20%] w-40 h-96 bg-yellow-100/20 translate-x-1/2 -translate-y-1/2 border border-white/10">
          {/* Crease markings */}
          <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
          
          {/* Wickets */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
          </div>
          
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
            <div className="w-1 h-8 bg-white/80"></div>
          </div>
        </div>
        
        {/* Boundary rope */}
        <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] rounded-full border-dashed border-4 border-white/20"></div>
        
        {/* Animated players - ORIGINAL FIELDERS */}
        <div className="absolute w-6 h-8 top-[30%] left-[10%] animate-fielder-move">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[70%] right-[10%] animate-fielder-move animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[40%] left-[5%] animate-fielder-move animation-delay-1000">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>
        
        {/* Batsman - LEFT SIDE */}
        <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
            <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
          </div>
        </div>
        
        {/* Bowler - LEFT SIDE */}
        <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
            <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
          </div>
        </div>
        
        {/* Batsman - RIGHT SIDE */}
        <div className="absolute w-8 h-12 top-[40%] right-[15%] animate-batsman-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
            <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
          </div>
        </div>
        
        {/* Bowler - RIGHT SIDE */}
        <div className="absolute w-8 h-12 bottom-[35%] right-[25%] animate-bowler-run animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
            <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
          </div>
        </div>
        
        {/* NEW PLAYERS - JUST ADDING 4 */}
        
        {/* Wicket-keeper - LEFT SIDE (NEW) */}
        <div className="absolute w-6 h-8 top-[35%] left-[15%] animate-wicketkeeper-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
          </div>
        </div>
        
        {/* Wicket-keeper - RIGHT SIDE (NEW) */}
        <div className="absolute w-6 h-8 top-[35%] right-[15%] animate-wicketkeeper-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
          </div>
        </div>
        
        {/* Non-striker - LEFT SIDE (NEW) */}
        <div className="absolute w-8 h-12 top-[55%] left-[18%] animate-nonstriker-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
          </div>
        </div>
        
        {/* Non-striker - RIGHT SIDE (NEW) */}
        <div className="absolute w-8 h-12 top-[55%] right-[18%] animate-nonstriker-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
          </div>
        </div>
        
        {/* Ball trajectories */}
        <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[18%] animate-ball-trajectory"></div>
        <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] right-[18%] animate-ball-trajectory animation-delay-500"></div>
        
        {/* Stadium elements */}
        <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>
        
      
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 pb-32">
        {/* Back Button */}
        <button onClick={() => router.back()} className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/30 shadow-md transition-all duration-300 group border border-white/30">
          <ChevronLeftIcon className="h-5 w-5 mr-1 text-white group-hover:text-white transition-colors"/> Back
        </button>

        {/* Header */}
        <div className="mb-12 pt-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-white">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 blur-xl opacity-30"></span>
              <span className="relative">Book Training Session</span>
            </span>
          </h1>
          <p className="mt-2 text-lg text-emerald-100 max-w-xl mx-auto">
            Reserve your personal training session with <span className="font-semibold text-white">{trainer.name}</span>.
          </p>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Left Column: Booking Form & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Booking Form Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3 flex items-center">
                  <CalendarDaysIcon className="h-6 w-6 mr-2 text-emerald-300" />
                  Session Details
                </h2>
                
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-white mb-1">
                      Date <span className="text-emerald-300">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  {/* Time */}
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-white mb-1">
                      Time Slot <span className="text-emerald-300">*</span>
                    </label>
                    <select
                      id="time"
                      name="time"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                    >
                      <option value="">Select time slot</option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-white mb-1">
                      Session Duration (hours)
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      value={sessionHours}
                      onChange={(e) => setSessionHours(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4].map((hours) => (
                        <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Participants */}
                  <div>
                    <label htmlFor="participants" className="block text-sm font-medium text-white mb-1">
                      Number of Participants
                    </label>
                    <select
                      id="participants"
                      name="participants"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      value={participants}
                      onChange={(e) => setParticipants(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>{num} person{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Facility Selection - Only shown if trainer has associated facilities */}
                  {trainer.associatedFacilities && trainer.associatedFacilities.length > 0 && (
                    <div className="md:col-span-2">
                      <label htmlFor="facility" className="block text-sm font-medium text-white mb-1">
                        Facility (Optional)
                      </label>
                      <select
                        id="facility"
                        name="facility"
                        className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                        value={selectedFacility}
                        onChange={(e) => setSelectedFacility(e.target.value)}
                      >
                        <option value="">No specific facility (trainer's discretion)</option>
                        {trainer.associatedFacilities.map((facility) => (
                          <option key={facility._id} value={facility._id}>
                            {facility.name} - {facility.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Special Requests */}
                  <div className="md:col-span-2">
                    <label htmlFor="requests" className="block text-sm font-medium text-white mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      id="requests"
                      name="requests"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      placeholder="Any specific training needs or accommodations..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3 flex items-center">
                  <CreditCardIcon className="h-6 w-6 mr-2 text-emerald-300" />
                  Payment Details
                </h2>
                
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Holder */}
                  <div className="md:col-span-2">
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-white mb-1">
                      Card Holder <span className="text-emerald-300">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="cardHolder"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      placeholder="Name on card"
                      value={paymentDetails.cardHolder}
                      onChange={handlePaymentInputChange}
                      required
                    />
                  </div>
                  
                  {/* Card Number */}
                  <div className="md:col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-white mb-1">
                      Card Number <span className="text-emerald-300">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      placeholder="0000 0000 0000 0000"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentInputChange}
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  {/* Expiration */}
                  <div>
                    <label htmlFor="expiration" className="block text-sm font-medium text-white mb-1">
                      Expiration Date <span className="text-emerald-300">*</span>
                    </label>
                    <input
                      type="text"
                      id="expiration"
                      name="expiration"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      placeholder="MM/YY"
                      value={paymentDetails.expiration}
                      onChange={handlePaymentInputChange}
                      maxLength={5}
                      required
                    />
                  </div>
                  
                  {/* CVC */}
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-white mb-1">
                      CVC <span className="text-emerald-300">*</span>
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm"
                      placeholder="000"
                      value={paymentDetails.cvc}
                      onChange={handlePaymentInputChange}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/30 text-emerald-600 focus:ring-emerald-500"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-white">
                        I agree to the <a href="/terms" className="text-emerald-300 hover:text-emerald-200">Terms and Conditions</a> <span className="text-emerald-300">*</span>
                      </label>
                      <p className="text-white/70 mt-1">
                        Including the cancellation policy and trainer's code of conduct.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-lg">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}
                
                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
                
                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center">
                  <LockClosedIcon className="h-4 w-4 text-white/60 mr-1.5" />
                  <p className="text-xs text-white/60">Secure payment processing</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Summary & Trainer Info */}
          <div className="space-y-8">
            {/* Booking Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                  <InformationCircleIcon className="h-6 w-6 mr-2 text-emerald-300" />
                  Booking Summary
                </h2>
                
                <dl className="mt-4 space-y-4">
                  <div className="flex justify-between text-white/80">
                    <dt className="text-sm">Training with</dt>
                    <dd className="text-sm font-medium text-white">{trainer.name}</dd>
                  </div>
                  
                  <div className="flex justify-between text-white/80">
                    <dt className="text-sm">Location</dt>
                    <dd className="text-sm font-medium text-white">{trainer.location}</dd>
                  </div>
                  
                  <div className="flex justify-between text-white/80">
                    <dt className="text-sm">Specialization</dt>
                    <dd className="text-sm font-medium text-white">{trainer.specialization}</dd>
                  </div>
                  
                  {selectedDate && (
                    <div className="flex justify-between text-white/80">
                      <dt className="text-sm">Date</dt>
                      <dd className="text-sm font-medium text-white">{new Date(selectedDate).toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="flex justify-between text-white/80">
                      <dt className="text-sm">Time</dt>
                      <dd className="text-sm font-medium text-white">{selectedTime}</dd>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-white/80">
                    <dt className="text-sm">Duration</dt>
                    <dd className="text-sm font-medium text-white">{sessionHours} hour{sessionHours > 1 ? 's' : ''}</dd>
                  </div>
                  
                  <div className="flex justify-between text-white/80">
                    <dt className="text-sm">Participants</dt>
                    <dd className="text-sm font-medium text-white">{participants}</dd>
                  </div>
                  
                  {selectedFacility && trainer.associatedFacilities && (
                    <div className="flex justify-between text-white/80">
                      <dt className="text-sm">Facility</dt>
                      <dd className="text-sm font-medium text-white">
                        {trainer.associatedFacilities.find(f => f._id === selectedFacility)?.name || 'Selected facility'}
                      </dd>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex justify-between text-white/80">
                      <dt className="text-sm">Base Rate</dt>
                      <dd className="text-sm font-medium text-white">{formatCurrency(trainer.hourlyRate)} / hour</dd>
                    </div>
                    
                    <div className="flex justify-between pt-4 text-lg font-bold text-white">
                      <dt>Total Cost</dt>
                      <dd className="text-emerald-300">{formatCurrency(totalCost)}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Trainer Info Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                  <UserCircleIcon className="h-6 w-6 mr-2 text-emerald-300" />
                  Trainer Information
                </h2>
                
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-800 to-green-700 shadow-md flex-shrink-0 border border-white/30">
                    <img
                      src={trainerImageUrl}
                      alt={trainer.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">{trainer.name}</h3>
                    <p className="text-emerald-300 text-sm">{trainer.specialization}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-start text-white/80">
                    <MapPinIcon className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="ml-2 text-sm">{trainer.location}</span>
                  </div>
                  
                  <div className="flex items-start text-white/80">
                    <CurrencyDollarIcon className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="ml-2 text-sm">{formatCurrency(trainer.hourlyRate)} per hour</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href={`/trainers/${trainer._id}`}>
                    <button className="w-full inline-flex items-center justify-center rounded-md bg-white/10 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-300">
                      View Full Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        /* Custom styling for the dropdown menus to match the screenshots */
        select option {
          background-color: white;
          color: #064e3b;
        }
        
        /* Override any Tailwind form styling that might interfere */
        input, select, textarea {
          appearance: auto;
        }
        
        /* Ensure date picker arrow appears properly */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        
        @keyframes fielder-move {
          0% { transform: translate(0, 0); }
          25% { transform: translate(50px, 20px); }
          50% { transform: translate(20px, 50px); }
          75% { transform: translate(-30px, 20px); }
          100% { transform: translate(0, 0); }
        }
        .animate-fielder-move {
          animation: fielder-move 12s ease-in-out infinite;
        }
        
        @keyframes batsman-ready {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-batsman-ready {
          animation: batsman-ready 3s ease-in-out infinite;
        }
        
        @keyframes nonstriker-ready {
          0% { transform: translateX(0); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }
        .animate-nonstriker-ready {
          animation: nonstriker-ready 5s ease-in-out infinite;
        }
        
        @keyframes wicketkeeper-ready {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        .animate-wicketkeeper-ready {
          animation: wicketkeeper-ready 2s ease-in-out infinite;
        }
        
        @keyframes bowler-run {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100px); }
        }
        .animate-bowler-run {
          animation: bowler-run 5s ease-in-out infinite alternate;
        }
        
        @keyframes cricket-ball {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-80px, -100px); }
        }
        .animate-cricket-ball {
          animation: cricket-ball 5s ease-in infinite alternate;
        }
        
        @keyframes bat-swing {
          0%, 70%, 100% { transform: rotate(45deg); }
          80%, 90% { transform: rotate(-45deg); }
        }
        .animate-bat-swing {
          animation: bat-swing 5s ease-in-out infinite;
        }
        
        @keyframes ball-trajectory {
          0% { width: 0; opacity: 0.7; }
          100% { width: 100%; opacity: 0; }
        }
        .animate-ball-trajectory {
          animation: ball-trajectory 5s ease-in infinite alternate;
          transform-origin: left;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}