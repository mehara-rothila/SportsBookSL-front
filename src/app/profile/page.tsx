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
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001'; // Already present
const FALLBACK_FACILITY_IMAGE = '/images/facility-placeholder.jpg';
const CANCELLATION_HOURS_LIMIT = 24;


// --- Interfaces ---
interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
    createdAt?: string;
    sportPreferences?: string[];
    role?: "user" | "trainer" | "admin" | "facilityOwner";
}

interface Booking {
    _id: string;
    bookingId?: string;
    date: string;
    timeSlot: string;
    status: string;
    bookingType?: 'facility' | 'trainer';
    facility?: string | {
        _id: string;
        name?: string;
        address?: string;
        images?: string[];
        location?: string;
        pricePerHourValue?: number;
    };
    trainer?: string | {
        _id: string;
        name?: string;
        specialization?: string;
    };
    durationHours?: number;
    participants?: number;
    totalCost?: number;
    createdAt?: string;
    updatedAt?: string;
    user?: string | { _id: string; name: string; email: string; };
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

const formatDate = (dateString: string | undefined, formatStr = 'PPP'): string => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, formatStr) : 'Invalid Date';
    } catch (e) {
        console.error("Date Format Error:", e);
        return 'Invalid Date';
    }
};

const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return 'N/A';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
};

const canCancelBooking = (bookingDate: string): boolean => {
    try {
        const now = new Date();
        const bookingDT = parseISO(bookingDate);
        return isValid(bookingDT) && differenceInHours(bookingDT, now) > CANCELLATION_HOURS_LIMIT;
    } catch (e) {
        return false;
    }
};

// --- Helper Components ---
const Spinner = ({ message = "Loading..." }: { message?: string }) => (
    <div className="flex flex-col justify-center items-center py-10">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
);

const ErrorMessage = ({ message }: { message: string | null }) => (
    message ? (
        <div className="text-center py-10 text-red-600 bg-red-50/90 backdrop-blur-sm p-4 rounded-lg border border-red-200">
            <p className="font-medium">Error:</p>
            {message}
        </div>
    ) : null
);

