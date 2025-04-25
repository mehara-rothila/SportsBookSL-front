'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon,
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
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


// --- Start of generateResponse implementation (updated model name) ---

const generateResponse = async (query: string, weatherData: any, facilityName: string): Promise<string> => {
  try {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return "I'm having trouble connecting to my knowledge base. Please ensure the API key is configured.";
    }
    
    // Extract relevant weather info to reduce token usage and provide context
    const simplifiedWeatherData = {
      current: {
        temp: weatherData.current?.temp,
        feels_like: weatherData.current?.feels_like,
        humidity: weatherData.current?.humidity,
        wind_speed: weatherData.current?.wind_speed,
        weather: weatherData.current?.weather
      },
      // Limit hourly data to the next 12 hours
      hourly: weatherData.hourly?.slice(0, 12).map((h: any) => ({
        dt: h.dt,
        temp: h.temp,
        pop: h.pop, // Probability of Precipitation
        weather: h.weather?.[0]
      })),
      // Limit daily data to the next 5 days
      daily: weatherData.daily?.slice(0, 5).map((d: any) => ({
        dt: d.dt,
        temp: d.temp,
        humidity: d.humidity,
        pop: d.pop, // Probability of Precipitation
        weather: d.weather?.[0]
      })),
      // Limit historic data to the last 3 days (assuming it's structured similarly)
      historic: weatherData.historic?.slice(0, 3).map((d: any) => ({
        date: d.date, // Assuming 'date' might be a Unix timestamp too
        temp: d.temp,
        humidity: d.humidity,
        weather: d.weather // Assuming this is an array like current/daily/hourly weather
      }))
    };

    const systemPrompt = `You are a helpful weather assistant for a sports facility called "${facilityName}". 
    Your task is to answer weather-related questions based *only* on the provided weather data. 
    Be concise, friendly, and informative. Include numerical data when relevant.
    If you cannot answer a question based on the provided data (e.g., asked for a date outside the provided range, or data is missing), acknowledge that limitation politely.
    DO NOT make up information about the weather that isn't provided in the data.
    The dates/times in the data (dt, date fields) are Unix timestamps in seconds. Interpret them accordingly for the user's locale if necessary, but stick to the provided data ranges.`;
    
    // Construct the prompt for Gemini
    // *** CHANGED MODEL NAME HERE AS REQUESTED ***
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
            { text: `User query: ${query}` }
          ]
        }]
      })
    });
    
    if (!response.ok) {
      // Attempt to read error body if available
      const errorBody = await response.text();
      console.error(`API responded with status: ${response.status}, Body: ${errorBody}`);
      // *** NOTE: The model name 'gemini-2.0-flash' might not be valid for this API endpoint.
      // If you get an error, check Google's official documentation for valid model names
      // or ensure your specific setup uses this name. ***
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API returned no valid candidates:', data);
      return "I received a response, but it didn't contain a valid answer. Please try rephrasing your question.";
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};

// --- End of generateResponse implementation ---


const WeatherChatbot: React.FC<WeatherChatbotProps> = ({ 
  weatherData, 
  facilityName, 
  className = '' 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your weather assistant for ${facilityName}. Ask me about current conditions, forecasts, or historical weather patterns!` 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await generateResponse(inputMessage, weatherData, facilityName);
      
      // Add bot response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get weather icon based on condition string
  const getWeatherIcon = (condition: string | undefined) => {
    if (!condition) return null;
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return <SunIcon className="h-5 w-5 text-yellow-400" />;
      case 'clouds':
        return <CloudIcon className="h-5 w-5 text-gray-300" />;
      case 'rain':
      case 'drizzle':
        return <CloudRainIcon className="h-5 w-5 text-blue-400" />;
      case 'thunderstorm':
        return <BoltIcon className="h-5 w-5 text-yellow-500" />;
      // Add more cases as needed (Snow, Mist, Fog, Haze, etc.)
      default:
        return null;
    }
  };
  
  // Helper to attempt to find a weather condition in the message content
  // This is a heuristic and might not be perfect, but helps add icons.
  // It could be improved by trying to match specific forecast phrases.
  const parseMessageForWeatherCondition = (content: string) => {
     const lowerContent = content.toLowerCase();
     if (lowerContent.includes('clear') || lowerContent.includes('sunny')) return 'clear';
     if (lowerContent.includes('cloudy') || lowerContent.includes('clouds') || lowerContent.includes('overcast')) return 'clouds';
     if (lowerContent.includes('rain') || lowerContent.includes('drizzle')) return 'rain';
     if (lowerContent.includes('thunderstorm') || lowerContent.includes('storm')) return 'thunderstorm';
     // Add more keywords as needed
     return undefined;
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <CloudIcon className="h-6 w-6 mr-2 text-emerald-400" />
          Weather Assistant
        </h3>
        <div className="bg-emerald-900/70 text-emerald-300 text-xs px-3 py-1 rounded-full">
          AI-Powered
        </div>
      </div>
      
      {/* Chat container */}
      <div 
        ref={chatContainerRef} 
        className="bg-gradient-to-br from-emerald-900/40 to-green-900/30 rounded-xl p-4 border border-white/10 shadow-inner h-80 overflow-y-auto mb-4 custom-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-3/4 px-4 py-2 rounded-2xl shadow-md ${
                msg.role === 'user' 
                  ? 'bg-emerald-600/80 text-white rounded-tr-none' 
                  : 'bg-white/10 backdrop-blur-sm text-white rounded-tl-none border border-white/10'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center mb-1 pb-1 border-b border-white/10">
                  <CloudIcon className="h-4 w-4 mr-1 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Weather Assistant</span>
                </div>
              )}
              <div className="text-sm md:text-base">
                 {/* Try to find a weather condition in the assistant's response */}
                {msg.role === 'assistant' && getWeatherIcon(parseMessageForWeatherCondition(msg.content)) && (
                  <span className="inline-block mr-1 align-middle">
                    {getWeatherIcon(parseMessageForWeatherCondition(msg.content))}
                  </span>
                )}
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white/10 backdrop-blur-sm text-white rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-white/10">
              <div className="flex items-center mb-1 pb-1 border-b border-white/10">
                <CloudIcon className="h-4 w-4 mr-1 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Weather Assistant</span>
              </div>
              <div className="flex space-x-2 items-center h-5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12 shadow-inner"
            placeholder="Ask about weather conditions..."
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`absolute right-1 top-1 p-2 rounded-full ${
              inputMessage.trim() && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-emerald-900/50 text-emerald-400/70'
            } transition-colors`}
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
      
      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button 
          onClick={() => !isLoading && setInputMessage("What's the temperature today?")}
          disabled={isLoading}
          className="bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-xs rounded-full px-3 py-1.5 border border-emerald-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Today's temperature
        </button>
        <button 
          onClick={() => !isLoading && setInputMessage("Will it rain tomorrow?")}
          disabled={isLoading}
          className="bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-xs rounded-full px-3 py-1.5 border border-emerald-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Rain forecast
        </button>
        <button 
          onClick={() => !isLoading && setInputMessage("Weather forecast for the next 3 days")}
          disabled={isLoading}
          className="bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-xs rounded-full px-3 py-1.5 border border-emerald-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          3-day forecast
        </button>
         <button 
          onClick={() => !isLoading && setInputMessage("What was the weather yesterday?")}
          disabled={isLoading}
          className="bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-xs rounded-full px-3 py-1.5 border border-emerald-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Yesterday's weather
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-4 pt-2 border-t border-white/10">
        This assistant provides weather insights based on available data
      </div>
    </div>
  );
};

export default WeatherChatbot;