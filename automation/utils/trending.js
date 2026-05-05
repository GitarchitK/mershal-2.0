import fetch from 'node-fetch';

/**
 * Fetch trending topics with multiple fallback strategies:
 * 1. Google Trends RSS (may be blocked on CI servers)
 * 2. NewsAPI top headlines (requires NEWS_API_KEY)
 * 3. GNews API (requires GNEWS_API_KEY)
 * 4. Hardcoded evergreen news topics as last resort
 */
export async function getTrendingTopics(geo = 'US') {
  let topics = [];

  // Strategy 1: Google Trends RSS
  topics = await fetchGoogleTrendsRSS(geo);
  if (topics.length > 0) {
    console.log(`✓ ${topics.length} topics from Google Trends RSS`);
    return await enrichWithRealFacts(topics);
  }

  // Strategy 2: NewsAPI top headlines
  topics = await fetchNewsAPIHeadlines();
  if (topics.length > 0) {
    console.log(`✓ ${topics.length} topics from NewsAPI`);
    return topics;
  }

  // Strategy 3: GNews API
  topics = await fetchGNewsTopics();
  if (topics.length > 0) {
    console.log(`✓ ${topics.length} topics from GNews`);
    return topics;
  }

  // Strategy 4: Fallback to evergreen news topics
  console.log('⚠️  All live sources failed. Using fallback topic list.');
  return getFallbackTopics();
}

async function fetchGoogleTrendsRSS(geo) {
  const topics = [];
  const urls = [
    `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
    `https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (!res.ok) { console.warn(`Google Trends returned ${res.status}`); continue; }
      const xml = await res.text();
      if (!xml.includes('<item>')) { console.warn('Google Trends RSS returned empty feed'); continue; }
      const parsed = parseGoogleTrendsRSS(xml);
      topics.push(...parsed);
    } catch (e) {
      console.warn(`Google Trends fetch failed:`, e.message);
    }
  }

  const seen = new Set();
  return topics.filter(t => {
    const key = t.topic.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchNewsAPIHeadlines() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.articles?.length) return [];
    return data.articles.filter(a => a.title && a.description).map(a => ({
      topic: cleanTitle(a.title),
      category: categorizeTopic(a.title + ' ' + (a.description || '')),
      source: a.source?.name || 'NewsAPI',
      traffic: 'High',
      realFacts: [{ headline: a.title, snippet: a.description || '', source: a.source?.name || '', url: a.url || '' }],
      relatedHeadlines: [],
    }));
  } catch (e) {
    console.warn('NewsAPI failed:', e.message);
    return [];
  }
}

async function fetchGNewsTopics() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://gnews.io/api/v4/top-headlines?lang=en&max=20&apikey=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.articles?.length) return [];
    return data.articles.filter(a => a.title && a.description).map(a => ({
      topic: cleanTitle(a.title),
      category: categorizeTopic(a.title + ' ' + (a.description || '')),
      source: a.source?.name || 'GNews',
      traffic: 'High',
      realFacts: [{ headline: a.title, snippet: a.description || '', source: a.source?.name || '', url: a.url || '' }],
      relatedHeadlines: [],
    }));
  } catch (e) {
    console.warn('GNews failed:', e.message);
    return [];
  }
}

async function enrichWithRealFacts(topics) {
  const enriched = [];
  for (const topic of topics.slice(0, 20)) {
    const facts = await fetchRealNewsFacts(topic.topic);
    enriched.push({ ...topic, realFacts: facts });
    await new Promise(r => setTimeout(r, 400));
  }
  return enriched;
}

async function fetchRealNewsFacts(topic) {
  const facts = [];

  // Try GNews API
  const gnewsKey = process.env.GNEWS_API_KEY;
  if (gnewsKey) {
    try {
      const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=5&apikey=${gnewsKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.articles?.length) {
          return data.articles.map(a => ({
            headline: a.title,
            snippet: a.description || '',
            source: a.source?.name || '',
            url: a.url || '',
          }));
        }
      }
    } catch (e) { /* fall through */ }
  }

  // Fallback: Google News RSS
  try {
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Mershal/1.0)' } }
    );
    if (res.ok) {
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (const item of items.slice(0, 6)) {
        const title = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const desc = (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';
        const source = (item.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || '';
        const cleanT = title.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').trim();
        const cleanD = desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
        if (cleanT) facts.push({ headline: cleanT, snippet: cleanD, source: source.trim() });
      }
    }
  } catch (e) { /* fall through */ }

  return facts;
}

function getFallbackTopics() {
  return [
    { topic: 'Global Climate Change Policy 2026', category: 'world' },
    { topic: 'Artificial Intelligence Regulation', category: 'technology' },
    { topic: 'Global Economic Outlook', category: 'business' },
    { topic: 'US Presidential Policy Updates', category: 'politics' },
    { topic: 'India Economic Growth 2026', category: 'business' },
    { topic: 'Electric Vehicle Market Trends', category: 'technology' },
    { topic: 'Middle East Geopolitical Situation', category: 'world' },
    { topic: 'Cryptocurrency Market Update', category: 'business' },
    { topic: 'Space Exploration Milestones', category: 'technology' },
    { topic: 'Global Health and Pandemic Preparedness', category: 'world' },
  ].map(t => ({ ...t, source: 'Fallback', traffic: 'Medium', realFacts: [], relatedHeadlines: [] }));
}

function parseGoogleTrendsRSS(xml) {
  const topics = [];
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of items) {
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       item.match(/<title>(.*?)<\/title>/);
    if (!titleMatch) continue;
    const topic = titleMatch[1].trim();
    if (!topic || topic.length < 3) continue;
    const trafficMatch = item.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
    const newsItems = item.match(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g) || [];
    const relatedHeadlines = newsItems.map(ni => {
      const h = ni.match(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/);
      const s = ni.match(/<ht:news_item_snippet><!\[CDATA\[(.*?)\]\]><\/ht:news_item_snippet>/);
      return { headline: h ? h[1] : '', snippet: s ? s[1] : '' };
    }).filter(n => n.headline);
    topics.push({
      topic,
      traffic: trafficMatch ? trafficMatch[1] : '',
      relatedHeadlines,
      category: categorizeTopic(topic),
      source: 'Google Trends',
    });
  }
  return topics;
}

function cleanTitle(title) {
  return title.replace(/\s*[-|]\s*(BBC|CNN|Reuters|AP|Guardian|NYT|Bloomberg).*$/i, '').trim();
}

function categorizeTopic(title) {
  const t = title.toLowerCase();
  if (t.match(/election|vote|minister|parliament|president|government|policy|senate|congress|political/)) return 'politics';
  if (t.match(/stock|market|economy|gdp|inflation|company|startup|finance|business|trade|bank/)) return 'business';
  if (t.match(/iphone|android|ai|tech|software|app|google|microsoft|apple|meta|openai|robot/)) return 'technology';
  if (t.match(/football|cricket|tennis|nba|nfl|fifa|olympics|match|tournament|sport|player|team/)) return 'sports';
  if (t.match(/movie|film|actor|music|celebrity|award|oscar|grammy|netflix|series|show/)) return 'entertainment';
  return 'world';
}