const EmptyState = ({ type, message, actionText, actionHref }: { type: string; message: string; actionText?: string; actionHref?: string }) => (
    <div className="text-center py-12 px-4 rounded-lg bg-gradient-to-br from-emerald-50/90 via-emerald-100/80 to-green-50/90 border border-emerald-200/50 backdrop-blur-sm">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100/80 flex items-center justify-center ring-4 ring-emerald-200/50">
            {type === 'bookings' ? <CalendarDaysIcon className="h-8 w-8 text-emerald-600" /> :
             type === 'favorites' ? <StarIcon className="h-8 w-8 text-emerald-600" /> :
             type === 'financial' ? <CreditCardIcon className="h-8 w-8 text-emerald-600" /> :
             type === 'donations' ? <GiftIcon className="h-8 w-8 text-emerald-600" /> :
             <QuestionMarkCircleIcon className="h-8 w-8 text-emerald-600" />}
        </div>
        <h3 className="mt-3 text-lg font-medium text-emerald-900">No {type} found</h3>
        <p className="mt-1 text-sm text-emerald-700/90 max-w-md mx-auto">{message}</p>
        {actionText && actionHref && (
            <Link href={actionHref} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                {actionText}
            </Link>
        )}
    </div>
);


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

    // Tracking if data has been fetched for each section
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

    // --- Fixed Avatar Preview Function ---
    const getAvatarUrl = (avatarPath: string | undefined | null): string | null => {
      if (!avatarPath) return null;
      // Handle both formats: with or without leading slash
      if (avatarPath.startsWith('http')) {
        return avatarPath; // Already a full URL
      } else {
        // Ensure base URL has a trailing slash and path doesn't have a leading one
        const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL : `${BACKEND_BASE_URL}/`;
        const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
        return `${baseUrl}${cleanPath}`;
      }
    };

    // --- IMPROVED Fetch Functions (Memoized) ---
    // FIX 1: Improved error handling and logging in fetch functions
    // --- UPDATED: fetchProfile function ---
    const fetchProfile = useCallback(async () => {
        setLoadingProfile(true);
        setProfileError(null);
        try {
            console.log("Fetching user profile...");
            const data = await userService.getUserProfile();
            console.log("Profile data received:", data);
            setProfile(data);
            setEditedProfileData({
                name: data?.name || '',
                email: data?.email || '',
                phone: data?.phone || '',
                address: data?.address || ''
            });

            if (data?.avatar) {
                console.log("Avatar path from server:", data.avatar); // Added log
                const avatarUrl = getAvatarUrl(data.avatar);          // Use helper
                console.log("Resolved avatar URL:", avatarUrl);       // Added log
                setAvatarPreview(avatarUrl);                         // Set preview
            } else {
                setAvatarPreview(null);
            }
        } catch (err: any) {
            console.error("Fetch Profile Error:", err);
            setProfileError(err?.message || 'Failed to load profile.');
        } finally {
            setLoadingProfile(false);
        }
    }, []); // Removed getAvatarUrl from dependency array as it's defined inside


    // FIX 2: Improved bookings fetch function with better error handling and logging
    const fetchBookingsData = useCallback(async () => {
        if (bookingsFetched || loadingBookings) return;
        setLoadingBookings(true);
        setBookingsError(null);
        try {
            console.log("Fetching user bookings...");
            const data = await bookingService.getUserBookings();
            console.log("Bookings data received:", data);

            // Process the bookings data to ensure consistent structure
            const processedBookings = Array.isArray(data) ? data.map(b => ({
                ...b,
                bookingType: b.bookingType || (b.trainer ? 'trainer' : 'facility') // Use existing bookingType if available
            })) as Booking[] : [];

            setBookings(processedBookings);
            setBookingsFetched(true);
        } catch (err: any) {
            console.error("Fetch Bookings Error:", err);
            setBookingsError(err?.message || 'Failed to load bookings. Please try again later.');
        } finally {
            setLoadingBookings(false);
        }
    }, [bookingsFetched, loadingBookings]);

    // FIX 3: Improved favorites fetch function
    const fetchFavoritesData = useCallback(async () => {
        if (favoritesFetched || loadingFavorites) return;
        setLoadingFavorites(true);
        setFavoritesError(null);
        try {
            console.log("Fetching user favorites...");
            const data = await userService.getUserFavorites();
            console.log("Favorites data received:", data);
            setFavorites(Array.isArray(data) ? data : []);
            setFavoritesFetched(true);
        } catch (err: any) {
            console.error("Fetch Favorites Error:", err);
            setFavoritesError(err?.message || 'Failed to load favorites. Please try again later.');
        } finally {
            setLoadingFavorites(false);
        }
    }, [favoritesFetched, loadingFavorites]);

    // FIX 4: Improved donations fetch function
    const fetchDonationsData = useCallback(async () => {
        if (donationsFetched || loadingDonations) return;
        setLoadingDonations(true);
        setDonationError(null);
        try {
            console.log("Fetching user donation history...");
            const data = await userService.getUserDonationHistory();
            console.log("Donations data received:", data);
            setDonationHistory(Array.isArray(data) ? data : []);
            setDonationsFetched(true);
        } catch (err: any) {
            console.error("Fetch Donations Error:", err);
            setDonationError(err?.message || 'Failed to load donation history. Please try again later.');
        } finally {
            setLoadingDonations(false);
        }
    }, [donationsFetched, loadingDonations]);

    // FIX 5: Improved financial aid fetch function
    const fetchAidData = useCallback(async () => {
        if (aidFetched || loadingAid) return;
        setLoadingAid(true);
        setAidError(null);
        try {
            console.log("Fetching user financial aid applications...");
            const data = await userService.getUserFinancialAidApps();
            console.log("Financial aid data received:", data);
            setFinancialAidApps(Array.isArray(data) ? data : []);
            setAidFetched(true);
        } catch (err: any) {
            console.error("Fetch Financial Aid Error:", err);
            setAidError(err?.message || 'Failed to load applications. Please try again later.');
        } finally {
            setLoadingAid(false);
        }
    }, [aidFetched, loadingAid]);

    // FIX 6: Force refetch function for debugging
    const forceRefetch = useCallback(() => {
        const currentTab = selectedIndex;
        switch(currentTab) {
            case 0: // Bookings
                setBookingsFetched(false);
                fetchBookingsData();
                break;
            case 1: // Favorites
                setFavoritesFetched(false);
                fetchFavoritesData();
                break;
            case 2: // Donations
                setDonationsFetched(false);
                fetchDonationsData();
                break;
            case 3: // Financial Aid
                setAidFetched(false);
                fetchAidData();
                break;
        }
    }, [selectedIndex, fetchBookingsData, fetchFavoritesData, fetchDonationsData, fetchAidData]);

    // --- Initial Auth Check & Profile Load ---
    useEffect(() => {
        const checkAuthAndLoad = async () => {
            try {
                const isAuthed = authService.isAuthenticated();
                if (!isAuthed) {
                    console.log("User not authenticated, redirecting to login...");
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

    // FIX 7: Improved tab data fetch effect with better logging
    useEffect(() => {
        if (!profile) return;

        const fetchTabData = async () => {
            console.log(`Fetching data for tab index: ${selectedIndex}`);

            switch(selectedIndex) {
                case 0: // Bookings Tab
                    if (!bookingsFetched) {
                        console.log("Initiating bookings fetch...");
                        await fetchBookingsData();
                    }
                    break;
                case 1: // Favorites Tab
                    if (!favoritesFetched) {
                        console.log("Initiating favorites fetch...");
                        await fetchFavoritesData();
                    }
                    break;
                case 2: // Donations Tab
                    if (!donationsFetched) {
                        console.log("Initiating donations fetch...");
                        await fetchDonationsData();
                    }
                    break;
                case 3: // Financial Aid Tab
                    if (!aidFetched) {
                        console.log("Initiating financial aid fetch...");
                        await fetchAidData();
                    }
                    break;
                // case 4 is settings, no initial fetch needed
            }
        };

        fetchTabData();
    }, [
        selectedIndex, profile,
        bookingsFetched, favoritesFetched, aidFetched, donationsFetched,
        fetchBookingsData, fetchFavoritesData, fetchDonationsData, fetchAidData
    ]);

    // Handle tab selection from query parameters (e.g., /profile?tab=bookings)
    useEffect(() => {
        const tab = searchParams.get('tab');
        console.log(`URL tab parameter: ${tab}`);

        switch (tab) {
            case 'bookings':
                console.log("Setting tab to bookings (0)");
                setSelectedIndex(0);
                break;
            case 'favorites':
                console.log("Setting tab to favorites (1)");
                setSelectedIndex(1);
                break;
            case 'donations':
                console.log("Setting tab to donations (2)");
                setSelectedIndex(2);
                break;
            case 'aid':
                console.log("Setting tab to financial aid (3)");
                setSelectedIndex(3);
                break;
            case 'settings':
                console.log("Setting tab to settings (4)");
                setSelectedIndex(4);
                break;
            default:
                // If no tab param or invalid, default to 0 (bookings) or keep current
                if (!searchParams.has('tab')) {
                    console.log("No tab parameter, defaulting to bookings (0)");
                    setSelectedIndex(0);
                }
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

                // Use getAvatarUrl here as well, although profile update doesn't change avatar
                if (updatedData.avatar) {
                    setAvatarPreview(getAvatarUrl(updatedData.avatar));
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
                toast("No changes made.");
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
            if (file.size > 2*1024*1024) { // 2MB limit
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
            // Reset preview to the current profile avatar using the helper function
            setAvatarPreview(profile?.avatar ? getAvatarUrl(profile.avatar) : null);
        }
    };

    // --- UPDATED: handleAvatarUpload function ---
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

            if (updatedProfile.avatar) {
                console.log("New avatar path from server:", updatedProfile.avatar); // Added log
                const avatarUrl = getAvatarUrl(updatedProfile.avatar);              // Use helper
                console.log("Resolved new avatar URL:", avatarUrl);                 // Added log
                setAvatarPreview(avatarUrl);                                        // Set preview
            } else {
                setAvatarPreview(null);
            }

            setSelectedAvatarFile(null); // Clear selected file after successful upload

            // Reset file input value
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            try {
                if(authService.updateLocalUserInfo) {
                    // Pass only the relevant updated info (avatar path)
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
            // Don't reset the preview on error, allow user to retry or cancel
        } finally {
            setLoadingAvatar(false);
        }
    };


    // Function to remove avatar
    const handleRemoveAvatar = async () => {
        setIsRemovingAvatar(true);
        const removeToast = toast.loading("Removing avatar...");

        try {
            const updatedProfile = await userService.removeUserAvatar();
            toast.dismiss(removeToast);
            toast.success("Avatar removed!");

            setProfile(updatedProfile);
            setAvatarPreview(null); // Avatar is removed, so preview is null

            try {
                if(authService.updateLocalUserInfo) {
                    authService.updateLocalUserInfo({ avatar: undefined }); // Update local storage
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

    const handleRemoveFavorite = async (facilityId: string) => {
        if (!facilityId) return;
        const removeToast = toast.loading("Removing favorite...");
        setLoadingFavorites(true);
        setFavoritesError(null);
        try {
            const updatedFavorites = await userService.removeFavorite(facilityId);
            setFavorites(updatedFavorites);
            toast.dismiss(removeToast);
            toast.success("Favorite removed");
        } catch (err: any) {
            toast.dismiss(removeToast);
            const msg = err?.message || 'Failed to remove favorite';
            setFavoritesError(msg);
            toast.error(msg);
        } finally {
            setLoadingFavorites(false);
        }
    };

    // -- Booking Cancel Handlers --
    const openCancelModal = (bookingId: string) => {
        setBookingToCancelId(bookingId);
        setCancelBookingModalOpen(true);
    };

    const closeCancelModal = () => {
        if(!isCancellingBooking) {
            setBookingToCancelId(null);
            setCancelBookingModalOpen(false);
        }
    };

    const confirmBookingCancel = async () => {
        if (!bookingToCancelId) return;
        setIsCancellingBooking(true);
        const cancelToast = toast.loading("Cancelling booking...");
        try {
            await bookingService.cancelBooking(bookingToCancelId);
            toast.dismiss(cancelToast);
            toast.success("Booking cancelled!");
            setBookings(prev => prev.map(b =>
                b._id === bookingToCancelId ? {...b, status: 'cancelled'} : b
            ));
        } catch (err: any) {
            toast.dismiss(cancelToast);
            toast.error(`Cancellation failed: ${err.message}`);
        } finally {
            setIsCancellingBooking(false);
            closeCancelModal();
        }
    };

    // -- Financial Aid Detail Handlers --
    const openAidDetailModal = async (appId: string) => {
        setIsFetchingAidDetails(true);
        setSelectedAidApp(null);
        setAidDetailModalOpen(true);
        try {
            // FIX 8: Use getApplicationDetails for fetching details
            console.log(`Fetching financial aid application details for ID: ${appId}`);
            const details = await financialAidService.getApplicationDetails(appId);
            console.log("Financial aid application details received:", details);
            setSelectedAidApp(details);
        } catch (err: any) {
            console.error("Error fetching financial aid details:", err);
            toast.error(`Error loading details: ${err.message}`);
            setAidDetailModalOpen(false); // Close modal on error
        } finally {
            setIsFetchingAidDetails(false);
        }
    };

    const closeAidDetailModal = () => {
        setAidDetailModalOpen(false);
        setSelectedAidApp(null);
    };

    // FIX 9: Add a reload button for troubleshooting
    const renderDebugControls = () => {
        return process.env.NODE_ENV !== 'production' ? (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={forceRefetch}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs font-medium shadow-lg hover:bg-gray-700"
                >
                    Reload Current Tab
                </button>
            </div>
        ) : null;
    };

    // --- Loading / Error / Main Render ---
    if (loadingProfile && !profile) { // Show initial load spinner only if profile isn't loaded yet
        return (
            <div className="flex justify-center items-center min-h-screen bg-emerald-900/10 backdrop-blur-sm">
                <Spinner message="Loading Profile..." />
            </div>
        );
    }

    if (profileError && !profile) { // Show error only if profile failed to load initially
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-100">
                <ErrorMessage message={profileError} />
            </div>
        );
    }

    if (!profile) { // Fallback if profile is still null after loading attempts
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p>Not logged in or profile unavailable. Please try logging in.</p>
                <Link href="/login" className="ml-2 text-emerald-600 hover:underline">Login</Link>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-800 pt-20">
            {/* Basketball Court Background - Added from layout.tsx */}
            <div className="absolute inset-0 overflow-hidden mt-28 z-0">
                {/* Full Court with enhanced styling */}
                <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[5%] rounded-lg bg-gradient-to-b from-emerald-700/30 to-emerald-600/20 border-2 border-white/10 shadow-inner"></div>
                
                {/* Center Circle with glow */}
                <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full border-2 border-white/20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_rgba(16,185,129,0.1)]"></div>
                
                {/* Center Line */}
                <div className="absolute top-[10%] left-1/2 bottom-[5%] w-0.5 bg-white/20 -translate-x-1/2"></div>
                
                {/* Three-Point Line - Left */}
                <div className="absolute top-[25%] left-[10%] w-64 h-96 border-2 border-white/20 rounded-tr-full rounded-br-full border-l-0 shadow-inner"></div>
                
                {/* Three-Point Line - Right */}
                <div className="absolute top-[25%] right-[10%] w-64 h-96 border-2 border-white/20 rounded-tl-full rounded-bl-full border-r-0 shadow-inner"></div>
                
                {/* Free Throw Line - Left */}
                <div className="absolute top-[40%] left-[10%] w-40 h-0.5 bg-white/20"></div>
                
                {/* Free Throw Line - Right */}
                <div className="absolute top-[40%] right-[10%] w-40 h-0.5 bg-white/20"></div>
                
                {/* Free Throw Circle - Left */}
                <div className="absolute top-[40%] left-[20%] w-24 h-24 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Free Throw Circle - Right */}
                <div className="absolute top-[40%] right-[20%] w-24 h-24 border-2 border-white/20 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Key/Paint - Left */}
                <div className="absolute top-[30%] left-[10%] w-40 h-80 border-2 border-white/20 border-l-0 bg-emerald-800/10"></div>
                
                {/* Key/Paint - Right */}
                <div className="absolute top-[30%] right-[10%] w-40 h-80 border-2 border-white/20 border-r-0 bg-emerald-800/10"></div>
                
                {/* Backboard - Left */}
                <div className="absolute top-[70%] left-[10%] w-20 h-1 bg-white/40 -translate-y-1/2"></div>
                
                {/* Backboard - Right */}
                <div className="absolute top-[70%] right-[10%] w-20 h-1 bg-white/40 -translate-y-1/2"></div>
                
                {/* Rim - Left */}
                <div className="absolute top-[70%] left-[10%] w-8 h-8 rounded-full border-2 border-emerald-500/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                
                {/* Rim - Right */}
                <div className="absolute top-[70%] right-[10%] w-8 h-8 rounded-full border-2 border-emerald-500/60 translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                
                {/* Basketballs - animated */}
                <div className="absolute w-6 h-6 top-[45%] left-[45%] animate-basketball-bounce">
                    <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
                </div>
                
                <div className="absolute w-5 h-5 top-[25%] right-[45%] animate-basketball-bounce animation-delay-700">
                    <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
                </div>
                
                <div className="absolute w-5 h-5 bottom-[35%] left-[55%] animate-basketball-bounce animation-delay-300">
                    <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
                </div>
                
                {/* Court shadows and glows */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/5 to-emerald-800/10 pointer-events-none"></div>
                <div className="absolute top-[5%] left-[50%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
                <div className="absolute bottom-[10%] right-[10%] w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Profile Header */}
            <div className="relative z-10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 shadow-lg border-b-4 border-emerald-800/50 mt-4">
                <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center">

                        {/* --- UPDATED: Avatar JSX with onError --- */}
                        <div className="relative group rounded-full overflow-hidden h-24 w-24 md:h-32 md:w-32 border-4 border-white/50 shadow-xl mb-4 md:mb-0 md:mr-8 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt={profile.name || 'User'}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        console.error("Avatar image failed to load:", avatarPreview);
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null; // Prevent infinite error loop
                                        target.src = "/images/default-avatar.png"; // Fallback image - MAKE SURE THIS EXISTS
                                    }}
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
                                aria-label="Profile picture upload"
                            />
                        </div>
                        {/* --- End of Updated Avatar JSX --- */}

                        {/* User Info */}
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-md">
                                {profile.name || 'User'}
                            </h1>
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
                                        className="btn-primary bg-white text-emerald-700 hover:bg-gray-100 text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingAvatar ? (
                                            <>
                                              <Spinner message="" /> Uploading... {/* Smaller spinner */}
                                            </>
                                         ) : (
                                            <>
                                                <ArrowUpTrayIcon className="h-4 w-4 mr-1"/>
                                                Upload Avatar
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedAvatarFile(null);
                                            // Reset preview using helper function
                                            setAvatarPreview(profile?.avatar ? getAvatarUrl(profile.avatar) : null);
                                            setAvatarError(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
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
                                    className="btn-secondary bg-red-600 text-white hover:bg-red-700 text-sm py-1.5 px-3 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

                        {/* Display Avatar Errors Correctly */}
                        {avatarError && (
                            <p className="text-red-200 text-xs mt-2 text-center md:text-left w-full md:w-auto absolute bottom-2 right-8">
                                {avatarError}
                            </p>
                        )}
                        {/* Display Profile Save Errors (distinct from avatar errors) */}
                         {profileError && !avatarError && ( // Only show profile error if not avatar error
                            <p className="text-red-200 text-xs mt-2 text-center md:text-left w-full md:w-auto absolute bottom-2 right-8">
                                {profileError}
                            </p>
                         )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-emerald-800/30 backdrop-blur-md shadow-xl rounded-xl overflow-hidden border border-emerald-500/20">
                    <div className="p-4 sm:p-6">
                        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                            <Tab.List className="flex flex-wrap p-1 space-x-1 bg-emerald-700/50 rounded-lg mb-6 sm:mb-8 shadow-inner border border-emerald-500/30">
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
                                            'focus:outline-none focus:ring-2 ring-offset-1 ring-offset-emerald-700 ring-emerald-300',
                                            'flex items-center justify-center whitespace-nowrap',
                                            selected
                                                ? 'bg-emerald-500 shadow-md text-white'
                                                : 'text-emerald-100 hover:bg-emerald-600/60 hover:text-white'
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
                                    {loadingBookings ? (
                                        <Spinner />
                                    ) : bookingsError ? (
                                        <ErrorMessage message={bookingsError} />
                                    ) : bookings.length === 0 ? (
                                        <EmptyState
                                            type="bookings"
                                            message="View your upcoming and past sessions."
                                            actionText="Browse Facilities"
                                            actionHref="/facilities"
                                        />
                                    ) : (
                                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="space-y-5">
                                                {bookings.map((booking) => {
                                                    const isCancellable = booking.status === 'upcoming' && canCancelBooking(booking.date);
                                                    return (
                                                        <div
                                                            key={booking._id}
                                                            className={`p-4 rounded-lg border backdrop-blur-md ${
                                                                booking.status === 'upcoming'
                                                                    ? 'bg-emerald-600/20 border-emerald-400/30 shadow-lg shadow-emerald-900/20'
                                                                    : booking.status === 'cancelled'
                                                                        ? 'bg-red-500/20 border-red-400/30 shadow-lg shadow-red-900/20'
                                                                        : 'bg-gray-700/20 border-gray-500/30 shadow-lg shadow-gray-900/20'
                                                            } flex flex-wrap md:flex-nowrap items-start gap-4`}
                                                        >
                                                            <div className="w-full md:w-40 flex-shrink-0 text-center md:text-left">
                                                                <p className="font-semibold text-sm text-white">
                                                                    {formatDate(booking.date, 'EEE, MMM d, yyyy')}
                                                                </p>
                                                                <p className="text-xs text-emerald-100/80">{booking.timeSlot}</p>
                                                                <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                    booking.status === 'upcoming'
                                                                        ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-400/30'
                                                                        : booking.status === 'completed'
                                                                            ? 'bg-blue-400/30 text-blue-100 border border-blue-400/30'
                                                                            : booking.status === 'cancelled'
                                                                                ? 'bg-red-400/30 text-red-100 border border-red-400/30'
                                                                                : 'bg-gray-400/30 text-gray-100 border border-gray-400/30'
                                                                }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex-grow">
                                                                <h3 className="font-medium text-white text-sm mb-1">
                                                                    {booking.bookingType === 'trainer'
                                                                        ? `Training: ${typeof booking.trainer === 'object' ? booking.trainer?.name || 'N/A' : 'N/A'}`
                                                                        : `Facility: ${typeof booking.facility === 'object' ? booking.facility?.name || 'N/A' : 'N/A'}`}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-emerald-100/80">
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
                                                                        className="bg-red-600/90 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded shadow-sm disabled:opacity-50 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Favorites Panel */}
                                <Tab.Panel className="focus:outline-none">
                                    {loadingFavorites ? (
                                        <Spinner />
                                    ) : favoritesError ? (
                                        <ErrorMessage message={favoritesError} />
                                    ) : favorites.length === 0 ? (
                                        <EmptyState
                                            type="favorites"
                                            message="Browse facilities and mark your favorites."
                                            actionText="Browse Facilities"
                                            actionHref="/facilities"
                                        />
                                    ) : (
                                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {favorites.map((facility) => (
                                                    <div key={facility._id} className="bg-emerald-800/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-emerald-500/20 group relative">
                                                        <Link href={`/facilities/${facility._id}`} className="block">
                                                            <div className="h-32 w-full bg-emerald-900/50">
                                                                {facility.images?.length ? (
                                                                    <img
                                                                        src={`${BACKEND_BASE_URL}${facility.images[0]}`} // Assuming facility images also need base URL
                                                                        alt={facility.name}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.onerror = null;
                                                                            target.src = FALLBACK_FACILITY_IMAGE;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <BuildingStorefrontIcon className="h-16 w-16 text-emerald-400/50" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleRemoveFavorite(facility._id)}
                                                            className="absolute top-2 right-2 p-1.5 bg-emerald-800/80 hover:bg-emerald-900 rounded-full text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 z-10"
                                                            aria-label={`Remove ${facility.name} from favorites`}
                                                        >
                                                            <XMarkIcon className="h-5 w-5" />
                                                        </button>
                                                        <div className="p-3">
                                                            <Link href={`/facilities/${facility._id}`} className="block hover:underline">
                                                                <h3 className="font-medium text-white text-sm mb-1 truncate">{facility.name}</h3>
                                                            </Link>
                                                            <p className="text-xs text-emerald-200/80 flex items-center mb-2">
                                                                <MapPinIcon className="h-3 w-3 mr-1 text-emerald-300/80"/>
                                                                {facility.location}
                                                            </p>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="flex items-center text-emerald-100">
                                                                    <StarIcon className="h-3.5 w-3.5 text-yellow-400 mr-0.5"/>
                                                                    {facility.rating?.toFixed(1) || 'N/A'}
                                                                </span>
                                                                <span className="font-medium text-emerald-300">{facility.pricePerHour}</span>
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
                                    {loadingDonations ? (
                                        <Spinner />
                                    ) : donationError ? (
                                        <ErrorMessage message={donationError} />
                                    ) : donationHistory.length === 0 ? (
                                        <EmptyState
                                            type="donations"
                                            message="Your contributions help athletes succeed."
                                            actionText="Support an Athlete"
                                            actionHref='/donations'
                                        />
                                    ) : (
                                        <div className="space-y-6 text-white max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                            <h3 className="text-lg font-medium text-emerald-200 mb-4">Your Donation History</h3>
                                            <div className="overflow-x-auto bg-emerald-800/30 backdrop-blur-md rounded-lg border border-emerald-500/20 shadow-lg">
                                                <table className="min-w-full divide-y divide-emerald-700/50 text-sm">
                                                    <thead className="bg-emerald-900/50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Athlete</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Amount</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Anonymous</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-emerald-700/30">
                                                        {donationHistory.map((donation) => (
                                                            <tr key={donation._id} className="hover:bg-emerald-700/30 transition-colors">
                                                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(donation.donationDate, 'PP')}</td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-medium">{donation.athlete?.name ?? 'N/A'}</td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-emerald-300">{formatCurrency(donation.amount)}</td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                        donation.paymentStatus === 'succeeded'
                                                                            ? 'bg-green-400/20 text-green-200 border border-green-400/30'
                                                                            : donation.paymentStatus === 'pending'
                                                                                ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30'
                                                                                : 'bg-red-400/20 text-red-200 border border-red-400/30'
                                                                    }`}>
                                                                        {donation.paymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">{donation.isAnonymous ? 'Yes' : 'No'}</td>
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
                                    {loadingAid ? (
                                        <Spinner />
                                    ) : aidError ? (
                                        <ErrorMessage message={aidError} />
                                    ) : financialAidApps.length === 0 ? (
                                        <EmptyState
                                            type="financial"
                                            message="Apply for assistance to access facilities."
                                            actionText="Apply Now"
                                            actionHref='/financial-aid/apply'
                                        />
                                    ) : (
                                        <div className="space-y-6 text-white max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                            <h3 className="text-lg font-medium text-emerald-200 mb-4">Your Financial Aid Applications</h3>
                                            <div className="overflow-x-auto bg-emerald-800/30 backdrop-blur-md rounded-lg border border-emerald-500/20 shadow-lg">
                                                <table className="min-w-full divide-y divide-emerald-700/50 text-sm">
                                                    <thead className="bg-emerald-900/50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Submitted</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Sport</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-emerald-700/30">
                                                        {financialAidApps.map((app) => (
                                                            <tr key={app._id} className="hover:bg-emerald-700/30 transition-colors">
                                                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(app.submittedDate)}</td>
                                                                <td className="px-4 py-3 whitespace-nowrap">{app.sportsInfo?.primarySport || 'N/A'}</td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                                                        app.status === 'approved'
                                                                            ? 'bg-green-400/20 text-green-200 border border-green-400/30'
                                                                            : app.status === 'pending'
                                                                                ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30'
                                                                                : app.status === 'rejected'
                                                                                    ? 'bg-red-400/20 text-red-200 border border-red-400/30'
                                                                                    : 'bg-blue-400/20 text-blue-200 border border-blue-400/30' // Example for other statuses
                                                                    }`}>
                                                                        {app.status.replace(/_/g, ' ')} {/* Replace underscores too */}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <button
                                                                        onClick={() => openAidDetailModal(app._id)}
                                                                        className="font-medium text-emerald-300 hover:text-emerald-200 hover:underline transition-colors"
                                                                        disabled={isFetchingAidDetails && selectedAidApp?._id === app._id} // Disable button while fetching for this app
                                                                    >
                                                                        {isFetchingAidDetails && selectedAidApp?._id === app._id ? 'Loading...' : 'View Details'}
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
                                    {/* Show non-avatar profile errors here */}
                                    {profileError && !avatarError && <ErrorMessage message={profileError} />}
                                    <div className="max-w-2xl mx-auto">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-medium text-emerald-200">Account Settings</h3>
                                            {/* Edit/Save/Cancel Buttons */}
                                            {!isEditingProfile ? (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingProfile(true);
                                                        setProfileError(null); // Clear errors when entering edit mode
                                                    }}
                                                    className="inline-flex items-center px-3 py-1.5 border border-emerald-500 text-sm font-medium rounded-md text-emerald-200 bg-emerald-700/50 hover:bg-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-1.5" />
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        disabled={loadingProfile} // Disable if saving
                                                        className="inline-flex items-center px-3 py-1.5 border border-emerald-500 text-sm font-medium rounded-md text-emerald-200 bg-emerald-700/50 hover:bg-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={loadingProfile}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm disabled:opacity-50"
                                                    >
                                                        {loadingProfile ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* Form Inputs */}
                                        <div className="bg-emerald-800/40 backdrop-blur-md shadow-lg rounded-lg overflow-hidden border border-emerald-500/20">
                                            <div className="px-4 py-5 sm:p-6">
                                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-emerald-200">Full Name</dt>
                                                        <dd className="mt-1 text-sm text-white">
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    value={editedProfileData.name}
                                                                    onChange={handleProfileChange}
                                                                    className="input-field"
                                                                    aria-label="Full Name Input"
                                                                    disabled={loadingProfile}
                                                                />
                                                            ) : profile.name || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-emerald-200">Email</dt>
                                                        <dd className="mt-1 text-sm text-white">
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    value={editedProfileData.email}
                                                                    onChange={handleProfileChange}
                                                                    className="input-field"
                                                                    aria-label="Email Input"
                                                                    disabled={loadingProfile}
                                                                />
                                                            ) : profile.email || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-emerald-200">Phone</dt>
                                                        <dd className="mt-1 text-sm text-white">
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="tel"
                                                                    name="phone"
                                                                    value={editedProfileData.phone || ''}
                                                                    onChange={handleProfileChange}
                                                                    className="input-field"
                                                                    aria-label="Phone Input"
                                                                    disabled={loadingProfile}
                                                                />
                                                            ) : profile.phone || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <dt className="text-sm font-medium text-emerald-200">Address</dt>
                                                        <dd className="mt-1 text-sm text-white">
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="text"
                                                                    name="address"
                                                                    value={editedProfileData.address || ''}
                                                                    onChange={handleProfileChange}
                                                                    className="input-field"
                                                                    aria-label="Address Input"
                                                                    disabled={loadingProfile}
                                                                />
                                                            ) : profile.address || '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <dt className="text-sm font-medium text-emerald-200">Account Type</dt>
                                                        <dd className="mt-1 text-sm text-emerald-300 capitalize">{profile.role || 'User'}</dd>
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

            {/* Debug Controls */}
            {renderDebugControls()}

            {/* Global CSS Styles - UPDATED with basketball theme styles */}
            <style jsx global>{`
                /* Custom Scrollbar Styling */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.3);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.5);
                }

                /* Table Cell Padding */
                .th-profile, .td-profile { padding: 0.75rem; font-size: 0.875rem; }
                .th-profile { text-align: left; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .td-profile { color: #374151; }

                /* Input Field */
                .input-field {
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    appearance: none;
                    border-width: 1px;
                    border-color: rgba(16, 185, 129, 0.3);
                    border-radius: 0.375rem;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    width: 100%;
                    display: block;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .input-field:focus {
                     outline: 2px solid transparent;
                     outline-offset: 2px;
                     --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                     --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                     box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
                     border-color: #10B981;
                     --tw-ring-color: #10B981;
                }
                .input-field:disabled {
                    background-color: rgba(255, 255, 255, 0.05);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                
                .input-field::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Button Styles */
                .btn-primary { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-width: 1px; border-color: transparent; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #ffffff; background-color: #059669; }
                .btn-primary:hover:not(:disabled) { background-color: #047857; }
                .btn-primary:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 2px #ffffff; --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + 2px) #059669; box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); --tw-ring-color: #059669; }
                .btn-secondary { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-width: 1px; border-color: #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; background-color: #ffffff; }
                .btn-secondary:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 2px #ffffff; --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + 2px) #059669; box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); --tw-ring-color: #059669; }
                .btn-secondary-outline { display: inline-flex; align-items: center; padding: 0.5rem 0.75rem; border-width: 1px; border-color: #6ee7b7; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; color: #047857; background-color: #ffffff; }
                .btn-secondary-outline:hover:not(:disabled) { background-color: #f0fdf4; }
                .btn-secondary-outline:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 2px #ffffff; --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + 2px) #059669; box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); --tw-ring-color: #059669; }

                /* Spinner inside button */
                .btn-primary .animate-spin { width: 1rem; height: 1rem; border-width: 2px; border-color: rgba(255,255,255,0.3); border-top-color: #ffffff; margin-right: 0.5rem; }
                
                /* ======== BASKETBALL THEME STYLES FROM ADMIN LAYOUT ======== */
                
                /* Color scheme overrides to match green theme */
                .bg-primary-600 { background-color: #10B981 !important; } /* emerald-500 */
                .hover\\:bg-primary-700:hover { background-color: #047857 !important; } /* emerald-600 */
                .text-primary-600 { color: #10B981 !important; } /* emerald-500 */
                .text-primary-700 { color: #047857 !important; } /* emerald-600 */
                .focus\\:ring-primary-500:focus { --tw-ring-color: #10B981 !important; } /* emerald-500 */
                .border-primary-500 { border-color: #10B981 !important; } /* emerald-500 */
                .border-t-primary-600 { border-top-color: #10B981 !important; } /* emerald-500 */
                
                /* Button overrides for green theme */
                .btn-primary {
                  background-color: #10B981 !important;
                  border-color: #047857 !important;
                  color: white !important;
                }
                .btn-primary:hover {
                  background-color: #047857 !important;
                }
                
                /* Add custom shadows to match the theme */
                .shadow-basketball {
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 3px rgba(16, 185, 129, 0.1);
                }
                
                /* Make headers and important text stand out */
                h1, h2, .text-header {
                  color: white !important;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }
                
                /* Form control styling */
                input, select, textarea {
                  background-color: rgba(255, 255, 255, 0.1) !important;
                  border-color: rgba(16, 185, 129, 0.3) !important;
                  color: white !important;
                }
                input::placeholder, select::placeholder, textarea::placeholder {
                  color: rgba(255, 255, 255, 0.5) !important;
                }
                input:focus, select:focus, textarea:focus {
                  border-color: #10B981 !important;
                  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
                }

                /* Animations for basketball elements */
                @keyframes player-move {
                  0% { transform: translate(0, 0); }
                  25% { transform: translate(30px, 20px); }
                  50% { transform: translate(10px, 40px); }
                  75% { transform: translate(-20px, 10px); }
                  100% { transform: translate(0, 0); }
                }
                .animate-player-move {
                  animation: player-move 10s ease-in-out infinite;
                }
                
                @keyframes basketball-bounce {
                  0%, 100% { transform: translateY(0) scale(1); }
                  50% { transform: translateY(40px) scale(0.9); }
                }
                .animate-basketball-bounce {
                  animation: basketball-bounce 1.5s ease-in-out infinite;
                }
                
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-350 { animation-delay: 0.35s; }
                .animation-delay-420 { animation-delay: 0.42s; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-550 { animation-delay: 0.55s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                .animation-delay-700 { animation-delay: 0.7s; }
                .animation-delay-750 { animation-delay: 0.75s; }
                .animation-delay-800 { animation-delay: 0.8s; }
                .animation-delay-850 { animation-delay: 0.85s; }
                .animation-delay-1000 { animation-delay: 1s; }

                /* ========== TABLE STYLES FOR ADMIN PAGES ========== */
                /* Table styling improvements */
                table {
                  border-collapse: separate;
                  border-spacing: 0;
                  width: 100%;
                }

                table th {
                  color: white;
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                  letter-spacing: 0.05em;
                  padding: 0.75rem 1rem;
                }

                table td {
                  padding: 1rem;
                  vertical-align: middle;
                }

                /* Progress bar styling */
                .progress-bar {
                  height: 0.5rem;
                  border-radius: 9999px;
                  background-color: rgba(255, 255, 255, 0.1);
                  overflow: hidden;
                }
                
                .progress-bar-fill {
                  height: 100%;
                  background-color: #10B981;
                  transition: width 0.3s ease;
                }

                /* Status badge */
                .status-badge {
                  display: inline-flex;
                  align-items: center;
                  padding: 0.25rem 0.75rem;
                  border-radius: 9999px;
                  font-size: 0.75rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                
                .status-badge.active {
                  background-color: rgba(16, 185, 129, 0.2);
                  color: #10B981;
                }
                
                .status-badge.inactive {
                  background-color: rgba(239, 68, 68, 0.2);
                  color: #EF4444;
                }
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