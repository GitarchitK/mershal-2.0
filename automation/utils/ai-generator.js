import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../config.js';
import { researchTopic, formatResearchForPrompt } from './research.js';

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

  // Research topic first for real, current information
  const research = await researchTopic(topic, category);
  const researchContext = formatResearchForPrompt(research);

  const prompt = `You are an award-winning journalist and senior editor at a top-tier news publication. Write a professional, well-researched news article that reads exactly like human-written content.

TOPIC: "${topic}"
CATEGORY: ${category}
CURRENT DATE: March 16, 2026

CRITICAL REQUIREMENTS - READ THIS FIRST:
1. You MUST use the research data provided below - do NOT make up facts
2. Include specific dates, numbers, names from the research
3. If research doesn't have enough info, say "According to recent reports..." rather than inventing
4. Only claim something as fact if it's in the research data
5. Use phrases like "reports indicate", "sources say", "according to recent information" when appropriate

${researchContext}

WRITING GUIDELINES FOR HUMAN-LIKE QUALITY:

1. **PROFESSIONAL JOURNALISM STYLE**
   - Write like a seasoned journalist, not an AI
   - Use active voice, varied sentence structures
   - Include specific details, names, dates, numbers from research
   - Balance short punchy sentences with longer explanatory ones
   - Avoid robotic or repetitive phrasing

2. **FACT-BASED CONTENT**
   - Only include information from the research sources above
   - If you don't have specific data, acknowledge uncertainty
   - Reference specific organizations, institutions from research
   - Include quotes only if they appear in research
   - Don't invent statistics or claims

3. **HUMAN-LIKE READABILITY**
   - Vary paragraph lengths naturally (some short, some medium)
   - Mix simple and complex sentences
   - Use transitional phrases naturally
   - Use **bold text** for emphasis on key points
   - Use numbered lists with **bold numbers** for key facts
   - Avoid list-heavy content
   - Write flowing prose, not bullet points
   - Include rhetorical questions occasionally
   - Use contractions naturally (don't, it's, we're)

4. **MAXIMUM READABILITY (Grade 8-10 level)**
   - Average sentence length: 15-20 words
   - Average paragraph length: 3-4 sentences
   - Use clear, direct language
   - Avoid jargon unless necessary (explain if used)
   - Use **bold** for important terms and key points

5. **MODERN STRUCTURE WITH BOLD EMPHASIS**
   - Engaging lead paragraph (who, what, when, where, why)
   - Clear subheadings (H2, H3) with decorative underline
   - Use **<span class="highlight-number">1</span>** for numbered highlights
   - Use **<b>bold text</b>** for key terms and important points
   - Use **<div class="key-point">...</div>** for key takeaways
   - Use **<div class="stats-box">...</div>** for statistics
   - Logical flow of information
   - Strong conclusion that summarizes key points

6. **SEO OPTIMIZATION**
   - Natural keyword integration
   - Compelling headline (60-70 chars)
   - SEO meta description (150-160 chars)
   - Relevant tags

FORMAT YOUR RESPONSE AS VALID JSON:
{
  "title": "Compelling, newsworthy headline (60-70 chars)",
  "excerpt": "Engaging summary that makes readers want to click (150-160 chars)",
  "content": "Full HTML article with <b>bold text</b> for emphasis, <span class='highlight-number'>1</span> for numbered points, and professional formatting",
  "seoTitle": "SEO optimized title (50-60 chars)",
  "seoDescription": "Meta description (150-160 chars) for search engines",
  "tags": ["primary-tag", "secondary-tag", "topic", "category", "related"]
}

REMEMBER: 
- Use ONLY information from the research data provided
- If research is limited, acknowledge that in the article
- Make it feel authentic, specific, and professionally crafted
- Use **bold text** liberally for emphasis on important points`;

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
