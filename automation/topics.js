// Custom topics configuration
export const customTopics = [
  { topic: 'India-Pakistan border tension updates March 2026', category: 'india' },
  { topic: 'New GST rate changes affecting middle class', category: 'business' },
  { topic: 'Kolkata Metro extension inauguration updates', category: 'india' },
  { topic: 'West Bengal government new education policy', category: 'politics' },
  { topic: 'IPL 2026 auction results and team changes', category: 'ipl' },
  { topic: 'Mumbai local train expansion news', category: 'india' },
  { topic: 'Indian rupee value against dollar today', category: 'business' },
  { topic: 'Delhi pollution levels and government action', category: 'india' },
  { topic: 'Bengaluru tech startup funding news', category: 'business' },
  { topic: 'Indian cricket team Australia tour 2026', category: 'sports' },
  { topic: 'Reliance Jio 6G launch announcement', category: 'technology' },
  { topic: 'Tata Motors electric vehicle new models', category: 'technology' },
  { topic: 'Sensex Nifty today closing update', category: 'business' },
  { topic: 'Adani Group new investment announcement', category: 'business' },
  { topic: 'Rohit Sharma Virat Kohli retirement news', category: 'sports' },
  { topic: 'Kolkata International Film Festival 2026', category: 'entertainment' },
  { topic: 'Bollywood movie controversy March 2026', category: 'entertainment' },
  { topic: 'Trump Putin meeting latest news', category: 'world' },
  { topic: 'China Taiwan situation update', category: 'world' },
  { topic: 'Bengal assembly election 2026 updates', category: 'politics' },
  { topic: 'Modi government new scheme announcement', category: 'politics' },
  { topic: 'CSK vs RCB match preview Eden Gardens', category: 'ipl' },
  { topic: 'MI vs KKR result analysis', category: 'ipl' },
  { topic: 'Kolkata traffic police new rule', category: 'india' },
  { topic: 'Howrah Bridge maintenance update', category: 'india' },
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
