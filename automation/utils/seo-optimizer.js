export function generateSEOKeywords(topic, category) {
  const baseKeywords = topic.toLowerCase().split(' ');
  
  // Primary keyword variations
  const primaryKeywords = [
    topic,
    `${topic} news`,
    `${topic} latest`,
    `${topic} 2026`,
    `${topic} update`
  ];
  
  // Location-based keywords for Indian audience
  const locationKeywords = [
    `${topic} India`,
    `${topic} Mumbai`,
    `${topic} Delhi`,
    `${topic} Kolkata`,
    `${topic} Bangalore`
  ];
  
  // Category-specific keywords
  const categoryKeywords = {
    sports: ['match', 'score', 'team', 'player', 'tournament', 'live'],
    technology: ['tech', 'innovation', 'startup', 'digital', 'AI', 'app'],
    business: ['market', 'economy', 'company', 'profit', 'investment', 'stock'],
    politics: ['government', 'election', 'policy', 'minister', 'parliament', 'vote'],
    entertainment: ['movie', 'celebrity', 'bollywood', 'music', 'show', 'actor'],
    world: ['international', 'global', 'country', 'world news', 'foreign']
  };
  
  // Trending modifiers
  const trendingModifiers = [
    'breaking',
    'exclusive',
    'major',
    'shocking',
    'viral',
    'trending',
    'live updates',
    'developing story'
  ];
  
  // Long-tail keywords (question-based)
  const questionKeywords = [
    `what is ${topic}`,
    `why ${topic}`,
    `how ${topic}`,
    `when ${topic}`,
    `${topic} explained`,
    `${topic} meaning`
  ];
  
  return {
    primary: primaryKeywords,
    location: locationKeywords,
    category: categoryKeywords[category] || [],
    trending: trendingModifiers,
    questions: questionKeywords
  };
}

export function generateSEOSubheadings(topic, keywords) {
  const subheadings = [
    `What Is ${topic}? Complete Breakdown`,
    `${topic}: Key Details You Must Know`,
    `How ${topic} Affects You: Expert Analysis`,
    `${topic} Timeline: What Happened When`,
    `Breaking: ${topic} Latest Updates`,
    `${topic} Explained: Simple Guide`,
    `What Experts Say About ${topic}`,
    `${topic}: What Happens Next?`,
    `${topic} Impact on India: Full Analysis`,
    `${topic} FAQ: Your Questions Answered`
  ];
  
  return subheadings.slice(0, 4); // Return 4 relevant subheadings
}

export function optimizeContentForSEO(content, keywords) {
  // Add schema markup hints
  const optimizedContent = content
    .replace(/<h2>/g, '<h2 class="seo-heading">')
    .replace(/<h3>/g, '<h3 class="seo-subheading">');
  
  return optimizedContent;
}

export function generateMetaTags(title, description, keywords, category) {
  return {
    title: title,
    description: description,
    keywords: keywords.primary.slice(0, 10).join(', '),
    ogTitle: title,
    ogDescription: description,
    ogType: 'article',
    articleSection: category,
    articleTag: keywords.primary.slice(0, 5)
  };
}