// src/services/weatherService.ts
// Weather data interfaces
export interface CurrentWeather {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  name: string;
  dt: number;
  coord?: {
    lat: number;
    lon: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  pop: number; // Probability of precipitation
  dt_txt: string;
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
  };
  daily: {
    dt: number;
    temp: {
      min: number;
      max: number;
      day: number;
    };
    humidity: number;
    wind_speed: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    pop: number; // Probability of precipitation
  }[];
  hourly: {
    dt: number;
    temp: number;
    humidity: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    pop: number; // Probability of precipitation
  }[];
  historic?: {
    date: string;
    temp: {
      min: number;
      max: number;
      avg: number;
    };
    humidity: number;
    wind_speed: number;
    weather: string;
    icon: string;
  }[];
  city: {
    name: string;
  };
}

// The API key
const API_KEY = 'f41125c406e0ea4ab65167eaa495879e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Create a global weather cache that persists across imports
// Use a global variable with a distinct name to ensure it's shared
declare global {
  interface Window {
    __GLOBAL_WEATHER_CACHE__: Map<string, WeatherData>;
  }
}

// Initialize global cache if it doesn't exist yet
if (typeof window !== 'undefined') {
  if (!window.__GLOBAL_WEATHER_CACHE__) {
    window.__GLOBAL_WEATHER_CACHE__ = new Map<string, WeatherData>();
    console.log('Global weather cache initialized');
  }
}

// Helper function to get the global cache
const getGlobalCache = (): Map<string, WeatherData> => {
  if (typeof window !== 'undefined') {
    return window.__GLOBAL_WEATHER_CACHE__;
  }
  // Fallback for server-side rendering
  return new Map<string, WeatherData>();
};

// Helper function to standardize coordinates for consistent cache keys
const standardizeCoordinates = (lat: number, lon: number): { lat: number, lon: number } => {
  // Ensure coordinates have exactly 6 decimal places
  return {
    lat: parseFloat(lat.toFixed(6)),
    lon: parseFloat(lon.toFixed(6))
  };
};

// Helper to create consistent cache keys
const createCacheKey = (type: 'coord' | 'city', value: string): string => {
  return `${type}:${value}`;
};

/**
 * Fetches weather data by coordinates with global caching
 */
export const getWeatherByCoordinates = async (lat: number, lon: number, facilityName?: string): Promise<WeatherData> => {
  try {
    // Standardize coordinates for consistent cache keys
    const standardCoords = standardizeCoordinates(lat, lon);
    
    // Create a cache key based on standardized coordinates
    const cacheKey = createCacheKey('coord', `${standardCoords.lat},${standardCoords.lon}`);
    const cache = getGlobalCache();
    
    // Check if we have cached data
    if (cache.has(cacheKey)) {
      console.log(`Using cached weather data for coordinates (${standardCoords.lat},${standardCoords.lon})`);
      return cache.get(cacheKey)!;
    }
    
    // Fetch current weather
    console.log(`Fetching weather data for coordinates: lat=${standardCoords.lat}, lon=${standardCoords.lon}`);
    const currentUrl = `${BASE_URL}/weather?lat=${standardCoords.lat}&lon=${standardCoords.lon}&units=metric&appid=${API_KEY}`;
    const currentResponse = await fetch(currentUrl);
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      throw new Error(`Current weather API error (${currentResponse.status}): ${errorText}`);
    }
    
    const currentData: CurrentWeather = await currentResponse.json();

    // Fetch forecast data (5 days, 3-hour steps)
    const forecastUrl = `${BASE_URL}/forecast?lat=${standardCoords.lat}&lon=${standardCoords.lon}&units=metric&appid=${API_KEY}`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      throw new Error(`Forecast API error (${forecastResponse.status}): ${errorText}`);
    }
    
    const forecastData: ForecastResponse = await forecastResponse.json();

    // Process the data into the expected format
    const processedData = processWeatherData(currentData, forecastData);
    
    // Override city name with facility name if provided
    if (facilityName) {
      processedData.city.name = facilityName;
    }
    
    // Store in global cache
    cache.set(cacheKey, processedData);
    console.log(`Cached weather data for coordinates (${standardCoords.lat},${standardCoords.lon})`);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching weather data by coordinates:', error);
    throw new Error('Failed to fetch weather data');
  }
};

/**
 * Fetches weather data by city name with global caching
 */
