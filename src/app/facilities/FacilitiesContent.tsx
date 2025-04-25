// src/app/facilities/FacilitiesContent.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import * as categoryService from '@/services/categoryService';
import FacilityCard from '@/components/facilities/FacilityCard';

// --- Icons ---
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  StarIcon,
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// --- Interfaces ---
interface FacilitySummary {
  _id: string;
  name: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  sportTypes: string[];
  images: string[];
  pricePerHour: string;
  isNew?: boolean;
  isPremium?: boolean;
}

interface FacilityListResponse {
  facilities: FacilitySummary[];
  page: number;
  pages: number;
  count: number;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  imageSrc: string;
  iconSvg?: string;
  slug: string;
}

// --- Component ---
export default function FacilitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State ---
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter State
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  // Filter Options State
  const [sportCategories, setSportCategories] = useState<Category[]>([]);
  const [popularLocations, setPopularLocations] = useState<string[]>([]);

  // Mobile Filter State
  const [filterOpen, setFilterOpen] = useState(false);

  // --- Fetch Data ---
  const fetchFacilities = useCallback(async (page: number, currentFilters: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      // Create a deep copy of filters to avoid modifying the original object
      const params: Record<string, any> = {
        pageNumber: page,
        ...JSON.parse(JSON.stringify(currentFilters)) // Deep copy of filter values
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === 'all') {
          delete params[key];
        }
      });

      // Debug log for filters
      console.log("Fetching facilities with params:", params);
      
      const response = await api.get<FacilityListResponse>('/facilities', { params });

      if (response.data && Array.isArray(response.data.facilities)) {
        console.log("API Response:", response.data);
        setFacilities(response.data.facilities);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.pages);
        setTotalCount(response.data.count);
      } else {
        throw new Error("Invalid data format received from API.");
      }
    } catch (err: any) {
      console.error("Error fetching facilities:", err);
      setError(err.response?.data?.message || err.message || "Failed to load facilities.");
      setFacilities([]); // Clear facilities on error
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch Filter Options ---
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch categories for sport types dropdown
        const categoriesData = await categoryService.getCategories();
        console.log("Fetched categories:", categoriesData);
        
        // Use the full category objects to retain all information
        setSportCategories(categoriesData);

        // Set common locations in Sri Lanka
        setPopularLocations([
          'Colombo',
          'Kandy',
          'Galle',
          'Negombo',
          'Batticaloa',
          'Jaffna',
          'Anuradhapura',
          'Nuwara Eliya'
        ]);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Set some default values in case of error
        setSportCategories([
          { _id: 'cricket', name: 'Cricket', slug: 'cricket', description: '', imageSrc: '' },
          { _id: 'football', name: 'Football', slug: 'football', description: '', imageSrc: '' },
          { _id: 'swimming', name: 'Swimming', slug: 'swimming', description: '', imageSrc: '' },
          { _id: 'tennis', name: 'Tennis', slug: 'tennis', description: '', imageSrc: '' },
          { _id: 'basketball', name: 'Basketball', slug: 'basketball', description: '', imageSrc: '' }
        ]);
      }
    };

    fetchFilterData();

    // Add custom styles to the document head for the select dropdown options
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      select option {
        background-color: white;
        color: #065f46; /* emerald-800 */
        padding: 8px;
      }
      select option:checked,
      select option:hover,
      select option:focus {
        background-color: #10b981 !important; /* emerald-500 */
        color: white !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // --- Effect to Fetch Data on Page Load/Param Change ---
  useEffect(() => {
    const pageQuery = parseInt(searchParams.get('page') || '1', 10);
    const keywordQuery = searchParams.get('keyword') || '';
    
    // Get location from URL parameter
    const locationQuery = searchParams.get('location') || '';
    
    // IMPORTANT: Check for both sportType and sport parameters
    // This handles both direct facilities page filters and redirects from Hero component
    const sportQuery = searchParams.get('sportType') || searchParams.get('sport') || '';
    
    console.log("Reading URL parameters:", {
      location: locationQuery,
      sportType: sportQuery,
      keyword: keywordQuery
    });

    // Update state based on URL - this will update the dropdown selections
    setCurrentPage(pageQuery);
    setKeyword(keywordQuery);
    setLocationFilter(locationQuery);
    setSportFilter(sportQuery);

    // Fetch data using current query params
    fetchFacilities(pageQuery, {
      keyword: keywordQuery,
      location: locationQuery,
      sportType: sportQuery,
    });

  }, [searchParams, fetchFacilities]); // Re-fetch when URL search params change

  // --- Event Handlers ---
  // --- Individual filter handlers for direct updates ---
  const handleSportFilterChange = (value: string) => {
    console.log("Sport filter changed to:", value);
    setSportFilter(value);

    // Prepare filter params
    const params = {
      keyword,
      location: locationFilter,
      sportType: value, // Use the new value
    };

    // Update URL and force a refetch (page 1)
    updateURLAndFetch(params, 1);
  };

  const handleLocationFilterChange = (value: string) => {
    console.log("Location filter changed to:", value);
    setLocationFilter(value);

    // Prepare filter params
    const params = {
      keyword,
      location: value, // Use the new value
      sportType: sportFilter,
    };

    // Update URL and force a refetch (page 1)
    updateURLAndFetch(params, 1);
  };

  const updateURLAndFetch = (params: Record<string, string>, page: number) => {
    console.log("Updating URL and fetching with params:", params, "page:", page);

    // Clean params before fetching and updating URL
    const cleanedParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        cleanedParams[key] = value;
      }
    });

    // First, fetch directly without relying on URL change
    fetchFacilities(page, cleanedParams);

    // Then, update URL for bookmarking/sharing (but don't trigger another fetch)
    const urlParams = new URLSearchParams();
    Object.entries(cleanedParams).forEach(([key, value]) => {
      urlParams.set(key, value);
    });
    urlParams.set('page', page.toString());

    // Use router.replace to avoid adding to history stack
    router.replace(`/facilities?${urlParams.toString()}`, { scroll: false });
  };

  // Keep the original search form handler for the search button, but modify to use our new approach
  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault(); // Prevent default form submission if used

    // Log the search parameters for debugging
    console.log("Search Form Submitted:", {
      keyword,
      locationFilter,
      sportFilter,
    });

    // Close mobile filter if open
    setFilterOpen(false);

    // Prepare filter params
    const params = {
      keyword,
      location: locationFilter,
      sportType: sportFilter,
    };

    // Update URL and force a refetch (page 1)
    updateURLAndFetch(params, 1);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocationFilter('');
    setSportFilter('');

    // Update URL to trigger refetch (will fetch with no filters)
    router.push('/facilities');
  };

  // --- Pagination Handler ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        // Prepare current filters
        const params = {
            keyword,
            location: locationFilter,
            sportType: sportFilter,
        };
        updateURLAndFetch(params, newPage);
    }
  };

  // Find the selected sport category from sportFilter value
  const findSelectedSportCategory = () => {
    if (!sportFilter) return null;
    return sportCategories.find(category => 
      category._id === sportFilter || 
      category.slug === sportFilter ||
      category.name === sportFilter
    );
  };

  // --- Render Logic ---
  return (
    <div className="bg-gray-50 min-h-screen relative overflow-hidden">
      {/* Cricket Stadium Background ... (remains unchanged) */}
       <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
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

        {/* PLAYERS - FIRST SET */}

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

        {/* Non-striker - LEFT SIDE */}
        <div className="absolute w-8 h-12 top-[55%] left-[18%] animate-nonstriker-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
          </div>
        </div>

        {/* Non-striker - RIGHT SIDE */}
        <div className="absolute w-8 h-12 top-[55%] right-[18%] animate-nonstriker-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
          </div>
        </div>

        {/* ADDITIONAL PLAYERS - SECOND SET */}

        {/* Slip fielders - LEFT SIDE */}
        <div className="absolute w-6 h-8 top-[30%] left-[20%] animate-fielder-slip">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        <div className="absolute w-6 h-8 top-[27%] left-[22%] animate-fielder-slip animation-delay-200">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Slip fielders - RIGHT SIDE */}
        <div className="absolute w-6 h-8 top-[30%] right-[20%] animate-fielder-slip animation-delay-600">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        <div className="absolute w-6 h-8 top-[27%] right-[22%] animate-fielder-slip animation-delay-800">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* ADDITIONAL PLAYERS - THIRD SET */}

        {/* Mid-wicket - LEFT SIDE */}
        <div className="absolute w-6 h-8 top-[25%] left-[30%] animate-fielder-move-alt animation-delay-400">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Mid-wicket - RIGHT SIDE */}
        <div className="absolute w-6 h-8 top-[25%] right-[30%] animate-fielder-move-alt animation-delay-900">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Long-on - LEFT SIDE */}
        <div className="absolute w-6 h-8 top-[15%] left-[45%] animate-fielder-dive animation-delay-700">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Long-on - RIGHT SIDE */}
        <div className="absolute w-6 h-8 top-[15%] right-[45%] animate-fielder-dive animation-delay-1200">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Deep square leg - LEFT SIDE */}
        <div className="absolute w-6 h-8 top-[70%] left-[30%] animate-fielder-move-alt animation-delay-300">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Deep square leg - RIGHT SIDE */}
        <div className="absolute w-6 h-8 top-[70%] right-[30%] animate-fielder-move-alt animation-delay-800">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
          </div>
        </div>

        {/* Umpires */}
        <div className="absolute w-7 h-10 top-[45%] left-[50%] -translate-x-1/2 animate-umpire">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-gray-200/90"></div>
            <div className="absolute top-4 left-2 w-3 h-6 bg-gray-800/70"></div>
          </div>
        </div>

        <div className="absolute w-7 h-10 bottom-[25%] left-[50%] -translate-x-1/2 animate-umpire animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-4 h-4 rounded-full bg-gray-200/90"></div>
            <div className="absolute top-4 left-2 w-3 h-6 bg-gray-800/70"></div>
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

      {/* Hero Section */}
      <div className="relative pb-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="animate-fade-in-down">
            <span className="inline-flex items-center px-3 py-1 mb-4 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm border border-white/20 shadow-lg">
              <BuildingOffice2Icon className="h-4 w-4 mr-1.5" />
              SPORTS VENUES
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">Find Your Perfect Facility</h1>
             <div className="relative flex py-5 items-center">
               <div className="w-16 h-1 bg-yellow-500 rounded-full animate-pulse-slow"></div>
               <div className="w-3 h-3 mx-2 bg-yellow-400 rounded-full"></div>
               <div className="w-24 h-1 bg-yellow-500 rounded-full animate-pulse-slow animation-delay-200"></div>
             </div>
            <p className="mt-3 max-w-3xl text-xl text-green-100 animate-fade-in-up animation-delay-300">
              Book sports venues across Sri Lanka for your practice, training, or competitive events.
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="mt-10 md:hidden mx-auto animate-fade-in-up animation-delay-400">
            <button
              onClick={() => setFilterOpen(true)}
              className="w-full flex items-center justify-center px-4 py-3 border border-white/30 backdrop-blur-sm rounded-xl text-white bg-white/10 hover:bg-white/20 transition-colors shadow-lg"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filter Facilities
            </button>
          </div>



