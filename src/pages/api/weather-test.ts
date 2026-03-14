import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'Weather API key not configured',
      message: 'Please add WEATHER_API_KEY to your .env file',
      envCheck: 'API key is missing or empty'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Kolkata&aqi=no`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: 'Weather API request failed',
        status: response.status,
        message: errorText,
        apiKeyPresent: true,
        apiKeyLength: apiKey.length
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data,
      apiKeyPresent: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch weather',
      message: error instanceof Error ? error.message : 'Unknown error',
      apiKeyPresent: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
