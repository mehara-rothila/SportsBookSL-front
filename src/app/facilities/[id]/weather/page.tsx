'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as facilityService from '@/services/facilityService';
import * as weatherService from '@/services/weatherService';
import { 
  ArrowPathIcon, 
  ChevronLeftIcon, 
  CalendarDaysIcon,
  CloudIcon,
  SunIcon,
  BoltIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/solid';

// Custom CloudRainIcon component
const CloudRainIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M4.5 13.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-6zm4.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-6zm4.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-6zm-9-5.25A.75.75 0 015.25 7.5h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" />
  </svg>
);

// Custom SnowIcon component
const SnowIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M11.625 16.5a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
    <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 001.06-1.06l-1.048-1.048A3.375 3.375 0 1011.625 18z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" clipRule="evenodd" />
  </svg>
);

// Custom WindIcon component
const WindIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export default function WeatherAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const facilityId = typeof params.id === 'string' ? params.id : '';
  
  const [facility, setFacility] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<weatherService.WeatherData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  const [chartType, setChartType] = useState<'temperature' | 'precipitation' | 'humidity'>('temperature');
  const [timeRange, setTimeRange] = useState<'all' | '7days' | '3days'>('all');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  // Fetch facility data
  useEffect(() => {
    if (!facilityId) {
      setError("Facility ID is missing");
      setLoading(false);
      return;
    }
    
    const fetchFacility = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Validate ID format (MongoDB ObjectId)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(facilityId);
        if (!isValidObjectId) {
          throw new Error(`Invalid Facility ID format: ${facilityId}. Expected a 24-character hexadecimal ID.`);
        }
        
        const data = await facilityService.getFacilityById(facilityId);
        setFacility(data);
        
        // Once we have facility data, fetch weather
        if (data.mapLocation?.lat && data.mapLocation?.lng) {
          await fetchWeatherData(data.mapLocation.lat, data.mapLocation.lng, data.name);
        } else if (data.location) {
          await fetchWeatherDataByCity(data.location, data.name);
        } else {
          throw new Error("No location data available for weather information");
        }
      } catch (err: any) {
        console.error('Error fetching facility:', err);
        setError(typeof err === 'string' ? err : err.message || 'Failed to load facility details');
        setFacility(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFacility();
  }, [facilityId]);
  
  // Fetch weather data using coordinates - USING REAL API
  const fetchWeatherData = async (lat: number, lon: number, facilityName: string) => {
    try {
      console.log(`WeatherAnalytics: Fetching weather data for coordinates lat=${lat}, lon=${lon}`);
      const data = await weatherService.getWeatherByCoordinates(lat, lon, facilityName);
      setWeatherData(data);
    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      setError(typeof err === 'string' ? err : 'Failed to load weather data');
    }
  };
  
  // Fetch weather data using city name - USING REAL API
  const fetchWeatherDataByCity = async (cityName: string, facilityName: string) => {
    try {
      console.log(`WeatherAnalytics: Fetching weather data for city ${cityName}`);
      const data = await weatherService.getWeatherByCity(cityName, facilityName);
      setWeatherData(data);
    } catch (err: any) {
      console.error('Error fetching weather data by city:', err);
      setError(typeof err === 'string' ? err : 'Failed to load weather data');
    }
  };
  
  // Helper function to format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Helper function to format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to format day of week
  const formatDayOfWeek = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Get weather icon based on icon code
  const getWeatherIcon = (iconCode: string, className?: string) => {
    const baseClass = className || "h-6 w-6";
    
    switch (iconCode.substring(0, 2)) {
      case '01': // clear sky
        return <SunIcon className={`${baseClass} text-yellow-400`} />;
      case '02': // few clouds
        return <CloudIcon className={`${baseClass} text-gray-400`} />;
      case '03': // scattered clouds
      case '04': // broken clouds
        return <CloudIcon className={`${baseClass} text-gray-300`} />;
      case '09': // shower rain
      case '10': // rain
        return <CloudRainIcon className={`${baseClass} text-blue-400`} />;
      case '11': // thunderstorm
        return <BoltIcon className={`${baseClass} text-yellow-500`} />;
      case '13': // snow
        return <SnowIcon className={`${baseClass} text-gray-300`} />;
      case '50': // mist
        return <CloudIcon className={`${baseClass} text-gray-500`} />;
      default:
        return <SunIcon className={`${baseClass} text-yellow-400`} />;
    }
  };

  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!weatherData) return { historicData: [], forecastData: [] };

    let historicData = weatherData.historic || [];
    let forecastData = weatherData.daily || [];

    if (timeRange === '3days') {
      historicData = historicData.slice(-3);
      forecastData = forecastData.slice(0, 3);
    } else if (timeRange === '7days') {
      historicData = historicData.slice(-7);
      forecastData = forecastData.slice(0, 3);
    }

    return { historicData, forecastData };
  };

  // Calculate data for current chart type
  const getChartData = () => {
    const { historicData, forecastData } = getFilteredData();
    
    if (chartType === 'temperature') {
      return {
        historicMin: historicData.map(d => d.temp.min),
        historicMax: historicData.map(d => d.temp.max),
        historicAvg: historicData.map(d => d.temp.avg),
        forecastMin: forecastData.map(d => d.temp.min),
        forecastMax: forecastData.map(d => d.temp.max),
        forecastAvg: forecastData.map(d => d.temp.day),
        unit: '°C'
      };
    } else if (chartType === 'precipitation') {
      // For precipitation, use humidity as a proxy for historical data since API doesn't provide historical precipitation
      return {
        historicData: historicData.map(d => {
          // Convert humidity to a precipitation probability (this is just a visual approximation)
          const precipProb = Math.max(0, Math.min(100, (d.humidity - 40) / 2));
          return precipProb / 100; // Convert to 0-1 range to match forecast data
        }),
        forecastData: forecastData.map(d => d.pop), // pop is already 0-1 range
        unit: '%'
      };
    } else if (chartType === 'humidity') {
      return {
        historicData: historicData.map(d => d.humidity),
        forecastData: forecastData.map(d => d.humidity),
        unit: '%'
      };
    }
    
    // Default fallback
    return {
      historicMin: [],
      historicMax: [],
      historicAvg: [],
      forecastMin: [],
      forecastMax: [],
      forecastAvg: [],
      unit: ''
    };
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
        <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="ml-4 text-xl font-semibold text-white">Loading weather analytics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
        <p className="mb-4 text-center">{error}</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center backdrop-blur-sm border border-white/30"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2"/> Try Again
          </button>
          <Link 
            href="/facilities" 
            className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center backdrop-blur-sm border border-white/30"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2"/> Back to Facilities
          </Link>
        </div>
      </div>
    );
  }
  
  if (!facility) { 
    return ( 
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-8"> 
        <h2 className="text-2xl font-bold text-white mb-2">Facility Not Found</h2> 
        <p className="text-emerald-100 mb-4 text-center">We couldn't find the facility (ID: {facilityId}).</p> 
        <Link href="/facilities" className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"> 
          Back to Facilities 
        </Link> 
      </div> 
    ); 
  }
  
  if (!weatherData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 text-white p-8">
        <h2 className="text-2xl font-bold mb-4">No Weather Data Available</h2>
        <p className="mb-4 text-center">Unable to retrieve weather information for this facility.</p>
        <Link 
          href={`/facilities/${facilityId}`}
          className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center backdrop-blur-sm border border-white/30"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2"/> Back to Facility
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 relative overflow-hidden">
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
        
        {/* FIELDERS - ANIMATED */}
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
        
        {/* Ball trajectories */}
        <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[18%] animate-ball-trajectory"></div>
        <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] right-[18%] animate-ball-trajectory animation-delay-500"></div>
        
        {/* Stadium elements */}
        <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-12 z-10">
      {/* Header */}
        <div className="mb-8">
          <div className="animate-fade-in-down">
            <Link
              href={`/facilities/${facilityId}`}
              className="inline-flex items-center text-emerald-300 hover:text-emerald-200 mb-4 transition-colors duration-300 group"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Facility
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 tracking-tight">
                  Weather Analysis for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">{facility.name}</span>
                </h1>
                <div className="mt-3 flex items-center">
                  <div className="flex items-center px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white shadow-md">
                    <MapPinIcon className="h-5 w-5 mr-2 text-emerald-400" />
                    <span className="font-medium">{facility.location || 'Location unavailable'}</span>
                  </div>
                  <div className="ml-4 px-3.5 py-1.5 rounded-full bg-emerald-700/30 backdrop-blur-sm border border-emerald-600/30 text-emerald-200 shadow-md">
                    <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
                    <span className="font-medium">7-day weather data</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-md">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-md flex items-center text-sm ${
                      viewMode === 'list' 
                        ? 'bg-emerald-700 text-white shadow-inner' 
                        : 'text-emerald-300 hover:bg-emerald-800/70'
                    } transition-colors duration-300`}
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`px-3 py-2 rounded-md flex items-center text-sm ${
                      viewMode === 'chart' 
                        ? 'bg-emerald-700 text-white shadow-inner' 
                        : 'text-emerald-300 hover:bg-emerald-800/70'
                    } transition-colors duration-300`}
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Chart View
                  </button>
                </div>
                
                {viewMode === 'chart' && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-md">
                    <button
                      onClick={() => setChartType('temperature')}
                      className={`px-3 py-2 rounded-md text-sm ${
                        chartType === 'temperature' 
                          ? 'bg-emerald-700 text-white shadow-inner' 
                          : 'text-emerald-300 hover:bg-emerald-800/70'
                      } transition-colors duration-300`}
                    >
                      Temperature
                    </button>
                    <button
                      onClick={() => setChartType('precipitation')}
                      className={`px-3 py-2 rounded-md text-sm ${
                        chartType === 'precipitation' 
                          ? 'bg-emerald-700 text-white shadow-inner' 
                          : 'text-emerald-300 hover:bg-emerald-800/70'
                      } transition-colors duration-300`}
                    >
                      Precipitation
                    </button>
                    <button
                      onClick={() => setChartType('humidity')}
                      className={`px-3 py-2 rounded-md text-sm ${
                        chartType === 'humidity' 
                          ? 'bg-emerald-700 text-white shadow-inner' 
                          : 'text-emerald-300 hover:bg-emerald-800/70'
                      } transition-colors duration-300`}
                    >
                      Humidity
                    </button>
                  </div>
                )}
                
                <div className="relative">
                  <select
                    id="time-range"
                    name="time-range"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="block w-full rounded-lg border-white/20 bg-white/10 backdrop-blur-sm py-2 pl-3 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 text-sm shadow-md"
                  >
                    <option value="all">All Days</option>
                    <option value="7days">7 Days</option>
                    <option value="3days">3 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-emerald-900/80 to-green-900/80 rounded-2xl p-6 border border-white/20 shadow-xl backdrop-blur-sm mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-4">Current Weather</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-6 sm:mb-0">
              <div className="bg-gradient-to-br from-emerald-800/80 to-green-800/60 p-5 rounded-xl mr-6 border border-white/10 shadow-lg">
                {weatherData.current?.weather && weatherData.current.weather.length > 0 
                  ? getWeatherIcon(weatherData.current.weather[0].icon, "h-12 w-12")
                  : <SunIcon className="h-12 w-12 text-yellow-400" />}
              </div>
              <div>
                <div className="text-5xl font-bold text-white">{Math.round(weatherData.current?.temp || 0)}°C</div>
                <div className="text-xl text-emerald-300 font-medium capitalize mt-1">
                  {weatherData.current?.weather && weatherData.current.weather.length > 0 
                    ? weatherData.current.weather[0].main 
                    : "Clear"}
                </div>
                <div className="text-gray-300 text-sm mt-1">Feels like: {Math.round(weatherData.current?.feels_like || 0)}°C</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm border border-white/20 hover:border-emerald-400/30 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="text-gray-400 flex justify-center mb-1">
                  <WindIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-gray-300 text-xs">Wind</div>
                <div className="text-xl font-bold text-white">{Math.round((weatherData.current?.wind_speed || 0) * 3.6)} km/h</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm border border-white/20 hover:border-emerald-400/30 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="text-gray-400 flex justify-center mb-1">
                  <CloudIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-gray-300 text-xs">Humidity</div>
                <div className="text-xl font-bold text-white">{weatherData.current?.humidity || 0}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm border border-white/20 hover:border-emerald-400/30 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="text-gray-400 flex justify-center mb-1">
                  <AdjustmentsHorizontalIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="text-gray-300 text-xs">Pressure</div>
                <div className="text-xl font-bold text-white">{weatherData.current?.pressure || 1013} hPa</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm border border-white/20 hover:border-emerald-400/30 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="text-gray-400 flex justify-center mb-1">
                  <CloudRainIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-gray-300 text-xs">Precipitation</div>
                <div className="text-xl font-bold text-white">
                  {weatherData.hourly && weatherData.hourly.length > 0 
                    ? Math.round((weatherData.hourly[0].pop || 0) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* View selection based on viewMode */}
        {viewMode === 'list' ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <SunIcon className="h-7 w-7 mr-3 text-amber-400" />
                Weather Forecast
              </h2>
              <p className="text-emerald-200">Next {weatherData.daily.length} days</p>
            </div>
            
            <div className="space-y-4">
              {weatherData.daily.map((day, index) => (
                <div 
                  key={day.dt} 
                  className="bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-[1.01]"
                >
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center">
                      <div className="bg-emerald-900/60 p-3 rounded-lg mr-3 shadow-md">
                        {day.weather && day.weather.length > 0 
                          ? getWeatherIcon(day.weather[0].icon)
                          : <SunIcon className="h-6 w-6 text-yellow-400" />}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white">{index === 0 ? 'Today' : formatDate(day.dt)}</div>
                        <div className="text-emerald-300 text-sm capitalize">
                          {day.weather && day.weather.length > 0 ? day.weather[0].main : "Clear"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Temp</div>
                      <div className="font-bold text-xl text-white">{Math.round(day.temp.day)}°C</div>
                    </div>
                    
                    <div className="text-center hidden md:block">
                      <div className="text-sm text-gray-400">Min/Max</div>
                      <div className="font-bold text-white">{Math.round(day.temp.min)}°/{Math.round(day.temp.max)}°C</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Humidity</div>
                      <div className="font-bold text-white">{Math.round(day.humidity)}%</div>
                    </div>
                    
                    <div className="text-center hidden md:block">
                      <div className="text-sm text-gray-400">Wind</div>
                      <div className="font-bold text-white">{Math.round(day.wind_speed * 3.6)} km/h</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Precipitation</div>
                      <div className="font-bold text-white">{Math.round(day.pop * 100)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Historical Data */}
            <div className="mt-10 pt-6 border-t border-white/10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <CalendarDaysIcon className="h-7 w-7 mr-3 text-emerald-400" />
                  Historical Weather
                </h2>
                <p className="text-emerald-200">Previous 7 days</p>
              </div>
              
              <div className="space-y-4">
                {weatherData.historic?.map((day) => (
                  <div 
                    key={day.date} 
                    className="bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                      <div className="flex items-center">
                        <div className="bg-emerald-900/60 p-3 rounded-lg mr-3 shadow-md">
                          {getWeatherIcon(day.icon)}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="text-emerald-300 text-sm capitalize">{day.weather}</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Avg Temp</div>
                        <div className="font-bold text-xl text-white">{Math.round(day.temp.avg)}°C</div>
                      </div>
                      
                      <div className="text-center hidden md:block">
                        <div className="text-sm text-gray-400">Min/Max</div>
                        <div className="font-bold text-white">{Math.round(day.temp.min)}°/{Math.round(day.temp.max)}°C</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Humidity</div>
                        <div className="font-bold text-white">{day.humidity}%</div>
                      </div>
                      
                      <div className="text-center hidden md:block">
                        <div className="text-sm text-gray-400">Wind</div>
                        <div className="font-bold text-white">{Math.round(day.wind_speed * 3.6)} km/h</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="inline-flex items-center px-3 py-1 bg-emerald-800/40 text-emerald-300 text-xs font-medium rounded-full">
                          <ClockIcon className="h-4 w-4 mr-1.5" />
                          Historical Data
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
            {/* Chart View */}
            {chartType === 'temperature' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Temperature Trend (°C)</h3>
                  <div className="flex space-x-3">
                    <span className="inline-flex items-center text-xs text-blue-300">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                      Min
                    </span>
                    <span className="inline-flex items-center text-xs text-red-300">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                      Max
                    </span>
                    <span className="inline-flex items-center text-xs text-emerald-300">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                      Average
                    </span>
                  </div>
                </div>
                
                {/* Temperature Chart - SVG representation */}
                <div className="h-80 relative mb-10 bg-gradient-to-b from-emerald-900/40 to-green-900/30 rounded-xl p-5 border border-white/10 group overflow-hidden">
                  {/* Temperature chart */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderTemperatureChart()}
                  
                  {/* Gradient overlay */}
                  <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-green-900/80 to-transparent"></div>
                </div>
              </>
            )}
            
            {chartType === 'precipitation' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Precipitation Probability (%)</h3>
                  <div className="flex space-x-3">
                    <span className="inline-flex items-center text-xs text-blue-300">
                      <div className="w-3 h-3 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-1"></div>
                      Precipitation
                    </span>
                  </div>
                </div>
                
                {/* Precipitation Chart */}
                <div className="h-64 relative mb-10 bg-gradient-to-b from-emerald-900/40 to-green-900/30 rounded-xl p-5 border border-white/10 group overflow-hidden">
                  {/* Precipitation chart */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderPrecipitationChart()}
                  
                  {/* Gradient overlay */}
                  <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-green-900/80 to-transparent"></div>
                </div>
              </>
            )}
            
            {chartType === 'humidity' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Humidity Levels (%)</h3>
                  <div className="flex space-x-3">
                    <span className="inline-flex items-center text-xs text-blue-300">
                      <div className="w-3 h-3 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full mr-1"></div>
                      Humidity
                    </span>
                  </div>
                </div>
                
                {/* Humidity Chart */}
                <div className="h-64 relative mb-10 bg-gradient-to-b from-emerald-900/40 to-green-900/30 rounded-xl p-5 border border-white/10 group overflow-hidden">
                  {/* Humidity chart */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderHumidityChart()}
                  
                  {/* Gradient overlay */}
                  <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-green-900/80 to-transparent"></div>
                </div>
              </>
            )}
            
            {/* Detailed day-by-day forecast */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Day-by-Day Weather Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Historical data */}
                {getFilteredData().historicData.map((day) => (
                  <div 
                    key={`summary-hist-${day.date}`}
                    className="group bg-emerald-900/40 rounded-xl p-4 flex flex-col items-center backdrop-blur-sm hover:bg-emerald-900/60 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/10 hover:border-emerald-400/50"
                    onMouseEnter={() => setHoveredDay(new Date(day.date).getTime())}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="text-xs text-emerald-300 mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-800/60 to-green-800/40 rounded-full mb-2 mt-1 shadow-md group-hover:shadow-lg transition-all duration-300">
                      {getWeatherIcon(day.icon, "h-8 w-8")}
                    </div>
                    <p className="text-white text-base font-medium capitalize">{day.weather}</p>
                    <div className="mt-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                      <p className="text-sm text-white font-bold">{Math.round(day.temp.avg)}°C</p>
                    </div>
                    
                    {/* Additional details on hover */}
                    <div className={`mt-3 w-full space-y-2 overflow-hidden transition-all duration-300 ${hoveredDay === new Date(day.date).getTime() ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Min/Max:</span>
                        <span className="text-white">{Math.round(day.temp.min)}°/{Math.round(day.temp.max)}°C</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Humidity:</span>
                        <span className="text-white">{day.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Wind:</span>
                        <span className="text-white">{Math.round(day.wind_speed * 3.6)} km/h</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-800/40 text-xs text-emerald-300 rounded-full">
                        Historical
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Forecast data */}
                {getFilteredData().forecastData.map((day, index) => (
                  <div 
                    key={`summary-forecast-${day.dt}`}
                    className="group bg-blue-900/40 rounded-xl p-4 flex flex-col items-center backdrop-blur-sm hover:bg-blue-900/60 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/10 hover:border-blue-400/50"
                    onMouseEnter={() => setHoveredDay(day.dt)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="text-xs text-blue-300 mb-1">
                      {index === 0 ? 'Today' : formatDate(day.dt)}
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-800/60 to-indigo-800/40 rounded-full mb-2 mt-1 shadow-md group-hover:shadow-lg transition-all duration-300">
                      {day.weather && day.weather.length > 0 
                        ? getWeatherIcon(day.weather[0].icon, "h-8 w-8")
                        : <SunIcon className="h-8 w-8 text-yellow-400" />}
                    </div>
                    <p className="text-white text-base font-medium capitalize">
                      {day.weather && day.weather.length > 0 ? day.weather[0].main : "Clear"}
                    </p>
                    <div className="mt-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                      <p className="text-sm text-white font-bold">{Math.round(day.temp.day)}°C</p>
                    </div>
                    
                    {/* Additional details on hover */}
                    <div className={`mt-3 w-full space-y-2 overflow-hidden transition-all duration-300 ${hoveredDay === day.dt ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Min/Max:</span>
                        <span className="text-white">{Math.round(day.temp.min)}°/{Math.round(day.temp.max)}°C</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Humidity:</span>
                        <span className="text-white">{Math.round(day.humidity)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Wind:</span>
                        <span className="text-white">{Math.round(day.wind_speed * 3.6)} km/h</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Precip:</span>
                        <span className="text-white">{Math.round(day.pop * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-blue-800/40 text-xs text-blue-300 rounded-full">
                        Forecast
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Hourly Forecast */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <ClockIcon className="h-7 w-7 mr-3 text-emerald-400" />
            Hourly Forecast
          </h3>
          
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex space-x-4 min-w-full">
              {weatherData.hourly?.slice(0, 12).map((hour, index) => (
                <div 
                  key={`hour-${hour.dt}`}
                  className="flex-shrink-0 w-24 p-3 bg-gradient-to-b from-emerald-900/40 to-green-900/30 backdrop-blur-sm rounded-lg border border-white/10 hover:border-emerald-400/30 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-center text-white mb-1">
                    {index === 0 ? 'Now' : formatTime(hour.dt)}
                  </div>
                  <div className="flex justify-center my-2">
                    {hour.weather && hour.weather.length > 0 
                      ? getWeatherIcon(hour.weather[0].icon, "h-8 w-8")
                      : <SunIcon className="h-8 w-8 text-yellow-400" />}
                  </div>
                  <div className="text-center font-bold text-xl text-white mb-1">{Math.round(hour.temp)}°C</div>
                  <div className="text-center text-xs text-blue-300">{Math.round((hour.pop || 0) * 100)}% <span className="text-gray-400">precip</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-300">
          <p>Weather data provided by OpenWeatherMap</p>
          <p className="mt-1">
            <span className="text-emerald-400">Note:</span> Historical data is simulated for demonstration purposes
          </p>
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

        @keyframes nonstriker-ready {
          0% { transform: translateX(0); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }
        .animate-nonstriker-ready {
          animation: nonstriker-ready 5s ease-in-out infinite;
        }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1200 { animation-delay: 1.2s; }
      `}</style>
    </div>
  );

  // Function to render temperature chart
  function renderTemperatureChart() {
    const { historicData, forecastData } = getFilteredData();
    const chartData = getChartData();
    
    // Skip rendering if no data
    if ((!historicData.length && !forecastData.length) || 
        (!chartData.historicMin?.length && !chartData.forecastMin?.length)) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-emerald-300">No temperature data available</p>
        </div>
      );
    }
    
    const totalDays = historicData.length + forecastData.length;
    const dayWidth = Math.min(80, 800 / totalDays); // Adjust width based on number of days
    const spaceBetween = totalDays > 10 ? 5 : 10;
    const svgWidth = (dayWidth + spaceBetween) * totalDays + 100; // Extra space for margins
    
    const maxTemp = Math.max(
      ...chartData.historicMax || [],
      ...chartData.forecastMax || []
    );
    const minTemp = Math.min(
      ...chartData.historicMin || [],
      ...chartData.forecastMin || []
    );
    
    // Add padding to temperature range
    const yMax = Math.ceil(maxTemp) + 5;
    const yMin = Math.floor(minTemp) - 5;
    const yRange = yMax - yMin;
    
    // Calculate scales
    const xOffset = 50; // Left margin
    const yOffset = 30; // Top margin
    const chartHeight = 220; // Available height for chart
    
    // Helper function to calculate x position
    const getX = (index: number, isHistoric: boolean) => {
      if (isHistoric) {
        return xOffset + index * (dayWidth + spaceBetween);
      } else {
        return xOffset + (historicData.length * (dayWidth + spaceBetween)) + index * (dayWidth + spaceBetween);
      }
    };
    
    // Helper function to calculate y position
    const getY = (temp: number) => {
      return yOffset + chartHeight - ((temp - yMin) / yRange) * chartHeight;
    };
    
    return (
      <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} 280`} preserveAspectRatio="xMidYMid meet">
        {/* Create gradient definitions */}
        <defs>
          <linearGradient id="temp-min-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
          </linearGradient>
          <linearGradient id="temp-max-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.2)" />
          </linearGradient>
          <linearGradient id="temp-avg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
          </linearGradient>
          
          {/* Add glow effect for lines */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* X-axis and Y-axis */}
        <line x1={xOffset} y1={yOffset + chartHeight} x2={svgWidth - 50} y2={yOffset + chartHeight} stroke="#4B5563" strokeWidth="1" />
        <line x1={xOffset} y1={yOffset} x2={xOffset} y2={yOffset + chartHeight} stroke="#4B5563" strokeWidth="1" />
        
        {/* Y-axis labels and grid lines */}
        {Array.from({ length: 6 }, (_, i) => {
          const temp = yMin + (i * (yRange / 5));
          const y = getY(temp);
          return (
            <g key={`y-${i}`}>
              <text x={xOffset - 10} y={y + 5} textAnchor="end" fill="#D1FAE5" fontSize="12">
                {Math.round(temp)}°C
              </text>
              <line 
                x1={xOffset} 
                y1={y} 
                x2={svgWidth - 50} 
                y2={y} 
                stroke="#374151" 
                strokeWidth="1" 
                strokeDasharray="4,4" 
                opacity="0.6"
              />
            </g>
          );
        })}
        
        {/* Dividing line between historical and forecast data */}
        {historicData.length > 0 && forecastData.length > 0 && (
          <>
            <line 
              x1={xOffset + (historicData.length * (dayWidth + spaceBetween)) - spaceBetween/2} 
              y1={yOffset} 
              x2={xOffset + (historicData.length * (dayWidth + spaceBetween)) - spaceBetween/2} 
              y2={yOffset + chartHeight} 
              stroke="#6B7280" 
              strokeWidth="1.5" 
              strokeDasharray="6,3" 
            />
            <text 
              x={xOffset + (historicData.length * (dayWidth + spaceBetween)) - spaceBetween/2} 
              y={yOffset - 10} 
              textAnchor="middle" 
              fill="#D1FAE5" 
              fontSize="12" 
              fontWeight="bold"
            >
              Today
            </text>
          </>
        )}
        
        {/* X-axis labels */}
        {historicData.map((day, i) => (
          <text 
            key={`x-historic-${i}`}
            x={getX(i, true) + dayWidth/2}
            y={yOffset + chartHeight + 20}
            textAnchor="middle"
            fill="#D1FAE5"
            fontSize="12"
          >
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </text>
        ))}
        
        {forecastData.map((day, i) => (
          <text 
            key={`x-forecast-${i}`}
            x={getX(i, false) + dayWidth/2}
            y={yOffset + chartHeight + 20}
            textAnchor="middle"
            fill="#D1FAE5"
            fontSize="12"
          >
            {i === 0 ? 'Today' : formatDayOfWeek(day.dt)}
          </text>
        ))}
        
        {/* Historical Min temperature line with gradient */}
        {chartData.historicMin?.length > 0 && (
          <>
            <path
              d={`
                M ${getX(0, true)} ${getY(chartData.historicMin[0])}
                ${chartData.historicMin.slice(1).map((temp, i) => 
                  `L ${getX(i+1, true)} ${getY(temp)}`
                ).join(' ')}
              `}
              fill="none"
              stroke="url(#temp-min-gradient)"
              strokeWidth="3"
              filter="url(#glow)"
              className="opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Data points for min temp */}
            {chartData.historicMin.map((temp, i) => (
              <circle
                key={`hist-min-pt-${i}`}
                cx={getX(i, true) + dayWidth/2}
                cy={getY(temp)}
                r="4"
                fill="#3B82F6"
                className="animate-pulse-slow"
              />
            ))}
          </>
        )}
        
        {/* Historical Max temperature line with gradient */}
        {chartData.historicMax?.length > 0 && (
          <>
            <path
              d={`
                M ${getX(0, true)} ${getY(chartData.historicMax[0])}
                ${chartData.historicMax.slice(1).map((temp, i) => 
                  `L ${getX(i+1, true)} ${getY(temp)}`
                ).join(' ')}
              `}
              fill="none"
              stroke="url(#temp-max-gradient)"
              strokeWidth="3"
              filter="url(#glow)"
              className="opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Data points for max temp */}
            {chartData.historicMax.map((temp, i) => (
              <circle
                key={`hist-max-pt-${i}`}
                cx={getX(i, true) + dayWidth/2}
                cy={getY(temp)}
                r="4"
                fill="#EF4444"
                className="animate-pulse-slow animation-delay-500"
              />
            ))}
          </>
        )}
        
        {/* Historical Avg temperature line with gradient */}
        {chartData.historicAvg?.length > 0 && (
          <>
            <path
              d={`
                M ${getX(0, true)} ${getY(chartData.historicAvg[0])}
                ${chartData.historicAvg.slice(1).map((temp, i) => 
                  `L ${getX(i+1, true)} ${getY(temp)}`
                ).join(' ')}
              `}
              fill="none"
              stroke="url(#temp-avg-gradient)"
              strokeWidth="4"
              filter="url(#glow)"
              className="opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Data points for avg temp */}
            {chartData.historicAvg.map((temp, i) => (
              <circle
                key={`hist-avg-pt-${i}`}
                cx={getX(i, true) + dayWidth/2}
                cy={getY(temp)}
                r="5"
                fill="#10B981"
                className="animate-pulse-slow animation-delay-300"
                stroke="#10B981"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            ))}
          </>
        )}
        
        {/* Forecast Min temperature line with gradient */}
        {chartData.forecastMin?.length > 0 && (
          <>
            <path
              d={`
                M ${getX(0, false)} ${getY(chartData.forecastMin[0])}
                ${chartData.forecastMin.slice(1).map((temp, i) => 
                  `L ${getX(i+1, false)} ${getY(temp)}`
                ).join(' ')}
              `}
              fill="none"
              stroke="url(#temp-min-gradient)"
              strokeWidth="3"
              strokeDasharray="0"
              filter="url(#glow)"
              className="opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Data points for min temp */}
            {chartData.forecastMin.map((temp, i) => (
              <circle
                key={`forecast-min-pt-${i}`}
                cx={getX(i, false) + dayWidth/2}
                cy={getY(temp)}
                r="4"
                fill="#3B82F6"
                className="animate-pulse-slow"
              />
            ))}
          </>
        )}
        
        {/* Forecast Max temperature line with gradient */}
        {chartData.forecastMax?.length > 0 && (
          <>
            <path
              d={`
                M ${getX(0, false)} ${getY(chartData.forecastMax[0])}
                ${chartData.forecastMax.slice(1).map((temp, i) => 
                  `L ${getX(i+1, false)} ${getY(temp)}`
                ).join(' ')}
              `}
              fill="none"
              stroke="url(#temp-max-gradient)"
              strokeWidth="3"
              strokeDasharray="0"
              filter="url(#glow)"
              className="opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Data points for max temp */}
            {chartData.forecastMax.map((temp, i) => (
              <circle
                key={`forecast-max-pt-${i}`}
                cx={getX(i, false) + dayWidth/2}
                cy={getY(temp)}
                r="4"
                fill="#EF4444"
                className="animate-pulse-slow animation-delay-500"
              />
            ))}
          </>
        )}
        
        {/* Forecast Avg temperature line with gradient */}
        {chartData.forecastAvg?.length > 0 && (
          <>
            <path
              d={`
                M ${getX(0, false)} ${getY(chartData.forecastAvg[0])}
                ${chartData.forecastAvg.slice(1).map((temp, i) => 
                  `L ${getX(i+1, false)} ${getY(temp)}`
                ).join(' ')}
              `}
              fill="none"
              stroke="url(#temp-avg-gradient)"
              strokeWidth="4"
              filter="url(#glow)"
              className="opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Data points for avg temp */}
            {chartData.forecastAvg.map((temp, i) => (
              <circle
                key={`forecast-avg-pt-${i}`}
                cx={getX(i, false) + dayWidth/2}
                cy={getY(temp)}
                r="5"
                fill="#10B981"
                className="animate-pulse-slow animation-delay-300"
                stroke="#10B981"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            ))}
          </>
        )}
      </svg>
    );
  }

  // Function to render precipitation chart
  function renderPrecipitationChart() {
    const { historicData, forecastData } = getFilteredData();
    const chartData = getChartData();
    
    // Skip rendering if no data
    if ((!historicData.length && !forecastData.length) || 
        (!chartData.historicData && !chartData.forecastData)) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-emerald-300">No precipitation data available</p>
        </div>
      );
    }
    
    const totalDays = historicData.length + forecastData.length;
    const barWidth = 30;
    const spaceBetween = 20;
    const svgWidth = (barWidth + spaceBetween) * totalDays + 100; // Extra space for margins
    
    // Calculate scales
    const xOffset = 50; // Left margin
    const yOffset = 30; // Top margin
    const chartHeight = 160; // Available height for chart
    
    // Helper function to calculate x position
    const getX = (index: number, isHistoric: boolean) => {
      if (isHistoric) {
        return xOffset + index * (barWidth + spaceBetween);
      } else {
        return xOffset + (historicData.length * (barWidth + spaceBetween)) + index * (barWidth + spaceBetween);
      }
    };
    
    return (
      <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} 220`} preserveAspectRatio="xMidYMid meet">
        {/* Create gradient definitions */}
        <defs>
          <linearGradient id="precip-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.9)" />
            <stop offset="100%" stopColor="rgba(2, 132, 199, 0.4)" />
          </linearGradient>
          
          <linearGradient id="forecast-precip-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.9)" />
            <stop offset="100%" stopColor="rgba(30, 58, 138, 0.4)" />
          </linearGradient>
          
          {/* Add glow effect */}
          <filter id="glow-precip">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* X-axis and Y-axis */}
        <line x1={xOffset} y1={yOffset + chartHeight} x2={svgWidth - 50} y2={yOffset + chartHeight} stroke="#4B5563" strokeWidth="1" />
        <line x1={xOffset} y1={yOffset} x2={xOffset} y2={yOffset + chartHeight} stroke="#4B5563" strokeWidth="1" />
        
        {/* Y-axis labels and grid lines */}
        {[0, 25, 50, 75, 100].map((percent, i) => {
          const y = yOffset + chartHeight - (percent / 100) * chartHeight;
          return (
            <g key={`y-precip-${i}`}>
              <text x={xOffset - 10} y={y + 5} textAnchor="end" fill="#D1FAE5" fontSize="12">
                {percent}%
              </text>
              <line 
                x1={xOffset} 
                y1={y} 
                x2={svgWidth - 50} 
                y2={y} 
                stroke="#374151" 
                strokeWidth="1" 
                strokeDasharray="4,4" 
                opacity="0.6"
              />
            </g>
          );
        })}
        
        {/* Dividing line between historical and forecast data */}
        {historicData.length > 0 && forecastData.length > 0 && (
          <>
            <line 
              x1={xOffset + (historicData.length * (barWidth + spaceBetween)) - spaceBetween/2} 
              y1={yOffset} 
              x2={xOffset + (historicData.length * (barWidth + spaceBetween)) - spaceBetween/2} 
              y2={yOffset + chartHeight} 
              stroke="#6B7280" 
              strokeWidth="1.5" 
              strokeDasharray="6,3" 
            />
            <text 
              x={xOffset + (historicData.length * (barWidth + spaceBetween)) - spaceBetween/2} 
              y={yOffset - 10} 
              textAnchor="middle" 
              fill="#D1FAE5" 
              fontSize="12" 
              fontWeight="bold"
            >
              Today
            </text>
          </>
        )}
        
        {/* X-axis labels */}
        {historicData.map((day, i) => (
          <text 
            key={`x-precip-hist-${i}`}
            x={getX(i, true) + barWidth/2}
            y={yOffset + chartHeight + 20}
            textAnchor="middle"
            fill="#D1FAE5"
            fontSize="12"
          >
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </text>
        ))}
        
        {forecastData.map((day, i) => (
          <text 
            key={`x-precip-forecast-${i}`}
            x={getX(i, false) + barWidth/2}
            y={yOffset + chartHeight + 20}
            textAnchor="middle"
            fill="#D1FAE5"
            fontSize="12"
          >
            {i === 0 ? 'Today' : formatDayOfWeek(day.dt)}
          </text>
        ))}
        
        {/* Historical precipitation bars */}
        {chartData.historicData?.map((precip, i) => (
          <rect
            key={`hist-precip-${i}`}
            x={getX(i, true)}
            y={yOffset + chartHeight - (precip * chartHeight)}
            width={barWidth}
            height={precip * chartHeight}
            fill="url(#precip-gradient)"
            rx="4"
            filter="url(#glow-precip)"
            className="opacity-80 hover:opacity-100 transition-opacity duration-300"
          >
            {/* Animation */}
            <animate 
              attributeName="height" 
              from="0" 
              to={precip * chartHeight} 
              dur="1s" 
              begin="0s" 
              fill="freeze" 
            />
            <animate 
              attributeName="y" 
              from={yOffset + chartHeight} 
              to={yOffset + chartHeight - (precip * chartHeight)} 
              dur="1s" 
              begin="0s" 
              fill="freeze" 
            />
          </rect>
        ))}
        
        {/* Forecast precipitation bars */}
        {chartData.forecastData?.map((precip, i) => (
          <rect
            key={`forecast-precip-${i}`}
            x={getX(i, false)}
            y={yOffset + chartHeight - (precip * chartHeight)}
            width={barWidth}
            height={precip * chartHeight}
            fill="url(#forecast-precip-gradient)"
            rx="4"
            filter="url(#glow-precip)"
            className="opacity-80 hover:opacity-100 transition-opacity duration-300"
          >
            {/* Animation */}
            <animate 
              attributeName="height" 
              from="0" 
              to={precip * chartHeight} 
              dur="1s" 
              begin="0s" 
              fill="freeze" 
            />
            <animate 
              attributeName="y" 
              from={yOffset + chartHeight} 
              to={yOffset + chartHeight - (precip * chartHeight)} 
              dur="1s" 
              begin="0s" 
              fill="freeze" 
            />
          </rect>
        ))}
        
        {/* Percentage labels on bars */}
        {chartData.historicData?.map((precip, i) => {
          const value = Math.round(precip * 100);
          // Only show label if value is significant
          if (value < 5) return null;
          
          return (
            <text 
              key={`hist-precip-label-${i}`}
              x={getX(i, true) + barWidth/2}
              y={yOffset + chartHeight - (precip * chartHeight) - 5}
              textAnchor="middle"
              fill="#D1FAE5"
              fontSize="10"
              fontWeight="bold"
            >
              {value}%
            </text>
          );
        })}
        
        {chartData.forecastData?.map((precip, i) => {
          const value = Math.round(precip * 100);
          // Only show label if value is significant
          if (value < 5) return null;
          
          return (
            <text 
              key={`forecast-precip-label-${i}`}
              x={getX(i, false) + barWidth/2}
              y={yOffset + chartHeight - (precip * chartHeight) - 5}
              textAnchor="middle"
              fill="#D1FAE5"
              fontSize="10"
              fontWeight="bold"
            >
              {value}%
            </text>
          );
        })}
      </svg>
    );
  }

