'use client';

import { useState, useEffect, useCallback } from 'react'; 
import Link from 'next/link';
import Hero from '../components/home/Hero';
import api from '@/services/api';

// Get the backend base URL from environment variables
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
// Define the path to your fallback/placeholder image in the frontend public folder
const FALLBACK_TESTIMONIAL_IMAGE = '/images/testimonial-placeholder.jpg'; // Renamed for clarity

export default function Home() {
  // --- State Variables ---
  const [featuredFacilities, setFeaturedFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]); // State for testimonial data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for category hover effects
  const [categoryHoveredId, setCategoryHoveredId] = useState(null);

  // State for featured facilities filters and hover effects
  const [activeFilter, setActiveFilter] = useState('all');
  const [facilityHoveredId, setFacilityHoveredId] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDataFromBackend = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch

        const [facilitiesRes, categoriesRes, testimonialsRes] = await Promise.all([
          api.get('/facilities/featured', { params: { limit: 8 } }),
          api.get('/categories'),
          api.get('/testimonials') // Fetch testimonials here
        ]);

        console.log('Facilities response:', facilitiesRes.data);
        console.log('Categories response:', categoriesRes.data);
        console.log('Testimonials response:', testimonialsRes.data); // Log testimonial response

        setFeaturedFacilities(Array.isArray(facilitiesRes.data) ? facilitiesRes.data : facilitiesRes.data?.facilities || []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.categories || []);
        // Set testimonials state
        setTestimonials(Array.isArray(testimonialsRes.data) ? testimonialsRes.data : testimonialsRes.data?.testimonials || []);

      } catch (err) {
        console.error('Error fetching data from backend:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load content. Please try again later.';
        setError(errorMessage);
        // Clear data on error
        setFeaturedFacilities([]);
        setCategories([]);
        setTestimonials([]); // Clear testimonials on error
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromBackend();
  }, []);

  // --- Helper function to render the Sport Categories section with ENHANCED STYLING ---
  const renderSportCategoriesSection = () => {
    // --- Loading State ---
    if (loading) {
      return (
        <section id="sport-categories" className="py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            {/* Simplified Loading Skeleton */}
            <div className="text-center mb-16">
              <div className="w-40 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
              <div className="w-96 h-12 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>
              <div className="w-full max-w-3xl h-6 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-60 rounded-2xl bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // --- Error State ---
    if (error && categories.length === 0) {
      return (
        <section id="sport-categories" className="py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 relative">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">Perfect Sport</span>
              </h2>
              <p className="text-lg text-red-600 max-w-3xl mx-auto">
                Having trouble loading categories. Please try again later.
              </p>
            </div>
          </div>
        </section>
      );
    }

    // --- Success State with ENHANCED STYLING ---
    return (
      <section id="sport-categories" className="py-24 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 opacity-50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-50 opacity-40 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="relative mb-16">
            <div className="absolute top-[-60px] left-8 z-10">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-50/90 text-emerald-700 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                EXPLORE BY CATEGORY
              </span>
            </div>
            <div className="mx-auto text-center bg-white/40 backdrop-blur-sm px-8 py-12 rounded-xl max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gray-900">Discover Your</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">Perfect Sport</span>
              </h2>
              <div className="flex justify-center items-center mb-6">
                <div className="w-16 h-1 bg-gray-200"></div>
                <div className="w-16 h-1 bg-emerald-400"></div>
                <div className="w-16 h-1 bg-emerald-600"></div>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Whether you're into team sports or individual athletics, find and book the perfect facilities for your passion
              </p>
            </div>
          </div>
          {/* Render categories from the API with ENHANCED STYLING */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {categories.length > 0 ? (
              <>
                {categories.map(category => {
                  const imageUrl = category.imageSrc
                    ? `${BACKEND_BASE_URL}${category.imageSrc}`
                    : '/images/category-placeholder.jpg';
                  const categoryId = category.id || category._id;

                  return (
                    <Link
                      key={categoryId}
                      href={`/facilities?sport=${category.slug || categoryId}`}
                      className="group relative overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-[1.03] hover:shadow-xl flex flex-col rounded-2xl"
                      onMouseEnter={() => setCategoryHoveredId(categoryId)}
                      onMouseLeave={() => setCategoryHoveredId(null)}
                    >
                      {/* Enhanced Image Container with Overlay and Effects */}
                      <div className="h-48 overflow-hidden relative">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url("${imageUrl}")` }}
                        ></div>
                        
                        {/* Enhanced Overlay with Gradient and Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 opacity-80 group-hover:opacity-70 transition-opacity duration-300"></div>
                        
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shine-effect"></div>
                        
                        {/* Category Name Overlay - For visual impact */}
                        <div className="absolute bottom-0 left-0 w-full p-4">
                          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md transform transition-all duration-300 group-hover:translate-y-[-5px]">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Content Container with Enhanced Styling */}
                      <div className="p-5 flex flex-col justify-between flex-grow bg-white">
                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4">
                          {category.description || `Book ${category.name.toLowerCase()} facilities across Sri Lanka`}
                        </p>
                        
                        {/* Bottom Action Area with Enhanced Styling */}
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                            {category.facilityCount || '0'}+ Facilities
                          </span>
                          <div className="flex items-center text-emerald-600 text-sm font-medium transition-all duration-300 group-hover:translate-x-1">
                            <span>Explore</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Accent Bar */}
                      <div className="h-1 w-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:w-full transition-all duration-500"></div>
                    </Link>
                  );
                })}
                
                {/* Enhanced View All Card */}
                <div className="relative overflow-hidden shadow-lg flex flex-col rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 group hover:shadow-2xl transition-all duration-500 hover:scale-[1.03]">
                  <div className="absolute inset-0 bg-sports-pattern opacity-5 group-hover:opacity-8 transition-opacity duration-300"></div>
                  
                  {/* Animated Background Circles */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white opacity-5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                  
                  <div className="p-8 flex flex-col items-center justify-center text-center h-full z-10">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:translate-y-[-5px] transition-transform duration-300">Explore All Sports</h3>
                    <p className="text-white/80 text-sm mb-6">
                      Discover all {categories.length}+ sports categories and find the perfect facilities for your passion
                    </p>
                    <Link href="/facilities" className="inline-flex items-center px-6 py-2.5 rounded-full border border-white/30 text-white text-sm font-medium bg-white/10 hover:bg-white/20 transition-all duration-300 group-hover:shadow-lg">
                      View All Categories
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              // --- No Categories Found State ---
              <div className="col-span-full text-center py-10">
                <p className="text-gray-600 mb-4">No categories found at the moment. Please check back later!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // --- Helper function to render the Featured Facilities section with ENHANCED STYLING ---
  const renderFeaturedFacilitiesSection = () => {
    // Define filters inside the function scope
    const filters = [
      { id: 'all', name: 'All Facilities' },
      { id: 'cricket', name: 'Cricket' },
      { id: 'swimming', name: 'Swimming' },
      { id: 'tennis', name: 'Tennis' },
      { id: 'new', name: 'Newly Added' },
      { id: 'premium', name: 'Premium' },
    ];

    // Filter facilities based on activeFilter
    const filteredFacilities = featuredFacilities.filter(facility => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'new') return facility.isNew;
      if (activeFilter === 'premium') return facility.isPremium;
      return facility.sportTypes && facility.sportTypes.some(sport =>
        sport.toLowerCase() === activeFilter.toLowerCase());
    }).slice(0, 4); // Show only first 4 after filtering

    // --- Loading State ---
    if (loading) {
      return (
        <section className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Simplified Loading Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div className="mb-6 md:mb-0">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-6 w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // --- Error State ---
    if (error && featuredFacilities.length === 0) {
      return (
        <section className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                Featured Facilities
              </h2>
              <p className="text-lg text-red-600 mb-8">
                Unable to load facilities at this time. Please try again later.
              </p>
            </div>
          </div>
        </section>
      );
    }

    // --- Success State with ENHANCED STYLING ---
    return (
      <section className="py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-40 right-0 w-80 h-80 bg-emerald-50 opacity-70 rounded-full -translate-x-1/3 blur-3xl"></div>
        <div className="absolute -bottom-20 left-0 w-72 h-72 bg-emerald-50 opacity-50 rounded-full translate-x-1/4 blur-3xl"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header and Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="mb-8 md:mb-0">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 inline-block mb-4">TOP RATED</span>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Featured Facilities
              </h2>
              <div className="mt-4 w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                Discover top-rated sports facilities across Sri Lanka
              </p>
            </div>
            
            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-100">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    activeFilter === filter.id 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Facilities Grid with Category Card Styling */}
          {featuredFacilities.length > 0 ? (
            <>
              {filteredFacilities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredFacilities.map((facility) => {
                    const imageUrl = (facility.images && facility.images.length > 0)
                      ? `${BACKEND_BASE_URL}${facility.images[0]}`
                      : '/images/facility-placeholder.jpg';
                    const facilityId = facility.id || facility._id;

                    return (
                      <Link
                        key={facilityId}
                        href={`/facilities/${facilityId}`}
                        className="group relative overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-[1.03] hover:shadow-xl flex flex-col rounded-2xl"
                        onMouseEnter={() => setFacilityHoveredId(facilityId)}
                        onMouseLeave={() => setFacilityHoveredId(null)}
                      >
                        <div className="relative overflow-hidden flex-grow">
                          {/* Enhanced Badges with Better Positioning and Styling */}
                          <div className="absolute top-0 left-0 w-full p-4 flex gap-2 z-20">
                            {facility.isNew && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></span>
                                New
                              </span>
                            )}
                            {facility.isPremium && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 shadow-sm">
                                <svg className="h-3 w-3 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a.75.75 0 01.692.462l2.24 5.37 5.38.446a.75.75 0 01.423 1.311l-4.16 3.34 1.29 5.233a.75.75 0 01-1.114.813L10 16.914l-4.75 2.74a.75.75 0 01-1.114-.813l1.29-5.233-4.16-3.34a.75.75 0 01.423-1.311l5.38-.446 2.24-5.37A.75.75 0 0110 2z" clipRule="evenodd" />
                                </svg>
                                Premium
                              </span>
                            )}
                          </div>

                          {/* Enhanced Image Container with Overlay and Effects - Similar to Category Cards */}
                          <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
                            <div
                              className="h-48 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                              style={{ backgroundImage: `url("${imageUrl}")` }}
                            />
                            
                            {/* Enhanced Image Overlay Gradient - Similar to Category Cards */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 opacity-80 group-hover:opacity-70 transition-opacity duration-300"></div>
                            
                            {/* Shine effect on hover - Same as Category Cards */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shine-effect"></div>
                            
                            {/* Facility Name Overlay - Similar to Category Card name */}
                            <div className="absolute bottom-0 left-0 w-full p-4">
                              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md transform transition-all duration-300 group-hover:translate-y-[-5px]">
                                {facility.name}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 mb-1">
                                {facility.sportTypes && facility.sportTypes.slice(0, 2).map((sport) => (
                                  <span key={sport} className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white border border-white/10">
                                    {sport}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Content Area - Styled like Category Cards */}
                          <div className="p-5 flex flex-col flex-grow bg-white">
                            {/* Location Display */}
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0 text-emerald-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              <span className="truncate">{facility.location}</span>
                            </div>

                            {/* Enhanced Rating Display */}
                            <div className="flex items-center text-sm text-gray-700 mb-3">
                              <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400 mr-1">
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{facility.rating?.toFixed(1) || 'N/A'}</span>
                                <span className="ml-1 text-gray-500">({facility.reviewCount || 0})</span>
                              </div>
                            </div>

                            {/* Bottom Action Area with Enhanced Styling - Similar to Category Cards */}
                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                                {facility.pricePerHour ? `Rs. ${facility.pricePerHour}/hr` : 'Price not available'}
                              </span>
                              
                              {/* Action Button - Similar to Category Cards */}
                              <div className="flex items-center text-emerald-600 text-sm font-medium transition-all duration-300 group-hover:translate-x-1">
                                <span>Book now</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom Accent Bar - Same as Category Cards */}
                          <div className="h-1 w-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                // --- No Facilities Found for Filter ---
                <div className="text-center py-10 col-span-full">
                  <p className="text-gray-600 mb-4">No facilities match the selected filter.</p>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Show All Featured
                  </button>
                </div>
              )}
            </>
          ) : (
            // --- No Facilities Found At All ---
            <div className="text-center py-10 col-span-full">
              <p className="text-gray-600 mb-4">No featured facilities available at the moment.</p>
              <Link href="/facilities" className="text-emerald-600 hover:underline">
                View all facilities
              </Link>
            </div>
          )}

          {/* Enhanced View All Button - Similar to Category View All Card */}
          <div className="mt-16 text-center">
            <Link
              href="/facilities"
              className="group relative overflow-hidden inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="relative z-10">View All Facilities</span>
              {/* Animated decoration circle */}
              <div className="absolute -left-4 -top-4 w-16 h-16 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <svg 
                className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 relative z-10" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              {/* Bottom accent line animation */}
              <span className="absolute bottom-0 left-0 h-1 w-0 bg-white/30 transition-all duration-500 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  // --- Helper function to render the Testimonials section (Integrated) ---
  const renderTestimonialsSection = () => {
    // State specific to the testimonial slider, kept local to this function
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState('right');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use the testimonials data passed from the main Home component state
    const displayTestimonials = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : [];

    // --- Navigation Logic (using useCallback for stability) ---
    const nextSlide = useCallback(() => {
      if (displayTestimonials.length <= 1) return;
      setIsTransitioning(true);
      setDirection('right');
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayTestimonials.length);
    }, [displayTestimonials.length]);

    const prevSlide = useCallback(() => {
      if (displayTestimonials.length <= 1) return;
      setIsTransitioning(true);
      setDirection('left');
      setCurrentIndex((prevIndex) => (prevIndex - 1 + displayTestimonials.length) % displayTestimonials.length);
    }, [displayTestimonials.length]);

    // --- Effects (local to this function) ---
    // Auto-rotation effect
    useEffect(() => {
      if (displayTestimonials.length <= 1) return;
      const interval = setInterval(nextSlide, 8000);
      return () => clearInterval(interval);
    }, [nextSlide, displayTestimonials.length]);

    // Handle transition end
    useEffect(() => {
      if (isTransitioning) {
        const timer = setTimeout(() => setIsTransitioning(false), 500); // Match CSS transition duration
        return () => clearTimeout(timer);
      }
    }, [isTransitioning]);

    // --- Helper Function for Slide CSS Classes (local) ---
    const getSlideClass = (index) => {
      if (displayTestimonials.length === 0) return 'opacity-0 translate-x-full z-0';

      if (index === currentIndex) {
        return 'opacity-100 translate-x-0 z-20';
      }

      const prevIndex = (currentIndex - 1 + displayTestimonials.length) % displayTestimonials.length;
      const nextIndex = (currentIndex + 1) % displayTestimonials.length;

      if (index === prevIndex) {
        return `opacity-0 -translate-x-full z-10 ${direction === 'left' && isTransitioning ? 'transition-transform duration-500' : ''}`;
      }
      if (index === nextIndex) {
        return `opacity-0 translate-x-full z-10 ${direction === 'right' && isTransitioning ? 'transition-transform duration-500' : ''}`;
      }
      return 'opacity-0 translate-x-full z-0';
    };

    // --- Conditional Rendering (using main loading/error state) ---

    // Loading State
    if (loading) {
      return (
        <section className="py-24 bg-black/70 backdrop-blur-sm relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="h-6 w-32 bg-emerald-800/40 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-10 w-64 bg-emerald-800/40 rounded mx-auto mb-6 animate-pulse"></div>
              <div className="h-1 w-20 bg-emerald-800/60 rounded mx-auto mb-6 animate-pulse"></div>
              <div className="h-6 w-96 bg-emerald-800/40 rounded mx-auto animate-pulse"></div>
            </div>
            <div className="mx-auto max-w-4xl">
              <div className="h-96 bg-emerald-800/30 rounded-2xl animate-pulse"></div>
            </div>
            <div className="flex justify-center space-x-2 mt-10">
              <div className="h-3 w-8 bg-emerald-800/40 rounded-full animate-pulse"></div>
              <div className="h-3 w-3 bg-emerald-800/30 rounded-full animate-pulse"></div>
              <div className="h-3 w-3 bg-emerald-800/30 rounded-full animate-pulse"></div>
            </div>
          </div>
        </section>
      );
    }

    // Error State (only show testimonial-specific error if data failed but others might have loaded)
    if (error && testimonials.length === 0) { // Check if testimonials specifically failed
      return (
        <section className="py-24 bg-black/70 backdrop-blur-sm relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                What our users say
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Unable to load testimonials at this time. Please try again later.
              </p>
            </div>
          </div>
        </section>
      );
    }

    // No Testimonials Available State
    if (!loading && !error && displayTestimonials.length === 0) {
      return (
        <section className="py-24 bg-black/70 backdrop-blur-sm relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                What our users say
              </h2>
              <p className="text-white/80 text-lg">
                No testimonials available yet. Check back soon!
              </p>
            </div>
          </div>
        </section>
      );
    }

    // --- Success State (Display Testimonials) ---
    return (
      <section className="py-24 bg-black/70 backdrop-blur-sm relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-sports-pattern opacity-10"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-800 rounded-full opacity-5"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-800 rounded-full opacity-5"></div>
        <div className="absolute top-20 right-20 w-20 h-20 border-2 border-emerald-500/20 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-40 w-16 h-16 border-2 border-emerald-500/20 rounded-full opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute top-40 left-96 w-24 h-8 border-2 border-emerald-500/20 rounded-full opacity-20 animate-float animation-delay-1000"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/30 text-emerald-300 inline-block mb-4 backdrop-blur-sm">TESTIMONIALS</span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What our users say
            </h2>
            <div className="flex justify-center mt-4 mb-6">
              <div className="w-20 h-1 bg-emerald-500 rounded"></div>
            </div>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-white/80">
              Hear from athletes, coaches, and facility owners who are transforming Sri Lanka's sports scene
            </p>
          </div>

          {/* Slider Container */}
          <div className="mt-12 relative">
            {/* Navigation Buttons */}
            {displayTestimonials.length > 1 && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 md:-left-6">
                  <button
                    onClick={prevSlide}
                    className="bg-emerald-900/30 hover:bg-emerald-800/40 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transform hover:scale-110 shadow-lg"
                    aria-label="Previous testimonial"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 md:-right-6">
                  <button
                    onClick={nextSlide}
                    className="bg-emerald-900/30 hover:bg-emerald-800/40 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transform hover:scale-110 shadow-lg"
                    aria-label="Next testimonial"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Testimonial Slides */}
            <div className="relative h-[420px] md:h-[380px] mx-auto max-w-4xl">
              {displayTestimonials.map((testimonial, index) => {
                const imageUrl = testimonial.imageUrl
                  ? `${BACKEND_BASE_URL}${testimonial.imageUrl}`
                  : FALLBACK_TESTIMONIAL_IMAGE; // Use the defined fallback
                const testimonialId = testimonial._id || testimonial.id;

                return (
                  <div
                    key={testimonialId}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${getSlideClass(index)}`}
                  >
                    <div className="h-full flex flex-col md:flex-row items-center rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-emerald-800/30">
                      {/* Image Column (Desktop) */}
                      <div className="hidden md:block md:w-2/5 h-full bg-emerald-900/30 relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                          style={{ backgroundImage: `url("${imageUrl}")` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent" />
                        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-emerald-500/30 rounded-full opacity-20"></div>
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-emerald-500/30 rounded-full opacity-20"></div>
                      </div>

                      {/* Content Column */}
                      <div className="p-8 md:p-10 md:w-3/5 flex flex-col justify-center">
                        {/* Quote Mark Decoration */}
                        <div className="relative mb-6">
                          <svg className="h-12 w-12 text-emerald-700/30 absolute -top-4 -left-2" fill="currentColor" viewBox="0 0 32 32">
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                          <div className="h-1 w-16 bg-emerald-500 rounded-full ml-10 mb-4"></div>
                        </div>

                        {/* Testimonial Content */}
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed italic mb-6">"{testimonial.content}"</p>

                        {/* Mobile Image */}
                        <div className="md:hidden mt-4 mb-4 flex justify-center">
                          <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-emerald-800/50">
                            <img
                              src={imageUrl}
                              alt={testimonial.author || 'Author'}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src=FALLBACK_TESTIMONIAL_IMAGE }}
                                                          />
                          </div>
                        </div>

                        {/* Author Info */}
                        <div className="mt-auto flex items-center">
                          {/* Desktop Image */}
                          <div className="mr-4 hidden md:block">
                            <div className="h-12 w-12 rounded-full overflow-hidden ring-4 ring-emerald-800/50">
                              <img
                                src={imageUrl}
                                alt={testimonial.author || 'Author'}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src=FALLBACK_TESTIMONIAL_IMAGE }}                              />
                            </div>
                          </div>
                          {/* Author Name & Role */}
                          <div>
                            <div className="text-lg font-semibold text-white">{testimonial.author}</div>
                            {testimonial.role && <div className="text-emerald-400">{testimonial.role}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            {displayTestimonials.length > 1 && (
              <div className="flex justify-center space-x-2 mt-10">
                {displayTestimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setDirection(index > currentIndex ? 'right' : 'left');
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                    }}
                    className={`h-3 transition-all duration-300 rounded-full ${
                      currentIndex === index
                        ? 'bg-emerald-500 w-8'
                        : 'bg-emerald-700/50 hover:bg-emerald-600/70 w-3'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Optional: Background decoration */}
        <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden opacity-10">
          <div className="w-full h-px bg-emerald-500"></div>
          <div className="absolute bottom-12 left-1/2 w-24 h-24 border-4 border-emerald-500 rounded-full transform -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/4 w-px h-24 bg-emerald-500"></div>
          <div className="absolute bottom-0 right-1/4 w-px h-24 bg-emerald-500"></div>
        </div>
      </section>
    );
  };

  // --- Weather Integration Highlight Section - Styled with baseball theme ---
  const renderWeatherSection = () => {
    return (
      <section className="py-24 relative overflow-hidden z-10">
        {/* Semi-transparent overlay for readability */}
        <div className="absolute inset-0 bg-emerald-900/75 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced header with animation */}
          <div className="text-center mb-16">
            <div className="inline-block mb-3">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 text-emerald-200 animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                SMART WEATHER INTEGRATION
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-lg">
              Never Let <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Weather</span> Disrupt Your Game
            </h2>

            {/* Animated bar */}
            <div className="flex justify-center items-center mb-6">
              <div className="w-16 h-1 bg-emerald-200 rounded-l-full"></div>
              <div className="w-10 h-1 bg-emerald-400 animate-pulse-slow"></div>
              <div className="w-16 h-1 bg-emerald-600 rounded-r-full"></div>
            </div>

            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Our platform intelligently monitors weather conditions and provides real-time recommendations to ensure your sports activities are never interrupted
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-8">
                {/* Feature 1 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-white/10">
                  <div className="flex items-start">
                    <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-700/50 text-emerald-200 mr-6 transform transition-transform duration-500 group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Real-Time Weather Monitoring</h3>
                      <p className="text-white/80">
                        Our system continuously monitors weather conditions at all outdoor facilities, ensuring you're informed about changes that might affect your game.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-white/10 ml-6">
                  <div className="flex items-start">
                    <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-700/50 text-emerald-200 mr-6 transform transition-transform duration-500 group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Dynamic Suitability Scoring</h3>
                      <p className="text-white/80">
                        Each outdoor facility receives a real-time suitability score based on current and forecasted weather conditions for informed booking decisions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-white/10">
                  <div className="flex items-start">
                    <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-700/50 text-emerald-200 mr-6 transform transition-transform duration-500 group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Intelligent Alternatives</h3>
                      <p className="text-white/80">
                        When weather affects your planned activity, our system automatically suggests nearby indoor alternatives with similar facilities and availability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
                {/* Weather widget header */}
                <div className="bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="weather-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#weather-pattern)" />
                    </svg>
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="font-bold text-xl mb-1">Premadasa Cricket Stadium</h3>
                      <p className="text-emerald-100 text-sm">Colombo, Sri Lanka • Cricket Ground</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-md">
                      75% Suitable
                    </div>
                  </div>

                  <div className="flex items-center mt-6 relative z-10">
                    <div className="w-16 h-16 mr-4">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zM7 13.5C7 12.12 8.12 11 9.5 11s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S7 14.88 7 13.5zM12 10c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2zm9 2c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">29°C</span>
                        <span className="ml-2 text-emerald-100">Feels like 31°C</span>
                      </div>
                      <p className="text-lg">Partly Cloudy</p>
                    </div>
                  </div>
                </div>

                {/* Weather details */}
                <div className="p-6 bg-gradient-to-b from-emerald-900/30 to-transparent">
                  {/* Weather metrics grid */}
                  <div className="grid grid-cols-4 gap-2 mb-8">
                    <div className="text-center">
                      <p className="text-sm text-emerald-200/60 mb-1">Wind</p>
                      <div className="flex items-center justify-center h-8 mb-1">
                        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                      </div>
                      <p className="font-medium text-white">15 km/h</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-emerald-200/60 mb-1">Humidity</p>
                      <div className="flex items-center justify-center h-8 mb-1">
                        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <p className="font-medium text-white">75%</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-emerald-200/60 mb-1">Rain</p>
                      <div className="flex items-center justify-center h-8 mb-1">
                        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <p className="font-medium text-white">30%</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-emerald-200/60 mb-1">UV Index</p>
                      <div className="flex items-center justify-center h-8 mb-1">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 17.657l-.707.707M18.364 5.636l-.707.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="font-medium text-white">7/10</p>
                    </div>
                  </div>

                  {/* Alternative facilities */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-emerald-200 mb-3 flex items-center">
                      <svg className="h-4 w-4 mr-1.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recommended Indoor Alternatives
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg shadow-sm border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer transform transition hover:scale-[1.01]">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-emerald-700/50 flex items-center justify-center mr-3">
                            <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-medium text-white">Colombo Indoor Cricket Arena</h5>
                            <p className="text-xs text-emerald-200/60">2.5 km away • Cricket</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-emerald-700/60 text-emerald-100 text-xs font-medium px-2 py-1 rounded">Available</span>
                          <svg className="h-5 w-5 ml-2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg shadow-sm border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer transform transition hover:scale-[1.01]">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-emerald-700/50 flex items-center justify-center mr-3">
                            <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-medium text-white">National Indoor Sports Complex</h5>
                            <p className="text-xs text-emerald-200/60">5.1 km away • Multi-sport</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-emerald-700/60 text-emerald-100 text-xs font-medium px-2 py-1 rounded">Available</span>
                          <svg className="h-5 w-5 ml-2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg shadow-md hover:from-emerald-700 hover:to-green-700 transform transition-all duration-300 hover:shadow-lg flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Alternative Facility
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // --- Call to Action Section ---
  const renderCallToActionSection = () => {
    return (
      <section className="py-24 bg-black/60 backdrop-blur-lg text-white relative overflow-hidden z-10">
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-emerald-300 backdrop-blur-sm mb-8 animate-pulse-slow">
              GET STARTED TODAY
            </span>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight animate-fade-in-down text-shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Ready to elevate</span>
              <br />
              <span className="text-white">your sports experience?</span>
            </h2>

            <p className="text-xl text-emerald-100/90 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
              Join SportsBookSL today and connect with the best sports facilities across Sri Lanka. Book facilities, coordinate transportation, find equipment, and support talented athletes all on one platform.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up animation-delay-500">
              <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/30 hover:shadow-xl hover:scale-105">
                <span className="relative z-10">Book a Facility Now</span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 h-1 w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
              </button>

              <button className="group relative overflow-hidden rounded-xl bg-transparent border-2 border-white/30 backdrop-blur-sm px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:border-white/50 hover:shadow-xl hover:scale-105">
                <span className="relative z-10">Explore Features</span>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
            </div>

            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-700">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-700/40 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-emerald-200">300+ Facilities</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-700/40 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-emerald-200">10,000+ Users</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-700/40 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-emerald-200">20+ Sports</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-700/40 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-emerald-200">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // --- Main Component Return ---
  return (
    <div className="min-h-screen">
      {/* Baseball Field Background - Fixed Position */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Enhanced baseball field background */}
        <div className="absolute inset-0 opacity-75">
          {/* Stadium atmosphere elements */}
          <div className="absolute inset-0 bg-pattern-noise opacity-5"></div>
          <div className="absolute top-0 left-0 w-full h-[8%] bg-gradient-to-b from-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[8%] bg-gradient-to-t from-black/30 to-transparent"></div>

          {/* Enhanced diamond field with more realistic texture */}
          <div className="absolute top-1/2 left-1/2 w-[750px] h-[750px] -translate-x-1/2 -translate-y-1/2 bg-green-700 rounded-lg transform rotate-45 border-4 border-white/30 overflow-hidden shadow-2xl">
            {/* Improved mowed grass pattern */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255, 255, 255, .15) 0px, rgba(255, 255, 255, .15) 25px, transparent 25px, transparent 50px)',
                backgroundSize: '100px 50px'
              }}
            />
            {/* Radial highlight in center */}
            <div className="absolute inset-0 bg-radial-gradient opacity-20"></div>
          </div>

          {/* Enhanced infield (dirt area) with texture */}
          <div className="absolute top-1/2 left-1/2 w-[480px] h-[480px] -translate-x-1/2 -translate-y-1/2 bg-amber-800 rounded-lg transform rotate-45 border-2 border-amber-700/70 overflow-hidden">
            {/* Dirt texture */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.25\'/%3E%3C/svg%3E")',
                backgroundSize: '150px 150px'
              }}
            />
          </div>

          {/* Enhanced infield grass */}
          <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] -translate-x-1/2 -translate-y-1/2 bg-green-600 rounded-lg transform rotate-45 border-2 border-green-500/70 overflow-hidden shadow-inner">
            {/* Center grass texture */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255, 255, 255, .1) 0px, rgba(255, 255, 255, .1) 20px, transparent 20px, transparent 40px)',
                backgroundSize: '80px 80px'
              }}
            />
          </div>

          {/* Enhanced base lines with glow */}
          <div className="absolute top-1/2 left-1/2 w-[730px] h-[730px] -translate-x-1/2 -translate-y-1/2 transform rotate-45 border-l-4 border-b-4 border-white pointer-events-none shadow-glow"></div>

          {/* Enhanced foul lines extending beyond diamond */}
          <div className="absolute top-[75%] left-[14%] w-[30%] h-1 bg-white/40 rotate-45 origin-left blur-[0.5px]"></div>
          <div className="absolute top-[75%] right-[14%] w-[30%] h-1 bg-white/40 -rotate-45 origin-right blur-[0.5px]"></div>

          {/* Improved pitcher's mound with 3D effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[100px] h-[100px] bg-amber-700 rounded-full border-2 border-amber-600/50 shadow-lg overflow-hidden">
              {/* Dirt texture */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.25\'/%3E%3C/svg%3E")',
                  backgroundSize: '100px 100px'
                }}
              />
              {/* Radial gradient for 3D effect */}
              <div className="absolute inset-0 bg-radial-gradient from-amber-600/30 to-transparent"></div>
            </div>
            {/* Pitcher's plate with 3D effect */}
            <div className="absolute top-1/2 left-1/2 w-[24px] h-[6px] -translate-x-1/2 -translate-y-1/2 bg-white shadow-md"></div>
          </div>

          {/* Enhanced home plate with 3D effect */}
          <div className="absolute top-[calc(50%+243px)] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[24px] h-[24px] bg-white rotate-45 transform origin-bottom-right shadow-lg">
              <div className="absolute bottom-0 right-0 border-r-[24px] border-b-[12px] border-transparent border-r-white"></div>
            </div>
            {/* Subtle shadow under home plate */}
            <div className="absolute -bottom-1 -right-1 w-[24px] h-[24px] bg-black/20 rotate-45 blur-[2px] -z-10"></div>
          </div>

          {/* Enhanced bases with 3D effects and shadows */}
          <div className="absolute top-1/2 left-[calc(50%+243px)] -translate-y-1/2 -translate-x-1/2">
            <div className="w-[18px] h-[18px] bg-white border border-gray-300 transform rotate-45 shadow-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-black/20 rotate-45 blur-[2px] -z-10"></div>
          </div>

          <div className="absolute top-[calc(50%-243px)] left-1/2 -translate-y-1/2 -translate-x-1/2">
            <div className="w-[18px] h-[18px] bg-white border border-gray-300 transform rotate-45 shadow-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-black/20 rotate-45 blur-[2px] -z-10"></div>
          </div>

          <div className="absolute top-1/2 left-[calc(50%-243px)] -translate-y-1/2 -translate-x-1/2">
            <div className="w-[18px] h-[18px] bg-white border border-gray-300 transform rotate-45 shadow-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-black/20 rotate-45 blur-[2px] -z-10"></div>
          </div>

          {/* FIELDERS WITH RANDOM MOVEMENT PATTERNS */}
          {/* Left field */}
          <div className="absolute w-10 h-14 top-[30%] left-[30%] animate-fielder-move-1">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1.5 w-6 h-6 rounded-full bg-blue-500/90 shadow-md"></div>
              <div className="absolute top-6 left-2 w-5 h-7 bg-blue-600/80 shadow-md"></div>
              <div className="absolute top-14 h-2 w-5 left-2 bg-black/10 rounded-full blur-[2px] -z-10"></div>
            </div>
          </div>

          {/* Right field */}
          <div className="absolute w-10 h-14 top-[65%] right-[25%] animate-fielder-move-2 animation-delay-500">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1.5 w-6 h-6 rounded-full bg-blue-500/90 shadow-md"></div>
              <div className="absolute top-6 left-2 w-5 h-7 bg-blue-600/80 shadow-md"></div>
              <div className="absolute top-14 h-2 w-5 left-2 bg-black/10 rounded-full blur-[2px] -z-10"></div>
            </div>
          </div>

          {/* Center field */}
          <div className="absolute w-10 h-14 top-[20%] left-[50%] animate-fielder-move-3 animation-delay-800">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1.5 w-6 h-6 rounded-full bg-blue-500/90 shadow-md"></div>
              <div className="absolute top-6 left-2 w-5 h-7 bg-blue-600/80 shadow-md"></div>
              <div className="absolute top-14 h-2 w-5 left-2 bg-black/10 rounded-full blur-[2px] -z-10"></div>
            </div>
          </div>{/* Shortstop */}
          <div className="absolute w-10 h-14 top-[40%] left-[40%] animate-fielder-move-7 animation-delay-700">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1.5 w-6 h-6 rounded-full bg-blue-500/90 shadow-md"></div>
              <div className="absolute top-6 left-2 w-5 h-7 bg-blue-600/80 shadow-md"></div>
              <div className="absolute top-14 h-2 w-5 left-2 bg-black/10 rounded-full blur-[2px] -z-10"></div>
            </div>
          </div>

          {/* Second baseman */}
          <div className="absolute w-10 h-14 top-[40%] right-[40%] animate-fielder-move-8 animation-delay-200">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1.5 w-6 h-6 rounded-full bg-blue-500/90 shadow-md"></div>
              <div className="absolute top-6 left-2 w-5 h-7 bg-blue-600/80 shadow-md"></div>
              <div className="absolute top-14 h-2 w-5 left-2 bg-black/10 rounded-full blur-[2px] -z-10"></div>
            </div>
          </div>

          {/* First base runner */}
          <div className="absolute w-10 h-14 top-1/2 left-[calc(50%+230px)] -translate-y-1/2 -translate-x-1/2 animate-baserunner-1">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1.5 w-6 h-6 rounded-full bg-red-500/90 shadow-md"></div>
              <div className="absolute top-6 left-2 w-5 h-7 bg-red-600/80 shadow-md"></div>
              <div className="absolute top-14 h-2 w-5 left-2 bg-black/10 rounded-full blur-[2px] -z-10"></div>
            </div>
          </div>

          {/* Animated baseball with trail effect */}
          <div className="baseball-container absolute top-[calc(50%-20px)] left-[calc(50%)] -translate-x-1/2 -translate-y-1/2">
            <div className="baseball w-4 h-4 bg-white rounded-full border border-red-500/60 shadow-md animate-baseball-throw"></div>
            <div className="baseball-trail absolute w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px] translate-y-[40px]"></div>
            <div className="baseball-trail absolute w-1 h-1 rounded-full bg-white/30 blur-[1px] translate-y-[80px]"></div>
            <div className="baseball-trail absolute w-0.5 h-0.5 rounded-full bg-white/20 blur-[1px] translate-y-[120px]"></div>
          </div>

          {/* Stadium lights effects */}
          <div className="absolute top-0 left-[20%] w-1 h-40 bg-gradient-to-b from-white/30 to-transparent rotate-12 blur-[2px]"></div>
          <div className="absolute top-0 right-[20%] w-1 h-40 bg-gradient-to-b from-white/30 to-transparent -rotate-12 blur-[2px]"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <Hero />
      </div>

      {/* Background Wrapper div that spans multiple sections */}
      <div className="relative overflow-hidden z-10">
        {/* --- Integrated Sport Categories Section --- */}
        <div className="relative">
          {renderSportCategoriesSection()}
        </div>

        {/* --- Integrated Featured Facilities Section --- */}
        <div className="relative">
          {renderFeaturedFacilitiesSection()}
        </div>
      </div>

      {/* Weather Integration Highlight Section */}
      {renderWeatherSection()}

      {/* --- Integrated Testimonials Section --- */}
      <div className="relative z-10">
        {renderTestimonialsSection()}
      </div>

      {/* Enhanced Call to Action */}
      {renderCallToActionSection()}

      {/* Display error notification if there's an error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {typeof error === 'string' ? error : 'An unexpected error occurred.'}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        .shadow-glow {
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
        }

        .bg-pattern-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .bg-radial-gradient {
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }

        /* Multiple fielder movement patterns */
        @keyframes fielder-move-1 {
          0% { transform: translate(0, 0); }
          20% { transform: translate(30px, -20px); }
          40% { transform: translate(10px, 40px); }
          60% { transform: translate(-40px, 15px); }
          80% { transform: translate(-20px, -30px); }
          100% { transform: translate(0, 0); }
        }
        .animate-fielder-move-1 {
          animation: fielder-move-1 17s ease-in-out infinite;
        }

        @keyframes fielder-move-2 {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-35px, 15px); }
          50% { transform: translate(25px, -30px); }
          75% { transform: translate(40px, 10px); }
          100% { transform: translate(0, 0); }
        }
        .animate-fielder-move-2 {
          animation: fielder-move-2 13s ease-in-out infinite;
        }

        @keyframes fielder-move-3 {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-25px, 35px); }
          40% { transform: translate(35px, 25px); }
          60% { transform: translate(10px, -30px); }
          80% { transform: translate(-15px, -15px); }
          100% { transform: translate(0, 0); }
        }
        .animate-fielder-move-3 {
          animation: fielder-move-3 19s ease-in-out infinite;
        }

        @keyframes fielder-move-7 {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-20px, -25px); }
          50% { transform: translate(15px, 10px); }
          75% { transform: translate(25px, -20px); }
          100% { transform: translate(0, 0); }
        }
        .animate-fielder-move-7 {
          animation: fielder-move-7 15s ease-in-out infinite;
        }

        @keyframes fielder-move-8 {
          0% { transform: translate(0, 0); }
          33% { transform: translate(20px, 20px); }
          66% { transform: translate(-25px, 5px); }
          100% { transform: translate(0, 0); }
        }
        .animate-fielder-move-8 {
          animation: fielder-move-8 18s ease-in-out infinite;
        }

        /* Base runner animations with shorter patrol areas */
        @keyframes baserunner-1 {
          0% { transform: translate(0, 0); }
          25% { transform: translate(15px, 10px); }
          50% { transform: translate(5px, -10px); }
          75% { transform: translate(-10px, 5px); }
          100% { transform: translate(0, 0); }
        }
        .animate-baserunner-1 {
          animation: baserunner-1 8s ease-in-out infinite;
        }

        @keyframes baseball-throw {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(0, 220px) scale(1); opacity: 1; }
          60% { transform: translate(0, 220px) scale(1.5); opacity: 0.7; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        .animate-baseball-throw {
          animation: baseball-throw 4s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        /* Added Ken Burns and Float animations for Testimonials */
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(5px, -5px);
          }
        }
        .animate-ken-burns {
          animation: ken-burns 15s ease-in-out infinite alternate;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Added shine effect for category cards */
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -110%;
          left: -210%;
          width: 200%;
          height: 200%;
          opacity: 0;
          transform: rotate(30deg);
          background: rgba(255, 255, 255, 0.13);
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.13) 0%,
            rgba(255, 255, 255, 0.13) 77%,
            rgba(255, 255, 255, 0.5) 92%,
            rgba(255, 255, 255, 0.0) 100%
          );
          transition: opacity 0.6s ease-in-out, left 0.6s ease-in-out; /* Smoother transition */
        }
        .group:hover .shine-effect::after {
          opacity: 1;
          left: -30%; /* Adjust end position for desired effect */
          transition: opacity 0.7s ease-in-out, left 0.7s ease-in-out; /* Smoother transition */
        }

        /* Added pulse slow animation */
        @keyframes pulse-slow {
          50% {
            opacity: .7;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Added fade-in animations */
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
        .animation-delay-300 {
          animation-delay: 0.3s;
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