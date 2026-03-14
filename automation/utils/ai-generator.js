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

export async function generateArticle(topic, category, keywords = []) {
  // Validate AI client is initialized
  if (config.ai.provider === 'openai' && !openai) {
    throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY in .env file.');
  }
  if (config.ai.provider === 'gemini' && !genAI) {
    throw new Error('Gemini client not initialized. Check GEMINI_API_KEY in .env file.');
  }

  const prompt = `You are a professional journalist writing for a news website. Write a comprehensive, SEO-optimized news article about: "${topic}"

Category: ${category}
Keywords to include: ${keywords.join(', ')}

Requirements:
- Write 800-1200 words
- Use journalistic tone
- Include relevant statistics and facts
- Structure with proper headings (H2, H3)
- Write in HTML format with proper tags
- Make it engaging and informative
- Include quotes if relevant
- Ensure content is unique and not plagiarized

Format the response as JSON:
{
  "title": "Compelling headline (60-70 characters)",
  "excerpt": "Brief summary (150-160 characters)",
  "content": "Full HTML article with proper formatting",
  "seoTitle": "SEO optimized title (50-60 characters)",
  "seoDescription": "Meta description (150-160 characters)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

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
    
    return {
      ...articleData,
      slug,
      wordCount,
      readingTime,
      category,
      author: 'Mershal Editorial Team',
      status: 'published',
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
    
    return {
      ...articleData,
      slug,
      wordCount,
      readingTime,
      category: 'ipl',
      author: 'Mershal Sports Desk',
      status: 'published',
    };
  } catch (error) {
    console.error('Error generating IPL article:', error);
    throw error;
  }
}
