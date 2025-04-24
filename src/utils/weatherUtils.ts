export interface WeatherData {
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
    dt_txt?: string;
  }
  
  // Format date for display
  export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get weather icon URL from OpenWeatherMap
  export const getWeatherIconUrl = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };
  
  // Convert wind direction degrees to cardinal direction
  export const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  
  // Calculate average temperature from an array of weather data
  export const calculateAverageTemp = (weatherDataArray: WeatherData[]): number => {
    if (!weatherDataArray.length) return 0;
    const sum = weatherDataArray.reduce((acc, data) => acc + data.main.temp, 0);
    return sum / weatherDataArray.length;
  };
  
  // Group forecast data by day
  export const groupForecastByDay = (forecastData: WeatherData[]): { [key: string]: WeatherData[] } => {
    const grouped: { [key: string]: WeatherData[] } = {};
    
    forecastData.forEach(data => {
      if (!data.dt_txt) return;
      
      const date = data.dt_txt.split(' ')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(data);
    });
    
    return grouped;
  };
  
  // Get daily summary from hourly data
  export const getDailySummary = (dayData: WeatherData[]): {
    date: string;
    tempMin: number;
    tempMax: number;
    tempAvg: number;
    icon: string;
    description: string;
    humidity: number;
    windSpeed: number;
  } => {
    const temps = dayData.map(d => d.main.temp);
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    const tempAvg = calculateAverageTemp(dayData);
    
    // Get the weather for noon or the middle of the day as representative
    const midDayWeather = dayData.sort((a, b) => {
      const aHour = a.dt_txt ? parseInt(a.dt_txt.split(' ')[1].split(':')[0]) : 0;
      const bHour = b.dt_txt ? parseInt(b.dt_txt.split(' ')[1].split(':')[0]) : 0;
      return Math.abs(aHour - 12) - Math.abs(bHour - 12);
    })[0];
    
    const humidity = dayData.reduce((acc, d) => acc + d.main.humidity, 0) / dayData.length;
    const windSpeed = dayData.reduce((acc, d) => acc + d.wind.speed, 0) / dayData.length;
    
    return {
      date: midDayWeather.dt_txt ? midDayWeather.dt_txt.split(' ')[0] : '',
      tempMin,
      tempMax,
      tempAvg,
      icon: midDayWeather.weather[0].icon,
      description: midDayWeather.weather[0].description,
      humidity,
      windSpeed
    };
  };
  
  // Generate mock weather data for testing
  export const generateMockWeatherData = (cityName: string): any => {
    // Current weather
    const current = {
      temp: 25 + (Math.random() * 10 - 5),
      feels_like: 26 + (Math.random() * 10 - 5),
      humidity: 60 + Math.floor(Math.random() * 30),
      pressure: 1010 + Math.floor(Math.random() * 20),
      wind_speed: 3 + Math.random() * 7,
      weather: [{
        id: 800,
        main: "Clear",
        description: "clear sky",
        icon: "01d"
      }]
    };
    
    // Generate daily forecast (7 days)
    const daily = Array.from({ length: 7 }, (_, i) => {
      const tempDay = 25 + (Math.random() * 10 - 5);
      return {
        dt: Math.floor(Date.now() / 1000) + (i * 86400),
        temp: {
          min: tempDay - 5 - Math.random() * 3,
          max: tempDay + 5 + Math.random() * 3,
          day: tempDay
        },
        humidity: 60 + Math.floor(Math.random() * 30),
        wind_speed: 3 + Math.random() * 7,
        weather: [{
          id: 800,
          main: ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)],
          description: "weather condition",
          icon: ["01d", "02d", "03d", "04d", "09d", "10d"][Math.floor(Math.random() * 6)]
        }],
        pop: Math.random() * 0.7 // Probability of precipitation
      };
    });
    
    // Generate hourly forecast (24 hours)
    const hourly = Array.from({ length: 24 }, (_, i) => {
      return {
        dt: Math.floor(Date.now() / 1000) + (i * 3600),
        temp: 25 + (Math.random() * 10 - 5),
        humidity: 60 + Math.floor(Math.random() * 30),
        weather: [{
          id: 800,
          main: ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)],
          description: "weather condition",
          icon: ["01d", "02d", "03d", "04d", "09d", "10d"][Math.floor(Math.random() * 6)]
        }],
        pop: Math.random() * 0.7
      };
    });
    
    // Generate historical data (past 7 days)
    const historic = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (7 - i));
      
      const avgTemp = 25 + (Math.random() * 10 - 5);
      return {
        date: date.toISOString().split('T')[0],
        temp: {
          min: avgTemp - 4 - Math.random() * 2,
          max: avgTemp + 4 + Math.random() * 2,
          avg: avgTemp
        },
        humidity: 60 + Math.floor(Math.random() * 30),
        wind_speed: 3 + Math.random() * 7,
        weather: ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Moderate Rain"][Math.floor(Math.random() * 5)],
        icon: ["01d", "02d", "03d", "04d", "09d", "10d"][Math.floor(Math.random() * 6)]
      };
    });
    
    return { current, daily, hourly, historic, city: { name: cityName } };
  };