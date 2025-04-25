'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addDays, parseISO, isValid } from 'date-fns';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon,
  CloudIcon,
  SunIcon,
  BoltIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon
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

// Cricket BallIcon component
const CricketBallIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <circle cx="8" cy="8" r="1" fill="white" />
    <circle cx="12" cy="5" r="1" fill="white" />
    <circle cx="16" cy="8" r="1" fill="white" />
    <circle cx="18" cy="12" r="1" fill="white" />
    <circle cx="16" cy="16" r="1" fill="white" />
    <circle cx="12" cy="18" r="1" fill="white" />
    <circle cx="8" cy="16" r="1" fill="white" />
    <circle cx="5" cy="12" r="1" fill="white" />
  </svg>
);

// Date utils for dynamic date handling
const dateUtils = {
  getCurrentDate: () => new Date(),
  
  formatDate: (date: Date, formatString: string = 'MMMM d, yyyy') => {
    return format(date, formatString);
  },
  
  getTomorrow: () => {
    return addDays(new Date(), 1);
  },
  
  getDayAfterTomorrow: () => {
    return addDays(new Date(), 2);
  },
  
  getNextDays: (numDays: number) => {
    return Array.from({ length: numDays }, (_, i) => 
      addDays(new Date(), i + 1)
    );
  },
  
  getDayName: (date: Date) => {
    return format(date, 'EEEE');
  },
  
  // Convert Unix timestamp to Date
  fromUnixTime: (unixTime: number) => {
    return new Date(unixTime * 1000);
  },
  
  // Check if string contains date reference
  containsDate: (text: string): boolean => {
    const datePatterns = [
      /january|february|march|april|may|june|july|august|september|october|november|december/i,
      /\d{1,2}\/\d{1,2}\/\d{2,4}/,
      /\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
      /\d{4}-\d{2}-\d{2}/
    ];
    
    return datePatterns.some(pattern => pattern.test(text));
  },
  
  // Extract date from text
  extractDate: (text: string): Date | null => {
    // Common date formats
    const dateFormats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'MMMM d, yyyy',
      'MMMM d yyyy',
      'MMM d, yyyy'
    ];
    
    // Match potential date substrings
    const dateMatches = [
      text.match(/\b\d{4}-\d{2}-\d{2}\b/),
      text.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/),
      text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i),
      text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/i)
    ].filter(Boolean).map(m => m?.[0]);
    
    // Try to parse each match with each format
    for (const match of dateMatches) {
      if (match) {
        for (const dateFormat of dateFormats) {
          try {
            const parsedDate = parseISO(match);
            if (isValid(parsedDate)) {
              return parsedDate;
            }
          } catch (e) {
            // Try next format
          }
        }
      }
    }
    
    return null;
  },

  // Correct date references in text
  correctDateReferences: (text: string): string => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    const todayStr = format(today, 'MMMM d, yyyy');
    const tomorrowStr = format(tomorrow, 'MMMM d, yyyy');
    
    // Fix tomorrow references
    if (text.toLowerCase().includes('tomorrow')) {
      const tomorrowDatePattern = /tomorrow,?\s+(?:which\s+is\s+)?([a-zA-Z]+\s+\d{1,2},?\s+\d{4})/i;
      const match = text.match(tomorrowDatePattern);
      
      if (match && match[1] !== tomorrowStr) {
        text = text.replace(match[0], `tomorrow, which is ${tomorrowStr}`);
      }
    }
    
    // Fix today references
    if (text.toLowerCase().includes('today')) {
      const todayDatePattern = /today,?\s+(?:which\s+is\s+)?([a-zA-Z]+\s+\d{1,2},?\s+\d{4})/i;
      const match = text.match(todayDatePattern);
      
      if (match && match[1] !== todayStr) {
        text = text.replace(match[0], `today, which is ${todayStr}`);
      }
    }
    
    // Find and correct any full date that's wrong (specified as a date but incorrect)
    const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/gi;
    const matches = text.match(datePattern);
    
    if (matches) {
      for (const match of matches) {
        try {
          const matchDate = parseISO(match);
          // If date is more than a month from now and not historical, it's likely wrong
          const monthFromNow = addDays(today, 30);
          if (isValid(matchDate) && matchDate > monthFromNow) {
            // Replace with the correct future date (assuming mention of tomorrow means tomorrow)
            if (text.toLowerCase().includes('tomorrow')) {
              text = text.replace(match, tomorrowStr);
            }
          }
        } catch (e) {
          // Skip this date if parsing fails
        }
      }
    }
    
    return text;
  }
};

