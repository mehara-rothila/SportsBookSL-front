// src/app/facilities/[id]/page.tsx

'use client';

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { Tab, Dialog, Transition } from '@headlessui/react';
import { useRouter, useParams } from 'next/navigation';
// Removed direct api import, use services instead
import * as facilityService from '@/services/facilityService';
import * as authService from '@/services/authService';
import * as reviewService from '@/services/reviewService';

// --- Import Components ---
import EquipmentRental from '@/components/equipment/EquipmentRental';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import WeatherWidget from '@/components/weather/WeatherWidget';
import Button from '@/components/ui/Button'; // **** CORRECTED IMPORT ****

// --- Import Icons ---
import {
    StarIcon, MapPinIcon, ClockIcon, PhoneIcon, GlobeAltIcon, CurrencyDollarIcon,
    CheckCircleIcon, BuildingOfficeIcon, InformationCircleIcon, CalendarDaysIcon,
    UserCircleIcon, SparklesIcon, CreditCardIcon, ChevronLeftIcon, ChevronRightIcon,
    PhotoIcon, VideoCameraIcon, HeartIcon, ShareIcon, AdjustmentsHorizontalIcon,
    UserGroupIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon, LockClosedIcon,
    CheckIcon as CheckIconSolid,
    ChevronDownIcon,
    HandThumbUpIcon,
    EnvelopeIcon,
    TagIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon,
    AcademicCapIcon,
    PencilSquareIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    XMarkIcon,
    SunIcon,
    CloudIcon,
    BoltIcon,
    MapIcon,
    ListBulletIcon,
    UsersIcon,
    ChatBubbleBottomCenterTextIcon,
    ShoppingCartIcon,
    BanknotesIcon,
    ArrowUturnLeftIcon,
    PaperAirplaneIcon,
    HomeIcon,
    PlayCircleIcon,
    HeartIcon as HeartIconOutline,
    ShareIcon as ShareIconOutline,
    PlusCircleIcon
} from '@heroicons/react/24/solid';
import { startOfMonth, format as formatDateFns } from 'date-fns';

// --- Interfaces ---
interface OperatingHours { day: string; open: string; close: string; }
interface EquipmentItem { _id?: string; name: string; pricePerHour: number; available: number; }
interface Coach { 
    _id: string; 
    id?: string; 
    name: string; 
    specialization: string; 
    hourlyRate?: number; // Now optional
    rating?: number; // Also making rating optional
    profileImage?: string; 
}
interface ReviewUser { _id?: string; id?: string; name: string; avatar?: string; }
interface Review { _id: string; id?: string; user: ReviewUser; rating: number; reviewDate: string; content: string; createdAt?: string; }

// Change from "Faility" to "Facility" and keep all properties optional as needed
interface Facility { 
    _id: string; 
    id?: string; 
    name: string; 
    location: string; 
    address: string; 
    description: string; 
    longDescription?: string; 
    sportTypes: string[]; 
    amenities?: string[]; 
    pricePerHour?: string; 
    pricePerHourValue?: number; 
    pricePerDay?: number; 
    rating?: number; 
    reviewCount?: number; 
    contactInfo?: { phone?: string; email?: string; website?: string; }; 
    images?: string[]; 
    operatingHours?: OperatingHours[]; 
    equipmentForRent?: EquipmentItem[]; 
    associatedCoaches?: Coach[]; 
    mapLocation?: { lat?: number; lng?: number; }; 
    isNew?: boolean; 
    isPremium?: boolean; 
    isFeatured?: boolean; 
    reviews?: Review[]; 
    specialRates?: { name: string; description: string; rate: number; conditions: string }[]; 
    rules?: string[]; 
}

interface AvailabilitySlot { time: string; available: boolean; }
interface AvailabilityDateInternal { date: Date; slots: AvailabilitySlot[]; }
interface EquipmentSelection { [key: string]: number; }

// --- Helper function for class names ---
function classNames(...classes: string[]) { return classes.filter(Boolean).join(' '); }

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/facility-placeholder.jpg';
const FALLBACK_AVATAR = '/images/default-avatar.png';

