// src/app/bookings/confirmation/page.tsx

'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { format as formatDateFns } from 'date-fns';

// --- Import Icons ---
import {
    CheckCircleIcon, MapPinIcon, TruckIcon, TicketIcon,
    InformationCircleIcon, ArrowRightIcon, ArrowUturnLeftIcon, ArrowPathIcon,
    BuildingOffice2Icon, ClockIcon, CurrencyDollarIcon, UsersIcon,
    ChatBubbleBottomCenterTextIcon, WrenchScrewdriverIcon,
    CalendarDaysIcon, UserCircleIcon, AcademicCapIcon, HomeIcon,
    ChevronLeftIcon, StarIcon
} from '@heroicons/react/24/solid';

// --- Interfaces ---
interface RentedEquipment {
  equipmentName: string;
  quantity: number;
}

interface FacilityInfo {
  _id: string;
  name: string;
  address?: string;
  location?: string;
  images?: string[];
}

interface TrainerInfo {
  _id: string;
  name: string;
  specialization?: string;
  profileImage?: string;
}

interface BookingDetails {
  _id: string;
  bookingId?: string;
  date: string;
  timeSlot: string;
  facility?: FacilityInfo;
  trainer?: TrainerInfo;
  participants: number;
  rentedEquipment?: RentedEquipment[];
  needsTransportation?: boolean;
  specialRequests?: string;
  totalCost: number;
  bookingType?: 'facility' | 'trainer';
}

// --- Get Base URL & Fallback Images ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/facility-placeholder.jpg';
const FALLBACK_TRAINER_IMAGE = '/images/default-trainer.png';

// --- Helper Functions ---
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return 'N/A';
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

const formatTime = (num: number) => num.toString().padStart(2, '0');

