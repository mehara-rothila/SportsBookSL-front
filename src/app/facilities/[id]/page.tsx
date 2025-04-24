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

    // --- Helper function for image URLs --- 
    const getImageUrl = (imagePath: string) => {
        // Check if the path already contains http/https
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Check if the backend URL ends with a slash
        const baseUrl = BACKEND_BASE_URL.endsWith('/') 
            ? BACKEND_BASE_URL.slice(0, -1) 
            : BACKEND_BASE_URL;
            
        // Check if the image path starts with a slash
        const formattedPath = imagePath.startsWith('/') 
            ? imagePath 
            : `/${imagePath}`;
        
        return `${baseUrl}${formattedPath}`;
    };

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
            // Validate ID format (MongoDB ObjectId)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
            if (!isValidObjectId) {
                throw new Error(`Invalid Facility ID format: ${id}. Expected a 24-character hexadecimal ID.`);
            }
            
            const data = await facilityService.getFacilityById(id);
            setFacility(data);
            setReviews(data.reviews || []);
            const initialReviewLimit = 5;
            setHasMoreReviews((data.reviews?.length || 0) >= initialReviewLimit && data.reviewCount > initialReviewLimit);
            setTotalReviewPages(Math.ceil((data.reviewCount || 0) / initialReviewLimit));
            setReviewPage(1);

            if (data.images && data.images.length > 0) {
                setMainImage(getImageUrl(data.images[0]));
            } else { 
                setMainImage(FALLBACK_IMAGE); 
            }
        } catch (err: any) {
            console.error('Error fetching facility data:', err);
            setError(typeof err === 'string' ? err : err.message || 'Failed to load facility details.');
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
            setReviews(prev => [...prev, ...((data.reviews || []) as unknown as Review[])]);
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
    const openLightbox = (imagePath: string) => { setLightboxImage(getImageUrl(imagePath)); setLightboxOpen(true); };
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

    const mainImageUrl = mainImage || (facility.images && facility.images.length > 0 ? getImageUrl(facility.images[0]) : FALLBACK_IMAGE);

    // --- Main Return JSX ---
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Cricket Stadium Background - Enhanced with more players and umpires */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 -z-10">
                {/* Background elements */}
                {/* ... (background elements remain unchanged) ... */}
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
                                const fullImageUrl = getImageUrl(imagePath);
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
                                {/* Tab Panels */}
                                {/* ... (content of tab panels) ... */}
                            </Tab.Panels>
                        </Tab.Group>
                    </div>

                    {/* Right column: Weather Widget and Booking widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            {/* Weather Widget */}
                            <WeatherWidget 
                              lat={facility.mapLocation?.lat} 
                              lng={facility.mapLocation?.lng} 
                              cityName={facility.location} 
                              facilityName={facility.name}
                              className="mb-6 animate-fade-in"
                            />

                            {/* Booking Widget */}
                            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-px rounded-2xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300 animate-fade-in">
                                <div className="bg-gradient-to-br from-emerald-900/80 to-green-900/80 rounded-2xl overflow-hidden backdrop-blur-sm">
                                    <div className="p-6 border-b border-white/10"><h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Book this Facility</h3></div>
                                    <div className="p-6">
                                        {/* Booking widget content */}
                                        {/* ... (content of booking widget) ... */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar facilities section */}
            <section className="bg-gradient-to-r from-emerald-900/60 to-green-900/50 py-16 border-t border-white/10 relative backdrop-blur-sm">
                {/* ... (similar facilities content) ... */}
            </section>

            {/* FAQ Section */}
            <section className="my-12 relative">
                {/* ... (FAQ content) ... */}
            </section>

            {/* Call to Action */}
            <section className="relative py-16 bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-900 overflow-hidden">
                {/* ... (call to action content) ... */}
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
                    {/* ... (review modal content) ... */}
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
                
                /* ... (remaining animation keyframes) ... */
            `}</style>
        </div>
    );
}