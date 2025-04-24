'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as weatherService from '@/services/weatherService';
import { 
  ArrowPathIcon, 
  ChevronLeftIcon, 
  CalendarDaysIcon,
  CloudIcon,
  SunIcon,
  BoltIcon,
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

interface WeatherAnalyticsProps {
  facilityId: string;
  facilityName?: string;
  lat?: number;
  lng?: number;
  cityName?: string;
  onClose?: () => void;
  className?: string;
}

const WeatherAnalytics: React.FC<WeatherAnalyticsProps> = ({ 
  facilityId, 
  facilityName, 
  lat, 
  lng, 
  cityName,
  onClose,
  className = '' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<weatherService.WeatherData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  
  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: weatherService.WeatherData;
        
        if (lat !== undefined && lng !== undefined) {
          console.log(`WeatherAnalytics: Fetching data by coordinates (${lat}, ${lng})`);
          data = await weatherService.getWeatherByCoordinates(lat, lng, facilityName);
        } else if (cityName) {
          console.log(`WeatherAnalytics: Fetching data by city (${cityName})`);
          data = await weatherService.getWeatherByCity(cityName, facilityName);
        } else {
          throw new Error("No location data provided for weather analysis");
        }
        
        setWeatherData(data);
      } catch (err: any) {
        console.error('Error fetching weather analytics data:', err);
        setError(typeof err === 'string' ? err : err.message || 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [lat, lng, cityName, facilityName]);

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
  
  // Get weather icon based on icon code
  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode.substring(0, 2)) {
      case '01': // clear sky
        return <SunIcon className="h-6 w-6 text-yellow-400" />;
      case '02': // few clouds
      case '03': // scattered clouds
      case '04': // broken clouds
        return <CloudIcon className="h-6 w-6 text-gray-400" />;
      case '09': // shower rain
      case '10': // rain
        return <CloudRainIcon className="h-6 w-6 text-blue-400" />;
      case '11': // thunderstorm
        return <BoltIcon className="h-6 w-6 text-yellow-500" />;
      case '13': // snow
        return <svg className="h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" /></svg>;
      case '50': // mist
        return <CloudIcon className="h-6 w-6 text-gray-500" />;
      default:
        return <SunIcon className="h-6 w-6 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="ml-4 text-lg font-semibold text-white">Loading weather data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`flex flex-col justify-center items-center py-8 ${className}`}>
        <div className="bg-red-900/30 text-red-300 p-6 rounded-xl border border-red-500/30 max-w-md">
          <h2 className="text-xl font-bold mb-3">Error Loading Weather Data</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center backdrop-blur-sm border border-white/30"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2"/> Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!weatherData) {
    return (
      <div className={`flex flex-col justify-center items-center py-8 ${className}`}>
        <div className="bg-emerald-900/40 text-emerald-300 p-6 rounded-xl border border-emerald-500/30 max-w-md text-center">
          <CloudIcon className="h-12 w-12 mx-auto mb-3 text-emerald-400/60" />
          <h2 className="text-xl font-bold mb-2">No Weather Data Available</h2>
          <p className="mb-4">Unable to retrieve weather information for this facility.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-gradient-to-br from-emerald-900/80 to-green-900/70 rounded-2xl p-6 border border-white/20 shadow-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Weather Analysis
          </h2>
          <p className="text-emerald-300">
            <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
            7-day historical data and 3-day forecast
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2 bg-emerald-900/50 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md flex items-center ${
              viewMode === 'list' 
                ? 'bg-emerald-700 text-white' 
                : 'text-emerald-300 hover:bg-emerald-800/70'
            }`}
          >
            <svg className="h-5 w-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-2 rounded-md flex items-center ${
              viewMode === 'chart' 
                ? 'bg-emerald-700 text-white' 
                : 'text-emerald-300 hover:bg-emerald-800/70'
            }`}
          >
            <svg className="h-5 w-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Chart View
          </button>
        </div>
      </div>
      
      {/* Current Weather Card */}
      <div className="bg-gradient-to-br from-emerald-900/80 to-green-900/80 rounded-xl p-5 border border-white/20 shadow-lg backdrop-blur-sm mb-6">
        <h3 className="text-xl font-bold text-white mb-3">Current Weather</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-emerald-800/60 p-3 rounded-full mr-4">
              {weatherData.current?.weather && weatherData.current.weather.length > 0 
                ? getWeatherIcon(weatherData.current.weather[0].icon)
                : <SunIcon className="h-6 w-6 text-yellow-400" />}
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{Math.round(weatherData.current?.temp || 0)}°C</div>
              <div className="text-emerald-300 capitalize">
                {weatherData.current?.weather && weatherData.current.weather.length > 0 
                  ? weatherData.current.weather[0].main 
                  : "Clear"}
              </div>
              <div className="text-gray-300 text-sm">Feels like: {Math.round(weatherData.current?.feels_like || 0)}°C</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
              <div className="text-gray-400">Humidity</div>
              <div className="text-lg font-bold text-white">{weatherData.current?.humidity || 0}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
              <div className="text-gray-400">Wind</div>
              <div className="text-lg font-bold text-white">{Math.round((weatherData.current?.wind_speed || 0) * 3.6)} km/h</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* View selection based on viewMode */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <SunIcon className="h-5 w-5 mr-2 text-amber-400" />
              Weather Forecast (Next 3 Days)
            </h3>
            
            <div className="space-y-3">
              {weatherData.daily.slice(0, 3).map((day, index) => (
                <div 
                  key={day.dt} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                    <div className="flex items-center">
                      <div className="bg-emerald-900/60 p-2 rounded-full mr-3">
                        {day.weather && day.weather.length > 0 
                          ? getWeatherIcon(day.weather[0].icon)
                          : <SunIcon className="h-5 w-5 text-yellow-400" />}
                      </div>
                      <div>
                        <div className="font-medium text-white">{index === 0 ? 'Today' : formatDate(day.dt)}</div>
                        <div className="text-emerald-300 text-sm capitalize">
                          {day.weather && day.weather.length > 0 ? day.weather[0].main : "Clear"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Temp</div>
                      <div className="font-bold text-white">{Math.round(day.temp.day)}°C</div>
                    </div>
                    
                    <div className="text-center hidden md:block">
                      <div className="text-sm text-gray-400">Min/Max</div>
                      <div className="font-bold text-white">{Math.round(day.temp.min)}°/{Math.round(day.temp.max)}°C</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Humidity</div>
                      <div className="font-bold text-white">{Math.round(day.humidity)}%</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Precipitation</div>
                      <div className="font-bold text-white">{Math.round(day.pop * 100)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Historical Data */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-emerald-400" />
              Historical Weather (Previous 7 Days)
            </h3>
            
            <div className="space-y-3">
              {weatherData.historic?.map((day) => (
                <div 
                  key={day.date} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                    <div className="flex items-center">
                      <div className="bg-emerald-900/60 p-2 rounded-full mr-3">
                        {getWeatherIcon(day.icon)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div className="text-emerald-300 text-sm capitalize">{day.weather}</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg Temp</div>
                      <div className="font-bold text-white">{Math.round(day.temp.avg)}°C</div>
                    </div>
                    
                    <div className="text-center hidden md:block">
                      <div className="text-sm text-gray-400">Min/Max</div>
                      <div className="font-bold text-white">{Math.round(day.temp.min)}°/{Math.round(day.temp.max)}°C</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Humidity</div>
                      <div className="font-bold text-white">{day.humidity}%</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Wind</div>
                      <div className="font-bold text-white">{Math.round(day.wind_speed * 3.6)} km/h</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Temperature Chart */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">10-Day Temperature Trend (°C)</h3>
            <div className="flex space-x-3 mb-3">
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
            
            {/* Temperature Chart - SVG representation */}
            <div className="h-64 relative mb-8 bg-white/5 rounded-lg p-4 border border-white/10">
              <svg className="w-full h-full" viewBox="0 0 900 240">
                {/* X-axis labels - Historical data (past 7 days) */}
                {weatherData.historic?.map((day, i) => (
                  <text 
                    key={`x-historic-${i}`}
                    x={50 + (i * 80)}
                    y="220"
                    textAnchor="middle"
                    fill="#D1FAE5"
                    fontSize="10"
                  >
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </text>
                ))}
                
                {/* X-axis labels - Forecast data (next 3 days) */}
                {weatherData.daily.slice(0, 3).map((day, i) => (
                  <text 
                    key={`x-forecast-${i}`}
                    x={610 + (i * 80)}
                    y="220"
                    textAnchor="middle"
                    fill="#D1FAE5"
                    fontSize="10"
                  >
                    {formatDate(day.dt).split(' ')[0]}
                  </text>
                ))}
                
                {/* Y-axis labels */}
                {[0, 10, 20, 30, 40].map((temp, i) => (
                  <text
                    key={`y-${i}`}
                    x="40"
                    y={200 - (i * 40)}
                    textAnchor="end"
                    fill="#D1FAE5"
                    fontSize="10"
                  >
                    {temp}°C
                  </text>
                ))}
                
                {/* Dividing line between historical and forecast */}
                <line x1="570" y1="30" x2="570" y2="200" stroke="#4B5563" strokeWidth="1" strokeDasharray="5,5" />
                <text x="570" y="20" textAnchor="middle" fill="#D1FAE5" fontSize="10">Today</text>
                
                {/* Y-axis line */}
                <line x1="50" y1="30" x2="50" y2="200" stroke="#4B5563" strokeWidth="1" />
                
                {/* X-axis line */}
                <line x1="50" y1="200" x2="850" y2="200" stroke="#4B5563" strokeWidth="1" />
                
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1="50"
                    y1={40 + (i * 40)}
                    x2="850"
                    y2={40 + (i * 40)}
                    stroke="#374151"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                ))}
                
                {/* Historical Min temperature line */}
                <polyline
                  points={weatherData.historic?.map((day, i) => 
                    `${50 + (i * 80)},${200 - (day.temp.min * 4)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                
                {/* Historical Max temperature line */}
                <polyline
                  points={weatherData.historic?.map((day, i) => 
                    `${50 + (i * 80)},${200 - (day.temp.max * 4)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
                
                {/* Historical Avg temperature line */}
                <polyline
                  points={weatherData.historic?.map((day, i) => 
                    `${50 + (i * 80)},${200 - (day.temp.avg * 4)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                />
                
                {/* Forecast Min temperature line */}
                <polyline
                  points={weatherData.daily.slice(0, 3).map((day, i) => 
                    `${610 + (i * 80)},${200 - (day.temp.min * 4)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                
                {/* Forecast Max temperature line */}
                <polyline
                  points={weatherData.daily.slice(0, 3).map((day, i) => 
                    `${610 + (i * 80)},${200 - (day.temp.max * 4)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
                
                {/* Forecast Avg temperature line */}
                <polyline
                  points={weatherData.daily.slice(0, 3).map((day, i) => 
                    `${610 + (i * 80)},${200 - (day.temp.day * 4)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                />
                
                {/* Data points - Historical */}
                {weatherData.historic?.map((day, i) => (
                  <g key={`points-historic-${i}`}>
                    <circle
                      cx={50 + (i * 80)}
                      cy={200 - (day.temp.min * 4)}
                      r="4"
                      fill="#3B82F6"
                    />
                    <circle
                      cx={50 + (i * 80)}
                      cy={200 - (day.temp.max * 4)}
                      r="4"
                      fill="#EF4444"
                    />
                    <circle
                      cx={50 + (i * 80)}
                      cy={200 - (day.temp.avg * 4)}
                      r="5"
                      fill="#10B981"
                    />
                  </g>
                ))}
                
                {/* Data points - Forecast */}
                {weatherData.daily.slice(0, 3).map((day, i) => (
                  <g key={`points-forecast-${i}`}>
                    <circle
                      cx={610 + (i * 80)}
                      cy={200 - (day.temp.min * 4)}
                      r="4"
                      fill="#3B82F6"
                    />
                    <circle
                      cx={610 + (i * 80)}
                      cy={200 - (day.temp.max * 4)}
                      r="4"
                      fill="#EF4444"
                    />
                    <circle
                      cx={610 + (i * 80)}
                      cy={200 - (day.temp.day * 4)}
                      r="5"
                      fill="#10B981"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>
          
          {/* Precipitation Chart */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">Precipitation Probability (%)</h3>
            <div className="h-40 relative bg-white/5 rounded-lg p-4 border border-white/10">
              <svg className="w-full h-full" viewBox="0 0 900 150">
                {/* X-axis labels - Historical days */}
                {weatherData.historic?.map((day, i) => (
                  <text 
                    key={`x-precip-hist-${i}`}
                    x={50 + (i * 80)}
                    y="140"
                    textAnchor="middle"
                    fill="#D1FAE5"
                    fontSize="10"
                  >
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </text>
                ))}
                
                {/* X-axis labels - Forecast days */}
                {weatherData.daily.slice(0, 3).map((day, i) => (
                  <text 
                    key={`x-precip-${i}`}
                    x={610 + (i * 80)}
                    y="140"
                    textAnchor="middle"
                    fill="#D1FAE5"
                    fontSize="10"
                  >
                    {formatDate(day.dt).split(' ')[0]}
                  </text>
                ))}
                
                {/* Y-axis labels */}
                {[0, 25, 50, 75, 100].map((percent, i) => (
                  <text
                    key={`y-precip-${i}`}
                    x="40"
                    y={120 - (i * 30)}
                    textAnchor="end"
                    fill="#D1FAE5"
                    fontSize="10"
                  >
                    {percent}%
                  </text>
                ))}
                
                {/* Dividing line between historical and forecast */}
                <line x1="570" y1="20" x2="570" y2="120" stroke="#4B5563" strokeWidth="1" strokeDasharray="5,5" />
                
                {/* Y-axis line */}
                <line x1="50" y1="20" x2="50" y2="120" stroke="#4B5563" strokeWidth="1" />
                
                {/* X-axis line */}
                <line x1="50" y1="120" x2="850" y2="120" stroke="#4B5563" strokeWidth="1" />
                
                {/* Historical Precipitation bars - using simulated data */}
                {weatherData.historic?.map((day, i) => {
                  // For simplicity, simulate precipitation data from humidity (not accurate but visually representative)
                  const precipProb = (day.humidity - 40) / 2;
                  const cappedProb = Math.max(0, Math.min(100, precipProb));
                  
                  return (
                    <rect
                      key={`hist-bar-${i}`}
                      x={35 + (i * 80)}
                      y={120 - (cappedProb * 1.2)}
                      width="30"
                      height={cappedProb * 1.2}
                      fill="url(#precipitation-gradient)"
                      rx="2"
                    />
                  );
                })}
                
                {/* Forecast Precipitation bars */}
                {weatherData.daily.slice(0, 3).map((day, i) => (
                  <rect
                    key={`bar-${i}`}
                    x={595 + (i * 80)}
                    y={120 - (day.pop * 120)}
                    width="30"
                    height={day.pop * 120}
                    fill="url(#precipitation-gradient)"
                    rx="2"
                  />
                ))}
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="precipitation-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          {/* Weather Conditions Summary */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">10-Day Weather Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Historical data */}
              {weatherData.historic?.map((day) => (
                <div 
                  key={`summary-hist-${day.date}`}
                  className="bg-emerald-900/40 rounded-lg p-2 flex flex-col items-center backdrop-blur-sm hover:bg-emerald-900/60 transition-colors"
                >
                  <p className="text-xs text-emerald-300 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className="p-2 bg-emerald-800/60 rounded-full mb-1">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <p className="text-white text-sm font-medium capitalize">{day.weather}</p>
                  <p className="text-xs text-gray-300">{Math.round(day.temp.avg)}°C</p>
                </div>
              ))}
              
              {/* Forecast data */}
              {weatherData.daily.slice(0, 3).map((day, index) => (
                <div 
                  key={`summary-forecast-${day.dt}`}
                  className="bg-blue-900/40 rounded-lg p-2 flex flex-col items-center backdrop-blur-sm hover:bg-blue-900/60 transition-colors"
                >
                  <p className="text-xs text-blue-300 mb-1">
                    {index === 0 ? 'Today' : formatDate(day.dt).split(' ')[0]}
                  </p>
                  <div className="p-2 bg-blue-800/60 rounded-full mb-1">
                    {day.weather && day.weather.length > 0 
                      ? getWeatherIcon(day.weather[0].icon)
                      : <SunIcon className="h-6 w-6 text-yellow-400" />}
                  </div>
                  <p className="text-white text-sm font-medium capitalize">
                    {day.weather && day.weather.length > 0 ? day.weather[0].main : "Clear"}
                  </p>
                  <p className="text-xs text-gray-300">{Math.round(day.temp.day)}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
        <p>Weather data provided by OpenWeatherMap</p>
        <p className="mt-1">
          <span className="text-emerald-400">Note:</span> Historical data is simulated for demonstration purposes
        </p>
      </div>
    </div>
  );
};

export default WeatherAnalytics;