// --- Main Component Logic ---
function BookingConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('id');
    const bookingTypeQueryParam = searchParams.get('type') as 'facility' | 'trainer' | null;

    // --- State ---
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- Fetch Booking Data ---
    useEffect(() => {
        if (!bookingId) {
            setError("Booking ID not found in URL.");
            setLoading(false);
            return;
        }

        const fetchBooking = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/bookings/${bookingId}`);

                if (response.data && response.data._id) {
                    let determinedType: 'facility' | 'trainer' = 'facility';
                    if (response.data.trainer && !response.data.facility) {
                        determinedType = 'trainer';
                    } else if (response.data.trainer && response.data.facility) {
                        determinedType = bookingTypeQueryParam || 'facility';
                    } else if (response.data.facility) {
                         determinedType = 'facility';
                    } else if (bookingTypeQueryParam) {
                        determinedType = bookingTypeQueryParam;
                    }

                    const bookingData: BookingDetails = {
                        ...response.data,
                        bookingType: determinedType
                    };
                    setBookingDetails(bookingData);
                } else {
                     console.warn("API returned data but no booking _id found for:", bookingId);
                     setError("Booking details could not be fully loaded.");
                     setBookingDetails(null);
                }
            } catch (err: any) {
                console.error("Error fetching booking details:", err);
                setError(err.response?.data?.message || err.message || "Failed to load booking details.");
                setBookingDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, bookingTypeQueryParam]);

    // --- Calculate Countdown ---
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!bookingDetails?.date || !bookingDetails?.timeSlot) {
            setIsExpired(true);
            setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        let initialDifference = 0;

        const calculateTimeRemaining = () => {
            try {
                const datePart = bookingDetails.date.split('T')[0];
                const startTime = bookingDetails.timeSlot.split('-')[0].trim();
                const bookingDateTimeString = `${datePart}T${startTime}:00`;
                const bookingDateTime = new Date(bookingDateTimeString);

                if (isNaN(bookingDateTime.getTime())) {
                    setIsExpired(true);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return { hours: 0, minutes: 0, seconds: 0 };
                }

                const now = new Date();
                const difference = bookingDateTime.getTime() - now.getTime();
                initialDifference = difference;

                if (difference <= 0) {
                    setIsExpired(true);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return { hours: 0, minutes: 0, seconds: 0 };
                }

                setIsExpired(false);
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                return { hours: days * 24 + hours, minutes, seconds };
            } catch (e) {
                console.error("Error calculating time remaining:", e);
                setIsExpired(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
                return { hours: 0, minutes: 0, seconds: 0 };
            }
        };

        const initialTime = calculateTimeRemaining();
        setTimeRemaining(initialTime);

        if (initialDifference > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(calculateTimeRemaining());
            }, 1000);
        } else {
             setIsExpired(true);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [bookingDetails]);

    // --- Get appropriate image URL ---
    const getImageUrl = useMemo(() => {
        if (!bookingDetails) return '';
        if (bookingDetails.bookingType === 'trainer' && bookingDetails.trainer?.profileImage) {
            return bookingDetails.trainer.profileImage.startsWith('http') ? bookingDetails.trainer.profileImage : `${BACKEND_BASE_URL}${bookingDetails.trainer.profileImage}`;
        } else if (bookingDetails.facility?.images && bookingDetails.facility.images.length > 0) {
            return bookingDetails.facility.images[0].startsWith('http') ? bookingDetails.facility.images[0] : `${BACKEND_BASE_URL}${bookingDetails.facility.images[0]}`;
        }
        return bookingDetails.bookingType === 'trainer' ? FALLBACK_TRAINER_IMAGE : FALLBACK_IMAGE;
    }, [bookingDetails]);

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-8 rounded-xl">
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="ml-4 text-xl font-semibold text-white">Loading Confirmation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white p-8">
                <h2 className="text-2xl font-bold mb-4">Error Loading Booking</h2>
                <p className="mb-4 text-center">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center border border-white/30">
                    <ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again
                </button>
            </div>
        );
    }

    if (!bookingDetails) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
                <p className="text-emerald-100 mb-4 text-center">We couldn't find the booking you were looking for.</p>
                <Link href="/facilities" className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30">
                    Browse Facilities
                </Link>
            </div>
        );
    }

    // --- Main Confirmation JSX ---
    return (
        <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen pt-24 pb-16 relative overflow-hidden">
            {/* Cricket Stadium Background */}
            <div className="absolute inset-0">
                {/* Oval field */}
                <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
                
                {/* Pitch */}
                <div className="absolute top-1/2 left-1/2 w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
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
                
                {/* Animated players */}
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
                
                {/* Batsman */}
                <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                        <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
                    </div>
                </div>
                
                {/* Bowler */}
                <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
                        <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
                    </div>
                </div>
                
                {/* Stadium elements */}
                <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
                <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>

            {/* Back Button */}
            <button onClick={() => router.back()} className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20 inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-800 hover:bg-white shadow-md transition-all duration-300 group">
                <ChevronLeftIcon className="h-4 w-4 mr-1 text-emerald-600 group-hover:text-emerald-800 transition-colors"/> Back
            </button>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Header Section */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30 mb-8 text-center">
                    <div className="pt-12 pb-10 px-6 relative">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 bg-emerald-600/80 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse-slow">
                                <CheckCircleIcon className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mt-6 tracking-tight">Booking Confirmed!</h1>
                        <p className="mt-3 text-lg text-emerald-100">
                            Your {bookingDetails.bookingType === 'trainer' ? 'training session' : 'facility booking'} is secured and ready to go.
                        </p>
                        <div className="mt-4 inline-flex items-center px-3.5 py-1.5 bg-emerald-700/60 backdrop-blur-sm rounded-full text-sm font-medium text-emerald-100 border border-emerald-600/30 shadow-sm">
                            <TicketIcon className="h-4 w-4 mr-2"/>
                            ID: {bookingDetails.bookingId || bookingDetails._id}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Main Details Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30 h-full">
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-4 flex items-center">
                                    <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                        <CalendarDaysIcon className="w-5 h-5 text-emerald-300" />
                                    </span>
                                    Booking Details
                                </h2>

                                <div className="space-y-6">
                                    {/* Date & Time */}
                                    <div className="flex items-start">
                                        <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                            <CalendarDaysIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-white">Date & Time</p>
                                            <p className="text-sm text-white/80">
                                                {formatDateFns(new Date(bookingDetails.date), 'EEEE, MMMM d, yyyy')}
                                            </p>
                                            <p className="text-sm text-white/80">{bookingDetails.timeSlot}</p>
                                        </div>
                                    </div>

                                    {/* Trainer */}
                                    {bookingDetails.trainer && (
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                                <UserCircleIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-white">
                                                    {bookingDetails.bookingType === 'trainer' ? 'Trainer' : 'Trainer (Included)'}
                                                </p>
                                                <p className="text-sm text-white/90 font-semibold">{bookingDetails.trainer.name}</p>
                                                {bookingDetails.trainer.specialization && 
                                                    <p className="text-sm text-white/80">{bookingDetails.trainer.specialization}</p>
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Facility */}
                                    {bookingDetails.facility && (
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                                <BuildingOffice2Icon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-white">
                                                    {bookingDetails.bookingType === 'facility' ? 'Facility' : 'Facility (Location)'}
                                                </p>
                                                <p className="text-sm text-white/90 font-semibold">{bookingDetails.facility.name}</p>
                                                <p className="text-sm text-white/80">
                                                    <MapPinIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
                                                    {bookingDetails.facility.address || bookingDetails.facility.location}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Participants */}
                                    <div className="flex items-start">
                                        <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                            <UsersIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-white">Participants</p>
                                            <p className="text-sm text-white/80">
                                                {bookingDetails.participants} person{bookingDetails.participants !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Equipment */}
                                    {bookingDetails.rentedEquipment && bookingDetails.rentedEquipment.length > 0 && (
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                                <WrenchScrewdriverIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-white">Equipment Rented</p>
                                                <ul className="text-sm text-white/80 space-y-1 mt-1">
                                                    {bookingDetails.rentedEquipment.map((item, index) => (
                                                        <li key={index} className="flex items-center">
                                                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full mr-2"></span>
                                                            {item.equipmentName} <span className="text-white/60 ml-1">(Qty: {item.quantity})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Transportation */}
                                    {bookingDetails.needsTransportation && (
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                                <TruckIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-white">Transportation</p>
                                                <p className="text-sm text-white/80">Round-trip transportation included</p>
                                                <p className="text-xs text-white/60 mt-1">Details will be shared closer to the date</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Requests */}
                                    {bookingDetails.specialRequests && (
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-800/60 rounded-full mr-4 backdrop-blur-sm">
                                                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-white">Special Requests</p>
                                                <p className="text-sm text-white/80 italic bg-white/10 p-3 rounded-lg border border-white/20 mt-1">
                                                    "{bookingDetails.specialRequests}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Total Amount */}
                                    <div className="mt-8 pt-6 border-t border-white/20">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-base font-medium text-white">Total Paid</p>
                                            <p className="text-2xl font-bold text-emerald-300">{formatCurrency(bookingDetails.totalCost)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Countdown Card */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <ClockIcon className="h-5 w-5 mr-2 text-emerald-300" />
                                    Time Until Your Booking
                                </h3>
                                {isExpired ? (
                                    <p className="text-center text-white/90 bg-emerald-800/40 p-4 rounded-lg border border-white/10">
                                        Your booking time has passed.
                                    </p>
                                ) : (
                                    <div className="flex justify-between gap-2">
                                        <div className="bg-emerald-800/40 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center flex-1">
                                            <div className="text-3xl font-bold text-white tabular-nums">{formatTime(timeRemaining.hours)}</div>
                                            <div className="text-xs text-white/60 uppercase tracking-wider mt-1">Hours</div>
                                        </div>
                                        <div className="bg-emerald-800/40 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center flex-1">
                                            <div className="text-3xl font-bold text-white tabular-nums">{formatTime(timeRemaining.minutes)}</div>
                                            <div className="text-xs text-white/60 uppercase tracking-wider mt-1">Minutes</div>
                                        </div>
                                        <div className="bg-emerald-800/40 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center flex-1">
                                            <div className="text-3xl font-bold text-white tabular-nums">{formatTime(timeRemaining.seconds)}</div>
                                            <div className="text-xs text-white/60 uppercase tracking-wider mt-1">Seconds</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 mr-2 text-emerald-300" />
                                    Important Information
                                </h3>
                                <div className="bg-emerald-800/40 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                                    <ul className="space-y-3">
                                        <li className="flex items-start text-white/90">
                                            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-emerald-400 mt-0.5" />
                                            <span>Confirmation sent to your email</span>
                                        </li>
                                        <li className="flex items-start text-white/90">
                                            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-emerald-400 mt-0.5" />
                                            <span>Cancellations permitted up to 24 hours prior via profile</span>
                                        </li>
                                        <li className="flex items-start text-white/90">
                                            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-emerald-400 mt-0.5" />
                                            <span>Arrive 15 minutes before start time</span>
                                        </li>
                                        {bookingDetails.needsTransportation && (
                                            <li className="flex items-start text-white/90">
                                                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-emerald-400 mt-0.5" />
                                                <span>Transportation details confirmed 2 hours before pickup</span>
                                            </li>
                                        )}
                                        {bookingDetails.bookingType === 'trainer' && (
                                            <li className="flex items-start text-white/90">
                                                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-emerald-400 mt-0.5" />
                                                <span>Trainer will contact you before session</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Image Card (if available) */}
                        {getImageUrl && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                                <div className="h-60 overflow-hidden">
                                    <img
                                        src={getImageUrl}
                                        alt={bookingDetails.bookingType === 'trainer' ? bookingDetails.trainer?.name : bookingDetails.facility?.name}
                                        className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = bookingDetails.bookingType === 'trainer' ? FALLBACK_TRAINER_IMAGE : FALLBACK_IMAGE }}
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-white/80">
                                        {bookingDetails.bookingType === 'trainer' ? 'Your Trainer' : 'Your Venue'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Link href="/profile?tab=bookings" className="inline-flex justify-center items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        <TicketIcon className="mr-2 h-5 w-5" />
                        View My Bookings
                    </Link>
                    {bookingDetails.bookingType === 'trainer' ? (
                        <Link href="/trainers" className="inline-flex justify-center items-center px-8 py-3 border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-lg transition-all duration-300">
                            Find More Trainers <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </Link>
                    ) : (
                        <Link href="/facilities" className="inline-flex justify-center items-center px-8 py-3 border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-lg transition-all duration-300">
                            Book Another Facility <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </Link>
                    )}
                    <Link href="/" className="inline-flex justify-center items-center px-8 py-3 border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-lg transition-all duration-300">
                        <HomeIcon className="mr-2 h-5 w-5" />Home
                    </Link>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
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
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .7; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
            `}</style>
        </div>
    );
}

// Wrap with Suspense for useSearchParams
export default function BookingConfirmationPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
        <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="ml-4 text-xl font-semibold text-white">Loading confirmation...</p>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}