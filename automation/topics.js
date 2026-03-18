// Custom topics configuration - Targeting Top Tier Countries (USA, UK, Canada, Australia, Germany, etc.)
export const customTopics = [
  { topic: 'OpenAI GPT-5 announcement latest updates', category: 'technology' },
  { topic: 'Apple iPhone 18 Pro features and release date', category: 'technology' },
  { topic: 'Tesla Cybertruck production expansion 2026', category: 'technology' },
  { topic: 'Nvidia AI chips new Blackwell architecture', category: 'technology' },
  { topic: 'SpaceX Starship Mars mission latest updates', category: 'technology' },
  { topic: 'Google Gemini 2.5 Pro announcement', category: 'technology' },
  { topic: 'Microsoft Copilot AI enterprise features', category: 'technology' },
  { topic: 'Amazon AWS new cloud services 2026', category: 'technology' },
  { topic: 'US Federal Reserve interest rate decision March 2026', category: 'business' },
  { topic: 'Stock market today S&P 500 Nasdaq closing', category: 'business' },
  { topic: 'Bitcoin price prediction after halving event', category: 'business' },
  { topic: 'Trump administration foreign policy updates', category: 'world' },
  { topic: 'Ukraine Russia peace talks latest developments', category: 'world' },
  { topic: 'China Taiwan tensions Pentagon assessment', category: 'world' },
  { topic: 'NATO summit 2026 key decisions announced', category: 'world' },
  { topic: 'US Congress new bill on AI regulation', category: 'politics' },
  { topic: 'Supreme Court landmark decision on social media', category: 'politics' },
  { topic: 'NBA Finals 2026 Celtics Lakers matchup', category: 'sports' },
  { topic: 'Super Bowl 2026 halftime performer announced', category: 'sports' },
  { topic: 'FIFA World Cup 2026 host city updates', category: 'sports' },
  { topic: 'Marvel Avengers 5 cast and release date', category: 'entertainment' },
  { topic: 'Netflix new series breaks viewership records', category: 'entertainment' },
  { topic: 'Oscars 2026 winners and highlights', category: 'entertainment' },
  { topic: 'Taylor Swift Eras Tour 2026 new dates', category: 'entertainment' },
  { topic: 'IPL 2026 CSK vs RCB final match preview', category: 'ipl' },
];

export const yourCustomTopics = [];

export const allTopics = [...customTopics, ...yourCustomTopics];

export function getRandomTopics(count = 1) {
  const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getTopicsByCategory(category) {
  return allTopics.filter(t => t.category === category);
}

export function addTopic(topic, category) {
  yourCustomTopics.push({ topic, category });
  allTopics.push({ topic, category });
}
