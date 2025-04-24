// src/app/facilities/[id]/book/page.tsx
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import * as facilityService from '@/services/facilityService';
import * as authService from '@/services/authService';
import * as bookingService from '@/services/bookingService';
import { FacilityDetails } from '@/services/facilityService';
import toast from 'react-hot-toast';

// --- Import Icons ---
import {
    ChevronLeftIcon, CalendarDaysIcon, ClockIcon, UsersIcon, CurrencyDollarIcon,
    InformationCircleIcon, LockClosedIcon, CreditCardIcon, ShoppingCartIcon,
    BuildingOffice2Icon, ArrowPathIcon, CheckCircleIcon, ChatBubbleBottomCenterTextIcon,
    MapPinIcon, StarIcon
} from '@heroicons/react/24/solid';

// --- Interfaces ---
interface RentedEquipment {
  equipmentName: string;
  quantity: number;
  pricePerItemPerHour?: number;
}

// --- Get Base URL & Fallback Images ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/facility-placeholder.jpg';

// --- Helper Functions ---
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return 'N/A';
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        const dateObj = new Date(dateStr + 'T00:00:00Z');
        return dateObj.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'Invalid Date'; }
};

// --- Main Component Logic ---
function FacilityBookingPageContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const facilityId = typeof params.id === 'string' ? params.id : undefined;
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    const equipmentParam = searchParams.get('equipment');

    // --- State ---
    const [facility, setFacility] = useState<FacilityDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Record<string, number>>({});
    const [totalCost, setTotalCost] = useState<number>(0);
    const [paymentDetails, setPaymentDetails] = useState({ cardHolder: '', cardNumber: '', expiration: '', cvc: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [participants, setParticipants] = useState<number>(1);
    const [specialRequests, setSpecialRequests] = useState<string>('');

    // --- Check Auth ---
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            const currentPath = `/facilities/${facilityId}/book?${searchParams.toString()}`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        } else {
            setIsAuthChecked(true);
        }
    }, [router, facilityId, searchParams]);

    // --- Parse Equipment ---
    useEffect(() => {
        if (equipmentParam) {
            try {
                const parsedEquipment = JSON.parse(equipmentParam);
                if (typeof parsedEquipment === 'object' && parsedEquipment !== null) {
                    setSelectedEquipment(parsedEquipment);
                }
            } catch (e) {
                console.error("Error parsing equipment query param:", e);
                setError("Invalid equipment data provided.");
            }
        } else {
             setSelectedEquipment({});
        }
    }, [equipmentParam]);
