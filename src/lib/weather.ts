interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
  };
}

export async function getCurrentWeather(city: string = 'Kolkata'): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHER_API_KEY || import.meta.env.WEATHER_API_KEY;
  
  console.log('Weather API Key present:', !!apiKey);
  console.log('Weather API Key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.warn('Weather API key not configured. Using mock data.');
    return null;
  }

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    console.log('Fetching weather for:', city);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: WeatherData = await response.json();
    console.log('Weather data received:', data.location.name, data.current.temp_c + '°C');
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
}

export function getWeatherEmoji(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return '☀️';
  if (lowerCondition.includes('partly cloudy')) return '⛅';
  if (lowerCondition.includes('cloudy') || lowerCondition.includes('overcast')) return '☁️';
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️';
  if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return '⛈️';
  if (lowerCondition.includes('snow')) return '❄️';
  if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) return '🌫️';
  
  return '🌤️';
}