// Function to render humidity chart
function renderHumidityChart() {
    const { historicData, forecastData } = getFilteredData();
    const chartData = getChartData();
    
    // Skip rendering if no data
    if ((!historicData.length && !forecastData.length) || 
        (!chartData.historicData && !chartData.forecastData)) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-emerald-300">No humidity data available</p>
        </div>
      );
    }
    
    const totalDays = historicData.length + forecastData.length;
    const segmentWidth = Math.min(60, 750 / totalDays); // Adjust width based on number of days
    const spaceBetween = totalDays > 10 ? 10 : 15;
    const svgWidth = (segmentWidth + spaceBetween) * totalDays + 100; // Extra space for margins
    
    // Calculate scales
    const xOffset = 50; // Left margin
    const yOffset = 30; // Top margin
    const chartHeight = 160; // Available height for chart
    
    // Helper function to calculate x position
    const getX = (index: number, isHistoric: boolean) => {
      if (isHistoric) {
        return xOffset + index * (segmentWidth + spaceBetween);
      } else {
        return xOffset + (historicData.length * (segmentWidth + spaceBetween)) + index * (segmentWidth + spaceBetween);
      }
    };
    
    // Helper function to calculate y position
    const getY = (humidity: number) => {
      return yOffset + chartHeight - (humidity / 100) * chartHeight;
    };
    
    return (
      <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} 220`} preserveAspectRatio="xMidYMid meet">
        {/* Create gradient definitions */}
        <defs>
          <linearGradient id="humidity-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
            <stop offset="100%" stopColor="rgba(5, 150, 105, 0.2)" />
          </linearGradient>
          
          <linearGradient id="humidity-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
          </linearGradient>
          
          <linearGradient id="humidity-forecast-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 209, 197, 0.8)" />
            <stop offset="100%" stopColor="rgba(79, 209, 197, 0.2)" />
          </linearGradient>
          
          <linearGradient id="humidity-forecast-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 209, 197, 0.4)" />
            <stop offset="100%" stopColor="rgba(79, 209, 197, 0.05)" />
          </linearGradient>
          
          {/* Add glow effect */}
          <filter id="glow-humidity">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* X-axis and Y-axis */}
        <line x1={xOffset} y1={yOffset + chartHeight} x2={svgWidth - 50} y2={yOffset + chartHeight} stroke="#4B5563" strokeWidth="1" />
        <line x1={xOffset} y1={yOffset} x2={xOffset} y2={yOffset + chartHeight} stroke="#4B5563" strokeWidth="1" />
        
        {/* Y-axis labels and grid lines */}
        {[0, 25, 50, 75, 100].map((percent, i) => {
          const y = yOffset + chartHeight - (percent / 100) * chartHeight;
          return (
            <g key={`y-humidity-${i}`}>
              <text x={xOffset - 10} y={y + 5} textAnchor="end" fill="#D1FAE5" fontSize="12">
                {percent}%
              </text>
              <line 
                x1={xOffset} 
                y1={y} 
                x2={svgWidth - 50} 
                y2={y} 
                stroke="#374151" 
                strokeWidth="1" 
                strokeDasharray="4,4" 
                opacity="0.6"
              />
            </g>
          );
        })}
        
        {/* Dividing line between historical and forecast data */}
        {historicData.length > 0 && forecastData.length > 0 && (
          <>
            <line 
              x1={xOffset + (historicData.length * (segmentWidth + spaceBetween)) - spaceBetween/2} 
              y1={yOffset} 
              x2={xOffset + (historicData.length * (segmentWidth + spaceBetween)) - spaceBetween/2} 
              y2={yOffset + chartHeight} 
              stroke="#6B7280" 
              strokeWidth="1.5" 
              strokeDasharray="6,3" 
            />
            <text 
              x={xOffset + (historicData.length * (segmentWidth + spaceBetween)) - spaceBetween/2} 
              y={yOffset - 10} 
              textAnchor="middle" 
              fill="#D1FAE5" 
              fontSize="12" 
              fontWeight="bold"
            >
              Today
            </text>
          </>
        )}
        
        {/* X-axis labels */}
        {historicData.map((day, i) => (
          <text 
            key={`x-humidity-hist-${i}`}
            x={getX(i, true) + segmentWidth/2}
            y={yOffset + chartHeight + 20}
            textAnchor="middle"
            fill="#D1FAE5"
            fontSize="12"
          >
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </text>
        ))}
        
        {forecastData.map((day, i) => (
          <text 
            key={`x-humidity-forecast-${i}`}
            x={getX(i, false) + segmentWidth/2}
            y={yOffset + chartHeight + 20}
            textAnchor="middle"
            fill="#D1FAE5"
            fontSize="12"
          >
            {i === 0 ? 'Today' : formatDayOfWeek(day.dt)}
          </text>
        ))}
        
        {/* Historical humidity area */}
        {chartData.historicData?.length > 0 && (
          <path
            d={`
              M ${getX(0, true)} ${yOffset + chartHeight}
              ${chartData.historicData.map((humidity, i) => 
                `L ${getX(i, true) + segmentWidth/2} ${getY(humidity)}`
              ).join(' ')}
              L ${getX(chartData.historicData.length-1, true) + segmentWidth} ${yOffset + chartHeight}
              Z
            `}
            fill="url(#humidity-area-gradient)"
            stroke="none"
            className="opacity-70 hover:opacity-90 transition-opacity duration-300"
          />
        )}
        
        {/* Historical humidity line */}
        {chartData.historicData?.length > 0 && (
          <path
            d={`
              M ${getX(0, true) + segmentWidth/2} ${getY(chartData.historicData[0])}
              ${chartData.historicData.slice(1).map((humidity, i) => 
                `L ${getX(i+1, true) + segmentWidth/2} ${getY(humidity)}`
              ).join(' ')}
            `}
            fill="none"
            stroke="url(#humidity-gradient)"
            strokeWidth="3"
            filter="url(#glow-humidity)"
            className="opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        )}
        
        {/* Forecast humidity area */}
        {chartData.forecastData?.length > 0 && (
          <path
            d={`
              M ${getX(0, false)} ${yOffset + chartHeight}
              ${chartData.forecastData.map((humidity, i) => 
                `L ${getX(i, false) + segmentWidth/2} ${getY(humidity)}`
              ).join(' ')}
              L ${getX(chartData.forecastData.length-1, false) + segmentWidth} ${yOffset + chartHeight}
              Z
            `}
            fill="url(#humidity-forecast-area-gradient)"
            stroke="none"
            className="opacity-70 hover:opacity-90 transition-opacity duration-300"
          />
        )}
        
        {/* Forecast humidity line */}
        {chartData.forecastData?.length > 0 && (
          <path
            d={`
              M ${getX(0, false) + segmentWidth/2} ${getY(chartData.forecastData[0])}
              ${chartData.forecastData.slice(1).map((humidity, i) => 
                `L ${getX(i+1, false) + segmentWidth/2} ${getY(humidity)}`
              ).join(' ')}
            `}
            fill="none"
            stroke="url(#humidity-forecast-gradient)"
            strokeWidth="3"
            filter="url(#glow-humidity)"
            className="opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        )}
        
        {/* Historical humidity dots */}
        {chartData.historicData?.map((humidity, i) => (
          <g key={`humidity-hist-dot-${i}`}>
            <circle
              cx={getX(i, true) + segmentWidth/2}
              cy={getY(humidity)}
              r="5"
              fill="#10B981"
              filter="url(#glow-humidity)"
              className="animate-pulse-slow"
            />
            <text
              x={getX(i, true) + segmentWidth/2}
              y={getY(humidity) - 10}
              textAnchor="middle"
              fill="#D1FAE5"
              fontSize="10"
              fontWeight="bold"
            >
              {humidity}%
            </text>
          </g>
        ))}
        
        {/* Forecast humidity dots */}
        {chartData.forecastData?.map((humidity, i) => (
          <g key={`humidity-forecast-dot-${i}`}>
            <circle
              cx={getX(i, false) + segmentWidth/2}
              cy={getY(humidity)}
              r="5"
              fill="#4FD1C5"
              filter="url(#glow-humidity)"
              className="animate-pulse-slow animation-delay-300"
            />
            <text
              x={getX(i, false) + segmentWidth/2}
              y={getY(humidity) - 10}
              textAnchor="middle"
              fill="#D1FAE5"
              fontSize="10"
              fontWeight="bold"
            >
              {humidity}%
            </text>
          </g>
        ))}
      </svg>
    );
  }
}