// Custom temp gradient component with accuracy colors
const TempGradient = ({ temp, className, isVerified = true }: { temp: number, className?: string, isVerified?: boolean }) => {
  // Ensure temperature is a valid number
  const temperature = Number(temp);
  if (isNaN(temperature)) {
    return null;
  }

  // Determine color based on temperature and verified status
  let color = 'from-blue-500 to-blue-600'; // cold
  if (temperature > 30) {
    color = 'from-red-500 to-red-600'; // hot
  } else if (temperature > 20) {
    color = 'from-orange-500 to-yellow-600'; // warm
  } else if (temperature > 10) {
    color = 'from-green-500 to-emerald-600'; // mild
  }

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-white text-xs font-bold bg-gradient-to-r ${color} ${className} shadow-sm ${isVerified ? '' : 'border border-yellow-400'}`}>
      {temperature}°C
      {!isVerified && <ExclamationCircleIcon className="h-3 w-3 ml-1 text-yellow-300" />}
    </div>
  );
};

// Define interfaces for structured weather data
interface EnhancedWeatherData {
  temperature?: number;
  condition?: string;
  precipitation?: number;
  wind?: number;
  visualType?: 'default' | 'chart' | 'forecast';
  verified?: boolean;
  correctionNote?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  weatherData?: EnhancedWeatherData;
  rawStructuredData?: any;
}

interface WeatherChatbotProps {
  weatherData: any;
  facilityName: string;
  className?: string;
}

// Define the API interface for Gemini Response
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
  }>;
}

// Enhanced function to extract structured weather data from response
// Fixed to handle both array and single value formats and properly clean messages
const extractWeatherDataFromResponse = (response: string): { data: EnhancedWeatherData, cleanedText: string } => {
  let cleanedText = response;
  
  try {
    // Try to extract structured JSON data from response
    const structuredMatch = response.match(/<weather_data>([\s\S]*?)<\/weather_data>/);
        if (structuredMatch && structuredMatch[1]) {
      const jsonData = JSON.parse(structuredMatch[1]);
      
      // Helper function to safely extract values from potential arrays
      const getValueSafely = (value: any): any => {
        if (Array.isArray(value)) {
          return value.length > 0 ? value[0] : null;
        }
        return value;
      };
      
      // Clean the user-visible response by removing the structured data
      cleanedText = response.replace(/<weather_data>[\s\S]*?<\/weather_data>/, '').trim();
      
      return {
        data: {
          temperature: getValueSafely(jsonData.temperature),
          condition: getValueSafely(jsonData.condition),
          precipitation: getValueSafely(jsonData.precipitation),
          wind: getValueSafely(jsonData.wind),
          visualType: getValueSafely(jsonData.visualType) || 'default',
          verified: true // Data is structured so we mark it as verified
        },
        cleanedText
      };
    }
  } catch (error) {
    console.error('Failed to parse structured weather data:', error);
    // Still clean the response even if parsing fails
    cleanedText = response.replace(/<weather_data>[\s\S]*?<\/weather_data>/, '').trim();
}
  
  // Fallback to regex extraction if structured data isn't available
  const data: EnhancedWeatherData = { verified: false };
  
  // Temperature extraction - more robust pattern
  const tempMatch = cleanedText.match(/(\d+(?:\.\d+)?)°C|(\d+(?:\.\d+)?)\s?degrees|temperature\s?(?:is|of|at)\s?(\d+(?:\.\d+)?)/i);
  if (tempMatch) {
    const tempValue = tempMatch[1] || tempMatch[2] || tempMatch[3];
    data.temperature = parseFloat(tempValue);
  }
  
  // Precipitation extraction - improved pattern
  const precipMatch = cleanedText.match(/(\d+(?:\.\d+)?)%\s?(?:chance|probability|chance of|risk of|possibility of)\s?(?:precipitation|rain|snow|showers)/i);
  if (precipMatch) {
    data.precipitation = parseFloat(precipMatch[1]);
  }
  
  // Wind speed extraction - enhanced pattern
  const windMatch = cleanedText.match(/wind(?:\s?speed)?\s?(?:of|at|is)?\s?(\d+(?:\.\d+)?)\s?(?:km\/h|mph|m\/s)/i);
  if (windMatch) {
    data.wind = parseFloat(windMatch[1]);
  }
  
  // Visual type detection - enhanced
  if (cleanedText.toLowerCase().includes('forecast') && 
     (cleanedText.toLowerCase().includes('days') || cleanedText.toLowerCase().includes('tomorrow'))) {
    data.visualType = 'forecast';
  } else if (cleanedText.toLowerCase().includes('average') || 
           cleanedText.toLowerCase().includes('trend') || 
           cleanedText.toLowerCase().includes('comparison') ||
           cleanedText.toLowerCase().includes('historical')) {
    data.visualType = 'chart';
  }
  
  // Weather condition extraction - enhanced with more conditions
  const conditionKeywords = [
    { keyword: 'sunny', condition: 'clear' },
    { keyword: 'clear', condition: 'clear' },
    { keyword: 'cloud', condition: 'clouds' },
    { keyword: 'overcast', condition: 'clouds' },
    { keyword: 'partly cloudy', condition: 'clouds' },
    { keyword: 'rain', condition: 'rain' },
    { keyword: 'shower', condition: 'rain' },
    { keyword: 'drizzle', condition: 'rain' },
    { keyword: 'storm', condition: 'thunderstorm' },
    { keyword: 'thunder', condition: 'thunderstorm' },
    { keyword: 'lightning', condition: 'thunderstorm' },
    { keyword: 'snow', condition: 'snow' },
    { keyword: 'sleet', condition: 'snow' },
    { keyword: 'hail', condition: 'snow' },
    { keyword: 'fog', condition: 'mist' },
    { keyword: 'mist', condition: 'mist' },
    { keyword: 'haze', condition: 'mist' },
  ];
  
  const lowerContent = cleanedText.toLowerCase();
  for (const { keyword, condition } of conditionKeywords) {
    if (lowerContent.includes(keyword)) {
      data.condition = condition;
      break;
    }
  }
  
  return { data, cleanedText };
};

// Validate extracted weather data against actual weather data
const validateWeatherData = (
  extractedData: EnhancedWeatherData, 
  actualWeatherData: any,
  responseText: string
): { validatedData: EnhancedWeatherData, correctionNote: string, correctedText: string } => {
  let correctionNote = '';
  let correctedText = dateUtils.correctDateReferences(responseText);
  const validatedData = { ...extractedData };
  
  // Helper to get current value from weather data
  const getCurrentTemp = (): number | undefined => {
    return actualWeatherData.current?.temp !== undefined 
      ? Number(actualWeatherData.current.temp) 
      : undefined;
  };
  
  const getCurrentCondition = (): string | undefined => {
    return actualWeatherData.current?.weather?.[0]?.main?.toLowerCase();
  };
  
  const getCurrentPrecip = (): number | undefined => {
    return actualWeatherData.hourly?.[0]?.pop !== undefined 
      ? Math.round(Number(actualWeatherData.hourly[0].pop) * 100) 
      : undefined;
  };
  
  const getCurrentWind = (): number | undefined => {
    return actualWeatherData.current?.wind_speed !== undefined 
      ? Math.round(Number(actualWeatherData.current.wind_speed) * 3.6) 
      : undefined;
  };
  
  // Check if extracted temperature is accurate
  if (validatedData.temperature !== undefined) {
    const actualTemp = getCurrentTemp();
    if (actualTemp !== undefined) {
      const diff = Math.abs(Number(validatedData.temperature) - actualTemp);
      
      if (diff > 2) { // If difference is more than 2°C
        validatedData.verified = false;
        validatedData.temperature = actualTemp;
        correctionNote += `Note: The current temperature is actually ${actualTemp.toFixed(1)}°C. `;
      }
    }
  }
  
  // Check precipitation accuracy
  if (validatedData.precipitation !== undefined) {
    const actualPrecip = getCurrentPrecip();
    if (actualPrecip !== undefined) {
      const diff = Math.abs(Number(validatedData.precipitation) - actualPrecip);
      
      if (diff > 15) { // If difference is more than 15%
        validatedData.verified = false;
        validatedData.precipitation = actualPrecip;
        correctionNote += `The precipitation probability is ${actualPrecip}%. `;
      }
    }
  }
  
  // Check wind speed accuracy
  if (validatedData.wind !== undefined) {
    const actualWind = getCurrentWind();
    if (actualWind !== undefined) {
      const diff = Math.abs(Number(validatedData.wind) - actualWind);
      
      if (diff > 5) { // If difference is more than 5 km/h
        validatedData.verified = false;
        validatedData.wind = actualWind;
        correctionNote += `Current wind speed is ${actualWind} km/h. `;
      }
    }
  }
  
  // Check weather condition
  if (validatedData.condition !== undefined) {
    const actualCondition = getCurrentCondition();
    if (actualCondition !== undefined) {
      if (validatedData.condition !== actualCondition) {
        validatedData.verified = false;
        validatedData.condition = actualCondition;
        
        // Only add weather condition correction if it's a significant difference
        const significantDifference = 
          (actualCondition === 'rain' && validatedData.condition === 'clear') ||
          (actualCondition === 'thunderstorm' && validatedData.condition !== 'thunderstorm') ||
          (actualCondition === 'snow' && validatedData.condition !== 'snow');
        
        if (significantDifference) {
          correctionNote += `Current conditions are ${actualWeatherData.current.weather[0].description}. `;
        }
      }
    }
  }
  
  return { 
    validatedData, 
    correctionNote: correctionNote.trim(),
    correctedText: correctedText
  };
};

// Generate fallback response using raw weather data
const generateFallbackResponse = (query: string, weatherData: any, facilityName: string): string => {
  const currentWeather = weatherData.current;
  const todayForecast = weatherData.daily?.[0];
  const tomorrowForecast = weatherData.daily?.[1];
  
  // Get dynamic date references
  const today = dateUtils.getCurrentDate();
  const tomorrow = dateUtils.getTomorrow();
  const formattedToday = dateUtils.formatDate(today);
  const formattedTomorrow = dateUtils.formatDate(tomorrow);
  
  // Handle common query patterns with direct data access
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('rain') || lowerQuery.includes('precipitation')) {
    const rainChance = weatherData.hourly?.[0]?.pop 
      ? Math.round(weatherData.hourly[0].pop * 100)
      : todayForecast?.pop
      ? Math.round(todayForecast.pop * 100)
      : null;
      
    if (rainChance !== null) {
      return `For today (${formattedToday}), the chance of rain at ${facilityName} is ${rainChance}%. ${rainChance > 30 ? 'You might want to bring an umbrella.' : 'It should be mostly dry.'}`;
    }
  }
  
  if (lowerQuery.includes('tomorrow')) {
    if (tomorrowForecast) {
      return `Tomorrow's forecast (${formattedTomorrow}) for ${facilityName}: ${Math.round(tomorrowForecast.temp.day)}°C, ${tomorrowForecast.weather[0].description}. Precipitation chance: ${Math.round(tomorrowForecast.pop * 100)}%.`;
    }
  }
  
  if (lowerQuery.includes('temperature') || lowerQuery.includes('hot') || lowerQuery.includes('cold') || lowerQuery.includes('warm')) {
    return `The current temperature at ${facilityName} (${formattedToday}) is ${Math.round(currentWeather.temp)}°C, and it feels like ${Math.round(currentWeather.feels_like)}°C.`;
  }
  
  if (lowerQuery.includes('wind')) {
    return `The current wind speed at ${facilityName} is ${Math.round(currentWeather.wind_speed * 3.6)} km/h.`;
  }
  
  if (lowerQuery.includes('humid') || lowerQuery.includes('humidity')) {
    return `The current humidity at ${facilityName} is ${currentWeather.humidity}%.`;
  }
  
  // Default fallback response with current conditions
  return `Current weather at ${facilityName} (${formattedToday}): ${Math.round(currentWeather.temp)}°C, ${currentWeather.weather[0].description}. Humidity: ${currentWeather.humidity}%. Wind: ${Math.round(currentWeather.wind_speed * 3.6)} km/h. ${todayForecast ? `Today's high: ${Math.round(todayForecast.temp.max)}°C, low: ${Math.round(todayForecast.temp.min)}°C.` : ''}`;
};

