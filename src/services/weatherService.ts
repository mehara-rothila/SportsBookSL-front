// src/services/weatherService.ts
import api from './api';

interface WeatherParams {
    lat?: number;
    lon?: number;
    facilityId?: string;
    date?: string; // YYYY-MM-DD format
}

// Define a more specific type for the expected weather response
// This should match what your backend /api/weather endpoint returns
interface WeatherResponse {
    message: string;
    query: WeatherParams;
    forecast?: {
        temp: number;
        condition: string; // e.g., 'Partly Cloudy'
        conditionCode?: string; // e.g., 'partly-cloudy'
        rainChance: number;
        windSpeed: number;
        // Add other relevant fields like humidity, feelsLike, etc.
    };
    suitabilityScore?: number;
    // Add fields for multi-day forecast if your backend provides it
}

/**
 * Fetch weather information and suitability score.
 * @param params - Query parameters including lat/lon or facilityId.
 */
export const getWeather = async (params: WeatherParams): Promise<WeatherResponse> => {
  try {
    console.log("Service: Getting weather with params:", params);
    const response = await api.get<WeatherResponse>('/weather', { params });
    console.log("Service: Get weather response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get Weather Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching weather information');
  }
};