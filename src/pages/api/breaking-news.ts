import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const NEWS_API_KEY = import.meta.env.NEWS_API_KEY;
  
  if (!NEWS_API_KEY) {
    return new Response(JSON.stringify({ 
      headlines: [
        'Welcome to Mershal - Your trusted source for breaking news',
        'Stay updated with the latest global developments',
        'Follow us for real-time news coverage'
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  }

  try {
    // Fetch top breaking news from multiple sources
    const sources = 'bbc-news,cnn,reuters,al-jazeera-english';
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=${sources}&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('NewsAPI request failed');
    }

    const data = await response.json();
    
    if (data.status === 'ok' && data.articles) {
      // Extract and clean headlines
      const headlines = data.articles
        .filter((article: any) => article.title)
        .map((article: any) => {
          // Remove source attribution from headlines
          let title = article.title
            .replace(/\s*-\s*(BBC|CNN|Reuters|Al Jazeera|NYT|Guardian).*$/i, '')
            .replace(/\s*\|\s*.*$/, '')
            .trim();
          
          // Limit length
          if (title.length > 100) {
            title = title.substring(0, 97) + '...';
          }
          
          return title;
        })
        .slice(0, 8); // Get top 8 headlines

      return new Response(JSON.stringify({ headlines }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      });
    }

    // Fallback headlines
    return new Response(JSON.stringify({ 
      headlines: [
        'Breaking: Global markets react to latest economic data',
        'Technology sector sees major developments',
        'International summit addresses climate concerns',
        'Sports world celebrates historic achievement'
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Error fetching breaking news:', error);
    
    // Return fallback headlines on error
    return new Response(JSON.stringify({ 
      headlines: [
        'Welcome to Mershal - Your trusted source for breaking news',
        'Stay updated with the latest global developments',
        'Follow us for real-time news coverage'
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};
