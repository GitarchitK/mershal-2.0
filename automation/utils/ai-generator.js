import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../config.js';
import { researchTopic, formatResearchForPrompt } from './research.js';
import { generateSEOKeywords, generateSEOSubheadings } from './seo-optimizer.js';

// Initialize AI clients based on configuration
let genAI = null;
let openai = null;

if (config.ai.provider === 'gemini' && config.ai.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
}

if (config.ai.provider === 'openai' && config.ai.openaiApiKey) {
  openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 70) // Limit to 70 characters for SEO
    .replace(/-$/, ''); // Remove trailing hyphen if any
}

function calculateReadingTime(wordCount) {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
}

function countWords(text) {
  return stripHtml(text).trim().split(/\s+/).filter(word => word.length > 0).length;
}

async function generateThumbnail(topic, category) {
  try {
    // Extract keywords from topic for better image search
    const keywords = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(',');
    
    // Use Unsplash API for high-quality, relevant images
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || 'your-access-key';
    const searchQuery = keywords || category;
    
    // Fallback to category-based images from Unsplash
    const categoryImages = {
      sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=630&fit=crop',
      technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop',
      business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop',
      politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=630&fit=crop',
      entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=630&fit=crop',
      world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=630&fit=crop',
      ipl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=630&fit=crop',
      cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=630&fit=crop',
    };
    
    // Try to fetch from Unsplash if API key is available
    if (unsplashAccessKey && unsplashAccessKey !== 'your-access-key') {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&orientation=landscape&w=1200&h=630`,
          {
            headers: {
              'Authorization': `Client-ID ${unsplashAccessKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          return data.urls.regular;
        }
      } catch (error) {
        console.log('Unsplash API error, using fallback image');
      }
    }
    
    // Return category-based fallback image
    return categoryImages[category.toLowerCase()] || categoryImages.world;
    
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Ultimate fallback
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop';
  }
}

