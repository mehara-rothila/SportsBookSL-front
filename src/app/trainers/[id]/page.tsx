//\trainers\[id]\page.tsx
'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
// Services
import * as trainerService from '@/services/trainerService';
import * as authService from '@/services/authService';
import * as reviewService from '@/services/reviewService';

// --- Import Components ---
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import Button from '@/components/ui/Button';

// --- Import Icons ---
import {
    StarIcon, MapPinIcon, AcademicCapIcon, CurrencyDollarIcon,
    CalendarDaysIcon, CheckIcon, ArrowPathIcon, ArrowRightIcon,
    BuildingOffice2Icon, UsersIcon, UserGroupIcon, LanguageIcon,
    ChevronLeftIcon, PencilSquareIcon, XMarkIcon, PlusCircleIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';

// --- Interfaces ---
interface Facility { _id: string; name: string; location: string; images?: string[]; }
interface ReviewUser { _id?: string; id?: string; name: string; avatar?: string; }
interface Review { _id: string; id?: string; user: ReviewUser; rating: number; reviewDate: string; content: string; createdAt?: string; }
interface Trainer { _id: string; name: string; specialization: string; sports: string[]; location: string; profileImage: string; rating: number; reviewCount: number; hourlyRate: number; experienceYears: number; availability: string[]; certifications: string[]; bio: string; languages: string[]; associatedFacilities?: Facility[]; reviews?: Review[]; }

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-trainer.png';
const FALLBACK_AVATAR = '/images/default-avatar.png';

// --- Helper function for class names ---
function classNames(...classes: string[]) { return classes.filter(Boolean).join(' '); }


export default function TrainerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : undefined;

    // --- State Variables ---
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // --- Fetch Trainer Data ---
    useEffect(() => {
        if (!id) {
            setError("Trainer ID is missing or invalid.");
            setLoading(false);
            return;
        }
        const fetchTrainer = async () => {
            setLoading(true); setError(null);
            try {
                const data = await trainerService.getTrainerById(id);
                setTrainer({
                    ...data,
                    profileImage: data.profileImage || FALLBACK_IMAGE,
                    rating: data.rating || 0,
                    reviewCount: data.reviewCount || 0, 
                    availability: data.availability || [],
                    certifications: data.certifications || [],
                    // Add any other required properties with defaults
                  } as Trainer); // Explicitly cast to Trainer type
                setReviews(data.reviews || []);
                const initialReviewLimit = 5;
                setHasMoreReviews((data.reviews?.length || 0) >= initialReviewLimit && data.reviewCount > initialReviewLimit);
                setTotalReviewPages(Math.ceil((data.reviewCount || 0) / initialReviewLimit));
                setReviewPage(1);
            } catch (err: any) {
                console.error('Error fetching trainer data:', err);
                setError(typeof err === 'string' ? err : 'Failed to load trainer details.');
                setTrainer(null);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainer();
    }, [id]);

    // --- Fetch More Reviews (Pagination) ---
    const fetchMoreReviews = async () => {
        if (!id || loadingReviews || !hasMoreReviews) return;
        setLoadingReviews(true); setReviewError(null);
        const nextPage = reviewPage + 1;
        const reviewLimit = 10;
        try {
            const data = await trainerService.getTrainerReviews(id, nextPage, reviewLimit);
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
        if (trainer && id) {
            setTrainer(prevTrainer => {
                if (!prevTrainer) return null;
                const newReviewCount = (prevTrainer.reviewCount || 0) + 1;
                trainerService.getTrainerById(id)
                .then(trainerData => {
                  setTrainer({
                    ...trainerData,
                    profileImage: trainerData.profileImage || FALLBACK_IMAGE,
                    rating: trainerData.rating || 0,
                    reviewCount: trainerData.reviewCount || 0, 
                    availability: trainerData.availability || [],
                    certifications: trainerData.certifications || []
                  } as Trainer);
                })
                .catch(console.error);                return { ...prevTrainer, reviewCount: newReviewCount };
            });
        }
    };

    // --- Helper Functions ---
    const formatCurrency = (amount: number | undefined) => { if (amount === undefined || amount === null) return 'N/A'; return `Rs. ${amount.toLocaleString('en-LK')}`; };
    const renderStars = (rating: number) => { return ( <div className="flex items-center"> {[1, 2, 3, 4, 5].map((star) => ( <StarIcon key={star} className={`h-5 w-5 flex-shrink-0 ${rating >= star ? 'text-yellow-400' : 'text-gray-300/40'}`} aria-hidden="true" /> ))} </div> ); };

    // --- Render Logic ---
    if (loading) { 
        return ( 
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900"> 
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div> 
                <p className="ml-4 text-xl font-semibold text-white">Loading Trainer Profile...</p> 
            </div> 
        ); 
    }
    
    if (error) { 
        return ( 
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white p-8"> 
                <h2 className="text-2xl font-bold mb-4">Error Loading Trainer</h2> 
                <p className="mb-4 text-center">{error}</p> 
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center border border-white/30"> 
                    <ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again 
                </button> 
            </div> 
        ); 
    }
    
    if (!trainer) { 
        return ( 
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-8"> 
                <h2 className="text-2xl font-bold text-white mb-2">Trainer Not Found</h2> 
                <p className="text-emerald-100 mb-4 text-center">We couldn't find the trainer you were looking for (ID: {id}).</p> 
                <Link href="/trainers" className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"> 
                    Back to Trainers 
                </Link> 
            </div> 
        );
    }

    const trainerImageUrl = trainer.profileImage ? `${BACKEND_BASE_URL}${trainer.profileImage}` : FALLBACK_IMAGE;

    return (
        <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen pb-16 relative overflow-hidden">
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

            {/* Back Button */}
            <button onClick={() => router.back()} className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20 inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-800 hover:bg-white shadow-md transition-all duration-300 group">
                <ChevronLeftIcon className="h-4 w-4 mr-1 text-emerald-600 group-hover:text-emerald-800 transition-colors"/> Back
            </button>

            {/* Hero Section */}
            <div className="relative pt-20 pb-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30 mt-20 max-w-7xl mx-auto">
                        <div className="md:flex">
                            {/* Trainer Image */}
                            <div className="md:w-1/3 md:h-auto relative">
                                <div className="h-80 md:h-full w-full overflow-hidden bg-black/20">
                                    <img
                                        src={trainerImageUrl}
                                        alt={trainer.name}
                                        className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                                    />
                                </div>
                                <div className="absolute top-4 right-4 bg-yellow-400/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-yellow-900 border border-yellow-400 shadow-sm flex items-center">
                                    <StarIcon className="h-4 w-4 mr-1 text-yellow-700" />
                                    {trainer.rating.toFixed(1)}
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-6">
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.sports.map((sport) => (
                                            <span
                                                key={sport}
                                                className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-white/50 shadow-sm"
                                            >
                                                {sport}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Trainer Details */}
                            <div className="p-6 md:p-8 md:w-2/3">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">{trainer.name}</h1>
                                        <div className="mt-1 flex items-center">
                                            {renderStars(trainer.rating)}
                                            <span className="ml-2 text-sm text-white/80">({trainer.reviewCount} reviews)</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 md:mt-0 text-2xl font-bold text-emerald-300">{formatCurrency(trainer.hourlyRate)}<span className="text-sm text-white/80 font-normal">/hr</span></p>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center text-white/90">
                                        <div className="p-2 bg-emerald-800/60 rounded-full mr-3 backdrop-blur-sm">
                                            <AcademicCapIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-white/60">Specialization</div>
                                            <div className="font-medium text-white">{trainer.specialization}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <div className="p-2 bg-emerald-800/60 rounded-full mr-3 backdrop-blur-sm">
                                            <MapPinIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-white/60">Location</div>
                                            <div className="font-medium text-white">{trainer.location}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <div className="p-2 bg-emerald-800/60 rounded-full mr-3 backdrop-blur-sm">
                                            <CalendarDaysIcon className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-white/60">Experience</div>
                                            <div className="font-medium text-white">{trainer.experienceYears} years</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-6">
                                    {trainer.certifications.map((cert, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full bg-emerald-700/60 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-emerald-600/30 shadow-sm"
                                        >
                                            <CheckIcon className="h-3.5 w-3.5 mr-1" />
                                            {cert}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => router.push(`/trainers/${trainer._id}/book`)}
                                        className="inline-flex items-center justify-center py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        <CalendarDaysIcon className="w-5 h-5 mr-2" />
                                        Book Session
                                    </button>
                                    <Link href="/facilities" passHref>
                                        <button className="inline-flex items-center justify-center py-3 px-6 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300">
                                            <BuildingOffice2Icon className="w-5 h-5 mr-2 text-white" />
                                            Find Facilities
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - All Sections Displayed Sequentially */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30 p-6 md:p-8 space-y-12">

                    {/* --- Overview Section --- */}
                    <section id="overview" className="animate-fade-in">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                                    <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                        <UserCircleIcon className="w-5 h-5 text-emerald-300" />
                                    </span>
                                    About {trainer.name}
                                </h2>
                                <p className="text-white/90 whitespace-pre-line leading-relaxed">{trainer.bio}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-emerald-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <LanguageIcon className="w-5 h-5 mr-2 text-emerald-300" />Languages Spoken
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.languages.map((language, index) => (
                                            <span key={index} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium shadow-sm border border-white/20">
                                                {language}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-emerald-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <UserGroupIcon className="w-5 h-5 mr-2 text-emerald-300" />Training Approach
                                    </h3>
                                    <p className="text-white/90 text-sm">Focuses on personalized plans to achieve athlete goals, combining technical skill development with strategic insights.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Experience & Skills Section --- */}
                    <section id="experience" className="animate-fade-in">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                                    <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                        <AcademicCapIcon className="w-5 h-5 text-emerald-300" />
                                    </span>
                                    Experience & Certifications
                                </h2>
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {trainer.certifications.map((cert, index) => (
                                        <div key={index} className="bg-white/10 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-white/20 transform hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                                            <div className="flex items-start">
                                                <div className="p-3 bg-emerald-800/60 backdrop-blur-sm rounded-lg mr-4">
                                                    <AcademicCapIcon className="h-6 w-6 text-emerald-300" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{cert}</h3>
                                                    <p className="text-sm text-white/70 mt-1">Certified Professional</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                                    <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                        <UserGroupIcon className="w-5 h-5 text-emerald-300" />
                                    </span>
                                    Sports & Specializations
                                </h2>
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {trainer.sports.map((sport, index) => (
                                        <div key={index} className="bg-emerald-700/30 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-white/20 transform hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                                            <h3 className="font-bold text-white mb-2">{sport}</h3>
                                            <p className="text-sm text-white/80">Specialized training for {sport.toLowerCase()} athletes.</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Facilities Section --- */}
                    <section id="facilities" className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                            <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                <BuildingOffice2Icon className="w-5 h-5 text-emerald-300" />
                            </span>
                            Associated Facilities
                        </h2>
                        {trainer.associatedFacilities && trainer.associatedFacilities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                {trainer.associatedFacilities.map((facility) => {
                                    const facilityImageUrl = (facility.images && facility.images.length > 0) ? `${BACKEND_BASE_URL}${facility.images[0]}` : FALLBACK_IMAGE;
                                    return (
                                        <div key={facility._id} className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-white/20 transform hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                            <div className="h-40 overflow-hidden bg-black/30">
                                                <img src={facilityImageUrl} alt={facility.name} className="w-full h-full object-cover transform hover:scale-110 transition-all duration-700 opacity-80" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}/>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-white mb-2">{facility.name}</h3>
                                                <p className="text-white/70 flex items-center mb-4 text-sm">
                                                    <MapPinIcon className="h-4 w-4 mr-1 text-emerald-300" />{facility.location}
                                                </p>
                                                <Link href={`/facilities/${facility._id}`}>
                                                    <button className="w-full py-2 rounded-lg bg-emerald-700/60 backdrop-blur-sm text-white border border-emerald-600/30 hover:bg-emerald-600/80 transition-all duration-300">
                                                        View Facility
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : ( 
                            <div className="bg-yellow-800/30 backdrop-blur-sm p-6 rounded-xl border border-yellow-700/30 text-center">
                                <p className="text-yellow-200">No associated facilities listed.</p>
                            </div> 
                        )}
                        <div className="mt-8 text-center">
                            <Link href="/facilities">
                                <button className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 shadow-lg">
                                    Browse all facilities
                                    <ArrowRightIcon className="ml-2 h-5 w-5"/>
                                </button>
                            </Link>
                        </div>
                    </section>

                    {/* --- Availability Section --- */}
                    <section id="availability" className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3 flex items-center">
                            <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                <CalendarDaysIcon className="w-5 h-5 text-emerald-300" />
                            </span>
                            Availability
                        </h2>
                        <div className="bg-emerald-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
                            <h3 className="text-lg font-bold text-white mb-4">Available Days</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => { 
                                    const isAvailable = trainer.availability.includes(day); 
                                    return (
                                        <div key={day} className={`${
                                            isAvailable 
                                                ? 'bg-emerald-700/60 border-emerald-600/30 text-white' 
                                                : 'bg-white/10 border-white/20 text-white/50'
                                            } p-4 rounded-lg border shadow-sm text-center backdrop-blur-sm`}>
                                            <p className="font-medium">{day}</p>
                                            {isAvailable ? (
                                                <p className="text-xs mt-2 flex items-center justify-center">
                                                    <CheckIcon className="h-4 w-4 mr-1 text-emerald-300" />Available
                                                </p>
                                            ) : (
                                                <p className="text-xs mt-2">Unavailable</p>
                                            )}
                                        </div>
                                    ); 
                                })}
                            </div>
                            <div className="mt-8 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-inner">
                                <p className="text-white/80 text-sm">Availability indicates general working days. Specific time slots can be viewed and booked through the booking process.</p>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <button onClick={() => router.push(`/trainers/${trainer._id}/book`)} className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 shadow-lg text-lg">
                                <CalendarDaysIcon className="mr-2 h-5 w-5" />Book a Session Now
                            </button>
                        </div>
                    </section>

                    {/* --- Reviews Section --- */}
                    <section id="reviews" className="animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/20 pb-3">
                            <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0 flex items-center">
                                <span className="bg-emerald-800/80 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                    <StarIcon className="w-5 h-5 text-yellow-400" />
                                </span>
                                Client Reviews ({trainer.reviewCount})
                            </h2>
                            {/* Conditional Add Review Button */}
                            {isLoggedIn ? (
                                <button onClick={() => setIsReviewModalOpen(true)} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-700/60 backdrop-blur-sm text-white hover:bg-emerald-600/80 transition-all duration-300 border border-emerald-600/30">
                                    <PencilSquareIcon className="w-5 h-5 mr-1.5"/> Write a Review
                                </button>
                            ) : (
                                <Link href={`/login?redirect=/trainers/${id}`}>
                                    <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 border border-white/30">
                                        Login to Review
                                    </button>
                                </Link>
                            )}
                        </div>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-sm">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="h-12 w-12 rounded-full overflow-hidden border border-white/30 bg-emerald-800/40">
                                                <img 
                                                    src={review.user.avatar || FALLBACK_AVATAR} 
                                                    alt={review.user.name} 
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-medium text-white">{review.user.name}</p>
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon
                                                            key={star}
                                                            className={`h-4 w-4 flex-shrink-0 ${
                                                                review.rating >= star ? 'text-yellow-400' : 'text-gray-300/40'
                                                            }`}
                                                            aria-hidden="true"
                                                        />
                                                    ))}
                                                </div>
                                                <p className="ml-2 text-sm text-white/60">
                                                    {new Date(review.reviewDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="mt-3 text-white/90 text-sm whitespace-pre-line">{review.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Load More Button */}
                        {hasMoreReviews && (
                            <div className="mt-8 text-center">
                                <button 
                                    onClick={fetchMoreReviews} 
                                    className={`inline-flex items-center justify-center px-6 py-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 ${loadingReviews ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={loadingReviews}
                                >
                                    {loadingReviews ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : 'Load More Reviews'}
                                </button>
                            </div>
                        )}
                        {!hasMoreReviews && reviews.length > 5 && (
                            <p className="text-center text-white/60 mt-8">No more reviews to load.</p>
                        )}
                        {reviewError && !loadingReviews && <p className="text-center text-red-300 mt-4">{reviewError}</p>}
                    </section>
                </div>
            </div>

            {/* Call to Action */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                    <div className="relative px-6 py-10 sm:px-10 sm:py-16 md:py-20 lg:py-28 xl:px-16">
                        <div className="relative max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Elevate Your Training?</h2>
                            <p className="mt-4 text-lg text-emerald-100">Book a personalized session with {trainer.name} today and reach your potential.</p>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <button 
                                    onClick={() => router.push(`/trainers/${trainer._id}/book`)} 
                                    className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 shadow-lg text-lg"
                                >
                                    <CalendarDaysIcon className="mr-2 -ml-1 h-5 w-5" />Book Session Now
                                </button>
                                <Link href="/trainers" passHref>
                                    <button className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300">
                                        View All Trainers
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Review Modal --- */}
            <Transition appear show={isReviewModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsReviewModalOpen(false)}>
                    {/* Backdrop */}
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    {/* Modal Content */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-emerald-900/90 backdrop-blur-xl p-6 text-left align-middle shadow-xl transition-all border border-white/20">
                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white mb-4 flex justify-between items-center">
                                        <span>Write a Review for {trainer.name}</span>
                                        <button onClick={() => setIsReviewModalOpen(false)} className="text-white/60 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                                    </Dialog.Title>
                                    {/* Review Form content would go here but with themed styling */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-1">Rating</label>
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} className="p-1">
                                                        <StarIcon className="h-8 w-8 text-yellow-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-1">Review</label>
                                            <textarea className="w-full rounded-lg bg-white/10 border-white/30 text-white placeholder-white/50 focus:ring-emerald-500 focus:border-emerald-500" rows={4} placeholder="Share your experience with this trainer..."></textarea>
                                        </div>
                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10">Cancel</button>
                                            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Submit Review</button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* --- End Review Modal --- */}

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
                
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
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