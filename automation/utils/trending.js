import fetch from 'node-fetch';

// Top international news sources
const NEWS_SOURCES = {
  bbc: 'bbc-news',
  cnn: 'cnn',
  reuters: 'reuters',
  aljazeera: 'al-jazeera-english',
  nyt: 'the-new-york-times',
  guardian: 'the-guardian-uk',
  washingtonpost: 'the-washington-post',
  bloomberg: 'bloomberg',
  techcrunch: 'techcrunch',
  espn: 'espn',
};

export async function getTrendingTopics() {
  const topics = [];
  
  try {
    // Fetch from top international news sources
    const newsTopics = await fetchTopNewsHeadlines();
    topics.push(...newsTopics);
    
    // Google Trends as backup
    const googleTrends = await fetchGoogleTrends();
    topics.push(...googleTrends);
    
  } catch (error) {
    console.error('Error fetching trending topics:', error);
  }
  
  // Remove duplicates and return top 50
  const uniqueTopics = Array.from(
    new Map(topics.map(t => [t.topic.toLowerCase(), t])).values()
  );
  
  return uniqueTopics.slice(0, 50);
}

async function fetchTopNewsHeadlines() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log('⚠️  NEWS_API_KEY not set. Get free key at https://newsapi.org');
    return [];
  }
  
  try {
    // Fetch from multiple top sources
    const sources = Object.values(NEWS_SOURCES).join(',');
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=${sources}&pageSize=100&apiKey=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.articles) {
      console.error('NewsAPI error:', data.message || 'Unknown error');
      return [];
    }
    
    console.log(`✓ Fetched ${data.articles.length} headlines from top sources`);
    
    return data.articles
      .filter(article => article.title && article.description)
      .map(article => ({
        topic: cleanHeadline(article.title),
        source: article.source.name,
        category: categorizeTopic(article.title + ' ' + article.description),
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
      }));
  } catch (error) {
    console.error('Error fetching NewsAPI:', error);
    return [];
  }
}

function cleanHeadline(title) {
  // Remove source attribution from headlines
  return title
    .replace(/\s*-\s*(BBC|CNN|Reuters|Al Jazeera|NYT|Guardian).*$/i, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim();
}

async function fetchGoogleTrends() {
  try {
    // Using Google Trends RSS feed for global trends
    const response = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US');
    const text = await response.text();
    
    // Parse RSS (simplified)
    const titleMatches = text.match(/<title>(.*?)<\/title>/g);
    if (!titleMatches) return [];
    
    return titleMatches
      .slice(1, 21) // Skip first title (channel title), get 20 trends
      .map(match => {
        const title = match.replace(/<\/?title>/g, '');
        return {
          topic: title,
          source: 'Google Trends',
          category: categorizeTopic(title),
        };
      });
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return [];
  }
}

async function fetchNewsAPI() {
  // This function is now replaced by fetchTopNewsHeadlines
  return [];
}

async function fetchRedditTrending() {
  // Disabled - focusing on professional news sources only
  return [];
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
