// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback, Fragment, Suspense } from 'react';
import Link from 'next/link';
import { Tab } from '@headlessui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { format, parseISO, differenceInHours, isValid } from 'date-fns';

// Import services
import * as userService from '@/services/userService';
import * as bookingService from '@/services/bookingService';
import * as financialAidService from '@/services/financialAidService';
import * as authService from '@/services/authService';

// Import Components
import FinancialAidDetailModal from '@/components/profile/FinancialAidDetailModal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

// Icons
import {
  StarIcon, MapPinIcon, PencilIcon, XMarkIcon, CameraIcon,
  ArrowUpTrayIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon, TrashIcon,
  GiftIcon, BanknotesIcon, LinkIcon, QuestionMarkCircleIcon
} from '@heroicons/react/24/solid';
import { CalendarDaysIcon, CreditCardIcon, UserIcon, BuildingStorefrontIcon, BriefcaseIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';


// --- Constants ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
// No fallback avatar anymore - we won't use a placeholder
const DEFAULT_AVATAR = '/images/default-avatar.png';
const FALLBACK_FACILITY_IMAGE = '/images/facility-placeholder.jpg';
const CANCELLATION_HOURS_LIMIT = 24;


// --- Interfaces ---
interface UserProfile {
    _id: string; name: string; email: string; phone?: string; address?: string; avatar?: string; createdAt?: string; sportPreferences?: string[]; role?: string;
}
interface Booking {
    _id: string; bookingId?: string; date: string; timeSlot: string; status: string; bookingType?: 'facility' | 'trainer'; facility?: { _id: string; name?: string; location?: string }; trainer?: { _id: string; name?: string; specialization?: string; }; durationHours?: number; participants?: number; totalCost?: number;
}
interface Favorite {
    _id: string; images?: string[]; name: string; location: string; rating?: number; pricePerHour?: string;
}
interface FinAidAppSummary {
    _id: string; submittedDate?: string; status: string; sportsInfo?: { primarySport?: string; };
}
interface FinAidAppDetails extends financialAidService.FinancialAidApplicationDetails {}
interface UserDonation {
    _id: string; athlete?: { _id: string; name: string; }; amount: number; donationDate: string; paymentStatus: string; isAnonymous: boolean;
}

// --- Helper Functions ---
function classNames(...classes: string[]) { return classes.filter(Boolean).join(' '); }
const formatDate = (dateString: string | undefined, formatStr = 'PPP'): string => { if (!dateString) return 'N/A'; try { const date = parseISO(dateString); return isValid(date) ? format(date, formatStr) : 'Invalid Date'; } catch (e) { console.error("Date Format Error:", e); return 'Invalid Date'; } };
const formatCurrency = (amount: number | undefined | null): string => { if (amount === undefined || amount === null) return 'N/A'; return `Rs. ${amount.toLocaleString('en-LK')}`; };
const canCancelBooking = (bookingDate: string): boolean => { try { const now = new Date(); const bookingDT = parseISO(bookingDate); return isValid(bookingDT) && differenceInHours(bookingDT, now) > CANCELLATION_HOURS_LIMIT; } catch (e) { return false; } };

// --- Helper Components ---
const Spinner = ({ message = "Loading..." }: { message?: string }) => (<div className="flex flex-col justify-center items-center py-10"><div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div><p className="mt-2 text-sm text-gray-500">{message}</p></div>);
const ErrorMessage = ({ message }: { message: string | null }) => (message ? (<div className="text-center py-10 text-red-600 bg-red-50/90 backdrop-blur-sm p-4 rounded-lg border border-red-200"><p className="font-medium">Error:</p>{message}</div>) : null);
const EmptyState = ({ type, message, actionText, actionHref } : { type: string; message: string; actionText?: string; actionHref?: string }) => ( <div className="text-center py-12 px-4 rounded-lg bg-gradient-to-br from-emerald-50 via-white to-green-50 border border-emerald-100"> <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center ring-4 ring-emerald-200/50">{type === 'bookings' ? <CalendarDaysIcon className="h-8 w-8 text-emerald-600" /> : type === 'favorites' ? <StarIcon className="h-8 w-8 text-emerald-600" /> : type === 'financial' ? <CreditCardIcon className="h-8 w-8 text-emerald-600" /> : type === 'donations' ? <GiftIcon className="h-8 w-8 text-emerald-600" /> : <QuestionMarkCircleIcon className="h-8 w-8 text-emerald-600" />}</div> <h3 className="mt-3 text-lg font-medium text-gray-900">No {type} found</h3> <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">{message}</p> {actionText && actionHref && (<Link href={actionHref} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"> {actionText} </Link> )} </div> );


// --- Main Page Component ---
function ProfilePageContent() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();

    // State declarations
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [loadingAid, setLoadingAid] = useState(false);
    const [loadingDonations, setLoadingDonations] = useState(false);
    const [loadingAvatar, setLoadingAvatar] = useState(false);
    const [isCancellingBooking, setIsCancellingBooking] = useState(false);
    const [isFetchingAidDetails, setIsFetchingAidDetails] = useState(false);
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [financialAidApps, setFinancialAidApps] = useState<FinAidAppSummary[]>([]);
    const [donationHistory, setDonationHistory] = useState<UserDonation[]>([]);

    const [profileError, setProfileError] = useState<string | null>(null);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [favoritesError, setFavoritesError] = useState<string | null>(null);
    const [aidError, setAidError] = useState<string | null>(null);
    const [donationError, setDonationError] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfileData, setEditedProfileData] = useState<Partial<UserProfile>>({});
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [bookingsFetched, setBookingsFetched] = useState(false);
    const [favoritesFetched, setFavoritesFetched] = useState(false);
    const [aidFetched, setAidFetched] = useState(false);
    const [donationsFetched, setDonationsFetched] = useState(false);

    // Modal States
    const [aidDetailModalOpen, setAidDetailModalOpen] = useState(false);
    const [selectedAidApp, setSelectedAidApp] = useState<FinAidAppDetails | null>(null);
    const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
    const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
    const [confirmAvatarRemoveModalOpen, setConfirmAvatarRemoveModalOpen] = useState(false);

    // --- Fetch Functions (Memoized) ---
    const fetchProfile = useCallback(async () => {
        setLoadingProfile(true); 
        setProfileError(null); 
        try { 
            const data = await userService.getUserProfile(); 
            setProfile(data); 
            setEditedProfileData({ 
                name: data?.name || '', 
                email: data?.email || '', 
                phone: data?.phone || '', 
                address: data?.address || '' 
            }); 
            
            // Set avatar preview directly without fallback
            if (data?.avatar) {
                setAvatarPreview(`${BACKEND_BASE_URL}${data.avatar}`);
            } else {
                setAvatarPreview(null);
            }
        } catch (err: any) { 
            console.error("Fetch Profile Error:", err); 
            setProfileError(err?.message || 'Failed to load profile.'); 
        } finally { 
            setLoadingProfile(false); 
        }
    }, []);

    const fetchBookingsData = useCallback(async () => {
         if (bookingsFetched || loadingBookings) return; setLoadingBookings(true); setBookingsError(null); try { const data = await bookingService.getUserBookings(); setBookings(data.map(b => ({...b, bookingType: b.trainer ? 'trainer' : 'facility'}))); setBookingsFetched(true); } catch (err:any) { setBookingsError(err?.message || 'Failed to load bookings'); } finally { setLoadingBookings(false); }
    }, [bookingsFetched, loadingBookings]);

    const fetchFavoritesData = useCallback(async () => {
         if (favoritesFetched || loadingFavorites) return; setLoadingFavorites(true); setFavoritesError(null); try { const data = await userService.getUserFavorites(); setFavorites(data); setFavoritesFetched(true); } catch (err:any) { setFavoritesError(err?.message || 'Failed to load favorites'); } finally { setLoadingFavorites(false); }
    }, [favoritesFetched, loadingFavorites]);

     const fetchDonationsData = useCallback(async () => {
        if (donationsFetched || loadingDonations) return; setLoadingDonations(true); setDonationError(null); try { const data = await userService.getUserDonationHistory(); setDonationHistory(data); setDonationsFetched(true); } catch (err:any) { setDonationError(err?.message || 'Failed to load donation history'); } finally { setLoadingDonations(false); }
     }, [donationsFetched, loadingDonations]);

    const fetchAidData = useCallback(async () => {
        if (aidFetched || loadingAid) return; setLoadingAid(true); setAidError(null); try { const data = await userService.getUserFinancialAidApps(); setFinancialAidApps(data); setAidFetched(true); } catch (err:any) { setAidError(err?.message || 'Failed to load applications'); } finally { setLoadingAid(false); }
     }, [aidFetched, loadingAid]);

     // --- Initial Auth Check & Profile Load ---
     useEffect(() => { 
        const checkAuthAndLoad = async () => { 
            try { 
                const isAuthed = authService.isAuthenticated(); 
                if (!isAuthed) { 
                    router.push('/login?redirect=/profile'); 
                    return; 
                } 
                await fetchProfile(); 
            } catch (err) { 
                console.error("Auth/Profile Load Error:", err); 
                setProfileError('Authentication failed. Please login again.'); 
            } 
        }; 
        checkAuthAndLoad(); 
    }, [router, fetchProfile]);

    // --- Fetch Tab Data Effect ---
    useEffect(() => {
         if (!profile) return; const fetchTabData = async () => { switch(selectedIndex) { case 0: if(!bookingsFetched) await fetchBookingsData(); break; case 1: if(!favoritesFetched) await fetchFavoritesData(); break; case 2: if(!donationsFetched) await fetchDonationsData(); break; // Donations Tab
                 case 3: if(!aidFetched) await fetchAidData(); break; // Financial Aid Tab
                 // case 4 is settings, no initial fetch
            } }; fetchTabData();
    }, [selectedIndex, profile, bookingsFetched, favoritesFetched, aidFetched, donationsFetched, fetchBookingsData, fetchFavoritesData, fetchDonationsData, fetchAidData]);

     // Handle tab selection from query parameters (e.g., /profile?tab=bookings)
     useEffect(() => {
         const tab = searchParams.get('tab');
         switch (tab) {
             case 'bookings': setSelectedIndex(0); break;
             case 'favorites': setSelectedIndex(1); break;
             case 'donations': setSelectedIndex(2); break;
             case 'aid': setSelectedIndex(3); break;
             case 'settings': setSelectedIndex(4); break;
             default: // If no tab param or invalid, default to 0 or keep current
                if (!searchParams.has('tab')) setSelectedIndex(0);
                break;
         }
     }, [searchParams]);

    // --- Event Handlers ---
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditedProfileData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleSaveProfile = async () => { 
        if (!profile) return; 
        setLoadingProfile(true); 
        setProfileError(null); 
        try { 
            const dataToUpdate: Partial<UserProfile> = {};
            
            if (editedProfileData.name !== profile.name) dataToUpdate.name = editedProfileData.name;
            if (editedProfileData.email !== profile.email) dataToUpdate.email = editedProfileData.email;
            if (editedProfileData.phone !== (profile.phone || '')) dataToUpdate.phone = editedProfileData.phone;
            if (editedProfileData.address !== (profile.address || '')) dataToUpdate.address = editedProfileData.address;
            
            if (Object.keys(dataToUpdate).length > 0) {
                const updatedData = await userService.updateUserProfile(dataToUpdate);
                setProfile(updatedData);
                
                // Update avatar preview
                if (updatedData.avatar) {
                    setAvatarPreview(`${BACKEND_BASE_URL}${updatedData.avatar}`);
                } else {
                    setAvatarPreview(null);
                }
                
                try {
                    if (authService.updateLocalUserInfo) {
                        authService.updateLocalUserInfo(updatedData);
                        console.log("Local storage updated.");
                    }
                } catch (lsErr) {
                    console.error("LS update error:", lsErr);
                }
                
                toast.success("Profile updated!");
            } else {
                toast.info("No changes made.");
            }
            
            setIsEditingProfile(false);
        } catch (err: any) {
            const msg = err?.message || 'Failed to save profile';
            setProfileError(msg);
            toast.error(msg);
        } finally {
            setLoadingProfile(false);
        }
    };
    
    const handleCancelEdit = () => {
        if (profile) {
            setEditedProfileData({
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || ''
            });
        }
        setIsEditingProfile(false);
        setProfileError(null);
    };
    
    const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2*1024*1024) {
                toast.error("File too large (max 2MB)");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error("Invalid file type");
                return;
            }
            
            setSelectedAvatarFile(file);
            setAvatarError(null);
            
            // Create local preview
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setSelectedAvatarFile(null);
            // Keep current avatar or set to null if no avatar exists
            setAvatarPreview(profile?.avatar ? `${BACKEND_BASE_URL}${profile.avatar}` : null);
        }
    };
    
    const handleAvatarUpload = async () => {
        if (!selectedAvatarFile) {
            toast.error("No file selected");
            return;
        }
        
        setLoadingAvatar(true);
        setAvatarError(null);
        const uploadToast = toast.loading("Uploading avatar...");
        
        try {
            const updatedProfile = await userService.uploadUserAvatar(selectedAvatarFile);
            toast.dismiss(uploadToast);
            toast.success("Avatar updated!");
            
            setProfile(updatedProfile);
            
            // Set avatar preview directly without fallback
            if (updatedProfile.avatar) {
                setAvatarPreview(`${BACKEND_BASE_URL}${updatedProfile.avatar}`);
            } else {
                setAvatarPreview(null);
            }
            
            setSelectedAvatarFile(null);
            
            try {
                if(authService.updateLocalUserInfo) {
                    authService.updateLocalUserInfo({ avatar: updatedProfile.avatar });
                }
            } catch (lsErr) {
                console.error("LS update error:", lsErr);
            }
        } catch (err: any) {
            toast.dismiss(uploadToast);
            const msg = err?.message || "Upload failed";
            setAvatarError(msg);
            toast.error(msg);
        } finally {
            setLoadingAvatar(false);
        }
    };
    
    // New function to remove avatar
    const handleRemoveAvatar = async () => {
        setIsRemovingAvatar(true);
        const removeToast = toast.loading("Removing avatar...");
        
        try {
            // Call a service to remove the avatar
            // We need to implement this function
            const updatedProfile = await userService.removeUserAvatar();
            toast.dismiss(removeToast);
            toast.success("Avatar removed!");
            
            setProfile(updatedProfile);
            setAvatarPreview(null);
            
            try {
                if(authService.updateLocalUserInfo) {
                    authService.updateLocalUserInfo({ avatar: undefined });
                }
            } catch (lsErr) {
                console.error("LS update error:", lsErr);
            }
            
            setConfirmAvatarRemoveModalOpen(false);
        } catch (err: any) {
            toast.dismiss(removeToast);
            const msg = err?.message || "Remove failed";
            setAvatarError(msg);
            toast.error(msg);
        } finally {
            setIsRemovingAvatar(false);
        }
    };
    
    const handleRemoveFavorite = async (facilityId: string) => { if (!facilityId) return; const removeToast = toast.loading("Removing favorite..."); setLoadingFavorites(true); setFavoritesError(null); try { const updatedFavorites = await userService.removeFavorite(facilityId); setFavorites(updatedFavorites); toast.dismiss(removeToast); toast.success("Favorite removed"); } catch (err:any) { toast.dismiss(removeToast); const msg = err?.message || 'Failed to remove favorite'; setFavoritesError(msg); toast.error(msg); } finally { setLoadingFavorites(false); }};

    // -- Booking Cancel Handlers --
    const openCancelModal = (bookingId: string) => { setBookingToCancelId(bookingId); setCancelBookingModalOpen(true); };
    const closeCancelModal = () => { if(!isCancellingBooking) {setBookingToCancelId(null); setCancelBookingModalOpen(false);} };
    const confirmBookingCancel = async () => { if (!bookingToCancelId) return; setIsCancellingBooking(true); const cancelToast = toast.loading("Cancelling booking..."); try { await bookingService.cancelBooking(bookingToCancelId); toast.dismiss(cancelToast); toast.success("Booking cancelled!"); setBookings(prev => prev.map(b => b._id === bookingToCancelId ? {...b, status: 'cancelled'} : b)); } catch (err: any) { toast.dismiss(cancelToast); toast.error(`Cancellation failed: ${err.message}`); } finally { setIsCancellingBooking(false); closeCancelModal(); } };

    // -- Financial Aid Detail Handlers --
    const openAidDetailModal = async (appId: string) => { 
        setIsFetchingAidDetails(true); 
        setSelectedAidApp(null); 
        setAidDetailModalOpen(true); 
        try { 
            const details = await financialAidService.getUserApplicationDetails(appId); 
            setSelectedAidApp(details); 
        } catch (err: any) { 
            toast.error(`Error loading details: ${err.message}`); 
            setAidDetailModalOpen(false); 
        } finally { 
            setIsFetchingAidDetails(false); 
        }
    };
    
    const closeAidDetailModal = () => { 
        setAidDetailModalOpen(false); 
        setSelectedAidApp(null); 
    };

    // --- Loading / Error / Main Render ---
    if (loadingProfile) { return <div className="flex justify-center items-center min-h-screen bg-emerald-900/10 backdrop-blur-sm"><Spinner message="Loading Profile..." /></div>; }
    if (profileError && !profile) { return <div className="flex justify-center items-center min-h-screen bg-red-100"><ErrorMessage message={profileError} /></div>; }
    if (!profile) { return <div className="flex justify-center items-center min-h-screen bg-gray-100"><p>Not logged in or profile unavailable.</p></div>; }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 shadow-lg border-b-4 border-emerald-800/50">
                <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Avatar */}
                        <div className="relative group rounded-full overflow-hidden h-24 w-24 md:h-32 md:w-32 border-4 border-white/50 shadow-xl mb-4 md:mb-0 md:mr-8 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                            {avatarPreview ? (
                                <img 
                                    src={avatarPreview} 
                                    alt={profile.name || 'User'} 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-16 w-16 text-gray-400" />
                            )}
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full" 
                                aria-label="Change profile picture"
                            >
                                <CameraIcon className="h-8 w-8 text-white/90" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarFileSelect} 
                                accept="image/*" 
                                className="hidden"
                            />
                        </div>
                        
                        {/* User Info */}
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-md">{profile.name || 'User'}</h1>
                            <p className="text-emerald-100 text-sm mb-1 flex items-center justify-center md:justify-start">
                                <UserIcon className="h-4 w-4 mr-1.5 text-emerald-300/80"/> 
                                {profile.email || 'No email'}
                            </p>
                            {profile.phone && (
                                <p className="text-emerald-100 text-sm mb-1 flex items-center justify-center md:justify-start">
                                    <svg className="h-4 w-4 mr-1.5 text-emerald-300/80" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    {profile.phone}
                                </p>
                            )}
                            {profile.address && (
                                <p className="text-emerald-100 text-sm mb-2 flex items-center justify-center md:justify-start">
                                    <MapPinIcon className="h-4 w-4 mr-1.5 text-emerald-300/80"/>
                                    {profile.address}
                                </p>
                            )}
                            {profile.createdAt && (
                                <p className="text-emerald-200/80 text-xs mb-3 flex items-center justify-center md:justify-start">
                                    <svg className="h-4 w-4 mr-1 text-emerald-300/80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    Member since {formatDate(profile.createdAt)}
                                </p>
                            )}
                        </div>
                        
                        {/* Avatar Action Controls */}
                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col sm:flex-row items-center gap-2">
                            {selectedAvatarFile && (
                                <>
                                    <button 
                                        onClick={handleAvatarUpload} 
                                        disabled={loadingAvatar} 
                                        className="btn-primary bg-white text-emerald-700 hover:bg-gray-100 text-sm py-1.5 px-3"
                                    >
                                        {loadingAvatar ? 'Uploading...' : (
                                            <>
                                                <ArrowUpTrayIcon className="h-4 w-4 mr-1"/>
                                                Upload Avatar
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => { 
                                            setSelectedAvatarFile(null); 
                                            setAvatarPreview(profile?.avatar ? `${BACKEND_BASE_URL}${profile.avatar}` : null); 
                                            setAvatarError(null); 
                                        }} 
                                        disabled={loadingAvatar} 
                                        className="text-sm text-white/80 hover:text-white underline disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                            
                            {!selectedAvatarFile && profile.avatar && (
                                <button 
                                    onClick={() => setConfirmAvatarRemoveModalOpen(true)} 
                                    disabled={isRemovingAvatar} 
                                    className="btn-secondary bg-red-500/90 text-white hover:bg-red-600 text-sm py-1.5 px-3"
                                >
                                    {isRemovingAvatar ? 'Removing...' : (
                                        <>
                                            <TrashIcon className="h-4 w-4 mr-1"/>
                                            Remove Avatar
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        
                        {avatarError && (
                            <p className="text-red-200 text-xs mt-2 text-center md:text-right w-full md:w-auto">
                                {avatarError}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-xl overflow-hidden border border-gray-200/50">
                    <div className="p-4 sm:p-6">
                        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                            <Tab.List className="flex flex-wrap p-1 space-x-1 bg-emerald-100/50 rounded-lg mb-6 sm:mb-8 shadow-inner border border-emerald-200/50">
                                {/* Tab titles */}
                                {[ 
                                    { name: "My Bookings", icon: CalendarDaysIcon }, 
                                    { name: "Favorites", icon: StarIcon }, 
                                    { name: "My Donations", icon: GiftIcon }, 
                                    { name: "Financial Aid", icon: CreditCardIcon }, 
                                    { name: "Account Settings", icon: UserIcon }
                                ].map((category, idx) => ( 
                                    <Tab 
                                        key={category.name} 
                                        className={({ selected }) => classNames(
                                            'flex-grow text-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200',
                                            'focus:outline-none focus:ring-2 ring-offset-1 ring-offset-emerald-50 ring-emerald-500',
                                            'flex items-center justify-center whitespace-nowrap',
                                            selected 
                                                ? 'bg-emerald-600 shadow-md text-white' 
                                                : 'text-emerald-700 hover:bg-emerald-200/60 hover:text-emerald-900'
                                        )}
                                    > 
                                        <category.icon className="h-4 w-4 mr-1.5" /> 
                                        {category.name} 
                                    </Tab> 
                                ))}
                            </Tab.List>
                            
                            <Tab.Panels className="mt-2 min-h-[300px]">
                                {/* Bookings Panel */}
                                <Tab.Panel className="focus:outline-none">
                                    {loadingBookings ? <Spinner /> : bookingsError ? <ErrorMessage message={bookingsError} /> : bookings.length === 0 ? <EmptyState type="bookings" message="View your upcoming and past sessions." actionText="Browse Facilities" actionHref="/facilities"/> : (
                                        <div className="space-y-5">
                                            {bookings.map((booking) => {
                                                const isCancellable = booking.status === 'upcoming' && canCancelBooking(booking.date);
                                                return (
                                                    <div 
                                                        key={booking._id} 
                                                        className={`p-4 rounded-lg border ${
                                                            booking.status === 'upcoming' 
                                                                ? 'bg-green-50 border-green-200' 
                                                                : booking.status === 'cancelled' 
                                                                    ? 'bg-red-50 border-red-200' 
                                                                    : 'bg-gray-50 border-gray-200'
                                                        } shadow-sm flex flex-wrap md:flex-nowrap items-start gap-4`}
                                                    >
                                                        <div className="w-full md:w-40 flex-shrink-0 text-center md:text-left">
                                                            <p className="font-semibold text-sm text-gray-800">
                                                                {formatDate(booking.date, 'EEE, MMM d, yyyy')}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{booking.timeSlot}</p>
                                                            <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                booking.status === 'upcoming' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : booking.status === 'completed' 
                                                                        ? 'bg-blue-100 text-blue-800' 
                                                                        : booking.status === 'cancelled' 
                                                                            ? 'bg-red-100 text-red-800' 
                                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex-grow">
                                                            <h3 className="font-medium text-gray-900 text-sm mb-1">
                                                                {booking.bookingType === 'trainer' 
                                                                    ? `Training: ${booking.trainer?.name || 'N/A'}` 
                                                                    : `Facility: ${booking.facility?.name || 'N/A'}`}
                                                            </h3>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                                                                <span className="inline-flex items-center">
                                                                    <UserGroupIcon className="h-3 w-3 mr-1"/>
                                                                    {booking.participants}p
                                                                </span>
                                                                <span className="inline-flex items-center">
                                                                    <ClockIcon className="h-3 w-3 mr-1"/>
                                                                    {booking.durationHours}h
                                                                </span>
                                                                <span className="inline-flex items-center">
                                                                    <BanknotesIcon className="h-3 w-3 mr-1"/>
                                                                    {formatCurrency(booking.totalCost)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0 mt-2 md:mt-0">
                                                            {isCancellable && (
                                                                <button 
                                                                    onClick={() => openCancelModal(booking._id)} 
                                                                    disabled={isCancellingBooking && bookingToCancelId === booking._id} 
                                                                    className="btn-secondary-outline border-red-300 text-red-600 hover:bg-red-50 text-xs px-2 py-1 disabled:opacity-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Favorites Panel */}
                                <Tab.Panel className="focus:outline-none">
                                    {loadingFavorites ? <Spinner /> : favoritesError ? <ErrorMessage message={favoritesError} /> : favorites.length === 0 ? <EmptyState type="favorites" message="Browse facilities and mark your favorites." /> : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {favorites.map((facility) => (
                                                    <div key={facility._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 group relative">
                                                        <Link href={`/facilities/${facility._id}`} className="block">
                                                            <div className="h-32 w-full bg-gray-200">
                                                                {facility.images?.length ? (
                                                                    <img 
                                                                        src={`${BACKEND_BASE_URL}${facility.images[0]}`} 
                                                                        alt={facility.name} 
                                                                        className="h-full w-full object-cover" 
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <BuildingStorefrontIcon className="h-16 w-16 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleRemoveFavorite(facility._id)} 
                                                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 z-10"
                                                        >
                                                            <XMarkIcon className="h-5 w-5" />
                                                        </button>
                                                        <div className="p-3">
                                                            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{facility.name}</h3>
                                                            <p className="text-xs text-gray-500 flex items-center mb-2">
                                                                <MapPinIcon className="h-3 w-3 mr-1 text-gray-400"/>
                                                                {facility.location}
                                                            </p>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="flex items-center">
                                                                    <StarIcon className="h-3.5 w-3.5 text-yellow-400 mr-0.5"/>
                                                                    {facility.rating?.toFixed(1) || 'N/A'}
                                                                </span>
                                                                <span className="font-medium text-emerald-600">{facility.pricePerHour}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Donations Panel */}
                                <Tab.Panel className="focus:outline-none">
                                    {loadingDonations ? <Spinner /> : donationError ? <ErrorMessage message={donationError} /> : donationHistory.length === 0 ? <EmptyState type="donations" message="Your contributions help athletes succeed." actionText="Support an Athlete" actionHref='/donations'/> : (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-medium text-emerald-800 mb-4">Your Donation History</h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                    <thead className="bg-gray-50/50">
                                                        <tr>
                                                            <th className="th-profile">Date</th>
                                                            <th className="th-profile">Athlete</th>
                                                            <th className="th-profile">Amount</th>
                                                            <th className="th-profile">Status</th>
                                                            <th className="th-profile">Anonymous</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                        {donationHistory.map((donation) => (
                                                            <tr key={donation._id}>
                                                                <td className="td-profile">{formatDate(donation.donationDate, 'PP')}</td>
                                                                <td className="td-profile font-medium text-gray-900">{donation.athlete?.name ?? 'N/A'}</td>
                                                                <td className="td-profile font-medium">{formatCurrency(donation.amount)}</td>
                                                                <td className="td-profile">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                        donation.paymentStatus === 'succeeded' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : donation.paymentStatus === 'pending' 
                                                                                ? 'bg-yellow-100 text-yellow-800' 
                                                                                : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {donation.paymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="td-profile">{donation.isAnonymous ? 'Yes' : 'No'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Financial Aid Panel */}
                                <Tab.Panel className="focus:outline-none">
                                    {loadingAid ? <Spinner /> : aidError ? <ErrorMessage message={aidError} /> : financialAidApps.length === 0 ? <EmptyState type="financial" message="Apply for assistance to access facilities." actionText="Apply Now" actionHref='/financial-aid/apply'/> : (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-medium text-emerald-800 mb-4">Your Financial Aid Applications</h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                    <thead className="bg-gray-50/50">
                                                        <tr>
                                                            <th className="th-profile">Submitted</th>
                                                            <th className="th-profile">Sport</th>
                                                            <th className="th-profile">Status</th>
                                                            <th className="th-profile">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                        {financialAidApps.map((app) => (
                                                            <tr key={app._id}>
                                                                <td className="td-profile">{formatDate(app.submittedDate)}</td>
                                                                <td className="td-profile">{app.sportsInfo?.primarySport || 'N/A'}</td>
                                                                <td className="td-profile">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                        app.status === 'approved' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : app.status === 'pending' 
                                                                                ? 'bg-yellow-100 text-yellow-800' 
                                                                                : app.status === 'rejected' 
                                                                                    ? 'bg-red-100 text-red-800' 
                                                                                    : 'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                        {app.status.replace('_',' ')}
                                                                    </span>
                                                                </td>
                                                                <td className="td-profile">
                                                                    <button 
                                                                        onClick={() => openAidDetailModal(app._id)} 
                                                                        className="font-medium text-emerald-600 hover:text-emerald-900 hover:underline"
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Account Settings Panel */}
                                <Tab.Panel className="focus:outline-none">
                                    {profileError && <ErrorMessage message={profileError} />}
                                    <div className="max-w-2xl mx-auto">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-medium text-emerald-800">Account Settings</h3>
                                            {/* Edit/Save/Cancel Buttons */}
                                            {!isEditingProfile ? (
                                                <button 
                                                    onClick={() => setIsEditingProfile(true)} 
                                                    className="btn-secondary-outline text-sm"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-1.5" />
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={handleCancelEdit} 
                                                        className="btn-secondary-outline text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={handleSaveProfile} 
                                                        disabled={loadingProfile} 
                                                        className="btn-primary text-sm disabled:opacity-50"
                                                    >
                                                        {loadingProfile ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* Form Inputs */}
                                        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                                            <div className="px-4 py-5 sm:p-6">
                                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">
                                                            {isEditingProfile ? (
                                                                <input 
                                                                    type="text" 
                                                                    name="name" 
                                                                    value={editedProfileData.name} 
                                                                    onChange={handleProfileChange} 
                                                                    className="input-field"
                                                                />
                                                            ) : profile.name || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">
                                                            {isEditingProfile ? (
                                                                <input 
                                                                    type="email" 
                                                                    name="email" 
                                                                    value={editedProfileData.email} 
                                                                    onChange={handleProfileChange} 
                                                                    className="input-field"
                                                                />
                                                            ) : profile.email || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">
                                                            {isEditingProfile ? (
                                                                <input 
                                                                    type="tel" 
                                                                    name="phone" 
                                                                    value={editedProfileData.phone || ''} 
                                                                    onChange={handleProfileChange} 
                                                                    className="input-field"
                                                                />
                                                            ) : profile.phone || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">
                                                            {isEditingProfile ? (
                                                                <input 
                                                                    type="text" 
                                                                    name="address" 
                                                                    value={editedProfileData.address || ''} 
                                                                    onChange={handleProfileChange} 
                                                                    className="input-field"
                                                                />
                                                            ) : profile.address || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                                                        <dd className="mt-1 text-sm text-gray-900 capitalize">{profile.role || 'User'}</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <FinancialAidDetailModal 
                isOpen={aidDetailModalOpen} 
                onClose={closeAidDetailModal} 
                application={selectedAidApp} 
                isLoading={isFetchingAidDetails} 
            />
            
            <ConfirmDeleteModal 
                isOpen={cancelBookingModalOpen} 
                onClose={closeCancelModal} 
                onConfirm={confirmBookingCancel} 
                title="Confirm Cancellation" 
                message={`Are you sure you want to cancel this booking? This action might be irreversible based on the cancellation policy (${CANCELLATION_HOURS_LIMIT} hours notice usually required).`} 
                confirmButtonText="Yes, Cancel Booking" 
                isDeleting={isCancellingBooking} 
            />
            
            <ConfirmDeleteModal 
                isOpen={confirmAvatarRemoveModalOpen} 
                onClose={() => setConfirmAvatarRemoveModalOpen(false)} 
                onConfirm={handleRemoveAvatar} 
                title="Remove Profile Picture" 
                message="Are you sure you want to remove your profile picture? This action cannot be undone." 
                confirmButtonText="Yes, Remove Picture" 
                isDeleting={isRemovingAvatar} 
            />

            {/* Global CSS Styles */}
            <style jsx global>{`
                /* Table Cell Padding */
                .th-profile, .td-profile { @apply px-3 py-3 text-sm; }
                .th-profile { @apply text-left font-medium text-gray-500 uppercase tracking-wider; }
                .td-profile { @apply text-gray-700; }
                
                /* Input Field */
                .input-field { @apply shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md; }
                
                /* Button Styles */
                .btn-primary { @apply inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500; }
                .btn-secondary { @apply inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500; }
                .btn-secondary-outline { @apply inline-flex items-center px-3 py-2 border border-emerald-300 rounded-md text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500; }
            `}</style>
        </div>
    );
}

// Wrap with Suspense to handle initial loading of params if needed
export default function ProfilePageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-emerald-900/10 backdrop-blur-sm"><Spinner message="Loading Profile Page..." /></div>}>
            <ProfilePageContent />
        </Suspense>
    );
}