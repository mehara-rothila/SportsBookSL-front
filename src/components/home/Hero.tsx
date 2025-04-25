'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/services/categoryService';
import { getFacilities } from '@/services/facilityService';

const Hero = () => {
  const router = useRouter();
  
  // State for dropdown data
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for selected values
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  
  // State for image positions (from original code)
  const imageSets = [
    [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    ],
    [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1534860741060-ee15f0438609?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
    ],
    [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    ]
  ];

  // State to track current image index for each position
  const [currentIndices, setCurrentIndices] = useState([0, 0, 0]);
  
  // Effect to rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices(prevIndices => {
        return prevIndices.map((index, position) =>
          (index + 1) % imageSets[position].length
        );
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories and extract unique locations from facilities
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories from the backend
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
        
        // Fetch facilities to extract unique locations
        // Using limit=100 to get a good sample size without fetching all
        const facilitiesData = await getFacilities({ limit: 100 });
        
        // Extract unique locations
        const uniqueLocations = Array.from(
          new Set(
            facilitiesData.facilities
              .map(facility => facility.location)
              .filter(Boolean)
          )
        ).sort();
        
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching data for Hero component:', error);
        // Fallback data in case of API errors
        if (categories.length === 0) {
          setCategories([
            { _id: 'cricket', name: 'Cricket' },
            { _id: 'tennis', name: 'Tennis' },
            { _id: 'swimming', name: 'Swimming' },
            { _id: 'basketball', name: 'Basketball' },
            { _id: 'football', name: 'Football' }
          ]);
        }
        
        if (locations.length === 0) {
          setLocations([
            'Colombo',
            'Kandy',
            'Galle',
            'Negombo',
            'Jaffna',
            'Matara',
            'Nuwara Eliya'
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle search button click
  const handleSearch = () => {
    // Get the slug from the selected category
    const selectedCategory = categories.find(cat => cat._id === selectedSport);
    const sportParam = selectedCategory?.slug || selectedSport;
    
    // Create query parameters
    const queryParams = new URLSearchParams();
    
    if (selectedLocation) {
      queryParams.set('location', selectedLocation);
    }
    
    if (sportParam) {
      queryParams.set('sport', sportParam);
    }
    
    // Navigate to facilities page with filters
    router.push(`/facilities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      {/* Sports background images with increased visibility */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div> {/* Semi-transparent overlay for text readability */}
        
        {/* Grid of sports images with transitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* First row */}
          <div className="relative h-full overflow-hidden">
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img 
                src={imageSets[0][currentIndices[0]]}
                alt="Sports facility" 
                className="object-cover w-full h-full animate-ken-burns"
              />
            </div>
          </div>
          
          {/* Only show these columns on medium screens and up */}
          <div className="relative h-full overflow-hidden hidden md:block">
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img 
                src={imageSets[1][currentIndices[1]]}
                alt="Sports activity" 
                className="object-cover w-full h-full animate-ken-burns"
              />
            </div>
          </div>
          
          <div className="relative h-full overflow-hidden hidden md:block">
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img 
                src={imageSets[2][currentIndices[2]]}
                alt="Sports equipment" 
                className="object-cover w-full h-full animate-ken-burns"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements with baseball theme */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Glowing orbs - updated with baseball theme colors */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-green-500/20 rounded-full blur-xl animate-pulse-slow animation-delay-1000"></div>
        
        {/* Floating sports equipment silhouettes */}
        <div className="absolute top-10 right-10 opacity-20 animate-float">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 animate-float animation-delay-1000">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
          </svg>
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col items-center justify-center min-h-[80vh]">
        {/* Enhanced headline with gradient text - updated to emerald/green */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 animate-fade-in-down">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-300">
            Book Sports Facilities
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-white">
            Across Sri Lanka
          </span>
        </h1>
        
        {/* Improved subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 text-center mb-8 max-w-3xl animate-fade-in-down animation-delay-200">
          Discover and book the best sports facilities, equipment, and trainers for your next training session or match.
        </p>
        
        {/* Enhanced search box with glass effect - UPDATED with Backend data */}
        <div className="w-full max-w-3xl glass-effect rounded-xl p-2 sm:p-3 md:p-4 mb-8 backdrop-blur-md bg-white/10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {/* Location dropdown - UPDATED from input to select */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="block w-full appearance-none bg-transparent border border-gray-300 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              >
                <option value="" className="bg-gray-900">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location} className="bg-gray-900">{location}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Sport type selection - UPDATED with backend data */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <select 
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="block w-full appearance-none bg-transparent border border-gray-300 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              >
                <option value="" className="bg-gray-900">All Sports</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id} className="bg-gray-900">{category.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Search button - updated to handle click */}
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Feature pills - updated with baseball theme colors */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 animate-fade-in-up animation-delay-500">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm sm:text-base text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Real-time Availability
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm sm:text-base text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Instant Booking
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm sm:text-base text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            </svg>
            Weather Integration
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm sm:text-base text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            Financial Aid
          </div>
        </div>
        
        {/* Scroll indicator - Fixed arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Wave overlay for transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,128L80,138.7C160,149,320,171,480,165.3C640,160,800,128,960,122.7C1120,117,1280,139,1360,149.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;