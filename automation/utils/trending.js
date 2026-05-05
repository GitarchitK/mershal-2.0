import fetch from 'node-fetch';

/**
 * Fetch trending topics from Google Trends RSS feed.
 * No API key required. Returns top trending searches for US/Global.
 */
export async function getTrendingTopics(geo = 'US') {
  const topics = [];

  try {
    // Google Trends daily trending searches RSS
    const urls = [
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN`, // India trends
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Mershal/1.0)' },
          timeout: 10000,
        });
        if (!res.ok) continue;

        const xml = await res.text();
        const parsed = parseGoogleTrendsRSS(xml);
        topics.push(...parsed);
      } catch (e) {
        console.warn(`Could not fetch trends from ${url}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Trending fetch error:', e.message);
  }

  // Deduplicate by topic text
  const seen = new Set();
  const unique = topics.filter(t => {
    const key = t.topic.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`✓ Found ${unique.length} trending topics from Google Trends`);
  return unique.slice(0, 30);
}

function parseGoogleTrendsRSS(xml) {
  const topics = [];

  // Extract <item> blocks
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const item of items) {
    // Title
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       item.match(/<title>(.*?)<\/title>/);
    if (!titleMatch) continue;
    const topic = titleMatch[1].trim();
    if (!topic || topic.length < 3) continue;

    // Traffic / approximate searches
    const trafficMatch = item.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
    const traffic = trafficMatch ? trafficMatch[1] : '';

    // News items inside the trend
    const newsItems = item.match(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g) || [];
    const relatedHeadlines = newsItems.map(ni => {
      const h = ni.match(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/);
      const s = ni.match(/<ht:news_item_snippet><!\[CDATA\[(.*?)\]\]><\/ht:news_item_snippet>/);
      return {
        headline: h ? h[1] : '',
        snippet: s ? s[1] : '',
      };
    }).filter(n => n.headline);

    topics.push({
      topic,
      traffic,
      relatedHeadlines,
      category: categorizeTopic(topic),
      source: 'Google Trends',
    });
  }

  return topics;
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