// Enhanced generateResponse function with structured data and error handling
const generateResponse = async (
  query: string, 
  weatherData: any, 
  facilityName: string,
  conversationHistory: Message[] = []
): Promise<{ response: string, structuredData: EnhancedWeatherData }> => {
  try {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      const fallbackResponse = generateFallbackResponse(query, weatherData, facilityName);
      const { data, cleanedText } = extractWeatherDataFromResponse(fallbackResponse);
      return { 
        response: cleanedText, 
        structuredData: data
      };
    }
    
    // Extract relevant weather info to reduce token usage and provide context
    const simplifiedWeatherData = {
      current: {
        temp: weatherData.current?.temp,
        feels_like: weatherData.current?.feels_like,
        humidity: weatherData.current?.humidity,
        wind_speed: weatherData.current?.wind_speed,
        weather: weatherData.current?.weather,
        dt: weatherData.current?.dt,
        pressure: weatherData.current?.pressure,
        uvi: weatherData.current?.uvi,
      },
      hourly: weatherData.hourly?.slice(0, 24).map((h: any) => ({
        dt: h.dt,
        temp: h.temp,
        pop: h.pop,
        humidity: h.humidity,
        wind_speed: h.wind_speed,
        weather: h.weather?.[0]
      })),
      daily: weatherData.daily?.map((d: any) => ({
        dt: d.dt,
        temp: d.temp,
        humidity: d.humidity,
        pop: d.pop,
        wind_speed: d.wind_speed,
        weather: d.weather?.[0],
        sunrise: d.sunrise,
        sunset: d.sunset,
        uvi: d.uvi
      })),
      historic: weatherData.historic?.map((d: any) => ({
        date: d.date,
        temp: d.temp,
        humidity: d.humidity,
        wind_speed: d.wind_speed,
        weather: d.weather,
        icon: d.icon
      })),
      locationName: facilityName
    };

    // Prepare conversation history for context
    // Include up to last 10 messages for better context
    const recentMessages = conversationHistory.slice(-10);
    
    // Add conversation summary if it's a long conversation
    let formattedPreviousMessages = recentMessages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    if (conversationHistory.length > 10) {
      // Create a summary of earlier conversation
      const topicsSummary = `Previous conversation summary: The user has asked about weather at ${facilityName}, including ${conversationHistory.slice(0, -10).filter(m => m.role === 'user').map(m => `"${m.content}"`).join(', ')}`;
      formattedPreviousMessages = topicsSummary + '\n\n' + formattedPreviousMessages;
    }

    // Get dynamic date information for prompt
    const today = dateUtils.getCurrentDate();
    const tomorrow = dateUtils.getTomorrow();
    const dayAfterTomorrow = dateUtils.getDayAfterTomorrow();
    
    const formattedToday = dateUtils.formatDate(today);
    const formattedTomorrow = dateUtils.formatDate(tomorrow);
    const formattedDayAfterTomorrow = dateUtils.formatDate(dayAfterTomorrow);
    const todayDayName = dateUtils.getDayName(today);
    const tomorrowDayName = dateUtils.getDayName(tomorrow);
    const dayAfterTomorrowName = dateUtils.getDayName(dayAfterTomorrow);
    
    // Enhanced system prompt with explicit accuracy instructions and structured data output
    // Added specific instructions to avoid array values and use dynamic dates
    const systemPrompt = `You are a helpful weather assistant for a sports facility called "${facilityName}". 
    Your task is to answer weather-related questions based ONLY on the provided weather data.
    
    VERY IMPORTANT DATE INFORMATION:
    - Today is ${todayDayName}, ${formattedToday}
    - Tomorrow is ${tomorrowDayName}, ${formattedTomorrow}
    - The day after tomorrow is ${dayAfterTomorrowName}, ${formattedDayAfterTomorrow}
    
    When referring to dates, ALWAYS use these exact dates. Never make up or guess future dates.
    
    VERY IMPORTANT ACCURACY REQUIREMENTS:
    - Always use the EXACT temperature values from the data (±0.5°C)
    - Report exact precipitation chances matching the data
    - Always specify wind speed in km/h using the exact values in the data
    - Never make up weather information not present in the provided data
    - If asked about suitable conditions for sports, provide practical advice based on weather conditions
    - Always specify which day you're referring to (today, tomorrow, etc.)
    - If data is not available for a specific request, clearly state that limitation
    
    The dates/times in the data (dt, date fields) are Unix timestamps in seconds. Format dates in a user-friendly way.
    
    Your answers should be concise, friendly, and informative, including specific numerical data when relevant.
    
    Always provide practical context for weather information:
    - For high temperatures (>28°C), suggest hydration and sun protection
    - For rain probability (>30%), suggest appropriate gear or indoor alternatives
    - For wind (>20 km/h), mention how it might affect sports activities
    - For good weather conditions, be enthusiastic about outdoor opportunities
    
    CRITICAL: After your response, include a structured JSON object with the following weather information inside <weather_data> tags:
    {
      "temperature": Current temperature in °C as a NUMBER (not an array),
      "condition": Weather condition as a STRING (not an array): "clear", "clouds", "rain", "thunderstorm", "snow", "mist",
      "precipitation": Chance of precipitation as percentage NUMBER (not an array),
      "wind": Wind speed in km/h as a NUMBER (not an array),
      "visualType": "default", "chart", or "forecast" as a STRING (not an array)
    }
    
    IMPORTANT: All JSON values must be single values, NOT arrays. Use null for any values you cannot determine from the data. Do not make up data.`;
    
    // Construct the prompt for Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: `Provided weather data (JSON): ${JSON.stringify(simplifiedWeatherData)}` },
            { text: `Previous conversation:\n${formattedPreviousMessages}` },
            { text: `User query: ${query}` }
          ]
        }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
          maxOutputTokens: 800
        }
      })
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API responded with status: ${response.status}, Body: ${errorBody}`);
      // Fallback to direct data response
      const fallbackResponse = generateFallbackResponse(query, weatherData, facilityName);
      const { data, cleanedText } = extractWeatherDataFromResponse(fallbackResponse);
      return { 
        response: cleanedText, 
        structuredData: data
      };
    }
    
    const apiResponse = await response.json() as GeminiResponse;
    
    if (apiResponse.candidates && apiResponse.candidates.length > 0 && apiResponse.candidates[0].content?.parts?.length > 0) {
        const aiResponse = apiResponse.candidates[0].content.parts[0].text;
      
      // Extract and clean the response
      const { data: extractedData, cleanedText } = extractWeatherDataFromResponse(aiResponse);
      
      // Validate the extracted data and correct dates
      const { validatedData, correctionNote, correctedText } = validateWeatherData(extractedData, weatherData, cleanedText);
      
      // Add correction note if needed
      let finalResponse = correctedText;
      if (correctionNote) {
        validatedData.correctionNote = correctionNote;
        finalResponse += `\n\n*Correction: ${correctionNote}*`;
      }
      
      return { response: finalResponse, structuredData: validatedData };
    } else {
        console.error('Gemini API returned no valid candidates:', apiResponse);      // Fallback to direct data response
      const fallbackResponse = generateFallbackResponse(query, weatherData, facilityName);
      const { data, cleanedText } = extractWeatherDataFromResponse(fallbackResponse);
      return { 
        response: cleanedText, 
        structuredData: data
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to direct data response
    const fallbackResponse = generateFallbackResponse(query, weatherData, facilityName);
    const { data, cleanedText } = extractWeatherDataFromResponse(fallbackResponse);
    return { 
      response: cleanedText, 
      structuredData: data
    };
  }
};

// Speech synthesis wrapper - enhanced for better pronunciation
const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Stop any current speech
  window.speechSynthesis.cancel();

  // Remove markdown formatting and simplify for speech
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/<weather_data>[\s\S]*?<\/weather_data>/, '') // Remove structured data
        .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\d+°C/g, match => match.replace('°C', ' degrees Celsius')) // Improve pronunciation of temperature
    .replace(/%/g, ' percent') // Improve pronunciation of percentages
    .replace(/km\/h/g, 'kilometers per hour'); // Improve pronunciation of speed

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set voice preferences - enhanced for more natural voice selection
  const voices = window.speechSynthesis.getVoices();
  
  // Prioritize natural-sounding voices for weather information
  const preferredVoices = [
    voices.find(voice => voice.name.includes('Samantha')),
    voices.find(voice => voice.name.includes('Google UK English Female')),
    voices.find(voice => voice.name.includes('Microsoft Zira')),
    voices.find(voice => voice.lang.includes('en') && voice.name.includes('Female'))
  ];
  
  const selectedVoice = preferredVoices.find(voice => voice !== undefined);
  
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 1.0;
  utterance.pitch = 1.1; // Slightly higher pitch for clearer speech
  
  window.speechSynthesis.speak(utterance);
};

const WeatherChatbot: React.FC<WeatherChatbotProps> = ({ 
  weatherData, 
  facilityName, 
  className = '' 
}) => {
  // Get accurate dates using date utils
  const today = dateUtils.getCurrentDate();
  const formattedToday = dateUtils.formatDate(today);
  
  // Initial state with accurate weather data
  const initialWeatherData: EnhancedWeatherData = {
    condition: weatherData.current?.weather?.[0]?.main?.toLowerCase() || 'clear',
    temperature: weatherData.current?.temp !== undefined ? Number(weatherData.current.temp) : undefined,
    precipitation: weatherData.hourly?.[0]?.pop !== undefined ? Math.round(Number(weatherData.hourly[0].pop) * 100) : undefined,
    wind: weatherData.current?.wind_speed !== undefined ? Math.round(Number(weatherData.current.wind_speed) * 3.6) : undefined,
    visualType: 'default',
    verified: true
  };

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your weather assistant for ${facilityName}. Ask me about current conditions, forecasts, or historical weather patterns! Today is ${formattedToday}.`,
      timestamp: new Date(),
      weatherData: initialWeatherData
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0); // Track API errors for fallback logic
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';
      
      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        // Submit automatically after voice input
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 500);
      };
      
      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
      
      speechRecognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
    
    // Initialize dynamic suggestions based on weather
    updateDynamicSuggestions();
    
    // Cleanup function
    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Stop speaking when loading new response
  useEffect(() => {
    if (isLoading && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isLoading]);

  // Generate dynamic suggestions based on weather data
  const updateDynamicSuggestions = () => {
    const suggestions: string[] = [];
    
    // Current weather suggestion
    suggestions.push("How's the weather right now?");
    
    // Check if it might rain soon
    const nextFewHours = weatherData.hourly?.slice(0, 12);
    const rainSoon = nextFewHours?.some((hour: any) => hour.pop > 0.3);
    if (rainSoon) {
      suggestions.push("Will it rain today?");
    }
    
    // Check for extreme temperatures in forecast
    const upcomingDays = weatherData.daily?.slice(0, 3);
    const highTemp = upcomingDays?.some((day: any) => day.temp.max > 30);
    const lowTemp = upcomingDays?.some((day: any) => day.temp.min < 10);
    
    if (highTemp) {
      suggestions.push("Is it going to be hot this week?");
    } else if (lowTemp) {
      suggestions.push("Is it going to be cold this week?");
    }
    
    // Get the day of week for suggestions using dateUtils
    const today = dateUtils.getCurrentDate();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    
    if (dayOfWeek < 5) { // If today is not weekend
      const daysToWeekend = 6 - dayOfWeek; // How many days until Saturday
      if (daysToWeekend <= 3) { // If weekend is coming up soon
        suggestions.push("How's the weather looking for this weekend?");
      } else {
        suggestions.push("What's the forecast for the next 3 days?");
      }
    } else {
      suggestions.push("What's the weather forecast for tomorrow?");
    }
    
    // Sport-specific suggestion based on current weather
    const currentCondition = weatherData.current?.weather?.[0]?.main?.toLowerCase();
    const currentTemp = weatherData.current?.temp;
    const currentWindSpeed = weatherData.current?.wind_speed;
    
    if (currentCondition === 'rain' || currentCondition === 'thunderstorm') {
      suggestions.push("Are there any indoor alternatives today?");
    } else if (currentCondition === 'clear' && currentTemp > 25 && currentWindSpeed < 15) {
      suggestions.push("Is this good weather for cricket?");
    } else if (currentWindSpeed > 20) {
      suggestions.push("How will the wind affect cricket today?");
    } else {
      suggestions.push("Is it good weather for outdoor sports?");
    }
    
    // Set the dynamic suggestions
    setDynamicSuggestions(suggestions);
  };
  
  const toggleSpeechInput = () => {
    if (!speechRecognition.current) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    
    if (isListening) {
      speechRecognition.current.abort();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognition.current.start();
    }
  };
  
  const toggleSpeechOutput = (messageContent: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(messageContent);
      
      // Reset state when speech ends
      const checkSpeaking = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkSpeaking);
        }
      }, 100);
    }
  };
  
  // Enhanced message handling with error recovery
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = { 
      role: 'user', 
      content: messageToSend.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      // Check if we should use fallback (after repeated errors)
      const shouldUseFallback = errorCount >= 2;
      
      let response, structuredData;
      
      if (shouldUseFallback) {
        // Use direct fallback if API has failed repeatedly
        const fallbackResponse = generateFallbackResponse(messageToSend, weatherData, facilityName);
        const { data, cleanedText } = extractWeatherDataFromResponse(fallbackResponse);
        structuredData = data;
        response = cleanedText + "\n\n*Using direct weather data due to connection issues.*";
      } else {
        // Normal flow - use Gemini API
        const result = await generateResponse(
          messageToSend, 
          weatherData, 
          facilityName,
          messages // Pass conversation history
        );
        response = result.response;
        structuredData = result.structuredData;
      }
      
      // Add bot response
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response,
        timestamp: new Date(),
        weatherData: structuredData
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setErrorCount(0); // Reset error count on success
      
      // Regenerate suggestions based on latest interaction
      updateDynamicSuggestions();
      
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      setErrorCount(prev => prev + 1); // Increment error count
      
      // Use direct fallback response
      const fallbackResponse = generateFallbackResponse(messageToSend, weatherData, facilityName);
      const { data, cleanedText } = extractWeatherDataFromResponse(fallbackResponse);
      
      // Add error message with fallback data
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I encountered an error processing your request. Here's the current weather information:\n\n${cleanedText}`,
        timestamp: new Date(),
        weatherData: data
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get weather icon based on condition string
  const getWeatherIcon = (condition: string | undefined, size: 'sm' | 'md' | 'lg' = 'md') => {
    if (!condition) return null;
    
    const sizeClass = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    }[size];
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return <SunIcon className={`${sizeClass} text-yellow-400`} />;
      case 'clouds':
        return <CloudIcon className={`${sizeClass} text-gray-300`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRainIcon className={`${sizeClass} text-blue-400`} />;
      case 'thunderstorm':
        return <BoltIcon className={`${sizeClass} text-yellow-500`} />;
      case 'snow':
        return <SnowIcon className={`${sizeClass} text-gray-300`} />;
      case 'mist':
      case 'fog':
        return <CloudIcon className={`${sizeClass} text-gray-500`} />;
      default:
        return <CloudIcon className={`${sizeClass} text-emerald-400`} />;
    }
  };
  
  // Function to format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to safely access weather data properties with type checking
  const safeNumber = (value: any): number | undefined => {
    return value !== undefined && value !== null && !isNaN(Number(value)) ? Number(value) : undefined;
  };

  // Function to render enhanced message content with weather details
  const renderEnhancedMessageContent = (message: Message) => {
    if (message.role === 'user') {
      return <div className="text-sm md:text-base">{message.content}</div>;
    }
    
    // For assistant messages, enhance with weather data if available
    const { weatherData } = message;
    
    const weatherDataAny = weatherData as any; // Type assertion to bypass type checking
    const currentTemp = safeNumber(weatherData?.temperature !== undefined ? 
      weatherData.temperature : 
      weatherDataAny?.current?.temp);
      
    const currentCondition = weatherData?.condition || 
      weatherDataAny?.current?.weather?.[0]?.main?.toLowerCase();
      
    const currentPrecip = safeNumber(weatherData?.precipitation !== undefined ? 
      weatherData.precipitation : 
      (weatherDataAny?.hourly?.[0]?.pop !== undefined ? Math.round(Number(weatherDataAny.hourly[0].pop) * 100) : undefined));
      
    const currentWind = safeNumber(weatherData?.wind !== undefined ? 
      weatherData.wind : 
      (weatherDataAny?.current?.wind_speed !== undefined ? Math.round(Number(weatherDataAny.current.wind_speed) * 3.6) : undefined));
    
    // If forecast visualization requested, add visual forecast elements
    if (weatherData?.visualType === 'forecast') {
      return (
        <div>
          <div className="text-sm md:text-base mb-3">{message.content}</div>
          
          {/* Weather forecast visualization - Enhanced with cricket theme */}
          <div className="mt-3 p-3 bg-gradient-to-br from-emerald-900/40 to-green-900/30 rounded-xl border border-emerald-700/30 shadow-inner overflow-hidden relative transform transition duration-300 hover:scale-[1.01]">
            {/* Cricket pitch overlay decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div className="absolute top-1/2 left-1/2 h-full w-16 bg-yellow-100 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-[15%] left-0 right-0 h-0.5 bg-white/50"></div>
              <div className="absolute bottom-[15%] left-0 right-0 h-0.5 bg-white/50"></div>
            </div>
            
            <div className="flex items-center mb-3">
              <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">3-Day Weather Forecast</span>
            </div>
            
            <div className="flex overflow-x-auto space-x-3 pb-2 custom-scrollbar">
              {weatherData.daily?.slice(0, 3).map((day: any, i: number) => {
                const dayDate = dateUtils.fromUnixTime(day.dt);
                return (
                  <div key={i} className="flex-shrink-0 bg-gradient-to-br from-emerald-900/50 to-green-800/40 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg border border-white/10 transform transition hover:scale-105 hover:border-emerald-500/30 w-24 md:w-28">
                    <div className="text-xs font-medium text-emerald-300 mb-1 truncate">
                      {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateUtils.formatDate(dayDate, 'EEE')}
                    </div>
                    <div className="bg-white/10 rounded-full p-2 mx-auto w-10 h-10 flex items-center justify-center mb-2">
                      {getWeatherIcon(day.weather?.main?.toLowerCase(), 'md')}
                    </div>
                    <div className="text-sm font-bold text-white mb-1">
                      {Math.round(day.temp.day)}°C
                    </div>
                    <div className="bg-blue-600/20 rounded-full px-1.5 py-0.5 text-[10px] text-blue-200 inline-flex items-center">
                      <CloudRainIcon className="h-2.5 w-2.5 mr-0.5" />
                      {Math.round((day.pop || 0) * 100)}%
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Match conditions tag line */}
            <div className="mt-3 text-center">
              <span className="inline-block px-3 py-1 bg-emerald-600/20 rounded-full text-xs text-emerald-300 border border-emerald-500/20">
                {currentCondition === 'clear' && currentTemp && currentTemp > 20 && currentTemp < 30 && currentWind && currentWind < 15 ? 
                  "Perfect cricket conditions! 🏏" : 
                  "Check match conditions before play"}
              </span>
            </div>
          </div>
          
          {/* If there's a correction note, display it prominently */}
          {weatherData.correctionNote && (
            <div className="mt-3 p-2.5 bg-gradient-to-r from-yellow-900/30 to-amber-800/30 rounded-lg border border-yellow-600/30 text-yellow-300 text-xs backdrop-blur-sm shadow-inner">
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{weatherData.correctionNote}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // If chart visualization requested
    if (weatherData?.visualType === 'chart') {
      return (
        <div>
          <div className="text-sm md:text-base mb-3">{message.content}</div>
          
          {/* Chart visualization - Enhanced with cricket theme */}
          <div className="mt-3 p-3 bg-gradient-to-br from-emerald-900/40 to-green-900/30 rounded-xl border border-emerald-700/30 shadow-inner overflow-hidden relative transform transition duration-300 hover:scale-[1.01]">
            {/* Cricket field decorative elements */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="flex items-center mb-3">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">Weather Trends Analysis</span>
            </div>
            
            <div className="flex items-center justify-center h-28 bg-emerald-900/30 rounded-lg border border-emerald-700/20 shadow-inner p-3">
              <div className="text-center">
                <CricketBallIcon className="h-6 w-6 text-emerald-400 mx-auto mb-2 animate-bounce-slow" />
                <span className="text-xs text-emerald-300 block">
                  Please refer to the detailed charts in the weather analysis section
                </span>
              </div>
            </div>
            
            {/* Weather impact on cricket tag */}
            <div className="mt-3 text-center">
              <span className="inline-block px-3 py-1 bg-emerald-600/20 rounded-full text-xs text-emerald-300 border border-emerald-500/20">
                {currentWind && currentWind > 15 ? "Wind may affect ball movement" : 
                 currentCondition === 'rain' ? "Wet outfield conditions expected" :
                 currentTemp && currentTemp > 30 ? "Hot conditions - stay hydrated" :
                 "Check detailed weather charts for planning"}
              </span>
            </div>
          </div>
          
          {/* Display correction if needed */}
          {weatherData?.correctionNote && (
            <div className="mt-3 p-2.5 bg-gradient-to-r from-yellow-900/30 to-amber-800/30 rounded-lg border border-yellow-600/30 text-yellow-300 text-xs backdrop-blur-sm shadow-inner">
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{weatherData.correctionNote}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Weather data is available - standard visualization with cricket theme
    return (
      <div>
        <div className="text-sm md:text-base whitespace-pre-line">
          {message.content}
        </div>
        
        {/* Enhanced weather indicators with verification - cricket themed badges */}
        {(currentCondition || currentTemp !== undefined || currentPrecip !== undefined || currentWind !== undefined) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/10">
            {currentCondition && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-900/60 to-green-800/50 text-white text-xs shadow-inner border border-white/10 transform transition hover:scale-105 hover:border-emerald-500/30">
                {getWeatherIcon(currentCondition, 'sm')}
                <span className="ml-1 capitalize">{currentCondition}</span>
              </div>
            )}
            
            {currentTemp !== undefined && (
              <TempGradient 
                temp={currentTemp} 
                isVerified={weatherData?.verified !== false}
                className="shadow-inner transform transition hover:scale-105 py-1"
              />
            )}
            
            {currentPrecip !== undefined && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-900/60 to-blue-700/40 text-blue-200 text-xs shadow-inner border border-blue-700/30 transform transition hover:scale-105 ${weatherData?.verified === false ? 'border border-yellow-400' : ''}`}>
                <CloudRainIcon className="h-3 w-3 mr-1" />
                {currentPrecip}% chance
                {weatherData?.verified === false && <ExclamationCircleIcon className="h-3 w-3 ml-1 text-yellow-300" />}
              </div>
            )}
            
            {currentWind !== undefined && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-900/60 to-teal-800/40 text-emerald-200 text-xs shadow-inner border border-emerald-700/30 transform transition hover:scale-105 ${weatherData?.verified === false ? 'border border-yellow-400' : ''}`}>
                <WindIcon className="h-3 w-3 mr-1" />
                {currentWind} km/h
                {weatherData?.verified === false && <ExclamationCircleIcon className="h-3 w-3 ml-1 text-yellow-300" />}
              </div>
            )}
            
            {/* Cricket specific condition badge - if appropriate */}
            {currentCondition && currentTemp !== undefined && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-600/30 to-emerald-700/20 text-emerald-200 text-xs shadow-inner border border-emerald-600/20 transform transition hover:scale-105">
                <CricketBallIcon className="h-3 w-3 mr-1 text-emerald-400" />
                {currentCondition === 'clear' && currentTemp > 20 && currentTemp < 30 ? 
                  "Great for cricket" : 
                 currentCondition === 'rain' ? 
                  "Poor playing conditions" :
                 currentWind && currentWind > 20 ? 
                  "Windy conditions" :
                 currentTemp > 30 ? 
                  "Hot - take breaks" :
                  "Check pitch conditions"}
              </div>
            )}
          </div>
        )}
        
        {/* Display correction if needed */}
        {weatherData?.correctionNote && (
          <div className="mt-3 p-2.5 bg-gradient-to-r from-yellow-900/30 to-amber-800/30 rounded-lg border border-yellow-600/30 text-yellow-300 text-xs backdrop-blur-sm shadow-inner">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
              <span>{weatherData.correctionNote}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Enhanced header with cricket theme */}
      <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-emerald-900/70 to-green-800/60 p-3 rounded-xl border border-white/10 shadow-lg">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200 flex items-center">
          <CloudIcon className="h-6 w-6 mr-2 text-emerald-400" />
          Weather Assistant
        </h3>
        <div className="bg-emerald-900/70 text-emerald-300 text-xs px-3 py-1 rounded-full flex items-center border border-emerald-600/30 shadow-inner">
          <BoltIcon className="h-3 w-3 mr-1" />
          AI-Powered
        </div>
      </div>
      
      {/* Chat container - Enhanced with cricket field background */}
      <div 
        ref={chatContainerRef} 
        className="bg-gradient-to-br from-emerald-900/50 to-green-900/40 rounded-xl p-4 border border-white/10 shadow-inner h-80 overflow-y-auto mb-4 custom-scrollbar relative"
      >
        {/* Cricket field decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Oval field */}
          <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border border-white/5 bg-green-700/5"></div>
          
          {/* Pitch - center */}
          <div className="absolute top-1/2 left-1/2 w-16 h-64 bg-yellow-100/5 -translate-x-1/2 -translate-y-1/2 border border-white/5">
            {/* Crease markings */}
            <div className="absolute top-[15%] left-0 right-0 h-0.5 bg-white/5"></div>
            <div className="absolute bottom-[15%] left-0 right-0 h-0.5 bg-white/5"></div>
          </div>
          
          {/* Boundary rope */}
          <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] rounded-full border-dashed border border-white/5"></div>
        </div>
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 px-4 py-3 rounded-2xl shadow-md transform transition-all duration-300 animate-fade-in-up hover:shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-emerald-600/80 to-emerald-700/90 text-white rounded-tr-none backdrop-blur-sm border border-emerald-500/30' 
                  : 'bg-gradient-to-r from-emerald-900/80 to-green-900/70 text-white rounded-tl-none border border-white/10 hover:border-emerald-500/30 backdrop-blur-sm'
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center">
                    <div className="bg-emerald-800/70 p-1 rounded-full mr-1.5">
                      <CloudIcon className="h-3.5 w-3.5 text-emerald-300" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-300">Weather Assistant</span>
                  </div>
                  
                  {/* Controls for assistant messages */}
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => toggleSpeechOutput(msg.content)}
                      className={`p-1 rounded-full ${isSpeaking ? 'bg-red-500/30 text-red-300 border border-red-500/30' : 'bg-emerald-900/70 text-emerald-400 hover:bg-emerald-800/70 border border-emerald-700/30'} transition-all shadow-sm hover:shadow transform hover:scale-110`}
                      title={isSpeaking ? "Stop speaking" : "Read aloud"}
                    >
                      {isSpeaking ? (
                        <SpeakerXMarkIcon className="h-3 w-3" />
                      ) : (
                        <SpeakerWaveIcon className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Enhanced message content */}
              {renderEnhancedMessageContent(msg)}
              
              {/* Enhanced timestamp */}
              <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                
                {/* For user messages, show a cricket ball icon */}
                {msg.role === 'user' && (
                  <span className="w-3 h-3 bg-red-500 rounded-full border border-white/20 shadow-sm"></span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced loading animation with cricket theme */}
        {isLoading && (
          <div className="flex justify-start mb-4 animate-fade-in-up">
            <div className="bg-gradient-to-r from-emerald-900/80 to-green-900/70 text-white rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-white/10 backdrop-blur-sm">
              <div className="flex items-center mb-2 pb-2 border-b border-white/10">
                <div className="bg-emerald-800/70 p-1 rounded-full mr-1.5">
                  <CloudIcon className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <span className="text-xs font-semibold text-emerald-300">Weather Assistant</span>
              </div>
              <div className="flex items-center space-x-2 h-5">
                <div className="relative">
                  {/* Cricket ball loading animation */}
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce-slow"></div>
                  {/* Animated shadow */}
                  <div className="absolute -bottom-1 left-0 w-2 h-0.5 bg-black/20 rounded-full animate-shadow-pulse"></div>
                </div>
                <span className="text-xs text-emerald-300">Checking weather data...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced speech recognition feedback */}
        {isListening && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-800/90 to-emerald-900/80 text-emerald-300 px-4 py-2 rounded-full border border-emerald-600/50 flex items-center animate-pulse shadow-lg backdrop-blur-sm">
            <MicrophoneIcon className="h-4 w-4 mr-2" />
            Listening...
            <button 
              onClick={() => toggleSpeechInput()}
              className="ml-2 bg-red-900/50 text-red-300 rounded-full p-1 border border-red-700/30 transform transition hover:scale-110"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      
      {/* Enhanced input area with cricket theme */}
      <div className="relative">
        {/* Input area background with pitch decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-full h-1 bg-yellow-100/5 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-full bg-white/5 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-full bg-white/5 -translate-y-1/2"></div>
        </div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={toggleSpeechInput}
            disabled={isLoading}
            className={`p-3 rounded-full ${
              isListening 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse border border-red-500/50 shadow-lg' 
                : 'bg-gradient-to-r from-emerald-900/70 to-green-800/60 text-emerald-400 hover:text-emerald-300 hover:from-emerald-800/70 hover:to-green-700/60 border border-emerald-700/30 shadow-md hover:shadow-lg'
            } transition-all duration-300 flex-shrink-0 transform hover:scale-105`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={isListening ? 'Listening...' : inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full bg-gradient-to-r from-emerald-900/70 to-green-900/60 border border-white/20 rounded-full px-5 py-3 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-12 shadow-inner placeholder-white/50 transition-all duration-300"
              placeholder="Ask about weather conditions..."
              disabled={isLoading || isListening}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim() || isListening}
              className={`absolute right-1 top-1 p-2 rounded-full ${
                inputMessage.trim() && !isLoading && !isListening
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-md' 
                  : 'bg-emerald-900/70 text-emerald-400/70 shadow-sm'
              } transition-all duration-300 transform hover:scale-110 border border-emerald-500/30`}
              aria-label="Send message"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced dynamic suggestion chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {dynamicSuggestions.slice(0, 4).map((suggestion, index) => (
          <button 
            key={index}
            onClick={() => !isLoading && handleSendMessage(suggestion)}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-900/60 to-green-800/50 hover:from-emerald-800/60 hover:to-green-700/50 text-emerald-300 hover:text-emerald-200 text-xs rounded-full px-3 py-1.5 border border-emerald-700/30 shadow-sm hover:shadow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 backdrop-blur-sm"
          >
            {suggestion}
          </button>
        ))}
        
        {/* Help button */}
        <button 
          className="bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 text-white/70 hover:text-white/90 text-xs rounded-full px-3 py-1.5 border border-white/10 shadow-sm hover:shadow transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          onClick={() => !isLoading && handleSendMessage("What can you tell me about the weather?")}
          disabled={isLoading}
        >
          <QuestionMarkCircleIcon className="h-3 w-3 inline mr-1" />
          Help
        </button>
      </div>
      
      {/* Enhanced footer with cricket reference */}
      <div className="text-center mt-4 pt-3 border-t border-white/10">
        <div className="bg-gradient-to-r from-emerald-900/40 to-green-900/30 rounded-full px-3 py-1.5 inline-flex items-center text-xs text-emerald-300 border border-emerald-700/20 shadow-inner backdrop-blur-sm">
          <CricketBallIcon className="h-3 w-3 mr-1.5 text-emerald-400" />
          <span>Weather insights for perfect cricket conditions</span>
        </div>
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        
        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.5; }
          50% { transform: scaleX(0.7); opacity: 0.3; }
        }
        .animate-shadow-pulse {
          animation: shadow-pulse 2s infinite ease-in-out;
        }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(5, 46, 22, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  );
};

export default WeatherChatbot;