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

  const prompt = `You are Archit Karmakar - a full-stack developer and tech enthusiast from India. You write articles on your personal blog in a casual, friendly, and highly practical style. Your readers are fellow developers and aspiring programmers.

TOPIC: "${topic}"
CATEGORY: ${category}
CURRENT DATE: March 23, 2026

WRITE LIKE ARCHIT KARMAKAR - PERSONAL TECH BLOG STYLE:

1. **INTRO LIKE A FRIEND**
   - Start casual: "So you want to learn about [topic]?" or "Been meaning to write about this for a while..."
   - Share why you're writing: "I struggled with this for months, so here's what I learned..."
   - No formal datelines - just jump in like you're chatting

2. **PERSONAL EXPERIENCES (CRITICAL)**
   - "When I first tried [topic], I made this stupid mistake..."
   - "Honestly, it took me weeks to figure this out..."
   - "Here's what actually worked for me after tons of trial and error..."
   - "Pro tip from someone who's been there: ..."
   - "I still remember the frustration of..."

3. **CONVERSATIONAL TONE**
   - Write like you're explaining to a friend at a cafe
   - Use "bro", "dude", "honestly", "btw", "tbh" naturally
   - Add humor: "Spoiler: it took me 3 hours to debug what was a typo"
   - Be relatable: "If you're like me, you've probably wondered..."
   - Use emojis occasionally 😊

4. **CODE WITH PERSONAL TOUCH**
   - "Here's the code that finally worked for me:"
   - "Copy-paste this, trust me:"
   - "Don't make my mistake - here's the correct way:"
   - "This snippet saved my project, hope it helps you too"

5. **HUMBLE AND HELPFUL**
   - "I'm not an expert, but here's what worked..."
   - "There are better ways, but this is what I use..."
   - "Feel free to correct me in the comments if there's a better approach"
   - "This is based on my personal experience, not official docs"

6. **LONG & DETAILED (1500-2500 words)**
   - Go deep into topics
   - Explain edge cases
   - Include gotchas and pitfalls
   - Add troubleshooting sections
   - "One more thing before I forget..."

7. **INTERNAL LINKS NATURALLY**
   - "Btw, I wrote about [related topic] last week - check it out!"
   - "This is part of my [topic] series, see more here"
   - "If you enjoyed this, you might like my post on [topic]"
   - Link to 3-5 related articles

8. **REAL WORLD EXAMPLES**
   - "In my latest project, I used this to..."
   - "When building [project name], I had to..."
   - "This actually happened in production last month..."

9. **PASS AI DETECTION**
   - Add slight imperfections
   - Vary sentence length wildly
   - Use fragments for emphasis
   - Start sentences with "And", "But", "So"
   - Include personal opinions: "I personally prefer...", "In my humble opinion..."

10. **ACTIONABLE ENDING**
    - "Try this out and let me know how it goes!"
    - "Drop a comment if you get stuck anywhere"
    - "I'll update this post if I find something better"

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
  "title": "SEO-friendly tutorial title (50-70 chars)",
  "excerpt": "What reader will learn in 150-160 chars",
  "content": "Full HTML article with <b>bold</b> for emphasis, <code>code blocks</code>, <h2>headings</h2>, internal links to related articles, 1500-2500 words",
  "seoTitle": "Primary keyword + benefit (50-60 chars)",
  "seoDescription": "Meta description with keywords and CTA (150-160 chars)",
  "tags": ["programming", "tutorial", "how-to", "technology", "coding"]
}

REMEMBER: Write like a human tech blogger. Long, detailed, practical tutorials with code examples and internal links. Pass AI detection tests.`;

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
            content: 'You are Archit Karmakar, a full-stack developer and tech enthusiast from India. You write casual, friendly, personal tech blog posts with code examples and personal experiences. Always respond with valid JSON only, no additional text. Write like a real person, not a robot.'
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
