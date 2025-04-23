'use client';

import { useState, useEffect } from 'react';

interface WeatherWidgetProps {
  locationName: string;
  facilityType: 'indoor' | 'outdoor';
  sportType: string;
  bookingDate?: Date;
}

// In a real app, this would come from an API
const mockWeatherData = {
  current: {
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    precipitation: 0,
    condition: 'partly-cloudy',
    description: 'Partly Cloudy',
    feelsLike: 30,
    uvIndex: 7,
    visibility: 10,
  },
  forecast: [
    {
      day: 'Today',
      temperature: { min: 24, max: 29 },
      condition: 'partly-cloudy',
      precipitation: 20,
      windSpeed: 12,
    },
    {
      day: 'Tomorrow',
      temperature: { min: 23, max: 30 },
      condition: 'sunny',
      precipitation: 0,
      windSpeed: 8,
    },
    {
      day: 'Wednesday',
      temperature: { min: 25, max: 32 },
      condition: 'sunny',
      precipitation: 0,
      windSpeed: 6,
    },
    {
      day: 'Thursday',
      temperature: { min: 26, max: 33 },
      condition: 'sunny',
      precipitation: 0,
      windSpeed: 10,
    },
    {
      day: 'Friday',
      temperature: { min: 24, max: 29 },
      condition: 'rain',
      precipitation: 80,
      windSpeed: 15,
    },
  ],
  alternatives: [
    {
      id: 'alt-1',
      name: 'Indoor Sports Complex',
      distance: 3.2,
      sportTypes: ['basketball', 'badminton', 'volleyball'],
      availability: true,
    },
    {
      id: 'alt-2',
      name: 'National Indoor Stadium',
      distance: 5.8,
      sportTypes: ['tennis', 'basketball'],
      availability: true,
    },
    {
      id: 'alt-3',
      name: 'City Sports Center',
      distance: 7.1,
      sportTypes: ['swimming', 'badminton'],
      availability: false,
    },
  ],
};