export async function generateArticle(topic, category, keywords = []) {
  // Validate AI client is initialized
  if (config.ai.provider === 'openai' && !openai) {
    throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY in .env file.');
  }
  if (config.ai.provider === 'gemini' && !genAI) {
    throw new Error('Gemini client not initialized. Check GEMINI_API_KEY in .env file.');
  }

  // Research topic first for real, current information
  const research = await researchTopic(topic, category);
  const researchContext = formatResearchForPrompt(research);
  
  // Generate SEO keywords and subheadings
  const seoKeywords = generateSEOKeywords(topic, category);
  const suggestedSubheadings = generateSEOSubheadings(topic, seoKeywords);
  
  const keywordContext = `
MANDATORY SEO KEYWORDS TO USE:
Primary Keywords: ${seoKeywords.primary.join(', ')}
Location Keywords: ${seoKeywords.location.slice(0, 3).join(', ')}
Category Keywords: ${seoKeywords.category.slice(0, 5).join(', ')}
Trending Modifiers: ${seoKeywords.trending.slice(0, 4).join(', ')}

SUGGESTED SUBHEADINGS (use 2-3 of these):
${suggestedSubheadings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

KEYWORD DENSITY TARGETS:
- Primary keyword "${topic}": 3-5 times (0.5-1% density)
- Secondary keywords: 2-3 times each
- Location keywords: 1-2 times naturally
- Use synonyms and variations to avoid keyword stuffing
`;

  const prompt = `You are Sarah Mitchell, a 12-year veteran international correspondent who has worked for CNN, BBC, Reuters, and Associated Press. You've covered major stories across North America, Europe, and Asia-Pacific. Your articles consistently rank #1 on Google in USA, Canada, Australia, and UK because they're perfectly optimized for international English-speaking audiences.

ASSIGNMENT: Write a news article that will DOMINATE Google search results in USA, Canada, Australia, and UK

TOPIC: "${topic}"
CATEGORY: ${category}
TARGET AUDIENCE: English-speaking professionals aged 25-55 in USA, Canada, Australia, UK
CURRENT DATE: March 16, 2026
GOAL: Rank #1 on Google in top-tier English-speaking countries within 24 hours

${researchContext}

${keywordContext}

🎯 GOOGLE RANKING STRATEGY (CRITICAL FOR SUCCESS):

1. **HEADLINE OPTIMIZATION**
   - Include primary keyword in first 60 characters
   - Use power words: "Breaking", "Latest", "Exclusive", "Major", "Shocking"
   - Include year "2026" for freshness signals
   - Make it clickable but not clickbait
   - Examples: "Breaking: [Topic] Shakes India in Major 2026 Development"

2. **FEATURED SNIPPET DOMINATION**
   - Start with direct answer in first paragraph (40-60 words)
   - Use "According to latest reports..." for authority
   - Include exact numbers, dates, percentages from research
   - Format key info as: "The [topic] involves X, Y, and Z factors."
   - Answer search intent immediately

3. **PEOPLE ALSO ASK OPTIMIZATION**
   - Include subheadings that match common questions:
     * "What is [topic]?"
     * "Why is [topic] important?"
     * "How does [topic] affect India?"
     * "When did [topic] happen?"
   - Answer each question in 2-3 sentences under subheading

4. **E-A-T SIGNALS (EXPERTISE, AUTHORITY, TRUST)**
   - Quote real experts from research data
   - Include specific statistics and data points
   - Reference authoritative sources: "According to [Organization]..."
   - Add author credibility: "This reporter has covered..."
   - Use first-person insights: "Having analyzed similar cases..."

5. **SEMANTIC SEO & ENTITY OPTIMIZATION**
   - Include related entities (people, places, organizations)
   - Use co-occurring terms Google expects
   - Add context around main topic
   - Include synonyms and variations naturally
   - Connect to broader themes and trends

6. **USER ENGAGEMENT SIGNALS**
   - Hook readers in first 15 seconds with shocking fact
   - Use emotional triggers: surprise, urgency, curiosity
   - Include "breaking news" elements with timestamps
   - Add social proof: "Thousands are sharing this news"
   - Create scroll-worthy content with visual breaks
   - End with compelling call-to-action

7. **TECHNICAL SEO ELEMENTS**
   - Use semantic keywords naturally
   - Include related entities (people, places, organizations)
   - Add FAQ-style sections
   - Use schema-friendly formatting
   - Include exact match and partial match keywords
   - Optimize for mobile-first indexing

8. **CONTENT FRESHNESS SIGNALS**
   - Include today's date: "March 16, 2026"
   - Use present tense: "is happening", "are reporting"
   - Add "latest updates", "breaking news", "developing story"
   - Reference recent events and timelines
   - Include "as of today" or "currently"

WRITING STYLE - COPY THESE PATTERNS:

✅ GOOD: "The Federal Reserve's latest announcement has sent shockwaves across global markets."
❌ BAD: "The central bank made an announcement regarding monetary policy."

✅ GOOD: "Here's what this means for your investment portfolio..."
❌ BAD: "This development has economic implications."

✅ GOOD: "But wait—there's more to this international story."
❌ BAD: "Additionally, there are other factors to consider."

✅ GOOD: "Sources close to the G7 negotiations reveal..."
❌ BAD: "It has been reported that..."

✅ GOOD: "This changes everything for North American trade."
❌ BAD: "This may have implications for citizens."

HUMAN-LIKE WRITING TECHNIQUES:

1. **INTERNATIONAL CONVERSATIONAL TONE**
   - Write like you're explaining to a global colleague over coffee
   - Use "you", "your", "we", "us" to connect with international readers
   - Include rhetorical questions: "Sound familiar to global markets?"
   - Use International English: "analyse" (not "analyze"), "centre" (not "center")
   - Reference global currencies: "$USD", "€EUR", "£GBP", "CAD$", "AUD$"

2. **GLOBAL EMOTIONAL HOOKS**
   - Start with statistics that matter to international audiences
   - Use power words: "unprecedented", "breakthrough", "exclusive", "global impact"
   - Create urgency: "This is reshaping markets worldwide"
   - Add international stakes: "This affects every developed economy"

3. **SENTENCE VARIETY FOR INTERNATIONAL READERS**
   - Short punches: "Markets are reacting."
   - Medium explanations: "The decision impacts trade relationships across North America."
   - Longer context: "According to sources familiar with international negotiations, the agreement represents a significant shift in how developed nations approach economic cooperation."

4. **INTERNATIONAL TRANSITIONS**
   - "But here's what global markets are saying..."
   - "What's more significant for international investors is..."
   - "This isn't the first time developed nations have..."
   - "Meanwhile, analysts across North America are reporting..."
   - "The real question for global markets is..."

5. **INTERNATIONAL CREDIBILITY MARKERS**
   - "International sources confirm..."
   - "According to exclusive information from Washington/Ottawa/Canberra..."
   - "Global industry insiders reveal..."
   - "Government officials from multiple countries speaking on condition of anonymity..."
   - "Cross-border analysis shows..."

CONTENT STRUCTURE FOR MAXIMUM RANKING:

**Paragraph 1 (THE HOOK)**: 
- Start with breaking news angle or shocking statistic
- Include primary keyword naturally
- Answer the main question immediately
- Create urgency or curiosity gap

**Paragraph 2 (THE FACTS)**:
- Who, what, when, where, why (journalism basics)
- Include specific numbers, dates, names from research
- Use secondary keywords naturally
- Add credibility with source attribution

**Paragraph 3 (THE IMPACT)**:
- "What this means for you" angle
- Connect to reader's life/interests
- Include emotional hook or personal stakes
- Use location keywords (India, specific cities)

**Subheading 1**: "What Is [Topic]? Complete Breakdown"
- Direct answer to search query
- Include definition and context
- Use primary keyword variations

**Subheading 2**: "[Topic]: Key Details You Must Know" 
- Numbered list format (Google loves lists)
- Include statistics and data points
- Use bold text for emphasis

**Subheading 3**: "How [Topic] Affects Global Markets: Expert Analysis"
- Quote international experts from research
- Include predictions and implications for developed economies
- Use semantic keywords with global context

**Subheading 4**: "What Happens Next? [Topic] International Timeline"
- Future developments across USA, Canada, Australia
- Call-to-action for international readers
- Include related keywords with global scope

**FAQ Section** (if space allows):
- "What is [topic]?"
- "Why is [topic] important?"
- "How does [topic] affect me?"

MANDATORY SEO ELEMENTS TO INCLUDE:
- Primary keyword 3-5 times naturally
- Related keywords: [topic] + "news", "latest", "update", "2026"
- Location keywords: "India", specific cities if relevant
- Trending phrases: "viral", "breaking", "exclusive"
- Question-based subheadings that people actually search
- Numbers and statistics for credibility
- Current date references for freshness

FORMAT AS VALID JSON:
{
  "title": "SEO-optimized headline with primary keyword (55-60 chars)",
  "excerpt": "Compelling meta description with keywords (150-155 chars)",
  "content": "Full HTML article with professional styling: <h2>Main Headings</h2>, <h3>Subheadings</h3>, <p>paragraphs</p>, <div class='key-point'><p>💡 Key insights</p></div>, <div class='important'><p>⚠️ Important notes</p></div>, <div class='info-box'><p>ℹ️ Additional info</p></div>, <div class='stats-box'><div class='stat'><div class='stat-value'>123</div><div class='stat-label'>Metric</div></div></div>, <blockquote><p>Expert quotes</p><div class='quote-author'>Expert Name, Title</div></blockquote>, <span class='highlight-number'>1</span> for numbered points, <strong>bold emphasis</strong>",
  "seoTitle": "Primary keyword + secondary keyword + 2026 (50-55 chars)",
  "seoDescription": "Search-optimized description with call-to-action (145-155 chars)",
  "tags": ["primary-keyword", "secondary-keyword", "location", "trending-term", "category"]
}

PROFESSIONAL STYLING ELEMENTS TO USE:

1. **Key Points**: <div class="key-point"><p>💡 Important insight or takeaway</p></div>
2. **Warnings**: <div class="important"><p>⚠️ Critical information readers must know</p></div>  
3. **Info Boxes**: <div class="info-box"><p>ℹ️ Additional context or background</p></div>
4. **Stats Display**: <div class="stats-box"><div class="stat"><div class="stat-value">₹50 Cr</div><div class="stat-label">Investment</div></div><div class="stat"><div class="stat-value">25%</div><div class="stat-label">Growth</div></div></div>
5. **Expert Quotes**: <blockquote><p>"Quote text here"</p><div class="quote-author">Expert Name, Position</div></blockquote>
6. **Numbered Highlights**: <span class="highlight-number">1</span> Key point with number
7. **Timeline Items**: <div class="timeline"><div class="timeline-item"><p>Event description</p></div></div>

USE THESE ELEMENTS STRATEGICALLY:
- 1-2 key-point boxes per article
- 1 important/warning box if relevant  
- 1 stats-box with 2-4 statistics
- 2-3 expert quotes in blockquotes
- 3-5 numbered highlights with <span class="highlight-number">
- Strong emphasis with <strong> tags on important terms

REMEMBER: You're not just writing an article—you're creating a Google-ranking machine. Every word should serve the dual purpose of informing readers and satisfying search algorithms. Make it so good that people can't stop reading and Google can't ignore it.

Write like Priya Sharma would: confident, insider knowledge, slightly conversational, but absolutely authoritative. This article MUST rank #1.`;

  try {
    let articleData;

    if (config.ai.provider === 'openai') {
      console.log('Using OpenAI with model:', config.ai.model);
      
      // Use OpenAI
      const completion = await openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional journalist. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      articleData = JSON.parse(responseText);
      
    } else {
      console.log('Using Gemini with model:', config.ai.model);
      
      // Use Gemini
      const model = genAI.getGenerativeModel({ model: config.ai.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      
      articleData = JSON.parse(jsonMatch[0]);
    }
    
    // Calculate metadata
    const wordCount = countWords(articleData.content);
    const readingTime = calculateReadingTime(wordCount);
    const slug = generateSlug(articleData.title);
    
    // Generate thumbnail
    const featuredImage = await generateThumbnail(topic, category);
    
    return {
      ...articleData,
      slug,
      wordCount,
      readingTime,
      category,
      author: 'Mershal Editorial Team',
      status: 'published',
      featuredImage,
    };
  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
}

export async function generateIPLArticle(matchData, articleType) {
  let prompt = '';
  
  switch (articleType) {
    case 'preview':
      prompt = `Write a detailed IPL match preview article for ${matchData.team1} vs ${matchData.team2}.
      
Match Details:
- Teams: ${matchData.team1} vs ${matchData.team2}
- Venue: ${matchData.venue}
- Date: ${matchData.matchDate}

Include:
- Team form analysis
- Key players to watch
- Head-to-head statistics
- Pitch and weather conditions
- Predicted playing XI
- Match prediction

Write 900-1100 words in HTML format.`;
      break;
      
    case 'result':
      prompt = `Write a comprehensive match result article for ${matchData.team1} vs ${matchData.team2}.
      
Match Result:
- Winner: ${matchData.winner}
- Result: ${matchData.result}

Include:
- Match summary
- Key moments
- Player performances
- Turning points
- Post-match reactions
- Points table impact

Write 900-1100 words in HTML format.`;
      break;
      
    case 'live':
      prompt = `Write a live match blog/commentary for ${matchData.team1} vs ${matchData.team2}.
      
Create engaging ball-by-ball commentary style content with:
- Match situation updates
- Key moments
- Player performances
- Exciting passages of play

Write 800-1000 words in HTML format.`;
      break;
  }
  
  prompt += `\n\nFormat as JSON:
{
  "title": "SEO-friendly headline",
  "excerpt": "Brief summary (150-160 characters)",
  "content": "Full HTML article",
  "seoTitle": "SEO title",
  "seoDescription": "Meta description",
  "tags": ["ipl", "cricket", "team1", "team2", "match"]
}`;

  try {
    let articleData;

    if (config.ai.provider === 'openai') {
      // Use OpenAI
      const completion = await openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional sports journalist. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      articleData = JSON.parse(responseText);
      
    } else {
      // Use Gemini
      const model = genAI.getGenerativeModel({ model: config.ai.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      
      articleData = JSON.parse(jsonMatch[0]);
    }
    
    const wordCount = countWords(articleData.content);
    const readingTime = calculateReadingTime(wordCount);
    const slug = generateSlug(articleData.title);
    
    // Generate thumbnail for IPL article
    const featuredImage = await generateThumbnail(`${matchData.team1} vs ${matchData.team2} cricket`, 'ipl');
    
    return {
      ...articleData,
      slug,
      wordCount,
      readingTime,
      category: 'ipl',
      author: 'Mershal Sports Desk',
      status: 'published',
      featuredImage,
    };
  } catch (error) {
    console.error('Error generating IPL article:', error);
    throw error;
  }
}
