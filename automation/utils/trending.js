import fetch from 'node-fetch';

/**
 * Fetch trending topics from Google Trends RSS,
 * then enrich each topic with real news from GNews API (free tier: 100 req/day).
 * No NewsAPI key needed — GNews free tier works fine.
 */
export async function getTrendingTopics(geo = 'US') {
  const topics = [];

  try {
    const urls = [
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Mershal/1.0)' },
        });
        if (!res.ok) continue;
        const xml = await res.text();
        const parsed = parseGoogleTrendsRSS(xml);
        topics.push(...parsed);
      } catch (e) {
        console.warn(`Trends fetch failed for ${url}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Trending error:', e.message);
  }

  // Deduplicate
  const seen = new Set();
  const unique = topics.filter(t => {
    const key = t.topic.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`✓ ${unique.length} trending topics from Google Trends`);

  // Enrich top topics with real news facts
  const enriched = [];
  for (const topic of unique.slice(0, 20)) {
    const facts = await fetchRealNewsFacts(topic.topic);
    enriched.push({ ...topic, realFacts: facts });
    // Small delay to be polite to APIs
    await new Promise(r => setTimeout(r, 500));
  }

  return enriched;
}

/**
 * Fetch real news headlines and snippets about a topic.
 * Uses GNews API (free: 100 req/day) or falls back to Google News RSS.
 */
async function fetchRealNewsFacts(topic) {
  const facts = [];

  // Try GNews API first (free tier, no credit card)
  const gnewsKey = process.env.GNEWS_API_KEY;
  if (gnewsKey) {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=5&apikey=${gnewsKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.articles?.length) {
          for (const a of data.articles) {
            facts.push({
              headline: a.title,
              snippet: a.description || '',
              source: a.source?.name || '',
              publishedAt: a.publishedAt || '',
              url: a.url || '',
            });
          }
          console.log(`  ✓ ${facts.length} real facts for "${topic}" (GNews)`);
          return facts;
        }
      }
    } catch (e) {
      console.warn('GNews failed:', e.message);
    }
  }

  // Fallback: Google News RSS (no API key needed)
  try {
    const query = encodeURIComponent(topic);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Mershal/1.0)' },
    });
    if (res.ok) {
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (const item of items.slice(0, 6)) {
        const title = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const desc = (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';
        const source = (item.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || '';
        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').trim();
        const cleanDesc = desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
        if (cleanTitle) {
          facts.push({ headline: cleanTitle, snippet: cleanDesc, source: source.trim() });
        }
      }
      if (facts.length) console.log(`  ✓ ${facts.length} real facts for "${topic}" (Google News RSS)`);
    }
  } catch (e) {
    console.warn('Google News RSS failed:', e.message);
  }

  return facts;
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
    const traffic = trafficMatch ? trafficMatch[1] : '';

    // Related headlines already in the RSS
    const newsItems = item.match(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g) || [];
    const relatedHeadlines = newsItems.map(ni => {
      const h = ni.match(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/);
      const s = ni.match(/<ht:news_item_snippet><!\[CDATA\[(.*?)\]\]><\/ht:news_item_snippet>/);
      return { headline: h ? h[1] : '', snippet: s ? s[1] : '' };
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