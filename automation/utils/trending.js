import fetch from 'node-fetch';

export async function getTrendingTopics() {
  const topics = [];
  
  try {
    // Google Trends (using unofficial API or RSS)
    const googleTrends = await fetchGoogleTrends();
    topics.push(...googleTrends);
    
    // News API
    const newsTopics = await fetchNewsAPI();
    topics.push(...newsTopics);
    
    // Reddit trending
    const redditTopics = await fetchRedditTrending();
    topics.push(...redditTopics);
    
  } catch (error) {
    console.error('Error fetching trending topics:', error);
  }
  
  return topics;
}

async function fetchGoogleTrends() {
  try {
    // Using Google Trends RSS feed
    const response = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN');
    const text = await response.text();
    
    // Parse RSS (simplified)
    const titleMatches = text.match(/<title>(.*?)<\/title>/g);
    if (!titleMatches) return [];
    
    return titleMatches
      .slice(1, 11) // Skip first title (channel title)
      .map(match => {
        const title = match.replace(/<\/?title>/g, '');
        return {
          topic: title,
          source: 'google-trends',
          category: categorizeTopic(title),
        };
      });
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return [];
  }
}

async function fetchNewsAPI() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${apiKey}`
    );
    const data = await response.json();
    
    if (!data.articles) return [];
    
    return data.articles.map(article => ({
      topic: article.title,
      source: 'news-api',
      category: categorizeTopic(article.title),
      description: article.description,
    }));
  } catch (error) {
    console.error('Error fetching News API:', error);
    return [];
  }
}

async function fetchRedditTrending() {
  try {
    const subreddits = ['news', 'worldnews', 'technology', 'sports'];
    const topics = [];
    
    for (const subreddit of subreddits) {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`
      );
      const data = await response.json();
      
      if (data.data && data.data.children) {
        data.data.children.forEach(post => {
          topics.push({
            topic: post.data.title,
            source: 'reddit',
            category: categorizeTopic(post.data.title),
            subreddit,
          });
        });
      }
    }
    
    return topics;
  } catch (error) {
    console.error('Error fetching Reddit:', error);
    return [];
  }
}

function categorizeTopic(title) {
  const titleLower = title.toLowerCase();
  
  // IPL/Cricket keywords
  if (titleLower.match(/ipl|cricket|match|wicket|century|bowler|batsman|t20/)) {
    return 'ipl';
  }
  
  // Sports keywords
  if (titleLower.match(/sport|football|tennis|olympics|championship|tournament/)) {
    return 'sports';
  }
  
  // Technology keywords
  if (titleLower.match(/tech|ai|software|app|smartphone|computer|digital|cyber/)) {
    return 'technology';
  }
  
  // Business keywords
  if (titleLower.match(/business|economy|market|stock|company|startup|finance/)) {
    return 'business';
  }
  
  // Politics keywords
  if (titleLower.match(/politics|government|election|minister|parliament|policy/)) {
    return 'politics';
  }
  
  // Entertainment keywords
  if (titleLower.match(/movie|film|actor|music|celebrity|entertainment|bollywood/)) {
    return 'entertainment';
  }
  
  return 'world';
}

export async function getIPLTrendingTopics() {
  try {
    // Fetch cricket/IPL specific trends
    const topics = [];
    
    // Twitter API (if available)
    // const twitterTopics = await fetchTwitterIPL();
    
    // CricAPI or similar sports API
    const cricketTopics = await fetchCricketNews();
    topics.push(...cricketTopics);
    
    return topics;
  } catch (error) {
    console.error('Error fetching IPL topics:', error);
    return [];
  }
}

async function fetchCricketNews() {
  // Placeholder for cricket API integration
  // You can use CricAPI, ESPN Cricinfo API, etc.
  return [
    { topic: 'IPL Match Preview', category: 'ipl', type: 'preview' },
    { topic: 'Player Performance Analysis', category: 'ipl', type: 'analysis' },
  ];
}
