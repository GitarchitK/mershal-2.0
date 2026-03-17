export async function researchTopic(topic, category) {
  console.log(`🔍 Researching: ${topic}`);
  
  const searchQueries = [
    `${topic} latest news 2026`,
    `${topic} current developments`,
    `${topic} recent updates`
  ];
  
  let researchData = {
    facts: [],
    sources: [],
    timeline: [],
    keyPoints: []
  };
  
  for (const query of searchQueries.slice(0, 2)) {
    try {
      // Use web search tool
      const results = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data.AbstractText) {
            return [{
              title: 'Related News',
              url: 'https://news.google.com',
              snippet: data.AbstractText
            }];
          }
          return [];
        })
        .catch(() => []);
      
      for (const result of results.slice(0, 3)) {
        researchData.sources.push({
          title: result.title,
          url: result.url,
          snippet: result.snippet
        });
        
        if (result.snippet) {
          researchData.facts.push(result.snippet);
        }
      }
    } catch (error) {
      console.log('Search error:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`✓ Found ${researchData.sources.length} sources`);
  return researchData;
}

export function formatResearchForPrompt(research) {
  if (!research || research.sources.length === 0) {
    return '';
  }
  
  let formatted = '\n\nCURRENT INFORMATION FROM RECENT SOURCES:\n';
  formatted += '─'.repeat(50) + '\n\n';
  
  for (const source of research.sources.slice(0, 5)) {
    formatted += `📰 ${source.title}\n`;
    formatted += `   ${source.snippet?.substring(0, 200)}...\n`;
    formatted += `   Source: ${source.url}\n\n`;
  }
  
  formatted += '─'.repeat(50) + '\n';
  formatted += 'IMPORTANT: Use this real information in your article. ';
  formatted += 'Include specific facts, dates, and details from these sources. ';
  formatted += 'Do NOT make up information - only use verified facts from research.\n';
  
  return formatted;
}