// --- Component ---
export default function FacilityDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : undefined;

    // --- State Variables ---
    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [equipmentSelection, setEquipmentSelection] = useState<EquipmentSelection>({});
    const [availabilityData, setAvailabilityData] = useState<AvailabilityDateInternal[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [currentAvailabilityMonth, setCurrentAvailabilityMonth] = useState(startOfMonth(new Date()));

    // Review State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const [totalReviewPages, setTotalReviewPages] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // --- Check Auth Status ---
    useEffect(() => {
        setIsLoggedIn(authService.isAuthenticated());
    }, []);

    // --- Fetch Facility Data ---
    useEffect(() => {
        if (!id) { setError("Facility ID is missing or invalid."); setLoading(false); return; }
        const fetchFacility = async () => {
            setLoading(true); setError(null);
            try {
                const data = await facilityService.getFacilityById(id);
                setFacility(data);
                setReviews(data.reviews || []);
                const initialReviewLimit = 5;
                setHasMoreReviews((data.reviews?.length || 0) >= initialReviewLimit && data.reviewCount > initialReviewLimit);
                setTotalReviewPages(Math.ceil((data.reviewCount || 0) / initialReviewLimit));
                setReviewPage(1);

                if (data.images && data.images.length > 0) {
                    setMainImage(`${BACKEND_BASE_URL}${data.images[0]}`);
                } else { setMainImage(FALLBACK_IMAGE); }
            } catch (err: any) {
                console.error('Error fetching facility data:', err);
                setError(typeof err === 'string' ? err : 'Failed to load facility details.');
                setFacility(null);
            } finally {
                setLoading(false);
            }
        };
        fetchFacility();
    }, [id]);

    // --- Fetch Availability Data ---
    const fetchAvailability = useCallback(async (monthDate: Date) => {
        if (!id) return;
        setLoadingAvailability(true);
        const monthString = formatDateFns(monthDate, 'yyyy-MM');
        try {
            const data = await facilityService.getFacilityAvailability(id, monthString);
            const parsedData = (Array.isArray(data) ? data : []).map(item => ({
                ...item,
                date: new Date(item.date + 'T00:00:00Z')
            }));
            setAvailabilityData(parsedData);
        } catch (err) {
            console.error(`Error fetching availability for ${monthString}:`, err);
            setAvailabilityData([]);
        } finally {
            setLoadingAvailability(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAvailability(currentAvailabilityMonth);
    }, [currentAvailabilityMonth, fetchAvailability]);

    // --- Fetch More Reviews (Pagination) ---
    const fetchMoreReviews = async () => {
        if (!id || loadingReviews || !hasMoreReviews) return;
        setLoadingReviews(true);
        setReviewError(null);
        const nextPage = reviewPage + 1;
        const reviewLimit = 5;
        try {
            const data = await facilityService.getFacilityReviews(id, nextPage, reviewLimit);
            setReviews(prev => [...prev, ...(data.reviews || [])]);
            setReviewPage(nextPage);
            setTotalReviewPages(data.pages || 1);
            setHasMoreReviews(nextPage < (data.pages || 1));
        } catch (err: any) {
            console.error("Error fetching more reviews:", err);
            setReviewError(typeof err === 'string' ? err : "Failed to load more reviews.");
        } finally {
            setLoadingReviews(false);
        }
    };

    // --- Review Submission Success Handler ---
    const handleReviewSubmitSuccess = (newReviewData: Review) => {
        const currentUser = authService.getCurrentUser();
        const reviewWithUser: Review = {
            ...newReviewData,
            _id: newReviewData._id || `temp-${Date.now()}`,
            user: {
                _id: newReviewData.user?._id || currentUser?._id || 'temp-user-id',
                name: newReviewData.user?.name || currentUser?.name || 'You',
                avatar: newReviewData.user?.avatar || currentUser?.avatar || FALLBACK_AVATAR
            },
            reviewDate: newReviewData.reviewDate || new Date().toISOString()
        };

        setReviews(prevReviews => [reviewWithUser, ...prevReviews]);
        setIsReviewModalOpen(false);

        if (facility && id) {
            setFacility(prevFac => {
                if (!prevFac) return null;
                const newReviewCount = (prevFac.reviewCount || 0) + 1;
                return {
                    ...prevFac,
                    reviewCount: newReviewCount,
                };
            });
            facilityService.getFacilityById(id).then(setFacility).catch(console.error);
        }
    };


    // --- Other Helper Functions & Handlers ---
    const formatCurrency = (amount: number | undefined) => { if (amount === undefined || amount === null) return 'N/A'; return `Rs. ${amount.toLocaleString('en-LK')}`; };
    const handleTimeSlotSelect = (timeSlot: string) => setSelectedTimeSlot(timeSlot);
    const handleEquipmentChange = (selections: EquipmentSelection) => { setEquipmentSelection(selections); };
    const calculateTotal = useMemo(() => { if (!facility) return 0; let total = selectedTimeSlot ? facility.pricePerHourValue * 2 : 0; Object.entries(equipmentSelection).forEach(([name, quantity]) => { const equipment = facility.equipmentForRent?.find(e => e.name === name); if (equipment && quantity > 0) { total += (equipment.pricePerHour || 0) * quantity * 2; } }); return total; }, [facility, selectedTimeSlot, equipmentSelection]);
    const openLightbox = (imagePath: string) => { setLightboxImage(`${BACKEND_BASE_URL}${imagePath}`); setLightboxOpen(true); };
    const handleProceedToBooking = () => { if (!facility) return; if (selectedDate && selectedTimeSlot) { const bookingUrl = `/facilities/${facility._id}/book`; const queryParams: Record<string, string> = { date: formatDateFns(selectedDate, 'yyyy-MM-dd'), time: selectedTimeSlot, }; const selectedEquipmentForQuery = Object.entries(equipmentSelection).filter(([_, quantity]) => quantity > 0).reduce((acc, [name, quantity]) => { acc[name] = quantity; return acc; }, {} as Record<string, number>); if (Object.keys(selectedEquipmentForQuery).length > 0) { queryParams.equipment = JSON.stringify(selectedEquipmentForQuery); } const urlWithParams = `${bookingUrl}?${new URLSearchParams(queryParams).toString()}`; router.push(urlWithParams); } else { alert("Please select a date and time slot first."); } };
    const toggleFaq = (index: number) => { setActiveFaq(activeFaq === index ? null : index); };

    // --- Render Logic ---
    if (loading) { 
        return ( 
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900"> 
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div> 
                <p className="ml-4 text-xl font-semibold text-white">Loading Facility...</p> 
            </div> 
        ); 
    }
    
    if (error) { 
        return ( 
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white p-8"> 
                <h2 className="text-2xl font-bold mb-4">Error Loading Facility</h2> 
                <p className="mb-4 text-center">{error}</p> 
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center backdrop-blur-sm border border-white/30"> 
                    <ArrowPathIcon className="w-5 h-5 mr-2"/> Try Again 
                </button> 
            </div> 
        ); 
    }
    
    if (!facility) { 
        return ( 
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-8"> 
                <h2 className="text-2xl font-bold text-white mb-2">Facility Not Found</h2> 
                <p className="text-emerald-100 mb-4 text-center">We couldn't find the facility (ID: {id}).</p> 
                <Link href="/facilities" className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"> 
                    Back to Facilities 
                </Link> 
            </div> 
        ); 
    }

    const mainImageUrl = mainImage || (facility.images && facility.images.length > 0 ? `${BACKEND_BASE_URL}${facility.images[0]}` : FALLBACK_IMAGE);

    // --- Main Return JSX ---
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Cricket Stadium Background - Enhanced with more players and umpires */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 -z-10">
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
                
                {/* FIELDERS - ORIGINAL AND ENHANCED */}
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
                
                {/* ADDITIONAL FIELDERS */}
                <div className="absolute w-6 h-8 top-[20%] right-[20%] animate-fielder-move animation-delay-300">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 bottom-[20%] right-[30%] animate-fielder-move animation-delay-700">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 top-[40%] right-[5%] animate-fielder-move animation-delay-1200">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 bottom-[30%] left-[25%] animate-fielder-move animation-delay-200">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 top-[15%] left-[30%] animate-fielder-move animation-delay-600">
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
                
                {/* Non-striker batsman - LEFT SIDE */}
                <div className="absolute w-8 h-12 bottom-[45%] left-[20%] animate-nonstriker-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                    </div>
                </div>
                
                {/* Non-striker batsman - RIGHT SIDE */}
                <div className="absolute w-8 h-12 bottom-[45%] right-[20%] animate-nonstriker-ready animation-delay-500">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                    </div>
                </div>
                
                {/* Wicket-keeper - LEFT SIDE */}
                <div className="absolute w-6 h-8 top-[35%] left-[15%] animate-wicketkeeper-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
                    </div>
                </div>
                
                {/* Wicket-keeper - RIGHT SIDE */}
                <div className="absolute w-6 h-8 top-[35%] right-[15%] animate-wicketkeeper-ready animation-delay-500">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
                    </div>
                </div>

                {/* UMPIRES - NEW ADDITION */}
                {/* Main Umpire at bowler's end - LEFT SIDE */}
                <div className="absolute w-7 h-10 bottom-[30%] left-[22%] animate-umpire-movement">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2 w-3 h-6 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Square leg Umpire - LEFT SIDE */}
                <div className="absolute w-7 h-10 top-[45%] left-[25%] animate-umpire-movement animation-delay-200">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2 w-3 h-6 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Main Umpire at bowler's end - RIGHT SIDE */}
                <div className="absolute w-7 h-10 bottom-[30%] right-[22%] animate-umpire-movement animation-delay-500">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2 w-3 h-6 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Square leg Umpire - RIGHT SIDE */}
                <div className="absolute w-7 h-10 top-[45%] right-[25%] animate-umpire-movement animation-delay-700">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2 w-3 h-6 bg-white/80"></div>
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

            {/* Back Button */}
            <button onClick={() => router.back()} className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20 inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 hover:bg-white shadow-md transition-all duration-300 group">
                <ChevronLeftIcon className="h-4 w-4 mr-1 text-gray-500 group-hover:text-primary-600 transition-colors"/> Back
            </button>

            {/* Hero section */}
            <div className="relative">
                <div className="h-[60vh] md:h-[70vh] w-full relative group">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-in-out group-hover:scale-110 animate-ken-burns" style={{ backgroundImage: `url(${mainImageUrl})` }} onError={(e) => { (e.target as HTMLDivElement).style.backgroundImage = `url(${FALLBACK_IMAGE})` }}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                        <div className="mx-auto max-w-7xl">
                            <div className="max-w-3xl animate-fade-in-up">
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">{facility.name}</h1>
                                <div className="flex flex-wrap items-center text-white text-sm md:text-base mb-6 gap-x-6 gap-y-2">
                                    <div className="flex items-center"><div className="p-1.5 bg-yellow-400 rounded-full shadow-lg animate-pulse-slow mr-2"><StarIcon className="w-5 h-5 text-white"/></div><span className="font-medium">{facility.rating?.toFixed(1) ?? 'N/A'}</span><span className="ml-1 text-white/80">({facility.reviewCount ?? 0} reviews)</span></div>
                                    <div className="flex items-center"><div className="p-1.5 bg-indigo-500 rounded-full shadow-lg animate-pulse-slow mr-2"><MapPinIcon className="w-5 h-5 text-white"/></div><span>{facility.location}</span></div>
                                </div>
                                <div className="flex flex-wrap gap-2 animate-fade-in-up animation-delay-300">{facility.sportTypes?.map((sport) => ( <span key={sport} className="relative overflow-hidden inline-block px-4 py-1.5 rounded-full text-sm font-medium text-white group"><span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 shadow-lg"></span><span className="relative">{sport}</span></span> ))}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image gallery thumbnails */}
                <div className="bg-gradient-to-r from-emerald-900/40 to-green-900/30 shadow-lg py-4 relative z-10 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar">
                            {facility.images?.map((imagePath, index) => {
                                const fullImageUrl = `${BACKEND_BASE_URL}${imagePath}`;
                                return (
                                    <button key={index} className={`flex-shrink-0 h-20 w-32 md:h-24 md:w-40 rounded-lg overflow-hidden transition-all duration-300 transform ${mainImage === fullImageUrl ? 'border-4 border-emerald-500 scale-110 shadow-2xl' : 'border-2 border-transparent hover:border-emerald-400 hover:scale-105'}`} onClick={() => setMainImage(fullImageUrl)}>
                                        <div className="h-full w-full overflow-hidden"> <img src={fullImageUrl} alt={`${facility.name} ${index + 1}`} className="h-full w-full object-cover hover:scale-110 transition-transform duration-700" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}/> </div>
                                    </button>
                                );
                            })}
                            {facility.images && facility.images.length > 0 && ( <button className="flex-shrink-0 h-20 w-32 md:h-24 md:w-40 bg-gradient-to-br from-emerald-800/50 to-green-800/40 rounded-lg flex flex-col items-center justify-center text-white hover:text-emerald-200 transition-colors duration-300 hover:shadow-xl border-2 border-white/20 transform hover:scale-105" onClick={() => openLightbox(facility.images[0])}> <PhotoIcon className="w-8 h-8 mb-1"/> <span className="text-sm font-medium">View Gallery</span> </button> )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {/* Left column: Facility details */}
                    <div className="lg:col-span-2">
                        <Tab.Group>
                            <Tab.List className="flex space-x-1 rounded-2xl bg-white/20 backdrop-blur-sm p-1.5 mb-8 shadow-lg">
                                {['Overview', 'Amenities', 'Equipment', 'Coaches', 'Reviews', 'Rules'].map((category) => (
                                    <Tab key={category} className={({ selected }) => classNames( 'w-full rounded-xl py-3 text-sm font-medium leading-5 transition-all duration-200', 'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-emerald-100 ring-emerald-400', selected ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg' : 'text-white hover:bg-white/20 hover:text-emerald-400' )}> {category} </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels className="mt-2">
                                {/* Overview Panel */}
                                <Tab.Panel className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/20">
                                    <div className="prose prose-sm sm:prose-base max-w-none mb-8 text-white"><h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">About this facility</h3><p className="whitespace-pre-line leading-relaxed">{facility.longDescription || facility.description}</p></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Location */}
                                        <div className="transform hover:scale-[1.02] transition-transform duration-300"><h4 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 flex items-center"><MapPinIcon className="w-6 h-6 mr-2 text-emerald-500"/> Location</h4><p className="text-white mb-2">{facility.address}</p><div className="mt-4 h-60 md:h-72 w-full bg-gradient-to-br from-emerald-900/40 to-green-800/30 rounded-xl overflow-hidden border border-white/20 shadow-lg relative group"><div className="h-full w-full bg-gray-800/30 flex items-center justify-center overflow-hidden"><div className="text-center p-4 relative z-10"><MapIcon className="w-16 h-16 text-emerald-400 mx-auto mb-3 animate-bounce-subtle"/><h5 className="text-lg font-bold text-emerald-300 mb-1">View on Map</h5><p className="text-white/80 mb-2">Get directions easily</p>{facility.mapLocation?.lat && facility.mapLocation?.lng && ( <p className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">Lat: {facility.mapLocation.lat.toFixed(4)}, Lng: {facility.mapLocation.lng.toFixed(4)}</p> )}</div></div><div className="absolute inset-0 bg-gradient-to-t from-emerald-900/70 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-6 transition-opacity duration-300"><a href={`https://www.google.com/maps/search/?api=1&query=${facility.mapLocation?.lat ?? ''},${facility.mapLocation?.lng ?? ''}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-emerald-700 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"> Open in Google Maps </a></div></div></div>
                                        {/* Contact & Hours */}
                                        <div className="transform hover:scale-[1.02] transition-transform duration-300"><h4 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 flex items-center"><PhoneIcon className="w-6 h-6 mr-2 text-emerald-500"/> Contact & Hours</h4><ul className="space-y-4 text-sm text-white mb-6">{facility.contactInfo?.phone && ( <li className="flex items-start bg-gradient-to-r from-emerald-900/40 to-green-800/30 p-3 rounded-lg shadow-sm border border-white/20"><PhoneIcon className="w-5 h-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0"/><span className="font-medium">{facility.contactInfo.phone}</span></li> )}{facility.contactInfo?.email && ( <li className="flex items-start bg-gradient-to-r from-emerald-900/40 to-green-800/30 p-3 rounded-lg shadow-sm border border-white/20"><EnvelopeIcon className="w-5 h-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0"/><span className="font-medium">{facility.contactInfo.email}</span></li> )}{facility.contactInfo?.website && ( <li className="flex items-start bg-gradient-to-r from-emerald-900/40 to-green-800/30 p-3 rounded-lg shadow-sm border border-white/20"><GlobeAltIcon className="w-5 h-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0"/><a href={facility.contactInfo.website.startsWith('http') ? facility.contactInfo.website : `http://${facility.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-emerald-300 hover:underline">{facility.contactInfo.website}</a></li> )}</ul><h4 className="text-xl font-bold mt-6 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 flex items-center"><ClockIcon className="w-6 h-6 mr-2 text-emerald-500"/> Operating Hours</h4><div className="space-y-2 text-sm text-white bg-gradient-to-r from-emerald-900/40 to-green-800/30 rounded-2xl p-5 border border-white/20 shadow-lg">{facility.operatingHours?.map((hours, index) => ( <div key={hours.day} className={`flex justify-between p-2 rounded-lg ${index % 2 === 0 ? 'bg-white/10' : 'bg-transparent'} hover:bg-white/20 transition-colors duration-200`}><span className="font-medium text-emerald-300">{hours.day}</span><span className="text-white">{hours.open} - {hours.close}</span></div> ))}{(!facility.operatingHours || facility.operatingHours.length === 0) && <p className="text-gray-400 text-center">Operating hours not listed.</p>}</div></div>
                                    </div>
                                </Tab.Panel>

                                {/* Amenities Panel */}
                                <Tab.Panel className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/20">
                                    <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Facilities & Amenities</h3>
                                    {facility.amenities && facility.amenities.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mb-10">{facility.amenities.map((amenity) => ( <div key={amenity} className="flex items-center p-3 bg-gradient-to-r from-emerald-900/40 to-green-800/30 rounded-xl shadow-sm border border-white/20 transform hover:scale-105 transition-transform duration-300 group"><div className="p-2 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full mr-3 shadow-md group-hover:shadow-lg transition-all duration-300"><CheckCircleIcon className="w-5 h-5 text-white"/></div><span className="font-medium text-white group-hover:text-emerald-300 transition-colors duration-300">{amenity}</span></div> ))}</div>) : ( <p className="text-gray-400 mb-10">No specific amenities listed.</p> )}
                                    {facility.specialRates && facility.specialRates.length > 0 && (<><h3 className="text-2xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Special Rates</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{facility.specialRates.map((rate) => ( <div key={rate.name} className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-px group transform hover:scale-105 transition-all duration-300 hover:shadow-xl"><div className="bg-gradient-to-r from-emerald-900/50 to-green-800/40 rounded-2xl p-6 h-full"><div className="flex justify-between items-start mb-3"><h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200 group-hover:from-white group-hover:to-white transition-all duration-300">{rate.name}</h4><div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full px-4 py-1 shadow-md group-hover:shadow-lg transition-all duration-300">{formatCurrency(rate.rate)}/hr</div></div><p className="text-white/80 mb-4">{rate.description}</p><div className="bg-white/10 rounded-lg p-3 text-sm text-white border border-white/20 shadow-inner backdrop-blur-sm"><strong className="text-emerald-300">Conditions:</strong> {rate.conditions}</div></div></div> ))}</div></>)}
                                </Tab.Panel>

                                {/* Equipment Panel */}
                                <Tab.Panel className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/20">
                                    <EquipmentRental
                                        equipmentList={facility.equipmentForRent || []}
                                        onEquipmentSelect={handleEquipmentChange}
                                        initialSelections={equipmentSelection}
                                    />
                                    <div className="mt-10 p-6 bg-gradient-to-br from-emerald-900/40 to-green-800/30 rounded-2xl border border-white/20 shadow-lg relative overflow-hidden"><div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-300 opacity-10 rounded-full"></div><div className="absolute -left-8 -bottom-8 w-32 h-32 bg-green-400 opacity-10 rounded-full"></div><h4 className="text-xl font-bold text-emerald-200 mb-4 flex items-center"><InformationCircleIcon className="w-6 h-6 mr-2 text-emerald-400"/> Equipment Rental Info</h4><ul className="space-y-3 text-sm text-white relative z-10"><li className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-sm"><CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-emerald-400"/><span>Return in same condition.</span></li><li className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-sm"><CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-emerald-400"/><span>Deposit may be required.</span></li><li className="flex items-start bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-sm"><CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-emerald-400"/><span>Add during booking or contact facility.</span></li></ul></div>
                                </Tab.Panel>

                                {/* Coaches Panel */}
                                <Tab.Panel className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/20">
                                    <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Available Coaches</h3>
                                    {facility.associatedCoaches && facility.associatedCoaches.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {facility.associatedCoaches.map((coach) => {
                                                const coachImageUrl = coach.profileImage ? `${BACKEND_BASE_URL}${coach.profileImage}` : FALLBACK_AVATAR;
                                                return (
                                                    <div key={coach._id || coach.id} className="bg-gradient-to-br from-emerald-500 to-green-600 p-px rounded-2xl overflow-hidden shadow-xl group transform hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl">
                                                        <div className="bg-gradient-to-r from-emerald-900/70 to-green-900/50 rounded-2xl overflow-hidden h-full"><div className="flex flex-col sm:flex-row h-full"><div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden relative"><img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" src={coachImageUrl} alt={coach.name} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR }}/></div><div className="p-5 flex flex-col justify-between sm:w-3/5 relative"><div><div className="flex justify-between items-start mb-1"><h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">{coach.name}</h4><div className="flex items-center bg-amber-400/20 rounded-full px-2 py-1"><StarIcon className="w-4 h-4 mr-1 text-amber-400"/><span className="font-bold text-amber-300">{coach.rating?.toFixed(1) ?? 'N/A'}</span></div></div><div><p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white mb-2 border border-white/20 shadow-sm"><AcademicCapIcon className="w-3.5 h-3.5 mr-1"/>{coach.specialization}</p></div><div className="flex items-center text-lg font-bold text-emerald-300 mb-3"><CurrencyDollarIcon className="w-5 h-5 mr-1 text-emerald-400"/>{formatCurrency(coach.hourlyRate)}/hr</div></div><Link href={`/trainers/${coach._id}/book`}><Button size="sm" fullWidth variant="gradient"> Book Session </Button></Link></div></div></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : ( <p className="text-gray-400">No associated coaches listed.</p> )}
                                    <div className="mt-10 text-center"><Link href="/trainers"><Button variant="gradient"> View all trainers <ArrowRightIcon className="ml-2 h-5 w-5"/></Button></Link></div>
                                </Tab.Panel>

                                {/* Reviews Panel */}
                                <Tab.Panel className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/20">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 mb-4 sm:mb-0">
                                            <span className="flex items-center">
                                                <StarIcon className="h-8 w-8 text-amber-400 mr-2" />
                                                User Reviews
                                                <span className="ml-2 px-3 py-1 bg-emerald-800/60 rounded-full text-sm text-white/90">
                                                    {facility.reviewCount ?? 0}
                                                </span>
                                            </span>
                                        </h3>
                                        {/* Conditional Add Review Button */}
                                        {isLoggedIn ? (
                                            <Button onClick={() => setIsReviewModalOpen(true)} variant="gradient" size="sm">
                                                <PencilSquareIcon className="w-5 h-5 mr-1.5"/> Write a Review
                                            </Button>
                                        ) : (
                                            <Link href={`/login?redirect=/facilities/${id}`}>
                                                <Button variant="glass" size="sm">
                                                    <LockClosedIcon className="w-4 h-4 mr-1.5"/> Login to Review
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    
                                    {/* Cricket-themed review list */}
                                    <div className="text-white">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-12 bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-lg border border-white/10 animate-fade-in backdrop-blur-sm">
                                                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-900/60">
                                                    <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-white mb-1">No reviews yet</h3>
                                                <p className="text-white/70 max-w-md mx-auto">Be the first to share your experience with this facility.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {reviews.map((review, index) => (
                                                    <div 
                                                        key={review._id || index} 
                                                        className="group bg-gradient-to-br from-emerald-900/40 to-green-900/30 rounded-xl shadow-sm hover:shadow-md border border-white/10 p-6 transition-all duration-300 animate-fade-in"
                                                        style={{ animationDelay: `${index * 100}ms` }}
                                                    >
                                                        <div className="flex items-start">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    className="h-12 w-12 rounded-full object-cover border-2 border-emerald-900/60 group-hover:border-emerald-500/60 transition-colors duration-300"
                                                                    src={review.user?.avatar || FALLBACK_AVATAR}
                                                                    alt={review.user?.name || "User"}
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR }}
                                                                />
                                                            </div>
                                                            <div className="ml-4 flex-1">
                                                                <div className="flex flex-wrap items-center justify-between">
                                                                    <div>
                                                                        <h4 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300">{review.user?.name || "Anonymous"}</h4>
                                                                        <div className="flex items-center mt-1">
                                                                            <div className="flex">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <StarIcon
                                                                                        key={i}
                                                                                        className={`h-5 w-5 ${
                                                                                            i < Math.floor(review.rating) 
                                                                                            ? 'text-amber-400' 
                                                                                            : 'text-gray-500/40'
                                                                                        } transition-colors duration-300`}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                            <time className="ml-2 text-sm text-white/60" dateTime={review.reviewDate || review.createdAt}>
                                                                                {new Date(review.reviewDate || review.createdAt || new Date()).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'long',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </time>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Animated indicator for new reviews - only for the first review */}
                                                                    {index === 0 && (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/60 text-emerald-300">
                                                                            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                                                            New
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="mt-3 prose prose-sm max-w-none text-white/80">
                                                                    <p className="leading-relaxed">{review.content}</p>
                                                                </div>
                                                                
                                                                {/* Action buttons */}
                                                                <div className="mt-4 flex items-center gap-4 pt-2 border-t border-white/10">
                                                                    <button className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors duration-200">
                                                                        <HandThumbUpIcon className="h-4 w-4 mr-1.5 text-emerald-400"/>
                                                                        Helpful
                                                                    </button>
                                                                    <button className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors duration-200">
                                                                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1.5 text-emerald-400"/>
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Load More Button */}
                                    {hasMoreReviews && (
                                        <div className="mt-8 text-center">
                                            <Button 
                                                onClick={fetchMoreReviews} 
                                                variant="glass" 
                                                isLoading={loadingReviews} 
                                                disabled={loadingReviews}
                                                leftIcon={loadingReviews ? undefined : <ArrowPathIcon className="h-4 w-4" />}
                                            >
                                                {loadingReviews ? 'Loading...' : 'Load More Reviews'}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {!hasMoreReviews && reviews.length > 5 && (
                                        <p className="text-center text-emerald-400 mt-8 animate-pulse-slow">
                                            You've seen all reviews
                                        </p>
                                    )}
                                    
                                    {reviewError && !loadingReviews && (
                                        <div className="text-center mt-4 bg-red-900/30 text-red-300 p-3 rounded-lg border border-red-500/30">
                                            {reviewError}
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Rules Panel */}
                                <Tab.Panel className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/20">
                                    <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Rules & Policies</h3>
                                    {facility.rules && facility.rules.length > 0 ? (<ul className="space-y-4 text-white list-disc list-inside pl-4">{facility.rules.map((rule, index) => ( <li key={index} className="bg-gradient-to-r from-emerald-900/50 to-green-800/40 p-3 rounded-lg border border-white/20 shadow-sm">{rule}</li> ))}</ul>) : ( <p className="text-gray-400">No specific rules listed.</p> )}
                                    <h4 className="text-xl font-bold mt-8 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 flex items-center"><InformationCircleIcon className="w-6 h-6 mr-2 text-emerald-500"/> Cancellation Policy</h4>
                                    <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 p-5 rounded-xl border border-red-500/30 shadow-md"><p className="text-sm text-red-200"> Free cancellation up to 24 hours before booking. 50% charge if cancelled within 24 hours. No refunds for no-shows or cancellations after the start time.</p></div>
                                </Tab.Panel>

                            </Tab.Panels>
                        </Tab.Group>
                    </div>

                    {/* Right column: Booking widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-px rounded-2xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300 animate-fade-in">
                                <div className="bg-gradient-to-br from-emerald-900/80 to-green-900/80 rounded-2xl overflow-hidden backdrop-blur-sm">
                                    <div className="p-6 border-b border-white/10"><h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Book this Facility</h3></div>
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {/* Date Selection */}
                                            <div>
                                                <label htmlFor="date-select" className="block text-sm font-bold text-white mb-2 flex items-center"><CalendarDaysIcon className="w-5 h-5 mr-1.5 text-emerald-400"/> Select a Date</label>
                                                <BookingCalendar
                                                    availableDates={availabilityData}
                                                    onDateSelect={(date) => { setSelectedDate(date); setSelectedTimeSlot(''); setEquipmentSelection({}); }}
                                                    onTimeSelect={handleTimeSlotSelect}
                                                    selectedDate={selectedDate}
                                                    selectedTime={selectedTimeSlot}
                                                    onMonthChange={setCurrentAvailabilityMonth}
                                                    currentMonth={currentAvailabilityMonth}
                                                    minDate={new Date()}
                                                />
                                                {loadingAvailability && <p className="text-center text-sm text-gray-300 mt-2">Loading availability...</p>}
                                            </div>

                                            {/* Equipment Selection (Conditional) */}
                                            {selectedTimeSlot && facility.equipmentForRent && facility.equipmentForRent.length > 0 && (
                                                <div className="animate-fade-in">
                                                    <label className="block text-sm font-bold text-white mb-2 flex items-center"><WrenchScrewdriverIcon className="w-5 h-5 mr-1.5 text-emerald-400"/> Add Equipment (Optional)</label>
                                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 bg-gradient-to-r from-emerald-900/50 to-green-900/40 rounded-xl p-4 shadow-inner border border-white/20 custom-scrollbar relative">
                                                        {/* Cricket equipment background pattern */}
                                                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                                                            <div className="absolute top-2 left-4 w-8 h-24 bg-white/20 rounded-full transform -rotate-12"></div>
                                                            <div className="absolute bottom-2 right-8 w-6 h-20 bg-white/20 rounded-full transform rotate-12"></div>
                                                        </div>
                                                        
                                                        {facility.equipmentForRent.map((equipment) => (
                                                            <div key={equipment.name} className="flex items-center justify-between bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20 shadow-sm hover:shadow-md hover:bg-white/15 transition-all duration-200 transform hover:scale-[1.02]">
                                                                <div>
                                                                    <div className="font-medium text-sm text-white">{equipment.name}</div>
                                                                    <div className="text-emerald-300 text-xs font-medium flex items-center">
                                                                        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                                                                        {formatCurrency(equipment.pricePerHour)}/hr
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className={`mr-3 px-2 py-0.5 text-xs rounded-full ${
                                                                        equipment.available > 5 ? 'bg-emerald-800/60 text-emerald-200' :
                                                                        equipment.available > 0 ? 'bg-amber-800/60 text-amber-200' :
                                                                        'bg-red-800/60 text-red-200'
                                                                    }`}>
                                                                        {equipment.available} left
                                                                    </span>
                                                                    <select 
                                                                        className="rounded-lg border-emerald-800 text-sm py-1.5 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-900/70 text-white" 
                                                                        value={equipmentSelection[equipment.name] || 0} 
                                                                        onChange={(e) => handleEquipmentChange({ ...equipmentSelection, [equipment.name]: parseInt(e.target.value) })} 
                                                                        disabled={equipment.available === 0}
                                                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2334d399' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                                                    >
                                                                        {[...Array(Math.max(0, equipment.available ?? 0) + 1).keys()].map((num) => (
                                                                            <option key={num} value={num}>{num}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Booking Summary (Conditional) */}
                                            {(selectedDate && selectedTimeSlot) && (
                                                <div className="border-t-2 border-white/10 pt-5 mt-6 animate-fade-in space-y-3">
                                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center"><CurrencyDollarIcon className="w-5 h-5 mr-1.5 text-emerald-400"/> Booking Summary</h4>
                                                    <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/40 rounded-xl p-4 shadow-inner border border-white/20">
                                                        <div className="flex justify-between text-sm border-b border-white/10 pb-2 mb-2"><span className="text-gray-300">Facility Fee ({selectedTimeSlot})</span><span className="text-white font-medium">{formatCurrency(facility.pricePerHourValue * 2)}</span></div>
                                                        {Object.entries(equipmentSelection).map(([name, quantity]) => { if (quantity > 0) { const equipment = facility.equipmentForRent?.find(e => e.name === name); if (equipment) { return ( <div key={name} className="flex justify-between text-sm border-b border-white/10 pb-2 mb-2"><span className="text-gray-300">{name} (x{quantity})</span><span className="text-white font-medium">{formatCurrency((equipment.pricePerHour || 0) * quantity * 2)}</span></div> ); } } return null; })}
                                                        <div className="flex justify-between font-bold text-lg mt-4 pt-1"><span className="text-white">Total Estimate</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">{formatCurrency(calculateTotal)}</span></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Proceed Button */}
                                            <Button className={`w-full mt-6`} size="lg" variant="gradient" disabled={!(selectedDate && selectedTimeSlot)} onClick={handleProceedToBooking}>
                                                <CheckIconSolid className="w-5 h-5 mr-2"/> Proceed to Book
                                            </Button>
                                            <p className="text-xs text-gray-300 text-center mt-3"> Confirm details & proceed to payment. </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar facilities section */}
            <section className="bg-gradient-to-r from-emerald-900/60 to-green-900/50 py-16 border-t border-white/10 relative backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200 mb-10 text-center">Similar Facilities</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Use mock data instead of hardcoded values */}
                        {[
                            { id: 1, name: 'Green Valley Stadium', sportType: 'Cricket', rating: 4.6, reviews: 65, price: 7000 },
                            { id: 2, name: 'Emerald Sports Complex', sportType: 'Cricket', rating: 4.5, reviews: 80, price: 7500 },
                            { id: 3, name: 'Willow Cricket Ground', sportType: 'Cricket', rating: 4.4, reviews: 95, price: 8000 },
                            { id: 4, name: 'Pavilion Training Center', sportType: 'Cricket', rating: 4.3, reviews: 110, price: 8500 }
                        ].map((item) => (
                            <div key={item.id} className="group bg-gradient-to-br from-emerald-900/70 to-green-900/60 rounded-2xl shadow-lg overflow-hidden border border-white/10 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 backdrop-blur-sm">
                                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                                    <img 
                                        src={`https://source.unsplash.com/random/400x300?cricket,stadium&sig=${item.id}`} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                        <div className="p-4 w-full">
                                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">{item.sportType}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-emerald-300 transition-colors duration-300">{item.name}</h3>
                                    <div className="flex items-center text-sm text-amber-400 mb-2">
                                        <StarIcon className="w-4 h-4 mr-1"/>
                                        <span className="font-bold">{item.rating.toFixed(1)}</span>
                                        <span className="text-white/80 ml-1">({item.reviews} reviews)</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Rs. {item.price}/hr</span>
                                        <Link href={`/facilities/${item.id}`}>
                                            <Button size="sm" variant="gradient">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="my-12 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    {/* Cricket field decorative elements */}
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-32 h-64 bg-white/20 rounded-full transform -rotate-45"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-32 h-64 bg-white/20 rounded-full transform rotate-45"></div>
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 backdrop-blur-sm animate-pulse-slow">
                            <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-emerald-400"/> FREQUENTLY ASKED
                        </span>
                        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Common <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Questions</span></h2>
                        <div className="flex justify-center items-center my-4">
                            <div className="w-16 h-1 bg-emerald-800 rounded-l-full"></div>
                            <div className="w-10 h-1 bg-emerald-600 animate-pulse-slow"></div>
                            <div className="w-16 h-1 bg-emerald-400 rounded-r-full"></div>
                        </div>
                        <p className="max-w-2xl mx-auto text-lg text-white/80">Everything you need to know about booking this facility</p>
                    </div>
                    
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Dynamic FAQ generation based on facility data */}
                        {[
                            { 
                                q: "What is the cancellation policy?", 
                                a: "Full refund up to 24 hours before booking. 50% charge if cancelled within 24 hours. No refunds for no-shows or cancellations after the start time.",
                                icon: <BanknotesIcon className="h-5 w-5 text-emerald-400" />
                            },
                            { 
                                q: "What equipment is available for rent?", 
                                a: facility.equipmentForRent?.length > 0
                                    ? `Yes, equipment like ${facility.equipmentForRent?.slice(0, 3).map(e => e.name).join(', ')} ${facility.equipmentForRent && facility.equipmentForRent.length > 3 ? 'and more' : ''} is available. See the 'Equipment' tab for details and rental options.`
                                    : "No equipment is currently listed for rent at this facility.",
                                icon: <WrenchScrewdriverIcon className="h-5 w-5 text-emerald-400" />
                            },
                            { 
                                q: "Is parking available?", 
                                a: facility.amenities?.some(a => a.toLowerCase().includes('parking')) 
                                    ? "Yes, parking is available." 
                                    : "Parking availability is not explicitly listed. Please contact the facility for details.",
                                icon: <MapPinIcon className="h-5 w-5 text-emerald-400" />
                            },
                            { 
                                q: "Are coaches available at this facility?", 
                                a: facility.associatedCoaches && facility.associatedCoaches.length > 0 
                                    ? `Yes, ${facility.associatedCoaches.length} associated coaches are listed under the 'Coaches' tab. You can book sessions with them directly.` 
                                    : "No coaches are directly associated with this facility listing. You can browse all trainers separately.",
                                icon: <AcademicCapIcon className="h-5 w-5 text-emerald-400" />
                            },
                            { 
                                q: "What is the weather policy?", 
                                a: "For outdoor facilities, bookings may be rescheduled or refunded in case of severe weather. Please check specific terms or contact support.",
                                icon: <CloudIcon className="h-5 w-5 text-emerald-400" />
                            }
                        ].map((faq, index) => (
                            <div 
                                key={index} 
                                className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-white/20 transition-all duration-300 hover:shadow-lg"
                            >
                                <button 
                                    onClick={() => toggleFaq(index)} 
                                    className="w-full flex justify-between items-center p-5 md:p-6 text-left"
                                >
                                    <span className="flex items-center text-base md:text-lg font-medium text-white">
                                        <span className="mr-3 p-2 bg-emerald-900/60 rounded-full">{faq.icon}</span>
                                        {faq.q}
                                    </span>
                                    <ChevronDownIcon 
                                        className={`h-6 w-6 text-emerald-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <div 
                                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                        activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="px-5 md:px-6 pb-6 pt-0">
                                        <p className="text-white/80 text-sm md:text-base">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 text-center">
                        <p className="text-white/80 mb-4">Still have questions?</p>
                        <Button variant="outline">
                            <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2 text-emerald-400"/> 
                            Contact Support 
                        </Button>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="relative py-16 bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-900 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"><div className="max-w-3xl mx-auto text-center"><h2 className="text-3xl font-extrabold text-white sm:text-4xl"> Ready to Book Your Session? </h2><p className="mt-4 text-lg text-emerald-100"> Secure your preferred time slot at {facility.name} today!</p><div className="mt-8 flex flex-col sm:flex-row justify-center gap-4"><Button onClick={handleProceedToBooking} disabled={!(selectedDate && selectedTimeSlot)} variant="primary" size="lg" className={` ${selectedDate && selectedTimeSlot ? 'bg-white text-emerald-700 hover:bg-gray-100' : 'bg-gray-300/50 text-gray-200 cursor-not-allowed'}`}> Book Now <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5"/> </Button><Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10"><ShareIconOutline className="mr-2 h-5 w-5"/> Share Facility </Button></div></div></div>
            </section>

            {/* Image lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4 animate-fade-in backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
                    <button className="absolute top-6 right-6 text-white hover:text-white/80 transition-colors z-[1000] bg-black/30 backdrop-blur-sm p-2 rounded-full" onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }} aria-label="Close lightbox"><XMarkIcon className="w-8 h-8"/></button>
                    <div onClick={(e) => e.stopPropagation()} className="relative max-w-5xl w-full group">
                        <img src={lightboxImage} alt="Enlarged facility view" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl mx-auto animate-fade-in" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}/>
                        <div className="absolute left-0 right-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"><p className="text-white font-medium text-center">{facility.name}</p></div>
                    </div>
                </div>
            )}

            {/* --- Review Modal --- */}
            <Transition appear show={isReviewModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setIsReviewModalOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-semibold leading-6 text-gray-900 mb-4 flex justify-between items-center"
                                    >
                                        <span>Write a Review for {facility.name}</span>
                                        <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </Dialog.Title>
                                    {/* Render the ReviewForm component */}
                                    <ReviewForm
                                        targetId={facility._id}
                                        targetType="facility"
                                        onSubmitSuccess={handleReviewSubmitSuccess}
                                        onCancel={() => setIsReviewModalOpen(false)}
                                    />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* --- End Review Modal --- */}

            {/* Animation keyframes */}
            <style jsx global>{`
                /* Custom scrollbar styles */
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(5, 46, 22, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.7); }
                
                /* Animation keyframes */
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
                
                @keyframes ken-burns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-ken-burns {
                    animation: ken-burns 20s ease-in-out infinite alternate;
                }
                
                @keyframes pulse-slow {
                    50% { opacity: .7; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                
                @keyframes nonstriker-ready {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(10px); }
                    100% { transform: translateX(0); }
                }
                .animate-nonstriker-ready {
                    animation: nonstriker-ready 5s ease-in-out infinite;
                }
                
                @keyframes umpire-movement {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-umpire-movement {
                    animation: umpire-movement 3s ease-in-out infinite;
                }
                
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
                
                .animation-delay-600 {
                    animation-delay: 0.6s;
                }
                
                .animation-delay-700 {
                    animation-delay: 0.7s;
                }
                
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                
                .animation-delay-1200 {
                    animation-delay: 1.2s;
                }
            `}</style>
        </div>
    );
}