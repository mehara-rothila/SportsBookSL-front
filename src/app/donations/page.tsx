'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DonationCard from '../../components/donations/DonationCard';
import api from '@/services/api';
import * as donationService from '@/services/donationService';

// --- Interfaces ---
interface Athlete {
  _id: string;
  id?: string;
  name: string;
  age: number;
  sport: string;
  goalAmount: number;
  raisedAmount: number;
  image: string;
  achievements: string[];
  story: string;
  location: string;
  progress?: number;
}

interface SuccessStoryAthlete {
    _id: string;
    name: string;
    sport: string;
    image: string;
    raisedAmount: number;
    goalAmount: number;
    story?: string;
    achievements?: string[];
}

interface FilterOption {
  id: string;
  name: string;
}

interface AthletesApiResponse {
    athletes: Athlete[];
    page: number;
    pages: number;
    count: number;
}

// --- Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_ATHLETE_IMAGE = '/images/default-athlete.png';

export default function DonationsPage() {
  // --- State for Main Athlete List ---
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // --- State for Success Stories ---
  const [successStories, setSuccessStories] = useState<SuccessStoryAthlete[]>([]);
  const [loadingSuccess, setLoadingSuccess] = useState(true);
  const [errorSuccess, setErrorSuccess] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  // Filter Options State
  const [sportOptions, setSportOptions] = useState<FilterOption[]>([{ id: 'all', name: 'All Sports' }]);
  const [locationOptions, setLocationOptions] = useState<FilterOption[]>([{ id: 'all', name: 'All Locations' }]);

  // --- Fetch Filter Options ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sportsRes, locationsRes] = await Promise.all([
          api.get('/utils/sports'),
          api.get('/utils/locations')
        ]);
        if (sportsRes.data && Array.isArray(sportsRes.data)) {
          setSportOptions([
            { id: 'all', name: 'All Sports' },
            ...sportsRes.data.map((s: string) => ({ id: s.toLowerCase(), name: s }))
          ]);
        } else { setSportOptions([{ id: 'all', name: 'All Sports' }]); }
        if (locationsRes.data && Array.isArray(locationsRes.data)) {
          setLocationOptions([
            { id: 'all', name: 'All Locations' },
            ...locationsRes.data.map((l: string) => ({ id: l.toLowerCase(), name: l }))
          ]);
        } else { setLocationOptions([{ id: 'all', name: 'All Locations' }]); }
      } catch (err) { console.error("Failed to fetch filter options:", err); }
    };
    fetchOptions();
  }, []);

  // --- Fetch Athletes Data ---
  const fetchAthletes = useCallback(async (pageToFetch = 1) => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string | number> = { pageNumber: pageToFetch };
      if (searchQuery) params.keyword = searchQuery;
      if (selectedSport !== 'all') params.sport = selectedSport;
      if (selectedLocation !== 'all') params.location = selectedLocation;
      if (sortBy === 'goal-high') params.sort = '-goalAmount';
      else if (sortBy === 'goal-low') params.sort = 'goalAmount';
      else if (sortBy === 'progress') params.sort = '-progress';

      const response = await api.get<AthletesApiResponse>('/athletes', { params });
      const responseData = response.data;

      if (responseData && Array.isArray(responseData.athletes)) {
          setAthletes(responseData.athletes);
          setTotalPages(responseData.pages || 1);
          setTotalCount(responseData.count || 0);
          setCurrentPage(responseData.page || 1);
      } else {
          setAthletes([]); setTotalPages(1); setTotalCount(0); setCurrentPage(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load athletes.");
      setAthletes([]); setTotalPages(1); setTotalCount(0); setCurrentPage(1);
    } finally { setLoading(false); }
  }, [searchQuery, selectedSport, selectedLocation, sortBy]);

  // --- Fetch Success Stories ---
  useEffect(() => {
    const fetchSuccessData = async () => {
        setLoadingSuccess(true);
        setErrorSuccess(null);
        try {
            const data = await donationService.getSuccessStories();
            setSuccessStories(data || []);
        } catch (err: any) {
            setErrorSuccess(err.message || "Failed to load success stories.");
            setSuccessStories([]);
        } finally {
            setLoadingSuccess(false);
        }
    };
    fetchSuccessData();
  }, []);

  // Initial fetch for main athletes list
  useEffect(() => {
    fetchAthletes(1);
  }, [fetchAthletes]);

  // Fetch specific page when currentPage state changes
  useEffect(() => {
    if (currentPage !== 1) { fetchAthletes(currentPage); }
  }, [currentPage, fetchAthletes]);

  // --- Event Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); };
  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); fetchAthletes(1); };
  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSport(e.target.value); setCurrentPage(1); };
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedLocation(e.target.value); setCurrentPage(1); };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSortBy(e.target.value); setCurrentPage(1); };
  const handlePageChange = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) { setCurrentPage(newPage); } };
  const resetFilters = () => { setSearchQuery(''); setSelectedSport('all'); setSelectedLocation('all'); setSortBy('recommended'); setCurrentPage(1); };

  // --- Render Logic ---
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cricket Stadium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
        {/* Oval field */}
        <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
        
        {/* Pitch - LEFT SIDE */}
        <div className="absolute top-1/2 left-[20%] w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
          <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
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
          <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
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
        
        <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
            <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
          </div>
        </div>
        
        <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
            <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
          </div>
        </div>
        
        <div className="absolute w-8 h-12 top-[40%] right-[15%] animate-batsman-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
            <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
          </div>
        </div>
        
        <div className="absolute w-8 h-12 bottom-[35%] right-[25%] animate-bowler-run animation-delay-500">
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

      {/* Hero section - with correct spacing */}
      <div className="relative pt-24 pb-48 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="animate-fade-in-down">
            <span className="inline-flex items-center px-3 py-1 mb-4 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm border border-white/20 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ATHLETE SUPPORT PROGRAM
            </span>
            <h1 className="text-4xl font-bold text-white sm:text-5xl mb-3">Support Rising Athletes</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
              Help talented Sri Lankan athletes access quality training facilities and equipment.
            </p>
          </div>
        </div>
        
        {/* White Curve Transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto block">
            <path fill="white" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Filter and search section - moved further down */}
      <div id="browse-athletes" className="relative mt-4 pt-16 z-10">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/20 mb-8">
            <div className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Athletes
                </h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className="inline-flex items-center px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors border border-emerald-500/30"
                >
                  {showFilters ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter Athletes
                    </>
                  )}
                </button>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-emerald-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input 
                  type="search" 
                  id="search" 
                  name="search" 
                  className="block w-full pl-10 pr-4 py-3 border border-white/30 rounded-lg text-white bg-emerald-900/40 backdrop-blur-sm placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                  placeholder="Search athletes by name, sport, location..." 
                  value={searchQuery} 
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button type="submit" className="p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <svg className="h-5 w-5 text-emerald-300 hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </form>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/20 animate-fade-in">
                  {/* Sport Filter */}
                  <div className="space-y-1">
                    <label htmlFor="sport" className="block text-sm font-medium text-white">Sport Type</label>
                    <div className="relative">
                      <select 
                        id="sport" 
                        name="sport" 
                        className="block w-full pl-3 pr-10 py-2 text-base bg-emerald-900/40 backdrop-blur-sm border-white/30 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-lg text-white" 
                        value={selectedSport} 
                        onChange={handleSportChange}
                      >
                        {sportOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Location Filter */}
                  <div className="space-y-1">
                    <label htmlFor="location" className="block text-sm font-medium text-white">Location</label>
                    <div className="relative">
                      <select 
                        id="location" 
                        name="location" 
                        className="block w-full pl-3 pr-10 py-2 text-base bg-emerald-900/40 backdrop-blur-sm border-white/30 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-lg text-white" 
                        value={selectedLocation} 
                        onChange={handleLocationChange}
                      >
                        {locationOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Sort By Filter */}
                  <div className="space-y-1">
                    <label htmlFor="sort" className="block text-sm font-medium text-white">Sort By</label>
                    <div className="relative">
                      <select 
                        id="sort" 
                        name="sort" 
                        className="block w-full pl-3 pr-10 py-2 text-base bg-emerald-900/40 backdrop-blur-sm border-white/30 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-lg text-white" 
                        value={sortBy} 
                        onChange={handleSortChange}
                      >
                        <option value="recommended">Recommended</option>
                        <option value="goal-high">Highest Goal</option>
                        <option value="goal-low">Lowest Goal</option>
                        <option value="progress">Most Progress</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3 flex justify-between items-center mt-2 pt-3 border-t border-white/20">
                    <div className="text-sm text-emerald-200">{totalCount} athletes matching</div>
                    <button 
                      onClick={resetFilters} 
                      className="inline-flex items-center text-emerald-300 hover:text-emerald-100 font-medium text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Athletes Seeking Support</h2>
              <div className="bg-emerald-900/50 backdrop-blur-sm text-emerald-100 px-3 py-1 rounded-full text-sm font-medium border border-emerald-700/50">{totalCount} athletes</div>
            </div>

            {/* Athletes grid */}
            {loading ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-10 h-10 border-4 border-emerald-200/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-emerald-200">Loading Athletes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-900/30 backdrop-blur-sm p-6 rounded-xl border border-red-500/30">
                <p className="text-red-200 font-medium">Error: {error}</p>
                <button 
                  onClick={() => fetchAthletes(1)} 
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : athletes.length === 0 ? (
              <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl border border-white/30">
                <h3 className="text-xl font-bold text-white mb-3">No athletes found</h3>
                <p className="text-base text-emerald-200 mb-6 max-w-md mx-auto">Try adjusting your search criteria or filters.</p>
                <button 
                  onClick={resetFilters} 
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-lg shadow-lg transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        // CORRECTED CODE
                {athletes.map((athlete) => (
                  <DonationCard
                    key={athlete._id}
                    athleteId={athlete._id}
                    name={athlete.name}
                    age={athlete.age}
                    sport={athlete.sport}
                    goal={athlete.goalAmount}
                    raised={athlete.raisedAmount}
                    image={`${BACKEND_BASE_URL}${athlete.image}`}
                    achievements={athlete.achievements}
                    story={athlete.story}
                    location={athlete.location}
                    // imageOpacity prop removed
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && athletes.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-1.5 border border-white/20">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="mx-1 px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-emerald-800/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only sm:not-sr-only">Previous</span>
                  </button>
                  
                  <div className="flex px-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button 
                          key={pageNum} 
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md text-sm ${
                            currentPage === pageNum 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-white/80 hover:bg-emerald-800/40'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="mx-1 px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-emerald-800/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only sm:not-sr-only">Next</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success stories section - Compact */}
      <div className="py-12 relative">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 mb-2">IMPACT STORIES</span>
            <h2 className="text-2xl font-bold text-white mb-2">Success Stories</h2>
            <p className="text-lg text-green-200 max-w-3xl mx-auto">See how your donations have transformed the careers of talented athletes</p>
          </div>

          {/* Dynamic success story rendering */}
          {loadingSuccess ? (
            <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-8 h-8 border-3 border-emerald-200/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-emerald-200">Loading Success Stories...</p>
            </div>
          ) : errorSuccess ? (
            <div className="text-center py-8 bg-red-900/30 backdrop-blur-sm p-4 rounded-xl border border-red-500/30">
              <p className="text-red-200">{errorSuccess}</p>
            </div>
          ) : successStories.length === 0 ? (
            <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-emerald-200">No success stories to display yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {successStories.slice(0, 3).map((story) => {
                const storyImageUrl = story.image ? `${BACKEND_BASE_URL}${story.image}` : FALLBACK_ATHLETE_IMAGE;
                const achievementTag = story.achievements && story.achievements.length > 0 ? story.achievements[0] : 'Funded';
                const storySnippet = story.story ? story.story.substring(0, 80) + (story.story.length > 80 ? '...' : '') : 'Supported through SportsBookSL donations.';

                return (
                  <div key={story._id} className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/30 group transform hover:scale-105 transition-all duration-500">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={storyImageUrl} 
                        alt={story.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 opacity-100" 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_ATHLETE_IMAGE; }}
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">{story.name}</h3>
                          <p className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/50 backdrop-blur-sm text-emerald-200 border border-emerald-700/30">{story.sport}</p>
                        </div>
                        <div className="bg-green-900/50 backdrop-blur-sm text-green-200 px-2 py-1 rounded-full text-xs font-bold border border-green-700/30">{achievementTag}</div>
                      </div>
                      <p className="text-white/80 text-sm mb-4 line-clamp-2">{storySnippet}</p>
                      <div className="pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-emerald-300">Total raised:</p>
                          <p className="font-bold text-green-300">Rs. {story.raisedAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-emerald-300">Goal reached:</p>
                          <p className="font-bold text-green-300">Rs. {story.goalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-6">
            <Link 
              href="/donations/success-stories" 
              className="inline-flex items-center px-5 py-2 bg-white/10 hover:bg-white/20 text-green-100 border border-white/30 font-medium rounded-lg shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-300"
            >
              View All Success Stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA section - More compact */}
      <div className="py-12 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/20">
            <div className="px-6 py-8 sm:p-8 lg:flex lg:items-center">
              <div className="lg:w-0 lg:flex-1">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to make a difference?</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full my-3"></div>
                <p className="max-w-2xl text-base text-green-100">Join our community of donors supporting the next generation of Sri Lankan sports talent.</p>
                <div className="mt-5 flex flex-col xs:flex-row gap-3">
                  <Link 
                    href="/donations/become-sponsor" 
                    className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium shadow-md transition-colors"
                  >
                    Become a Sponsor
                  </Link>
                  <Link 
                    href="/about/donation-program" 
                    className="inline-flex items-center justify-center px-5 py-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8 lg:w-1/3 lg:flex-shrink-0 hidden md:block">
                <div className="relative h-48 rounded-lg overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/90 to-transparent z-10"></div>
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1526763025849-26a4d2dea110" alt="Athletes celebrating"/>
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <div className="text-lg font-bold text-white mb-1">Support Their Journey</div>
                    <div className="text-sm text-emerald-200">450+ Athletes Supported</div>
                  </div>
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
        
        @keyframes bowler-run {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }
        .animate-bowler-run {
          animation: bowler-run 5s ease-in-out infinite alternate;
        }
        
        @keyframes cricket-ball {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-80px, -50px); }
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
        
        @keyframes fade-in-down { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-down { 
          animation: fade-in-down 0.5s ease-out forwards; 
        }
        
        @keyframes fade-in-up { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { 
          animation: fade-in-up 0.5s ease-out forwards; 
        }
        
        @keyframes fade-in { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .animate-fade-in { 
          animation: fade-in 0.3s ease-out forwards; 
        }
        
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        
        /* Apply line clamping for text */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}