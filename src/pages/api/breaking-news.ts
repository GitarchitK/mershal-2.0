import type { APIRoute } from 'astro';

// Professional fallback headlines (used when API fails or no key)
const FALLBACK_HEADLINES = [
  'Breaking: Global markets show strong performance amid economic uncertainty',
  'Technology giants announce major AI partnerships in new deal',
  'World leaders gather for crucial climate summit discussions',
  'Sports: Historic championship final draws record viewership',
  'Business: Major merger creates industry powerhouse worth billions',
  'Health officials release new guidelines for disease prevention',
  'Space agency announces ambitious mission to explore new frontiers',
  'Entertainment: Award season kicks off with surprise nominations',
  'Politics: Key legislation passes in landmark parliamentary session',
  'Science: Researchers make breakthrough discovery in renewable energy'
];

export const GET: APIRoute = async () => {
  const NEWS_API_KEY = import.meta.env.NEWS_API_KEY;
  
  console.log('Breaking News API - NEWS_API_KEY present:', !!NEWS_API_KEY);
  
  if (!NEWS_API_KEY || NEWS_API_KEY === '') {
    console.log('No NEWS_API_KEY found, using fallback headlines');
    return new Response(JSON.stringify({ 
      headlines: FALLBACK_HEADLINES
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  try {
    // Fetch top breaking news from multiple sources
    const sources = 'bbc-news,cnn,reuters,al-jazeera-english';
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=${sources}&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    console.log('NewsAPI response status:', response.status);

    if (!response.ok) {
      throw new Error(`NewsAPI request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('NewsAPI data status:', data.status);
    
    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
      // Extract and clean headlines
      const headlines = data.articles
        .filter((article: any) => article.title && article.title !== '[Removed]')
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
        .slice(0, 8);

      console.log('Fetched headlines:', headlines.length);
      
      return new Response(JSON.stringify({ headlines }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // API returned no articles
    console.log('No articles from NewsAPI, using fallback');
    return new Response(JSON.stringify({ 
      headlines: FALLBACK_HEADLINES
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
      headlines: FALLBACK_HEADLINES
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};
