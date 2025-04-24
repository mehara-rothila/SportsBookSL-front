// src/components/weather/WeatherWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as weatherService from '@/services/weatherService';
import { SunIcon, CloudIcon, ArrowPathIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid';

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

const BoltIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      fillRule="evenodd"
      d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
      clipRule="evenodd"
    />
  </svg>
);

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  cityName?: string;
  facilityName?: string;
  facilityId?: string; // Added explicit facility ID prop
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  lat, 
  lng, 
  cityName, 
  facilityName, 
  facilityId: propFacilityId, 
  className = '' 
}) => {
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(propFacilityId || null);
  
  // Extract facility ID from URL if not provided as prop
  useEffect(() => {
    if (!facilityId) {
      const path = window.location.pathname;
      const matches = path.match(/\/facilities\/([a-zA-Z0-9]+)/);
      if (matches && matches[1]) {
        setFacilityId(matches[1]);
      }
    }
  }, [facilityId]);
  
  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let weatherData;
        
        // Use the same weather service call pattern as the analytics page
        if (lat && lng) {
          console.log(`WeatherWidget: Fetching by coordinates (lat=${lat}, lng=${lng})`);
          weatherData = await weatherService.getWeatherByCoordinates(lat, lng, facilityName);
        } else if (cityName) {
          console.log(`WeatherWidget: Fetching by city name (${cityName})`);
          weatherData = await weatherService.getWeatherByCity(cityName, facilityName);
        } else {
          throw new Error('No location data provided');
        }
        
        console.log('WeatherWidget: Weather data received', {
          temp: weatherData.current?.temp,
          weather: weatherData.current?.weather?.[0]?.main,
          location: weatherData.city?.name
        });
        
        setWeather(weatherData);
      } catch (err: any) {
        console.error('Error fetching weather in widget:', err);
        setError(typeof err === 'string' ? err : 'Could not load weather data');
      } finally {
        setLoading(false);
      }
    };
    
    if (lat && lng || cityName) {
      fetchWeather();
    } else {
      setLoading(false);
      setError('No location data provided');
    }
  }, [lat, lng, cityName, facilityName]);
  
  // Get appropriate weather icon based on code
  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode.substring(0, 2)) {
      case '01': // clear sky
        return <SunIcon className="h-10 w-10 text-yellow-400" />;
      case '02': // few clouds
      case '03': // scattered clouds
      case '04': // broken clouds
        return <CloudIcon className="h-10 w-10 text-gray-300" />;
      case '09': // shower rain
      case '10': // rain
        return <CloudRainIcon className="h-10 w-10 text-blue-400" />;
      case '11': // thunderstorm
        return <BoltIcon className="h-10 w-10 text-yellow-500" />;
      case '13': // snow
        return <svg className="h-10 w-10 text-gray-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" /></svg>;
      case '50': // mist
        return <CloudIcon className="h-10 w-10 text-gray-400" />;
      default:
        return <SunIcon className="h-10 w-10 text-yellow-400" />;
    }
  };
  
  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-emerald-900/60 to-green-900/50 rounded-2xl p-4 shadow-lg border border-white/20 ${className}`}>
        <div className="flex justify-center items-center h-32 text-white/70">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error || !weather) {
    return (
      <div className={`bg-gradient-to-br from-emerald-900/60 to-green-900/50 rounded-2xl p-4 shadow-lg border border-white/20 ${className}`}>
        <div className="text-center py-4">
          <CloudIcon className="h-10 w-10 mx-auto text-emerald-300/50 mb-2" />
          <p className="text-white/70 text-sm">Weather data unavailable</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-gradient-to-br from-emerald-900/60 to-green-900/50 rounded-2xl overflow-hidden shadow-lg border border-white/20 ${className}`}>
      {/* Header with location */}
      <div className="bg-gradient-to-r from-emerald-800/80 to-green-800/80 p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center">
          <CloudIcon className="h-5 w-5 mr-2 text-emerald-300" />
          Weather for {facilityName || weather.city?.name || cityName || 'This Location'}
        </h3>
      </div>
      
      {/* Current weather */}
      <div className="p-5">
        <div className="flex items-center mb-5">
          <div className="mr-4">
            {weather.current?.weather && weather.current.weather.length > 0 
              ? getWeatherIcon(weather.current.weather[0].icon)
              : <SunIcon className="h-10 w-10 text-yellow-400" />}
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{Math.round(weather.current?.temp || 0)}°C</div>
            <div className="text-emerald-300 capitalize">
              {weather.current?.weather && weather.current.weather.length > 0 
                ? weather.current.weather[0].description 
                : "Clear Sky"}
            </div>
          </div>
        </div>
        
        {/* Weather details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
            <div className="text-xs text-gray-300">Feels Like</div>
            <div className="text-lg font-bold text-white">{Math.round(weather.current?.feels_like || 0)}°C</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
            <div className="text-xs text-gray-300">Humidity</div>
            <div className="text-lg font-bold text-white">{weather.current?.humidity || 0}%</div>
          </div>
        </div>
        
        {/* 3-day forecast */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-sm font-medium text-emerald-300 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-2">
            {weather.daily?.slice(0, 3).map((day: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-300">
                  {index === 0 ? 'Today' : 
                   index === 1 ? 'Tomorrow' : 
                   weatherService.formatDate(day.dt).split(' ')[0]}
                </div>
                <div className="flex justify-center my-1">
                  {day.weather && day.weather.length > 0 
                    ? getWeatherIcon(day.weather[0].icon)
                    : <SunIcon className="h-6 w-6 text-yellow-400" />}
                </div>
                <div className="text-white text-sm font-bold">{Math.round(day.temp.day)}°</div>
                <div className="text-gray-400 text-xs">{Math.round(day.temp.min)}° / {Math.round(day.temp.max)}°</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Link to detailed weather */}
        {facilityId && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <Link 
              href={`/facilities/${facilityId}/weather`}
              className="inline-flex items-center text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              View detailed weather <ArrowUpRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;