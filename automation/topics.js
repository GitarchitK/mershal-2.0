// Custom topics configuration
// Add your own topics here - the AI will randomly pick from this list

export const customTopics = [
  // Technology
  { topic: 'Latest AI and machine learning developments', category: 'technology' },
  { topic: 'Smartphone reviews and comparisons', category: 'technology' },
  { topic: 'Cybersecurity news and tips', category: 'technology' },
  { topic: 'Cloud computing trends', category: 'technology' },
  { topic: 'Gadget launches and announcements', category: 'technology' },
  
  // Business
  { topic: 'Stock market updates and analysis', category: 'business' },
  { topic: 'Startup funding news', category: 'business' },
  { topic: 'Economic policy changes', category: 'business' },
  { topic: 'Cryptocurrency market updates', category: 'business' },
  { topic: 'Corporate mergers and acquisitions', category: 'business' },
  
  // Sports
  { topic: 'IPL 2026 cricket updates', category: 'ipl' },
  { topic: 'Cricket match previews and reviews', category: 'sports' },
  { topic: 'Football league updates', category: 'sports' },
  { topic: 'Olympic sports news', category: 'sports' },
  { topic: 'Tennis tournament updates', category: 'sports' },
  
  // World
  { topic: 'International diplomacy news', category: 'world' },
  { topic: 'Climate change developments', category: 'world' },
  { topic: 'Global health news', category: 'world' },
  { topic: 'Space exploration updates', category: 'world' },
  { topic: 'International relations and conflicts', category: 'world' },
  
  // Politics
  { topic: 'Indian government policy updates', category: 'politics' },
  { topic: 'Election news and analysis', category: 'politics' },
  { topic: 'Legislative changes', category: 'politics' },
  { topic: 'Political controversies and debates', category: 'politics' },
  
  // Entertainment
  { topic: 'Bollywood movie reviews', category: 'entertainment' },
  { topic: 'Hollywood entertainment news', category: 'entertainment' },
  { topic: 'Music industry updates', category: 'entertainment' },
  { topic: 'Streaming platform releases', category: 'entertainment' },
  { topic: 'Celebrity news and gossip', category: 'entertainment' },
  
  // Kolkata/India specific
  { topic: 'Kolkata local news and events', category: 'world' },
  { topic: 'West Bengal politics and development', category: 'politics' },
  { topic: 'Bengali culture and entertainment', category: 'entertainment' },
  { topic: 'Bengal cricket team updates', category: 'sports' },
  { topic: 'Kolkata traffic and infrastructure updates', category: 'world' },
];

// Your custom topics - EDIT THIS LIST!
export const yourCustomTopics = [
  // Add YOUR topics here in this format:
  // { topic: 'Your topic description', category: 'category-name' },
  
  // Examples:
  // { topic: 'AI tools for productivity', category: 'technology' },
  // { topic: 'Budget 2026 updates', category: 'business' },
  // { topic: 'RCB vs CSK match preview', category: 'ipl' },
];

// Merge all topics
export const allTopics = [...customTopics, ...yourCustomTopics];

// Get random topics for publishing
export function getRandomTopics(count = 1) {
  const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get topics by category
export function getTopicsByCategory(category) {
  return allTopics.filter(t => t.category === category);
}

// Add a new topic
export function addTopic(topic, category) {
  yourCustomTopics.push({ topic, category });
  allTopics.push({ topic, category });
}