export default function WeatherWidget({ 
  locationName = 'Colombo', 
  facilityType = 'outdoor', 
  sportType = 'Cricket',
  bookingDate
}: WeatherWidgetProps) {
  const [suitabilityScore, setSuitabilityScore] = useState(75);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate suitability score based on weather and sport type
  useEffect(() => {
    // This would be a more complex calculation in a real app
    const forecast = mockWeatherData.forecast[selectedDay];
    
    if (facilityType === 'indoor') {
      setSuitabilityScore(100);
      return;
    }
    
    let score = 100;
    
    // Reduce score based on precipitation chance
    score -= forecast.precipitation * 0.8;
    
    // Reduce score based on wind speed for certain sports
    if (['Cricket', 'Badminton', 'Tennis'].includes(sportType)) {
      score -= forecast.windSpeed * 2;
    }
    
    // Temperature factors
    const avgTemp = (forecast.temperature.min + forecast.temperature.max) / 2;
    if (avgTemp > 35 || avgTemp < 15) {
      score -= 20;
    }
    
    // Ensure score is in 0-100 range
    score = Math.max(0, Math.min(100, score));
    setSuitabilityScore(Math.round(score));
  }, [facilityType, sportType, selectedDay]);
  
  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" fill="#FDB813" stroke="#FDB813" strokeWidth="2" />
            <path d="M12 3V2M12 22V21M3 12H2M22 12H21M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636" 
              stroke="#FDB813" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'partly-cloudy':
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="9" r="3" fill="#FDB813" stroke="#FDB813" strokeWidth="2" />
            <path d="M8 4V3M3 9H2M14 9H13M5.172 6.172L4.464 5.464M11.536 5.464L10.828 6.172" 
              stroke="#FDB813" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 16.5C3 14.015 5.015 12 7.5 12H13.5C15.985 12 18 14.015 18 16.5C18 18.985 15.985 21 13.5 21H7.5C5.015 21 3 18.985 3 16.5Z" 
              fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 15.5C3 13.015 5.015 11 7.5 11H16.5C18.985 11 21 13.015 21 15.5C21 17.985 18.985 20 16.5 20H7.5C5.015 20 3 17.985 3 15.5Z" 
              fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
            <path d="M7 11C7 8.79086 8.79086 7 11 7H13C15.2091 7 17 8.79086 17 11" 
              stroke="#93C5FD" strokeWidth="2" />
          </svg>
        );
      case 'rain':
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13.5C3 11.015 5.015 9 7.5 9H16.5C18.985 9 21 11.015 21 13.5C21 15.985 18.985 18 16.5 18H7.5C5.015 18 3 15.985 3 13.5Z" 
              fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
            <path d="M8 18L7 21M12 18L11 21M16 18L15 21" 
              stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" fill="#FDB813" stroke="#FDB813" strokeWidth="2" />
          </svg>
        );
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden">
      {/* Header with location and suitability score */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-white text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationName}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {facilityType === 'indoor' ? 'Indoor Facility' : 'Outdoor Facility'} • {sportType}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col items-start sm:items-end">
            <p className="text-blue-100 text-sm font-medium">Suitability Score</p>
            <div className="mt-1 w-full sm:w-auto bg-white/20 rounded-full h-4 relative backdrop-blur-sm overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  suitabilityScore >= 80 
                    ? 'bg-green-500' 
                    : suitabilityScore >= 60 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${suitabilityScore}%` }}
              >
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">{suitabilityScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className="p-6 animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <div className="w-28 h-28 rounded-full bg-gray-300"></div>
            <div className="w-2/3">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-gray-300 rounded"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Current weather and details */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Main weather icon and temperature */}
              <div 
                className={`relative flex-shrink-0 w-28 h-28 rounded-full ${
                  mockWeatherData.current.condition === 'sunny' || mockWeatherData.current.condition === 'partly-cloudy'
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-500' 
                    : mockWeatherData.current.condition === 'rain'
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                      : 'bg-gradient-to-br from-gray-300 to-gray-500'
                } shadow-lg flex items-center justify-center p-2 transform transition-transform hover:scale-105 duration-300`}
              >
                <div className="w-16 h-16 text-white">
                  {getConditionIcon(mockWeatherData.current.condition)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-xs font-semibold px-2 py-1 shadow-md">
                  {facilityType === 'indoor' ? 'INDOOR' : 'OUTDOOR'}
                </div>
              </div>
              
              <div className="text-center sm:text-left flex-grow">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  {mockWeatherData.current.temperature}°C
                  <span className="text-gray-500 text-lg font-normal ml-2">
                    Feels like {mockWeatherData.current.feelsLike}°C
                  </span>
                </h3>
                <p className="text-gray-600 text-lg mt-1">{mockWeatherData.current.description}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-gray-500">Humidity</span>
                    <span className="font-medium text-gray-700">{mockWeatherData.current.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-gray-500">Wind</span>
                    <span className="font-medium text-gray-700">{mockWeatherData.current.windSpeed} km/h</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-gray-500">Precipitation</span>
                    <span className="font-medium text-gray-700">{mockWeatherData.current.precipitation}%</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-gray-500">UV Index</span>
                    <span className="font-medium text-gray-700">{mockWeatherData.current.uvIndex} of 10</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 5-day forecast */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-500 mb-4">5-Day Forecast</h4>
              <div className="grid grid-cols-5 gap-2">
                {mockWeatherData.forecast.map((day, index) => (
                  <button
                    key={index}
                    className={`p-3 rounded-lg transition-all duration-300 hover:shadow-md ${
                      selectedDay === index 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-white/60 hover:bg-white border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedDay(index)}
                  >
                    <div className="text-center">
                      <p className={`text-sm font-medium ${selectedDay === index ? 'text-blue-700' : 'text-gray-700'}`}>
                        {day.day}
                      </p>
                      <div className="w-10 h-10 mx-auto my-2">
                        {getConditionIcon(day.condition)}
                      </div>
                      <div className="flex justify-center space-x-2 text-xs">
                        <span className="font-semibold text-gray-900">{day.temperature.max}°</span>
                        <span className="text-gray-500">{day.temperature.min}°</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-center space-x-1">
                        <span>{day.precipitation}%</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recommendations section */}
          <div>
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getSuitabilityColor(suitabilityScore)} mr-2`}></div>
                  <h4 className="font-medium text-gray-800">
                    {suitabilityScore >= 80 
                      ? 'Excellent conditions for your sport!' 
                      : suitabilityScore >= 60 
                        ? 'Acceptable conditions, but be prepared' 
                        : 'Poor conditions - consider alternatives'}
                  </h4>
                </div>
                {facilityType === 'outdoor' && suitabilityScore < 80 && (
                  <button 
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center"
                  >
                    {showAlternatives ? 'Hide Alternatives' : 'View Indoor Alternatives'}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-1 transition-transform duration-300 ${showAlternatives ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Alternative facilities section */}
            {showAlternatives && (
              <div className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm animate-slide-down">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Recommended Indoor Alternatives</h4>
                <div className="space-y-3">
                  {mockWeatherData.alternatives.map((alt) => (
                    <div 
                      key={alt.id} 
                      className={`p-4 rounded-lg border ${alt.availability ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} hover:shadow-md transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{alt.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {alt.sportTypes.join(', ')} • {alt.distance} km away
                          </p>
                        </div>
                        {alt.availability ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Booked
                          </span>
                        )}
                      </div>
                      {alt.availability && (
                        <div className="mt-3 text-right">
                          <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                            Book Instead
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}