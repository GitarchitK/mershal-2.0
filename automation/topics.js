```javascript
// =======================================================
// AI NEWS GENERATOR TOPICS CONFIG
// Optimized for Google News + Discover traffic
// Updated: March 2026
// =======================================================

// =====================
// TECHNOLOGY
// =====================

const technologyTopics = [
  { topic: 'OpenAI GPT-5 release date and features explained', category: 'technology' },
  { topic: 'Google Gemini 2.5 Pro AI model benchmark results', category: 'technology' },
  { topic: 'Apple iPhone 18 Pro leaks reveal revolutionary AI camera', category: 'technology' },
  { topic: 'Tesla robotaxi network expansion announced', category: 'technology' },
  { topic: 'Nvidia Blackwell AI GPU demand shocks tech industry', category: 'technology' },
  { topic: 'Microsoft Copilot AI replacing traditional office tools', category: 'technology' },
  { topic: 'Meta Quest 4 mixed reality headset launch rumors', category: 'technology' },
  { topic: 'SpaceX Starship Mars mission latest development', category: 'technology' },
  { topic: 'Samsung Galaxy S26 Ultra specifications leak', category: 'technology' },
  { topic: 'Nintendo Switch 2 official announcement expected soon', category: 'technology' },
  { topic: 'AI startups attract record venture capital funding in 2026', category: 'technology' },
  { topic: 'Apple iOS 20 AI features change smartphone experience', category: 'technology' },
  { topic: 'Google DeepMind reveals new AGI research breakthrough', category: 'technology' },
  { topic: 'Amazon launches next generation Alexa AI assistant', category: 'technology' },
  { topic: 'Quantum computing race intensifies among tech giants', category: 'technology' },
];

// =====================
// BUSINESS
// =====================

const businessTopics = [
  { topic: 'Global stock markets today S&P 500 Nasdaq closing analysis', category: 'business' },
  { topic: 'Bitcoin price prediction after 2026 market rally', category: 'business' },
  { topic: 'US Federal Reserve interest rate decision impact on markets', category: 'business' },
  { topic: 'Tesla stock surges after robotaxi announcement', category: 'business' },
  { topic: 'Amazon vs Walmart retail war intensifies in 2026', category: 'business' },
  { topic: 'Gold price hits new highs amid global uncertainty', category: 'business' },
  { topic: 'Tech layoffs 2026 AI automation impact explained', category: 'business' },
  { topic: 'Global recession fears grow as inflation remains high', category: 'business' },
  { topic: 'Cryptocurrency regulation bill passes US Congress', category: 'business' },
  { topic: 'Apple market value crosses new historic milestone', category: 'business' },
  { topic: 'Venture capital investments surge in AI startups', category: 'business' },
  { topic: 'Oil prices spike due to geopolitical tensions', category: 'business' },
  { topic: 'European economy outlook 2026 growth forecast', category: 'business' },
  { topic: 'US job market shows unexpected growth in March 2026', category: 'business' },
  { topic: 'Global tech companies compete in AI infrastructure race', category: 'business' },
];

// =====================
// WORLD NEWS
// =====================

const worldTopics = [
  { topic: 'Ukraine Russia war latest developments and peace talks', category: 'world' },
  { topic: 'China Taiwan tensions escalate after military drills', category: 'world' },
  { topic: 'Middle East conflict latest diplomatic efforts', category: 'world' },
  { topic: 'NATO summit 2026 security strategy update', category: 'world' },
  { topic: 'UN climate summit pushes new global carbon targets', category: 'world' },
  { topic: 'Global leaders discuss AI regulation framework', category: 'world' },
  { topic: 'European Union new climate laws spark debate', category: 'world' },
  { topic: 'Germany coalition government crisis deepens', category: 'world' },
  { topic: 'UK political turmoil triggers early election speculation', category: 'world' },
  { topic: 'Global migration crisis intensifies in 2026', category: 'world' },
];

// =====================
// POLITICS
// =====================

const politicsTopics = [
  { topic: 'US election 2026 early campaign analysis', category: 'politics' },
  { topic: 'AI regulation bill sparks debate in US Congress', category: 'politics' },
  { topic: 'European Union introduces strict AI governance rules', category: 'politics' },
  { topic: 'Canada immigration policy changes explained', category: 'politics' },
  { topic: 'Australia housing crisis government response', category: 'politics' },
  { topic: 'Brazil G20 summit key decisions summary', category: 'politics' },
  { topic: 'US Supreme Court landmark decision on tech companies', category: 'politics' },
];

// =====================
// SPORTS
// =====================

const sportsTopics = [
  { topic: 'March Madness 2026 NCAA tournament biggest upsets', category: 'sports' },
  { topic: 'NBA MVP race 2026 top contenders revealed', category: 'sports' },
  { topic: 'Premier League title race heats up in final weeks', category: 'sports' },
  { topic: 'FIFA World Cup 2026 host city preparations update', category: 'sports' },
  { topic: 'Formula 1 2026 season predictions and driver rankings', category: 'sports' },
  { topic: 'UFC fight night results and highlights', category: 'sports' },
  { topic: 'Tennis ATP rankings shakeup after major tournament', category: 'sports' },
];

// =====================
// ENTERTAINMENT
// =====================

const entertainmentTopics = [
  { topic: 'Marvel Avengers 5 cast and storyline leaks', category: 'entertainment' },
  { topic: 'GTA 6 gameplay leaks dominate gaming discussions', category: 'entertainment' },
  { topic: 'Netflix new blockbuster series breaks streaming records', category: 'entertainment' },
  { topic: 'Taylor Swift new tour dates announced', category: 'entertainment' },
  { topic: 'Christopher Nolan new movie trailer sparks excitement', category: 'entertainment' },
  { topic: 'Oscars 2026 winners and biggest surprises', category: 'entertainment' },
  { topic: 'K-pop group breaks Billboard global records', category: 'entertainment' },
];

// =====================
// IPL CRICKET
// =====================

const iplTopics = [
  { topic: 'IPL 2026 opening match preview and predictions', category: 'ipl' },
  { topic: 'CSK vs RCB rivalry match analysis IPL 2026', category: 'ipl' },
  { topic: 'IPL 2026 auction biggest buys and surprises', category: 'ipl' },
  { topic: 'Virat Kohli IPL 2026 performance analysis', category: 'ipl' },
  { topic: 'Mumbai Indians new captain announcement IPL 2026', category: 'ipl' },
  { topic: 'IPL 2026 playoff qualification scenarios explained', category: 'ipl' },
];

// =====================
// COMBINE ALL TOPICS
// =====================

export const customTopics = [
  ...technologyTopics,
  ...businessTopics,
  ...worldTopics,
  ...politicsTopics,
  ...sportsTopics,
  ...entertainmentTopics,
  ...iplTopics
];

// =====================
// USER CUSTOM TOPICS
// =====================

export const yourCustomTopics = [];

// =====================
// ALL TOPICS
// =====================

export const allTopics = [...customTopics, ...yourCustomTopics];

// =====================
// FUNCTIONS
// =====================

export function getRandomTopics(count = 1) {
  const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getTopicsByCategory(category) {
  return allTopics.filter(t => t.category === category);
}

export function addTopic(topic, category) {
  yourCustomTopics.push({ topic, category });
}
```