// --- Fetch Facility Data ---
useEffect(() => {
    if (!isAuthChecked || !facilityId) {
        if(!facilityId && isAuthChecked) {
            setError("Facility ID missing.");
            setLoading(false);
        }
        return;
    };

    const fetchFacility = async () => {
        setLoading(true);
        setError(null);
        try {
            // Validate ID format (MongoDB ObjectId)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(facilityId);
            if (!isValidObjectId) {
                throw new Error(`Invalid Facility ID format: ${facilityId}. Expected a 24-character hexadecimal ID.`);
            }
            
            const data = await facilityService.getFacilityById(facilityId);
            setFacility(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load facility details.');
            setFacility(null);
        } finally {
            setLoading(false);
        }
    };
    fetchFacility();
}, [facilityId, isAuthChecked]);


    // --- Calculate Total Cost ---
     useEffect(() => {
        if (!facility || !timeParam) {
            setTotalCost(0);
            return;
        }

        try {
            let calculatedTotal = 0;
            // Assuming 2-hour slot based on previous logic
            const facilityFee = (facility.pricePerHourValue || 0) * 2;
            calculatedTotal += facilityFee;

            // Calculate equipment cost
            let equipmentCost = 0;
            Object.entries(selectedEquipment).forEach(([name, quantity]) => {
                const equipmentItem = facility.equipmentForRent?.find(e => e.name === name);
                if (equipmentItem && quantity > 0) {
                    const itemCost = (equipmentItem.pricePerHour || 0) * quantity * 2; // Assuming 2hr
                    equipmentCost += itemCost;
                }
            });
            calculatedTotal += equipmentCost;

            setTotalCost(calculatedTotal);
        } catch (e) {
             console.error("Error during cost calculation:", e);
             setTotalCost(0);
        }
    }, [facility, timeParam, selectedEquipment]);

    // --- Event Handlers ---
    const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    // --- Submit Handler ---
    const handleConfirmAndPay = async () => {
        if (!facility || !dateParam || !timeParam || !termsAgreed || !paymentDetails.cardHolder || !paymentDetails.cardNumber || !paymentDetails.expiration || !paymentDetails.cvc) {
            setError('Please complete all required fields (Payment Info) and agree to terms.');
            toast.error('Please complete payment info and agree to terms.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        const loadingToast = toast.loading("Processing booking...");

        // Prepare equipment data for backend
        const equipmentDataForApi = Object.entries(selectedEquipment)
            .filter(([_, quantity]) => quantity > 0)
            .map(([name, quantity]) => ({ equipmentName: name, quantity }));

        const bookingPayload: bookingService.CreateBookingData = {
            facility: facility._id,
            date: dateParam,
            timeSlot: timeParam,
            participants: participants,
            rentedEquipment: equipmentDataForApi.length > 0 ? equipmentDataForApi : undefined,
            specialRequests: specialRequests || undefined,
        };

        try {
            const response = await bookingService.createBooking(bookingPayload);
            toast.dismiss(loadingToast);
            toast.success("Booking successful!");

            const newBookingId = response?._id || response?.bookingId;

            if (!newBookingId) {
                console.error("Booking ID not found in API response:", response);
                setError("Booking created, but confirmation failed. Please contact support.");
                setIsSubmitting(false);
                return;
            }
            // Redirect to confirmation page
            router.push(`/bookings/confirmation?id=${newBookingId}&type=facility`);

        } catch (err: any) {
            toast.dismiss(loadingToast);
            console.error('Error submitting booking:', err);
            const errMsg = err.message || 'Booking failed. Please check details or try again.';
            setError(errMsg);
            toast.error(`Booking failed: ${errMsg}`);
            setIsSubmitting(false);
        }
    };

    // --- Get appropriate image URL ---
    const facilityImageUrl = useMemo(() => {
        if (!facility) return FALLBACK_IMAGE;
        if (facility.images && facility.images.length > 0) {
            return facility.images[0].startsWith('http') ? facility.images[0] : `${BACKEND_BASE_URL}${facility.images[0]}`;
        }
        return FALLBACK_IMAGE;
    }, [facility]);

    // --- Render ---
    if (!isAuthChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="ml-4 text-xl font-semibold text-white">Checking authentication...</p>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="ml-4 text-xl font-semibold text-white">Loading Booking Details...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-6">
                <div className="bg-red-900/30 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 max-w-md text-center">
                    <p className="text-xl mb-4 text-red-200">{error}</p>
                    <Link href={facilityId ? `/facilities/${facilityId}` : '/facilities'} className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30 shadow-md">
                        <ChevronLeftIcon className="h-5 w-5 mr-2" />Go Back
                    </Link>
                </div>
            </div>
        );
    }
    
    if (!facility || !dateParam || !timeParam) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-6">
                <div className="bg-yellow-900/30 backdrop-blur-sm rounded-xl p-8 border border-yellow-500/30 max-w-md text-center">
                    <p className="text-xl mb-4 text-yellow-200">Missing booking information. Please go back and select date/time.</p>
                    <Link href="/facilities" className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30 shadow-md">
                        <BuildingOffice2Icon className="h-5 w-5 mr-2" />Back to Facilities
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 pb-16 pt-20 relative overflow-hidden">
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
                
                {/* Fielders */}
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
                
                {/* Additional Fielders */}
                <div className="absolute w-6 h-8 top-[25%] right-[25%] animate-fielder-move animation-delay-700">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 top-[60%] left-[25%] animate-fielder-move animation-delay-200">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 bottom-[30%] right-[35%] animate-fielder-move animation-delay-300">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 bottom-[45%] left-[40%] animate-fielder-move animation-delay-400">
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
                
                {/* Non-striker batsman */}
                <div className="absolute w-8 h-12 bottom-[40%] left-[18%] animate-nonstriker-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                    </div>
                </div>
                
                {/* Bowler */}
                <div className="absolute w-8 h-12 bottom-[35%] right-[30%] animate-bowler-run">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
                        <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
                    </div>
                </div>
                
                {/* Wicket-keeper */}
                <div className="absolute w-6 h-8 top-[43%] left-[25%] animate-wicketkeeper-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
                    </div>
                </div>
                
                {/* Umpire at bowler's end */}
                <div className="absolute w-7 h-10 bottom-[30%] right-[25%] animate-umpire">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2 w-3 h-6 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Umpire at square leg */}
                <div className="absolute w-7 h-10 top-[50%] right-[15%] animate-umpire animation-delay-200">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2 w-3 h-6 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Ball trajectory */}
                <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[30%] animate-ball-trajectory"></div>
                
                {/* Stadium elements */}
                <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
                <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Back Button */}
                <button onClick={() => router.back()} className="absolute top-0 left-4 sm:left-6 z-20 inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-800 hover:bg-white shadow-md transition-all duration-300 group">
                    <ChevronLeftIcon className="h-4 w-4 mr-1 text-emerald-600 group-hover:text-emerald-800 transition-colors"/> Back
                </button>

                {/* Header Section with Facility Image */}
                <div className="max-w-4xl mx-auto bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30 mb-10">
                    <div className="relative h-40 sm:h-60 overflow-hidden">
                        <img 
                            src={facilityImageUrl} 
                            alt={facility.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Confirm Your Booking</h1>
                            <div className="flex items-center text-white/90">
                                <BuildingOffice2Icon className="h-5 w-5 mr-2 text-emerald-300" />
                                <span className="text-lg font-medium">{facility.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Booking Summary */}
                    <div className="lg:col-span-2 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                        <div className="p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3 flex items-center">
                                <InformationCircleIcon className="h-6 w-6 mr-2 text-emerald-300" />
                                Booking Summary
                            </h2>
                            
                            <div className="space-y-6">
                                {/* Location & Date Details */}
                                <div className="bg-emerald-800/40 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-inner">
                                    <div className="flex items-start mb-4">
                                        <div className="p-2 bg-emerald-700/60 rounded-full mr-3 backdrop-blur-sm">
                                            <MapPinIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/70">Facility Location</p>
                                            <p className="text-base font-medium text-white">{facility.location}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-700/60 rounded-full mr-3 backdrop-blur-sm">
                                                <CalendarDaysIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/70">Date</p>
                                                <p className="text-base font-medium text-white">{formatDate(dateParam)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                            <div className="p-2 bg-emerald-700/60 rounded-full mr-3 backdrop-blur-sm">
                                                <ClockIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/70">Time Slot</p>
                                                <p className="text-base font-medium text-white">{timeParam}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Participants Input */}
                                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-emerald-700/60 rounded-full mr-3 backdrop-blur-sm">
                                            <UsersIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <span className="text-white font-medium">Participants</span>
                                    </div>
                                    <select
                                        id="participants-confirm"
                                        value={participants}
                                        onChange={(e) => setParticipants(Number(e.target.value))}
                                        className="rounded-lg border-white/30 bg-emerald-800/40 backdrop-blur-sm py-2 px-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 text-base shadow-sm w-20 text-center"
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1} className="bg-emerald-900">{i + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Equipment Summary */}
                                {Object.keys(selectedEquipment).length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                        <h3 className="text-white font-medium mb-4 flex items-center">
                                            <ShoppingCartIcon className="h-5 w-5 mr-2 text-emerald-300"/>
                                            Selected Equipment
                                        </h3>
                                        <ul className="space-y-2">
                                            {Object.entries(selectedEquipment)
                                                .filter(([_, quantity]) => quantity > 0)
                                                .map(([name, quantity]) => {
                                                    const equipmentItem = facility.equipmentForRent?.find(e => e.name === name);
                                                    const itemCost = equipmentItem ? (equipmentItem.pricePerHour || 0) * quantity * 2 : 0;
                                                    
                                                    return (
                                                        <li key={name} className="flex justify-between items-center bg-emerald-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                                            <div className="flex items-center">
                                                                <div className="h-2 w-2 bg-emerald-400 rounded-full mr-2"></div>
                                                                <span className="text-white">{name}</span>
                                                                <span className="ml-2 text-emerald-300 text-sm">x{quantity}</span>
                                                            </div>
                                                            <span className="text-white/90 text-sm">{formatCurrency(itemCost)}</span>
                                                        </li>
                                                    );
                                                })
                                            }
                                        </ul>
                                    </div>
                                )}

                                {/* Special Requests Input */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                    <label htmlFor="special-requests-confirm" className="block text-white font-medium mb-3 flex items-center">
                                        <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2 text-emerald-300"/>
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        id="special-requests-confirm"
                                        name="specialRequests"
                                        rows={3}
                                        className="w-full rounded-lg border-white/30 bg-emerald-800/40 backdrop-blur-sm py-3 px-4 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 text-base shadow-sm"
                                        placeholder="Any specific needs for this booking?"
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                    />
                                </div>

                                {/* Total Cost */}
                                <div className="bg-emerald-800/60 backdrop-blur-sm rounded-xl p-5 border border-emerald-600/30">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-emerald-700/60 rounded-full mr-3 backdrop-blur-sm">
                                                <CurrencyDollarIcon className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <span className="text-white font-bold text-lg">Total Cost</span>
                                        </div>
                                        <span className="text-2xl font-bold text-emerald-300">{formatCurrency(totalCost)}</span>
                                    </div>
                                    <p className="text-white/60 text-sm mt-2 ml-10">
                                        Includes facility rental fee ({formatCurrency(facility.pricePerHourValue ? facility.pricePerHourValue * 2 : 0)}) and equipment charges
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Placeholder */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                        <div className="p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3 flex items-center">
                                <CreditCardIcon className="h-6 w-6 mr-2 text-emerald-300" />
                                Payment Details
                            </h2>
                            
                            <div className="space-y-5">
                                <p className="text-white/80 text-sm bg-emerald-800/40 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                                    Secure payment processing will be handled here. For now, enter mock details to confirm your booking.
                                </p>
                                
                                {/* Mock Payment Fields */}
                                <div>
                                    <label htmlFor="cardHolder" className="block text-sm font-medium text-white mb-2">Card Holder <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        id="cardHolder" 
                                        name="cardHolder" 
                                        className="block w-full rounded-lg border-white/30 bg-emerald-800/40 backdrop-blur-sm py-3 px-4 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
                                        placeholder="Name on card"
                                        value={paymentDetails.cardHolder}
                                        onChange={handlePaymentInputChange}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="cardNumber" className="block text-sm font-medium text-white mb-2">Card Number <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        id="cardNumber" 
                                        name="cardNumber"
                                        className="block w-full rounded-lg border-white/30 bg-emerald-800/40 backdrop-blur-sm py-3 px-4 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
                                        placeholder="0000 0000 0000 0000"
                                        value={paymentDetails.cardNumber}
                                        onChange={handlePaymentInputChange}
                                        maxLength={19}
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="expiration" className="block text-sm font-medium text-white mb-2">Expiry <span className="text-red-400">*</span></label>
                                        <input 
                                            type="text" 
                                            id="expiration" 
                                            name="expiration" 
                                            className="block w-full rounded-lg border-white/30 bg-emerald-800/40 backdrop-blur-sm py-3 px-4 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
                                            placeholder="MM/YY"
                                            value={paymentDetails.expiration}
                                            onChange={handlePaymentInputChange}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="cvc" className="block text-sm font-medium text-white mb-2">CVC <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            id="cvc"
                                            name="cvc"
                                            className="block w-full rounded-lg border-white/30 bg-emerald-800/40 backdrop-blur-sm py-3 px-4 text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 shadow-sm"
                                            placeholder="123"
                                            value={paymentDetails.cvc}
                                            onChange={handlePaymentInputChange}
                                            maxLength={4}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5 mt-1">
                                            <input
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-white/30 text-emerald-600 focus:ring-emerald-500 bg-emerald-800/40"
                                                checked={termsAgreed}
                                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                                required
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <label htmlFor="terms" className="text-white">
                                                I agree to the <Link href="/terms" className="text-emerald-300 hover:text-emerald-200 underline">Terms and Conditions</Link> <span className="text-red-400">*</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                                        <p className="text-red-200 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Pay Button */}
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={handleConfirmAndPay}
                                        disabled={isSubmitting || !termsAgreed}
                                        className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300 ${isSubmitting || !termsAgreed ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                            <>
                                                <CheckCircleIcon className="h-6 w-6 mr-2" />
                                                Confirm & Pay
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-center">
                                    <LockClosedIcon className="h-4 w-4 text-white/60 mr-1.5" />
                                    <p className="text-xs text-white/60">Secure Checkout (Simulation)</p>
                                </div>
                            </div>
                        </div>
                    </div>
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
                
                @keyframes umpire {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-umpire {
                    animation: umpire 3s ease-in-out infinite;
                }
                
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
                
                .animation-delay-700 {
                    animation-delay: 0.7s;
                }
            `}</style>
        </div>
    );
}

// Wrap with Suspense for useSearchParams
export default function FacilityBookingPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
                 <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
                 <p className="ml-4 text-xl font-semibold text-white">Loading Booking Details...</p>
            </div>
        }>
            <FacilityBookingPageContent />
        </Suspense>
    );
}