{/* Desktop Search Form */}
<div className="mt-10 max-w-4xl mx-auto animate-fade-in-up animation-delay-500 hidden md:block">
  <form onSubmit={handleSearch} className="relative rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 border border-white/30"></div>
    <div className="relative p-6">
      {/* MODIFIED: Removed the second grid row, integrated Sport Filter here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Keyword Search */}
<div className="relative">
  <label htmlFor="keyword-search" className="block text-sm font-medium text-white mb-1">Keyword</label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <MagnifyingGlassIcon className="h-5 w-5 text-white/60" aria-hidden="true" />
    </div>
    <input
      type="text"
      name="keyword-search"
      id="keyword-search"
      className="block w-full rounded-lg bg-white/10 border-white/20 pl-10 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-white placeholder-white/60"
      placeholder="e.g., Cricket, Stadium, Nets"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
    />
  </div>
</div>

        {/* Location Filter - Dropdown */}
        <div className="relative">
          <label htmlFor="location-filter" className="block text-sm font-medium text-white mb-1">Location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-white/60" aria-hidden="true" />
            </div>
            <select
              name="location-filter"
              id="location-filter"
              className="block w-full rounded-lg bg-white/90 border-emerald-400 pl-10 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-emerald-900 font-medium"
              value={locationFilter}
              // Use direct handler
              onChange={(e) => handleLocationFilterChange(e.target.value)}
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23047857' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
                appearance: "none"
              }}
            >
              <option value="">All Locations</option>
              {popularLocations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sport Filter - Dropdown */}
        <div className="relative">
          <label htmlFor="sport-filter" className="block text-sm font-medium text-white mb-1">Sport Type</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-white/60" aria-hidden="true" />
            </div>
            <select
              name="sport-filter"
              id="sport-filter"
               className="block w-full rounded-lg bg-white/90 border-emerald-400 pl-10 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-emerald-900 font-medium" 
              value={sportFilter}
              // Use direct handler
              onChange={(e) => handleSportFilterChange(e.target.value)}
               style={{ 
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23047857' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
                appearance: "none"
              }}
            >
              <option value="">All Sports</option>
              {sportCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {/* Submit Button */}
        <button
          type="submit"
          className="flex-1 justify-center inline-flex items-center rounded-lg border border-transparent bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          Search Facilities
        </button>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={handleClearFilters}
          className="justify-center inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 transition-all duration-300"
        >
          <XMarkIcon className="h-5 w-5 mr-2" />
          Clear Filters
        </button>
      </div>
    </div>
  </form>
</div>

        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto block">
            <path fill="#F9FAFB" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFilterOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-gradient-to-br from-emerald-900 to-emerald-800 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
              <h3 className="text-lg font-medium text-white">Filter Options</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="rounded-md p-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* NOTE: Using handleSearch for the form submit, individual selects update state directly */}
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Keyword Search */}
                <div>
                  <label htmlFor="mobile-keyword" className="block text-sm font-medium text-white mb-1">Keyword</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      type="text"
                      name="mobile-keyword"
                      id="mobile-keyword"
                      className="block w-full pl-10 py-3 bg-white/10 border-white/20 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-white"
                      placeholder="e.g., Cricket, Stadium, Nets"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="mobile-location" className="block text-sm font-medium text-white mb-1">Location</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-white/60" />
                    </div>
                    <select
                      id="mobile-location"
                      name="mobile-location"
                      className="block w-full pl-10 py-3 bg-white/90 border-emerald-400 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-emerald-900 font-medium"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23047857' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                        appearance: "none"
                      }}
                    >
                      <option value="">All Locations</option>
                      {popularLocations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sport Type */}
                <div>
                  <label htmlFor="mobile-sport" className="block text-sm font-medium text-white mb-1">Sport Type</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-white/60" />
                    </div>
                    <select
                      id="mobile-sport"
                      name="mobile-sport"
                      className="block w-full pl-10 py-3 bg-white/90 border-emerald-400 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-emerald-900 font-medium"
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23047857' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                        appearance: "none"
                      }}
                    >
                      <option value="">All Sports</option>
                      {sportCategories.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-white/20 bg-white/5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex justify-center items-center px-4 py-3 border border-white/30 rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Clear All
                </button>
                <button
                  onClick={() => handleSearch()}
                  className="inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 z-10">
        <div className="rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl overflow-hidden border border-white/30">
          {/* Results Count Bar */}
          <div className="px-6 py-4 sm:p-6 bg-gradient-to-r from-emerald-900/50 to-emerald-800/40 border-b border-emerald-700/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-yellow-400" />
                Available Facilities
              </h2>

              {/* Active Filters Display - MODIFIED */}
              {(keyword || locationFilter || sportFilter) && !loading && !error && facilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keyword && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800/60 text-emerald-100">
                      Search: {keyword}
                    </span>
                  )}
                  {locationFilter && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800/60 text-emerald-100">
                      Location: {locationFilter}
                    </span>
                  )}
                  {sportFilter && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800/60 text-emerald-100">
                      Sport: {findSelectedSportCategory()?.name || sportFilter}
                    </span>
                  )}
                </div>
              )}

              {!loading && !error && facilities.length > 0 && (
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium bg-emerald-800/60 text-emerald-100 border border-emerald-600/30 shadow-sm">
                  {totalCount} {totalCount === 1 ? 'facility' : 'facilities'} found
                </span>
              )}
            </div>
          </div>

          {/* Facilities Content Area */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-emerald-300 font-medium">Loading facilities...</p>
                </div>
              </div>
            )}

            {/* Error State - MODIFIED */}
            {error && !loading && (
              <div className="mt-12 text-center py-12 rounded-xl bg-red-900/30 backdrop-blur-sm border border-red-500/30 shadow-inner">
                <h3 className="text-xl font-bold text-white mb-2">Error Loading Facilities</h3>
                <p className="text-red-200 max-w-md mx-auto mb-8">{error}</p>
                <button
                  onClick={() => fetchFacilities(currentPage, {
                    keyword,
                    location: locationFilter,
                    sportType: sportFilter,
                  })}
                  className="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-5 py-3 text-base font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2"/>
                  Retry
                </button>
              </div>
            )}

            {/* No Results State - MODIFIED */}
            {!loading && !error && facilities.length === 0 && (
              <div className="mt-12 text-center py-12 rounded-xl bg-emerald-900/30 backdrop-blur-sm border border-emerald-600/20 shadow-inner">
                <h3 className="text-xl font-bold text-white mb-2">No Facilities Found</h3>
                <p className="text-emerald-200 max-w-md mx-auto mb-8">
                  {keyword || locationFilter || sportFilter
                    ? "Try adjusting your search or filter criteria."
                    : "There are no facilities available at the moment."}
                </p>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-5 py-3 text-base font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300"
                  onClick={handleClearFilters}
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Facilities Grid */}
            {!loading && !error && facilities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((facility) => (
                  <div key={facility._id} className="overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-fade-in">
                    <FacilityCard facility={facility} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
               <div className="mt-12 flex justify-center">
                 <nav className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-1.5 border border-white/20">
                   <button
                     type="button"
                     className="mx-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-emerald-300 transition-colors duration-200 group disabled:opacity-50 disabled:pointer-events-none"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                   >
                     <ChevronLeftIcon className="h-5 w-5 mr-1" />
                     Previous
                   </button>

                   {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`mx-1 w-10 h-10 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white shadow-sm transform transition hover:scale-105'
                            : 'text-white/80 hover:bg-emerald-700/40 hover:text-white'
                        } flex items-center justify-center transition-colors duration-200`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                   <button
                     type="button"
                     className="mx-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-emerald-300 transition-colors duration-200 group disabled:opacity-50 disabled:pointer-events-none"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                   >
                     Next
                     <ChevronRightIcon className="h-5 w-5 ml-1" />
                   </button>
                 </nav>
               </div>
            )}
          </div>
        </div>
      </div>

       {/* CTA Section ... (remains unchanged) */}
       <div className="relative py-24 overflow-hidden z-10">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
             <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:px-16 text-center">
               <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Need a Trainer?</h2>
               <p className="mt-4 text-lg text-emerald-100 max-w-3xl mx-auto">
                 Book a session with one of our expert trainers to improve your skills and get personalized coaching.
               </p>
               <div className="mt-8">
                 <Link
                   href="/trainers"
                   className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
                 >
                   Find a Trainer
                   <svg className="ml-2 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
                 </Link>
               </div>
             </div>
           </div>
         </div>
       </div>

      {/* CSS Animations ... (remains unchanged) */}
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

        @keyframes fielder-move-alt {
          0% { transform: translate(0, 0) rotate(0deg); }
          30% { transform: translate(-30px, 10px) rotate(-5deg); }
          60% { transform: translate(20px, -15px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-fielder-move-alt {
          animation: fielder-move-alt 15s ease-in-out infinite;
        }

        @keyframes fielder-slip {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-3deg); }
          75% { transform: translateY(3px) rotate(3deg); }
        }
        .animate-fielder-slip {
          animation: fielder-slip 4s ease-in-out infinite;
        }

        @keyframes fielder-dive {
          0%, 100% { transform: translateY(0) scale(1); }
          40%, 45% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1) rotate(-20deg); }
          55% { transform: translateY(-5px) scale(0.95) rotate(-25deg); }
          60%, 95% { transform: translateY(0) scale(1); }
        }
        .animate-fielder-dive {
          animation: fielder-dive 20s ease-in-out infinite;
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
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(-2deg); }
          75% { transform: translateX(-50%) rotate(2deg); }
        }
        .animate-umpire {
          animation: umpire 4s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          50% { opacity: .7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
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

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-900 {
          animation-delay: 0.9s;
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