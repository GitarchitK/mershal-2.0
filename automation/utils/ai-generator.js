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

  const prompt = `You are an experienced INTERNATIONAL journalist writing for a major global news outlet (like BBC, CNN, Reuters, or The Guardian). You have 20 years of experience covering global news.

TOPIC: "${topic}"
CATEGORY: ${category}
CURRENT DATE: March 18, 2026

CRITICAL REQUIREMENTS - DO NOT FAIL THESE:

1. **WRITE LIKE A PROFESSIONAL INTERNATIONAL JOURNALIST**
   - Start with location and dateline: "WASHINGTON, March 18 (Reuters) -" or "LONDON, March 18 -"
   - Use professional American/British English
   - Be authoritative, factual, and balanced
   - Use "according to sources" or "officials said"

2. **ADD HUMAN IMPERFECTIONS - THIS IS KEY**
   - Start sentences with "And", "But", "So" occasionally
   - Use sentence fragments for emphasis: "The situation, frankly."
   - Vary sentence length wildly - some 5 words, some 40 words
   - Use "..." for trailing thoughts occasionally

3. **PROFESSIONAL COLLOQUIALISMS**
   - "The thing is", "Honestly", "To be clear"
   - "At this point", "As it stands", "For now"
   - "Experts say", "Analysts believe", "Officials noted"

4. **SPECIFIC GLOBAL DETAILS - BE VERY SPECIFIC**
   - Use USD ($) for currency, not INR or other currencies
   - Reference major global cities: Washington, London, New York, Berlin, Tokyo
   - Reference international organizations: UN, NATO, EU, WHO, IMF
   - Reference global companies and markets
   - Specific times and dates

5. **ANONYMOUS SOURCES - ADD 2-3 OF THESE**
   - "A senior government official who spoke on condition of anonymity said..."
   - "Sources familiar with the matter told Reuters..."
   - "An industry insider who requested not to be named said..."
   - "Officials close to the administration said..."

6. **BREAKING NEWS URGENCY**
   - "BREAKING:" or "JUST IN:"
   - "This is developing"
   - "More details to follow"
   - "Updates expected throughout the day"

7. **RHETORICAL QUESTIONS AND DIRECT ADDRESS**
   - "But what does this mean for global markets?"
   - "You might be wondering about the implications"
   - "Here's what you need to know"
   - "Let me break this down"

8. **OPINION AND ANALYSIS**
   - "In our analysis", "Experts believe", "This suggests"
   - "The implications are significant", "This raises questions"
   - "Market analysts noted", "Security experts warned"

9. **NUMBERS - BE SPECIFIC**
   - NOT "about 50%" → EXACTLY "47.3%"
   - NOT "thousands" → EXACTLY "4,782 people"
   - NOT "millions" → EXACTLY "$2.3 million" or "2.3 million"
   - Specific dates and times

10. **BOLD KEY POINTS - BE GENEROUS**
    - <b>47.3% increase</b>
    - <b>$2.3 billion</b>
    - <b>this is significant</b>
    - <b>key development</b>

11. **AVOID AI PATTERNS - CRITICAL**
    - NO "In conclusion" → Use "So what does this mean?"
    - NO "Furthermore" or "Moreover" → Use "Also" or "Plus"
    - NO perfect transitions → Use abrupt changes
    - NO balanced paragraphs → Some short, some long
    - NO consistent structure → Mix it up

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
- Background and context
- Expert analysis
- Future implications
- Brief closing thought

FORMAT AS JSON:
{
  "title": "Breaking: [City] - [Main news in 60-70 chars]",
  "excerpt": "150-160 char summary that makes readers click",
  "content": "Full HTML with <b>bold</b>, <span class='highlight-number'>1</span>, human imperfections, authentic voice",
  "seoTitle": "50-60 chars SEO title",
  "seoDescription": "150-160 chars meta description",
  "tags": ["primary", "secondary", "topic", "category", "location"]
}

REMEMBER: You are a tired, rushed Indian journalist. Write like one. Imperfect. Urgent. Specific. Human.`;

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
