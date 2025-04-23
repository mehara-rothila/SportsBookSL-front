'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import api from '@/services/api'; // For utility endpoints
import * as trainerService from '@/services/trainerService'; // Import the trainer service

// --- Import Icons ---
import { StarIcon } from '@heroicons/react/24/solid';
// Add other icons used in the template if necessary
import {
    AcademicCapIcon,
    MapPinIcon,
    CalendarDaysIcon,
    CheckIcon,
    ArrowRightIcon
} from '@heroicons/react/24/solid';


// --- Interfaces ---
interface Trainer {
  _id: string;
  name: string;
  specialization: string;
  sports: string[];
  location: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experienceYears: number;
  availability: string[];
  certifications: string[];
  bio: string;
  languages: string[];
  facilities?: string[]; // Optional mapping from associatedFacilities
}

interface FilterOption {
  id: string;
  name: string;
}

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-trainer.png';

export default function TrainersPage() {
  // --- State ---
  const [sportOptions, setSportOptions] = useState<FilterOption[]>([{ id: 'all', name: 'All Sports' }]);
  const [locationOptions, setLocationOptions] = useState<FilterOption[]>([{ id: 'all', name: 'All Locations' }]);
  const [ratingOptions] = useState<FilterOption[]>([
    { id: 'all', name: 'Any Rating' }, { id: '4.5', name: '4.5+' },
    { id: '4.0', name: '4.0+' }, { id: '3.5', name: '3.5+' }
  ]);
  const [priceRangeOptions] = useState<FilterOption[]>([
    { id: 'all', name: 'Any Price' }, { id: '1000-2000', name: 'Rs. 1,000 - 2,000' },
    { id: '2000-3000', name: 'Rs. 2,000 - 3,000' }, { id: '3000-plus', name: 'Rs. 3,000+' }
  ]);
  const [filters, setFilters] = useState({
    sport: 'all', location: 'all', rating: 'all', priceRange: 'all', availability: [] as string[]
  });
  const [sortBy, setSortBy] = useState('rating'); // Default sort
  const [searchQuery, setSearchQuery] = useState('');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredTrainer, setHoveredTrainer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [daysOfWeek] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]);

  // --- Helper Functions ---
  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-LK')}`;
  const toggleDaySelection = (day: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      availability: prevFilters.availability.includes(day)
        ? prevFilters.availability.filter(d => d !== day)
        : [...prevFilters.availability, day]
    }));
    // Note: Availability filter is client-side, API call won't re-trigger here
  };

  // --- Fetch Filter Options ---
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [sportsRes, locationsRes] = await Promise.all([
          api.get('/utils/sports'),
          api.get('/utils/locations')
        ]);

        if (sportsRes.data) {
          // Ensure sportsData is an array, default to empty if not
          const sportsData = Array.isArray(sportsRes.data) ? sportsRes.data : [];
          setSportOptions([
            { id: 'all', name: 'All Sports' },
            ...sportsData.map((sport: string) => ({ id: sport.toLowerCase(), name: sport }))
          ]);
        }
        if (locationsRes.data) {
          // FIX: Assign locationsRes.data if it's an array, otherwise assign an empty array
          const locationsData = Array.isArray(locationsRes.data) ? locationsRes.data : [];
          setLocationOptions([
            { id: 'all', name: 'All Locations' },
            ...locationsData.map((loc: string) => ({ id: loc.toLowerCase(), name: loc }))
          ]);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
        // Optionally set an error state for filter options
      }
    };
    fetchFilterOptions();
  }, []); // Empty dependency array means this runs once on mount

  // --- Fetch Trainers Data ---
  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { pageNumber: currentPage };
      if (searchQuery) params.keyword = searchQuery;
      if (filters.sport !== 'all') params.sport = filters.sport;
      if (filters.location !== 'all') params.location = filters.location;
      if (filters.rating !== 'all') params.rating = filters.rating;
      if (filters.priceRange !== 'all') {
        if (filters.priceRange === '1000-2000') { params.minPrice = 1000; params.maxPrice = 2000; }
        else if (filters.priceRange === '2000-3000') { params.minPrice = 2000; params.maxPrice = 3000; }
        else if (filters.priceRange === '3000-plus') { params.minPrice = 3000; }
      }
      // Apply availability filter on the backend if the API supports it
      // if (filters.availability.length > 0) params.availability = filters.availability.join(',');

      if (sortBy === 'rating') params.sort = '-rating';
      else if (sortBy === 'price_low') params.sort = 'hourlyRate';
      else if (sortBy === 'price_high') params.sort = '-hourlyRate';
      else if (sortBy === 'experience') params.sort = '-experienceYears';

      const data = await trainerService.getTrainers(params);
      setTrainers((data.trainers || []).map(trainer => ({
        ...trainer,
        profileImage: trainer.profileImage || FALLBACK_IMAGE,
        rating: trainer.rating || 0,
        reviewCount: trainer.reviewCount || 0,
        availability: trainer.availability || [],
        certifications: trainer.certifications || [],
        bio: trainer.bio || "",
        languages: trainer.languages || []
      } as Trainer)));
      setTotalPages(data.pages || 1);
      setTotalCount(data.count || 0);

    } catch (err: any) {
      console.error('Error fetching trainers:', err);
      setError(typeof err === 'string' ? err : err?.message || 'Failed to load trainers. Please try again.');
      setTrainers([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
    // Removed filters.availability from dependencies as it's handled client-side now
    // If backend starts supporting availability filter, add it back:
    // }, [currentPage, searchQuery, filters.sport, filters.location, filters.rating, filters.priceRange, filters.availability, sortBy]);
  }, [currentPage, searchQuery, filters.sport, filters.location, filters.rating, filters.priceRange, sortBy]);


  // Trigger fetch when dependencies change
  useEffect(() => {
    // Debounce search input or trigger fetch immediately based on your preference
    // For now, fetchTrainers is triggered by handleSearchSubmit and filter/sort changes
    // Fetch on initial load and page change
     fetchTrainers();
   }, [fetchTrainers]); // fetchTrainers itself changes when its dependencies change


  // Client-side filtering for availability (apply AFTER backend fetch)
  const displayedTrainers = useMemo(() => {
    if (filters.availability.length === 0) {
      return trainers; // Return all fetched trainers if no availability filter is set
    }
    return trainers.filter(trainer =>
      filters.availability.every(day => trainer.availability?.includes(day))
    );
  }, [trainers, filters.availability]); // Re-run only when trainers or availability filter changes

  // --- Event Handlers ---
  const resetFilters = () => {
    setFilters({ sport: 'all', location: 'all', rating: 'all', priceRange: 'all', availability: [] });
    setSearchQuery('');
    setSortBy('rating');
    setCurrentPage(1); // Reset to page 1 when resetting filters
    // No need to call fetchTrainers here, the state changes will trigger the useEffect
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new search
    fetchTrainers(); // Trigger fetch immediately
  };

   // Handler for filter changes (except availability which is client-side)
   const handleFilterChange = (filterType: keyof typeof filters, value: string | string[]) => {
     setFilters(prevFilters => ({ ...prevFilters, [filterType]: value }));
     setCurrentPage(1); // Reset to page 1 when filters change
     // Note: fetchTrainers will be triggered by the useEffect dependency change
   };

   // Handler for sort change
   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     setSortBy(e.target.value);
     setCurrentPage(1); // Reset to page 1 when sorting changes
     // Note: fetchTrainers will be triggered by the useEffect dependency change
   };


  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
       // fetchTrainers will be triggered by the useEffect watching currentPage via fetchTrainers useCallback dependencies
    }
  };

  // --- Render Stars ---
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 flex-shrink-0 ${
              rating >= star ? 'text-yellow-400' : 'text-gray-500/40'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  // --- Main Return JSX ---
  return (
    <div className="bg-gray-50 min-h-screen relative overflow-hidden">
      {/* Cricket Stadium Background */}
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

      {/* Hero Section */}
      <div className="relative pb-32 overflow-hidden">
        {/* Keep the original hero section, but with transparent background */}
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="animate-fade-in-down">
            <span className="inline-flex items-center px-3 py-1 mb-4 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm border border-white/20 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              EXPERT TRAINERS
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">Find Expert Sports Trainers</h1>
            <div className="relative flex py-5 items-center"><div className="w-16 h-1 bg-yellow-500 rounded-full animate-pulse-slow"></div><div className="w-3 h-3 mx-2 bg-yellow-400 rounded-full"></div><div className="w-24 h-1 bg-yellow-500 rounded-full animate-pulse-slow animation-delay-200"></div></div>
            <p className="mt-3 max-w-3xl text-xl text-green-100 animate-fade-in-up animation-delay-300">Connect with professional coaches and trainers across Sri Lanka...</p>
          </div>
          <div className="mt-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-500">
            <form onSubmit={handleSearchSubmit} className="relative rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 border border-white/30"></div>
              <div className="relative">
                <div className="flex">
                  <div className="flex-grow">
                    <input type="text" placeholder="Search trainers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full bg-transparent border-0 py-4 pl-5 pr-10 text-white placeholder-white/70 focus:ring-0 focus:outline-none text-lg"/>
                  </div>
                  <div className="flex-shrink-0">
                    <button type="submit" className="h-full px-6 py-4 bg-white/20 hover:bg-white/30 transition-colors duration-300 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto block"><path fill="#F9FAFB" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 z-10">
        <div className="rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl overflow-hidden border border-white/30">
          {/* Filter Bar */}
          <div className="px-6 py-6 sm:p-8 bg-gradient-to-r from-emerald-900/50 to-emerald-800/40 border-b border-emerald-700/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Mobile Search (optional, redundancy with Hero search) */}
              <div className="max-w-lg w-full md:hidden">
                 <form onSubmit={handleSearchSubmit} className="relative">
                   <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><svg className="h-5 w-5 text-white/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
                   <input id="search-mobile" name="search-mobile" className="block w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm py-3 pl-10 pr-3 text-white placeholder-white/60 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm" placeholder="Search trainers..." type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                   {/* Hidden submit button for form submission on enter */}
                   <button type="submit" className="hidden">Search</button>
                 </form>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <label htmlFor="sort-by" className="block text-sm font-medium text-white mb-1 group-hover:text-emerald-300 transition-colors">Sort by</label>
                  <select id="sort-by" name="sort-by" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 backdrop-blur-sm py-2.5 pl-3 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm group-hover:border-emerald-300" value={sortBy} onChange={handleSortChange}>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
                <button type="button" className="inline-flex items-center rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/20 hover:border-white/50 transition-colors duration-300 md:hidden" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                  Filters {isFilterOpen ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          {/* Mobile Filters */}
          <div className="md:hidden">
            <Transition 
              show={isFilterOpen} 
              enter="transition duration-300 ease-out" 
              enterFrom="transform scale-95 opacity-0" 
              enterTo="transform scale-100 opacity-100" 
              leave="transition duration-200 ease-in" 
              leaveFrom="transform scale-100 opacity-100" 
              leaveTo="transform scale-95 opacity-0"
            >
              <div className="mt-6 border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white flex items-center">Filters</h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 bg-emerald-900/30 backdrop-blur-sm p-5 rounded-xl shadow-inner border border-white/10">
                  {/* Sport */}
                  <div className="relative group">
                    <label htmlFor="mobile-sport" className="block text-sm font-medium text-white mb-1">Sport</label>
                    <select id="mobile-sport" name="mobile-sport" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 backdrop-blur-sm py-2.5 pl-3 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm" value={filters.sport} onChange={(e) => handleFilterChange('sport', e.target.value)}>
                      {sportOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Location */}
                  <div className="relative group">
                    <label htmlFor="mobile-location" className="block text-sm font-medium text-white mb-1">Location</label>
                    <select id="mobile-location" name="mobile-location" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 backdrop-blur-sm py-2.5 pl-3 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm" value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}>
                      {locationOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Rating */}
                  <div className="relative group">
                    <label htmlFor="mobile-rating" className="block text-sm font-medium text-white mb-1">Rating</label>
                    <select id="mobile-rating" name="mobile-rating" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 backdrop-blur-sm py-2.5 pl-3 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm" value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)}>
                      {ratingOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Price */}
                  <div className="relative group">
                    <label htmlFor="mobile-price" className="block text-sm font-medium text-white mb-1">Price Range</label>
                    <select id="mobile-price" name="mobile-price" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 backdrop-blur-sm py-2.5 pl-3 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm shadow-sm" value={filters.priceRange} onChange={(e) => handleFilterChange('priceRange', e.target.value)}>
                      {priceRangeOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Availability */}
                  <div>
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex w-full justify-between rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/20 border border-white/20 focus:outline-none focus-visible:ring focus-visible:ring-emerald-500 focus-visible:ring-opacity-75 shadow-sm">
                            <span className="flex items-center text-white">Availability</span>
                            {open ? (
                              <ChevronUpIcon className="h-5 w-5 text-emerald-300" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-emerald-300" />
                            )}
                          </Disclosure.Button>
                          <Disclosure.Panel className="px-4 pt-4 pb-2 bg-white/5 backdrop-blur-sm mt-2 rounded-lg border border-white/10 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              {daysOfWeek.map((day) => (
                                <div key={`mobile-day-${day}`} className="flex items-start">
                                  <div className="flex h-5 items-center">
                                    <input
                                      id={`mobile-day-${day}`}
                                      name={`mobile-day-${day}`}
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                      checked={filters.availability.includes(day)}
                                      onChange={() => toggleDaySelection(day)}
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor={`mobile-day-${day}`} className="font-medium text-white hover:text-emerald-300 cursor-pointer">
                                      {day}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button type="button" className="flex items-center text-sm font-medium text-emerald-300 hover:text-emerald-400 group" onClick={resetFilters}>Reset</button>
                  <button type="button" className="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300" onClick={() => setIsFilterOpen(false)}>Apply</button>
                </div>
              </div>
            </Transition>
          </div>
          </div>
          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row">
            {/* Desktop Filters */}
            <div className="hidden md:block bg-gradient-to-b from-emerald-900/40 to-emerald-800/30 backdrop-blur-sm p-6 lg:w-72 xl:w-80 lg:rounded-bl-2xl border-r border-white/10 shadow-inner">
              <h3 className="text-lg font-bold text-white flex items-center">Filters</h3>
              <div className="mt-6 space-y-6">
                {/* Desktop filters content - updated for transparent theme */}
                {/* Sport */}
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-white border-b border-white/10 pb-2 mb-3 flex items-center">Sport Type</legend>
                    <div className="mt-2 space-y-3">
                      {sportOptions.map((option) => (
                        <div key={`desktop-sport-${option.id}`} className="flex items-center">
                          <input
                            id={`desktop-sport-${option.id}`}
                            name="desktop-sport"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            checked={filters.sport === option.id}
                            onChange={() => handleFilterChange('sport', option.id)} // Use handler
                          />
                          <label htmlFor={`desktop-sport-${option.id}`} className="ml-3 block text-sm font-medium text-white hover:text-emerald-300 cursor-pointer">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
                {/* Location */}
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-white border-b border-white/10 pb-2 mb-3 flex items-center">Location</legend>
                    <div className="mt-2 space-y-3">
                      {locationOptions.map((option) => (
                        <div key={`desktop-location-${option.id}`} className="flex items-center">
                          <input
                            id={`desktop-location-${option.id}`}
                            name="desktop-location"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            checked={filters.location === option.id}
                            onChange={() => handleFilterChange('location', option.id)} // Use handler
                          />
                          <label htmlFor={`desktop-location-${option.id}`} className="ml-3 block text-sm font-medium text-white hover:text-emerald-300 cursor-pointer">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
                {/* Rating */}
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-white border-b border-white/10 pb-2 mb-3 flex items-center">Rating</legend>
                    <div className="mt-2 space-y-3">
                      {ratingOptions.map((option) => (
                        <div key={`desktop-rating-${option.id}`} className="flex items-center">
                          <input
                            id={`desktop-rating-${option.id}`}
                            name="desktop-rating"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            checked={filters.rating === option.id}
                            onChange={() => handleFilterChange('rating', option.id)} // Use handler
                          />
                          <label htmlFor={`desktop-rating-${option.id}`} className="ml-3 block text-sm font-medium text-white hover:text-emerald-300 cursor-pointer">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
                {/* Price */}
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-white border-b border-white/10 pb-2 mb-3 flex items-center">Price Range</legend>
                    <div className="mt-2 space-y-3">
                      {priceRangeOptions.map((option) => (
                        <div key={`desktop-price-${option.id}`} className="flex items-center">
                          <input
                            id={`desktop-price-${option.id}`}
                            name="desktop-price"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            checked={filters.priceRange === option.id}
                            onChange={() => handleFilterChange('priceRange', option.id)} // Use handler
                          />
                          <label htmlFor={`desktop-price-${option.id}`} className="ml-3 block text-sm font-medium text-white hover:text-emerald-300 cursor-pointer">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
                {/* Availability */}
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-white border-b border-white/10 pb-2 mb-3 flex items-center">Availability</legend>
                    <div className="mt-2 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {daysOfWeek.map((day) => (
                          <div key={`desktop-day-${day}`} className="flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id={`desktop-day-${day}`}
                                name={`desktop-day-${day}`}
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                checked={filters.availability.includes(day)}
                                onChange={() => toggleDaySelection(day)} // Use toggleDaySelection
                              />
                            </div>
                            <div className="ml-2 text-sm">
                              <label htmlFor={`desktop-day-${day}`} className="font-medium text-white hover:text-emerald-300 cursor-pointer">
                                {day.substring(0, 3)}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <button type="button" className="flex items-center text-sm font-medium text-emerald-300 hover:text-emerald-400 group" onClick={resetFilters}>Reset</button>
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-800/60 text-emerald-100 rounded-full text-xs font-medium ring-1 ring-emerald-500/30">{totalCount} found</span>
                </div>
              </div>
            </div>
            {/* Trainer Listings */}
            <div className="flex-1 p-6 lg:p-8 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
              <div className="border-b border-white/10 pb-5 sm:flex sm:items-center sm:justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center">Expert Trainers</h2>
                <p className="mt-2 inline-flex items-center px-3.5 py-1.5 bg-gradient-to-r from-emerald-800/60 to-emerald-700/60 backdrop-blur-sm rounded-full text-sm font-medium text-emerald-100 border border-emerald-600/30 shadow-sm sm:mt-0">
                    {/* Show count based on displayed trainers after client-side filtering */}
                   {displayedTrainers.length} {displayedTrainers.length === 1 ? 'trainer' : 'trainers'} found
                   {/* Optionally show total count before client-side filtering */}
                   {/* {filters.availability.length > 0 && ` (of ${totalCount} total)`} */}
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-16">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-emerald-300 font-medium">Loading trainers...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="mt-12 text-center py-12 rounded-xl bg-red-900/30 backdrop-blur-sm border border-red-500/30 shadow-inner">
                  <h3 className="text-xl font-bold text-white mb-2">Error Loading Trainers</h3>
                  <p className="text-red-200 max-w-md mx-auto mb-8">{error}</p>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-5 py-3 text-base font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300"
                    onClick={fetchTrainers}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* No Results State */}
              {!loading && !error && displayedTrainers.length === 0 && (
                <div className="mt-12 text-center py-12 rounded-xl bg-emerald-900/30 backdrop-blur-sm border border-emerald-600/20 shadow-inner">
                  <h3 className="text-xl font-bold text-white mb-2">No trainers match your filters</h3>
                  <p className="text-emerald-200 max-w-md mx-auto mb-8">Try adjusting your search or filter criteria.</p>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-5 py-3 text-base font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300"
                    onClick={resetFilters}
                  >
                    Reset all filters
                  </button>
                </div>
              )}

              {/* UPDATED Trainer Cards - Now with transparent styling */}
              {!loading && !error && displayedTrainers.length > 0 && (
                <div role="list" className="space-y-6">
                  {displayedTrainers.map((trainer) => {
                    const trainerImageUrl = trainer.profileImage ? `${BACKEND_BASE_URL}${trainer.profileImage}` : FALLBACK_IMAGE;
                    return (
                      <div
                        key={trainer._id}
                        className="overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image - grayscale placeholder style */}
                          <div className="relative aspect-square w-full md:w-56 lg:w-64 flex-shrink-0 overflow-hidden bg-gray-200/40 backdrop-blur-sm">
                            <img
                              className="h-full w-full object-cover" // Removed grayscale here, apply conditionally if needed
                              src={trainerImageUrl}
                              alt={trainer.name}
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            />
                            {/* Experience badge */}
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center rounded-full bg-emerald-100/80 backdrop-blur-sm px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                {trainer.experienceYears} yrs exp
                              </span>
                            </div>
                          </div>

                          {/* Content - styled to match transparent theme */}
                          <div className="flex flex-1 flex-col p-6 bg-gradient-to-b from-white/10 to-white/5">
                            <div className="flex-1">
                              {/* Name and rating */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-1">{trainer.name}</h3>
                                  <div className="mt-1 flex items-center">
                                    {renderStars(trainer.rating)}
                                    <span className="ml-2 text-sm text-white/70">({trainer.reviewCount || 0} reviews)</span>
                                  </div>
                                </div>
                                <p className="text-xl font-bold text-emerald-300 flex-shrink-0 ml-4">
                                  {formatCurrency(trainer.hourlyRate)}<span className="text-sm text-emerald-300/70 font-normal">/hr</span>
                                </p>
                              </div>

                              {/* Specialization */}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {trainer.specialization && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-700/60 backdrop-blur-sm px-3 py-1 text-xs font-medium text-emerald-100">
                                    <AcademicCapIcon className="h-3.5 w-3.5 mr-1" /> {trainer.specialization}
                                  </span>
                                )}
                                <span className="inline-flex items-center text-sm text-white/70">
                                    <MapPinIcon className="h-4 w-4 mr-1"/>{trainer.location}
                                </span>
                              </div>

                              {/* Certifications */}
                              {trainer.certifications && trainer.certifications.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {trainer.certifications.slice(0, 2).map((cert, index) => (
                                    <span key={index} className="inline-flex items-center rounded-full bg-emerald-800/60 backdrop-blur-sm px-3 py-1 text-xs font-medium text-emerald-100">
                                      <CheckIcon className="h-3.5 w-3.5 mr-1" />{cert}
                                    </span>
                                  ))}
                                  {trainer.certifications.length > 2 && (
                                      <span className="text-xs text-emerald-200/80 self-center">+{trainer.certifications.length - 2} more</span>
                                  )}
                                </div>
                              )}

                              {/* Bio */}
                              <p className="mt-3 text-sm text-white/80 line-clamp-2">{trainer.bio}</p>
                            </div>

                            {/* Availability & Actions - styled to match theme */}
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-white/10">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-white/80 mb-2 flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5"/>Available on: </span>
                                <div className="flex flex-wrap gap-1">
                                  {daysOfWeek.map((day) => (
                                    <span
                                      key={`${trainer._id}-${day}`}
                                      className={`inline-block w-6 text-center text-xs font-medium rounded-md px-1 py-1 transition-colors ${
                                        trainer.availability && trainer.availability.includes(day)
                                          ? 'bg-emerald-700/60 text-emerald-100'
                                          : 'bg-gray-700/40 text-gray-400'
                                      }`}
                                      title={day}
                                    >
                                      {day.substring(0, 1)}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex space-x-3 flex-shrink-0 mt-4 sm:mt-0">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-all duration-300"
                                  // Consider using Next Link for client-side navigation if booking page is internal
                                   onClick={() => window.location.href = `/trainers/${trainer._id}/book`}
                                >
                                  Book Now
                                </button>
                                <Link
                                  href={`/trainers/${trainer._id}`}
                                  className="inline-flex items-center justify-center rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700 transition-all duration-300 group"
                                >
                                  View Profile <ArrowRightIcon className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination - Updated for transparent theme */}
              {!loading && !error && displayedTrainers.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-1.5 border border-white/20">
                    <button
                      type="button"
                      className="mx-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-emerald-300 transition-colors duration-200 group disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {/* Page numbers generation logic */}
                    {(() => {
                      const pageNumbers = [];
                      const maxPagesToShow = 5;
                      const halfPages = Math.floor(maxPagesToShow / 2);
                      let startPage = Math.max(1, currentPage - halfPages);
                      let endPage = Math.min(totalPages, currentPage + halfPages);

                      if (currentPage <= halfPages) {
                          endPage = Math.min(totalPages, maxPagesToShow);
                      }
                      if (currentPage + halfPages >= totalPages) {
                          startPage = Math.max(1, totalPages - maxPagesToShow + 1);
                      }

                       if (startPage > 1) {
                            pageNumbers.push(
                                <button key={1} type="button" className="mx-1 w-10 h-10 rounded-md text-sm font-medium text-white/80 hover:bg-emerald-700/40 hover:text-white flex items-center justify-center transition-colors duration-200" onClick={() => goToPage(1)}>1</button>
                            );
                            if (startPage > 2) {
                                pageNumbers.push(<span key="start-ellipsis" className="mx-1 w-10 h-10 flex items-center justify-center text-sm font-medium text-white/60">...</span>);
                            }
                        }

                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(
                          <button
                            key={i}
                            type="button"
                            className={`mx-1 w-10 h-10 rounded-md text-sm font-medium ${
                              currentPage === i
                                ? 'bg-emerald-600 text-white shadow-sm transform transition hover:scale-105'
                                : 'text-white/80 hover:bg-emerald-700/40 hover:text-white'
                            } flex items-center justify-center transition-colors duration-200`}
                            onClick={() => goToPage(i)}
                          >
                            {i}
                          </button>
                        );
                      }

                      if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                                pageNumbers.push(<span key="end-ellipsis" className="mx-1 w-10 h-10 flex items-center justify-center text-sm font-medium text-white/60">...</span>);
                            }
                            pageNumbers.push(
                                <button key={totalPages} type="button" className="mx-1 w-10 h-10 rounded-md text-sm font-medium text-white/80 hover:bg-emerald-700/40 hover:text-white flex items-center justify-center transition-colors duration-200" onClick={() => goToPage(totalPages)}>{totalPages}</button>
                            );
                        }

                      return pageNumbers;
                    })()}
                    <button
                      type="button"
                      className="mx-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-emerald-300 transition-colors duration-200 group disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Cricket Stadium Theme */}
      <div className="relative py-24 bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white overflow-hidden z-10">
        {/* Stadium background elements */}
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
        </div>

        <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:py-20 relative z-10 max-w-7xl mx-auto">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Are you a sports trainer?</h2>
            <p className="max-w-3xl text-lg text-green-100 mt-4">Join our platform and connect with athletes across Sri Lanka. Grow your client base and showcase your expertise to thousands of potential students.</p>
          </div>
          <div className="mt-10 lg:mt-0 lg:ml-8 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="/trainer-registration" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-white px-5 py-3 text-base font-medium text-emerald-800 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 transition-all duration-300 transform hover:scale-105">Register as a Trainer</a>
              <a href="/trainer-info" className="inline-flex items-center justify-center rounded-lg border border-white bg-transparent px-5 py-3 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 transition-all duration-300">Learn More</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <div className="pb-16 bg-gray-900"></div> {/* Added bg to avoid transparency issue if footer is light */}

      {/* CSS Animations */}
      <style jsx>{`
        /* Ensure the base page background doesn't show through footer spacer */
        html, body {
             background-color: #111827; /* Or your footer bg color */
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

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(5px, -5px); }
        }
        .animate-ken-burns {
          animation: ken-burns 15s ease-in-out infinite alternate;
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

        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-1000 { animation-delay: 1s; }

        /* Transparency overrides - keep these if needed, but ensure they don't break layout */
        div[class*="bg-white/20"],
        div[class*="bg-white/10"],
        div[class*="bg-white/5"] {
          /* These already have alpha, so !important might not be needed */
          /* Adjust blur and border as needed */
          backdrop-filter: blur(8px);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Fix text colors for contrast on transparent backgrounds */
        .text-gray-900 { color: white !important; }
        .text-gray-600, .text-gray-500 { color: rgba(255, 255, 255, 0.8) !important; }

        /* Style form elements on transparent backgrounds */
        select, input[type="text"], input[type="search"], input[type="radio"], input[type="checkbox"] {
          /* Ensure good contrast and visibility */
        }
        label {
           /* Ensure labels are readable */
        }

        /* Adjust button styling on transparent backgrounds */
        button[class*="border-gray-300"],
        button[class*="bg-white/10"] {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        button[class*="border-gray-300"]:hover,
        button[class*="bg-white/10"]:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }


         /* Pagination button adjustments */
        nav[class*="bg-white/10"] button {
             /* Ensure buttons are visible */
        }
         nav[class*="bg-white/10"] button.bg-emerald-600 {
            /* Active page button style */
        }

        /* Make filter sections transparent if needed */
        .bg-white.p-4.rounded-xl { /* Example selector */
            background-color: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .bg-white\/5.backdrop-blur-sm { /* Targeting specific class combo */
             background-color: rgba(255, 255, 255, 0.05) !important;
        }

        /* Add specific overrides if styles are not applying correctly */

      `}</style>
    </div>
  );
}