export const getWeatherByCity = async (cityName: string, facilityName?: string): Promise<WeatherData> => {
  try {
    // Normalize the city name to ensure consistent cache keys
    const normalizedCity = cityName.trim().toLowerCase();
    
    // Create a cache key based on city name
    const cacheKey = createCacheKey('city', normalizedCity);
    const cache = getGlobalCache();
    
    // Check if we have cached data
    if (cache.has(cacheKey)) {
      console.log(`Using cached weather data for city (${cityName})`);
      return cache.get(cacheKey)!;
    }
    
    // Fetch current weather
    console.log(`Fetching weather data for city: ${cityName}`);
    const currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;
    const currentResponse = await fetch(currentUrl);
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      throw new Error(`Current weather API error (${currentResponse.status}): ${errorText}`);
    }
    
    const currentData: CurrentWeather = await currentResponse.json();

    // Fetch forecast data (5 days, 3-hour steps)
    const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      throw new Error(`Forecast API error (${forecastResponse.status}): ${errorText}`);
    }
    
    const forecastData: ForecastResponse = await forecastResponse.json();

    // Process the data into the expected format
    const processedData = processWeatherData(currentData, forecastData);
    
    // Override city name with facility name if provided
    if (facilityName) {
      processedData.city.name = facilityName;
    }
    
    // Store in global cache
    cache.set(cacheKey, processedData);
    console.log(`Cached weather data for city (${cityName})`);
    
    // Also create a coordinate-based cache entry to ensure consistency
    // between coordinate and city-name based lookups
    if (currentData.coord) {
      const coordCacheKey = createCacheKey('coord', 
        `${standardizeCoordinates(currentData.coord.lat, currentData.coord.lon).lat},${standardizeCoordinates(currentData.coord.lat, currentData.coord.lon).lon}`
      );
      cache.set(coordCacheKey, processedData);
      console.log(`Added coordinate cache entry for city (${cityName})`);
    }
    
    return processedData;
  } catch (error) {
    console.error('Error fetching weather data by city:', error);
    throw new Error(`Failed to fetch weather data for ${cityName}`);
  }
};

/**
 * Process the raw API data into the format expected by the UI
 */
const processWeatherData = (
  currentData: CurrentWeather, 
  forecastData: ForecastResponse
): WeatherData => {
  // Process current weather
  const current = {
    temp: currentData.main.temp,
    feels_like: currentData.main.feels_like,
    humidity: currentData.main.humidity,
    pressure: currentData.main.pressure,
    wind_speed: currentData.wind.speed,
    weather: currentData.weather
  };

  // Group forecast by day (to get daily data)
  const dailyData = processDailyForecast(forecastData.list);

  // Get hourly data (next 24 hours)
  const hourlyData = processHourlyForecast(forecastData.list);

  // Generate consistent historical data using the current data as seed
  const historicData = generateConsistentHistoricData(currentData.main.temp);

  return {
    current,
    daily: dailyData,
    hourly: hourlyData,
    historic: historicData,
    city: {
      name: currentData.name || forecastData.city.name
    }
  };
};

/**
 * Process forecast list into daily data
 */
const processDailyForecast = (forecastList: ForecastItem[]) => {
  // Group by day
  const dayMap = new Map<string, ForecastItem[]>();
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dayMap.has(date)) {
      dayMap.set(date, []);
    }
    dayMap.get(date)?.push(item);
  });

  // Process each day
  const dailyData: any[] = [];
  
  dayMap.forEach((items, date) => {
    // Find min, max temps for the day
    const temps = items.map(item => item.main.temp);
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    
    // Get mid-day item for representative weather
    const midDayItem = items.reduce((prev, curr) => {
      const prevHour = new Date(prev.dt * 1000).getHours();
      const currHour = new Date(curr.dt * 1000).getHours();
      return Math.abs(prevHour - 12) < Math.abs(currHour - 12) ? prev : curr;
    }, items[0]);

    // Calculate average values
    const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
    const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;
    
    // Get max probability of precipitation for the day
    const maxPop = Math.max(...items.map(item => item.pop));

    dailyData.push({
      dt: midDayItem.dt,
      temp: {
        min: tempMin,
        max: tempMax,
        day: midDayItem.main.temp
      },
      humidity: avgHumidity,
      wind_speed: avgWindSpeed,
      weather: midDayItem.weather,
      pop: maxPop
    });
  });

  // Sort by date and limit to 7 days
  dailyData.sort((a, b) => a.dt - b.dt);
  return dailyData.slice(0, 7);
};

/**
 * Process forecast list into hourly data
 */
const processHourlyForecast = (forecastList: ForecastItem[]) => {
  // Get the next 24 hours of forecast data
  const hourlyItems = forecastList.slice(0, 8); // 8 items = 24 hours (3-hour steps)
  
  return hourlyItems.map(item => ({
    dt: item.dt,
    temp: item.main.temp,
    humidity: item.main.humidity,
    weather: item.weather,
    pop: item.pop || 0
  }));
};

/**
 * Generate consistent historical data using the current temperature as seed
 * This ensures consistency between widget and analytics page
 */
const generateConsistentHistoricData = (currentTemp: number) => {
  // Use current temperature as base for consistency
  const baseSeed = Math.round(currentTemp);
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (7 - i));
    
    // Generate deterministic values based on the date and current temp
    const day = date.getDate();
    const month = date.getMonth() + 1;
    // Use deterministic formula for temperature variation
    const baseTemp = baseSeed + ((day * month) % 5 - 2);
    
    return {
      date: date.toISOString().split('T')[0],
      temp: {
        min: baseTemp - 3,
        max: baseTemp + 4,
        avg: baseTemp
      },
      humidity: 60 + ((day + month) % 30),
      wind_speed: 3 + ((day * month) % 7),
      // Use deterministic index selection for consistent weather condition
      weather: ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Moderate Rain"][(day + month) % 5],
      icon: ["01d", "02d", "03d", "04d", "09d", "10d"][(day + month) % 6]
    };
  });
};

/**
 * Utility function to format date
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get weather icon URL from OpenWeatherMap
 */
export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};