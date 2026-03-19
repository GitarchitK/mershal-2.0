import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../config.js';

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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(wordCount) {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

function countWords(text) {
  return text.trim().split(/\s+/).length;
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

  const prompt = `You are a senior correspondent for a prestigious international news agency (Al Jazeera, The Times, BBC, Reuters style). Write a comprehensive news article with the authority and depth of world-class journalism.

TOPIC: "${topic}"
CATEGORY: ${category}
CURRENT DATE: March 18, 2026

WRITING STYLE - EMULATE TOP INTERNATIONAL NEWS OUTLETS:

1. **OPENING STRUCTURE (Al Jazeera/Reuters Style)**
   - Strong dateline: "WASHINGTON, March 18 (Reuters) -" or "LONDON -"
   - Lead paragraph: Most critical information in first 25-30 words
   - Second paragraph: Key context or immediate impact
   - Third paragraph: Attribution to sources or officials

2. **AUTHORITATIVE TONE (BBC/The Times Style)**
   - Objective, balanced, factual reporting
   - Multiple perspectives when relevant
   - Expert analysis woven throughout
   - Historical context where appropriate
   - Clear cause-and-effect relationships

3. **SOURCE ATTRIBUTION (Professional Standards)**
   - "According to officials familiar with the matter..."
   - "A senior administration official, speaking on condition of anonymity, said..."
   - "Documents reviewed by this publication show..."
   - "Industry analysts told reporters..."
   - Mix attributed and anonymous sources naturally

4. **GLOBAL CONTEXT (International Perspective)**
   - Reference USD ($) for all financial figures
   - Cite international organizations: UN, NATO, EU, WHO, World Bank, IMF
   - Reference major global cities and capitals
   - Include geopolitical implications
   - Compare with similar situations in other countries

5. **DATA AND SPECIFICITY**
   - Exact percentages: "47.3%" not "about 47%"
   - Precise figures: "4,782 people" not "thousands"
   - Specific dollar amounts: "$2.3 billion" not "billions"
   - Exact dates and times with time zones when relevant
   - Statistical context: year-over-year comparisons

6. **PARAGRAPH STRUCTURE**
   - Vary length: Some 2-3 sentences, others 4-5
   - Each paragraph advances the story
   - Use transitional phrases sparingly
   - Occasional single-sentence paragraphs for impact
   - Build narrative momentum

7. **HUMAN ELEMENTS (Subtle)**
   - Occasional sentence fragments for emphasis
   - Strategic use of "And" or "But" to start sentences
   - Vary sentence length (10-40 words)
   - Natural flow, not robotic
   - Conversational authority

8. **BOLD FORMATTING (Strategic Emphasis)**
   - <b>Key statistics and figures</b>
   - <b>Important names and titles</b>
   - <b>Critical developments</b>
   - <b>Breaking news elements</b>

9. **AVOID AI PATTERNS**
   - NO "In conclusion" or "To sum up"
   - NO "Furthermore" or "Moreover" - use "Also" or natural transitions
   - NO perfectly balanced sections
   - NO repetitive sentence structures
   - NO obvious list formatting in prose

10. **CLOSING (Professional Standard)**
    - Forward-looking statement or implications
    - Unanswered questions or ongoing developments
    - Expert prediction or analysis
    - Call to action or "what to watch"

12. **CONTEXT - ADD LOCAL CULTURE**
    - Mention local festivals, events
    - Reference local customs
    - Add weather context
    - Include traffic/transport references

13. **EMOTIONAL LANGUAGE**
    - "Shocking", "Surprising", "Troubling"
    - "This has left people worried"
    - "Angered by the decision"
    - "Celebrating the move"

14. **TIMELINE AND SEQUENCE**
   - "First", "Then", "After that", "Meanwhile"
   - "This came after", "Following this"
   - "Earlier this week", "Just hours before"

15. **EXPERT QUOTES**
   - "Dr. Rajesh Kumar, an economist at IIM Calcutta, said..."
   - "Senior journalist Somen Mishra noted..."
   - "Advocate Prashant Sharma told our reporter..."

STRUCTURE YOUR ARTICLE:
- Lede: Who, what, when, where in first 2-3 sentences
- Quote from anonymous source in paragraph 2
11. **ARTICLE STRUCTURE (1000-1200 words)**
    - Lead paragraph (25-30 words)
    - Context paragraph
    - Source quotes and attribution
    - Data and statistics
    - Expert analysis
    - Historical context or comparison
    - Implications and impact
    - Forward-looking conclusion

FORMAT AS JSON:
{
  "title": "Compelling headline in active voice (60-70 chars)",
  "excerpt": "Engaging summary highlighting key development (150-160 chars)",
  "content": "Full HTML article with <b>bold emphasis</b> on key points, professional journalism standards, varied paragraph lengths",
  "seoTitle": "SEO-optimized title with keywords (50-60 chars)",
  "seoDescription": "Meta description with key information (150-160 chars)",
  "tags": ["primary-keyword", "secondary-keyword", "topic", "category", "location"]
}

REMEMBER: Write like Al Jazeera, The Times, BBC, or Reuters. Authoritative. Balanced. Global perspective. Professional standards.`;

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
        temperature: 0.9,
      });

      const responseText = completion.choices[0].message.content;
      articleData = JSON.parse(responseText);
      
    } else {
      console.log('Using Gemini with model:', config.ai.model);
      
      // Use Gemini with higher temperature for human-like output
      const model = genAI.getGenerativeModel({ model: config.ai.model, generationConfig: { temperature: 0.9 } });
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
      prompt = `You are an experienced cricket correspondent for a major international sports outlet. Write an IPL preview for ${matchData.team1} vs ${matchData.team2}.

Match Details:
- Teams: ${matchData.team1} vs ${matchData.team2}
- Venue: ${matchData.venue}
- Date: ${matchData.matchDate}

CRITICAL - WRITE LIKE A PROFESSIONAL SPORTS JOURNALIST:
- Start with dateline: "MUMBAI, March 18 (Reuters) -"
- Include expert analysis and statistics
- Reference team form, head-to-head records
- Include quotes from coaches or captains (attributed or anonymous)
- Add specific details: exact times, weather, pitch conditions
- Bold key stats and player names
- Use varied sentence length
- NO "In conclusion" - use "The question remains..."
- Reference international cricket context

Write 900-1100 words with <b>bold</b> emphasis.`;
      break;
      
    case 'result':
      prompt = `You are covering the match for a major international sports outlet. Write a match report for ${matchData.team1} vs ${matchData.team2}.

Match Result:
- Winner: ${matchData.winner}
- Result: ${matchData.result}

PROFESSIONAL SPORTS WRITING:
- Start with the key result immediately
- Include match statistics and turning points
- Add expert analysis: "Cricket analysts noted..."
- Reference key moments with specific details
- Bold key stats: <b>87 runs</b>, <b>4 wickets</b>
- Include post-match reactions
- Use varied paragraph lengths
- End with implications for the tournament

Write 900-1100 words with <b>bold</b> emphasis.`;
      break;
      
    case 'live':
      prompt = `You are providing live cricket commentary for a major international sports network. Cover ${matchData.team1} vs ${matchData.team2}.

LIVE COMMENTARY STYLE:
- Write with urgency and excitement
- Reference specific moments: "That delivery from Bumrah..."
- Include statistical context
- Reference the venue and atmosphere
- Bold key moments: boundaries, wickets, milestones
- Use varied sentence structure
- Reference international cricket context

Write 800-1000 words with <b>bold</b> for key moments.`;
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
        temperature: 0.9,
      });

      const responseText = completion.choices[0].message.content;
      articleData = JSON.parse(responseText);
      
    } else {
      // Use Gemini with higher temperature
      const model = genAI.getGenerativeModel({ model: config.ai.model, generationConfig: { temperature: 0.9 } });
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
