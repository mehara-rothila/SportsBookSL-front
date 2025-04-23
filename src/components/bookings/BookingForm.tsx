'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UsersIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  LockClosedIcon,
  CheckIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/solid';

interface BookingFormProps {
  facilityId: string;
  facilityName: string;
}

export default function BookingForm({ facilityId, facilityName }: BookingFormProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participants, setParticipants] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context in a real app
  
  // Generate time slots for the select input
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!date || !startTime || !endTime) {
      setError('Please select date and time for your booking.');
      setIsLoading(false);
      return;
    }
    
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      setIsLoading(false);
      return;
    }
    
    try {
      // This would be an API call in a real application
      console.log('Booking:', { 
        facilityId, 
        date, 
        startTime, 
        endTime, 
        participants, 
        specialRequests 
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, always succeed
      window.location.href = `/bookings/confirmation?facility=${facilityId}`;
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4 border border-white/20 shadow-md">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Sign In Required</h3>
          <p className="text-emerald-100 mb-5">Please sign in to book this facility.</p>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all duration-200 transform hover:scale-105"
          >
            Sign In <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <p className="mt-4 text-sm text-white/70">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-300 hover:text-emerald-200 hover:underline transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <form className="bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 overflow-hidden animate-fade-in" onSubmit={handleSubmit}>
      <div className="p-6 border-b border-white/20">
        <h3 className="text-xl font-bold text-white mb-1">Book {facilityName}</h3>
        <p className="text-emerald-100 text-sm">Fill in details to secure your booking</p>
      </div>
      
      <div className="p-6 space-y-5">
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-4 rounded-lg flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="booking-date" className="block text-sm font-medium text-white mb-1 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-1.5 text-emerald-400" />
            Date
          </label>
          <input
            id="booking-date"
            type="date"
            className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2.5 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-white mb-1 flex items-center">
              <ClockIcon className="h-5 w-5 mr-1.5 text-emerald-400" />
              Start Time
            </label>
            <select
              id="start-time"
              className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2.5 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            >
              <option value="" className="bg-emerald-900">Select time</option>
              {timeOptions.map((time) => (
                <option key={`start-${time}`} value={time} className="bg-emerald-900">
                  {time}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-white mb-1 flex items-center">
              <ClockIcon className="h-5 w-5 mr-1.5 text-emerald-400" />
              End Time
            </label>
            <select
              id="end-time"
              className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2.5 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            >
              <option value="" className="bg-emerald-900">Select time</option>
              {timeOptions.map((time) => (
                <option 
                  key={`end-${time}`} 
                  value={time}
                  disabled={time <= startTime} // Disable times earlier than or equal to start time
                  className="bg-emerald-900"
                >
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="participants" className="block text-sm font-medium text-white mb-1 flex items-center">
            <UsersIcon className="h-5 w-5 mr-1.5 text-emerald-400" />
            Number of Participants
          </label>
          <select
            id="participants"
            className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2.5 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          >
            {[...Array(30)].map((_, i) => (
              <option key={i} value={i + 1} className="bg-emerald-900">
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="special-requests" className="block text-sm font-medium text-white mb-1 flex items-center">
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-1.5 text-emerald-400" />
            Special Requests (Optional)
          </label>
          <textarea
            id="special-requests"
            rows={3}
            className="mt-1 block w-full rounded-md border-white/30 bg-white/10 backdrop-blur-sm py-2.5 px-3 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
            placeholder="Any specific requirements or equipment needs..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          ></textarea>
        </div>
        
        <div className="pt-3">
          <button
            type="submit"
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-[1.02]'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Book Now
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-emerald-900/40 backdrop-blur-sm p-4 border-t border-white/10">
        <p className="text-xs text-emerald-100 text-center">
          By clicking "Book Now" you agree to our{' '}
          <Link href="/terms" className="text-emerald-300 hover:text-emerald-200 hover:underline transition-colors">
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link href="/cancellation-policy" className="text-emerald-300 hover:text-emerald-200 hover:underline transition-colors">
            Cancellation Policy
          </Link>.
        </p>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </form>
  );
}