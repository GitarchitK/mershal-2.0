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

  const prompt = `You are a LOCAL Indian journalist from Kolkata/Mumbai writing for a regional newspaper. You have 20 years of experience. You are typing this article RIGHT NOW after talking to sources. You are tired, rushed, and human.

TOPIC: "${topic}"
CATEGORY: ${category}
CURRENT DATE: March 18, 2026

CRITICAL REQUIREMENTS - DO NOT FAIL THESE:

1. **WRITE LIKE A REAL BENGALI/MUMBAI JOURNALIST WHO IS TIRED**
   - Start with "Kolkata/Mumbai, March 18:" or just jump in
   - Use "bhai", "dada", "yaar" occasionally
   - Say "Honestly speaking" or "To be frank"
   - Add "as I understand it" or "from what I've gathered"
   - Use "main" instead of "I" sometimes (Indian English)

2. **ADD IMPERFECTIONS - THIS IS KEY**
   - Start sentences with "And", "But", "So"
   - Use sentence fragments: "The situation, honestly."
   - Add "(laughs)" or "(sighs)" or "(pauses)"
   - Use "you know" or "I mean" naturally
   - Vary sentence length wildly - some 5 words, some 40 words
   - Occasionally use "..." for trailing thoughts

3. **INDIAN ENGLISH COLLOQUIALISMS**
   - "The thing is", "Actually ya", "Listen"
   - "It's not like", "I don't know why but"
   - "People were like", "And then he said"
   - "Quite honestly", "Frankly speaking"
   - "At the end of the day", "When you think about it"

4. **SPECIFIC LOCAL DETAILS - BE VERY SPECIFIC**
   - "Near Howrah Bridge yesterday evening"
   - "At VT station during rush hour"
   - "In South Kolkata's Garia area"
   - "At a tea stall in Durgapur"
   - Prices in INR: "₹2,500", "₹1.2 lakh", "₹50 crore"
   - Local time: "around 4 PM when the incident occurred"
   - Government officials by name and designation

5. **ANONYMOUS SOURCES - ADD 2-3 OF THESE**
   - "A senior government official who did not wish to be named said..."
   - "Sources in the state secretariat told me..."
   - "An insider who spoke on condition of anonymity revealed..."
   - "Industry sources close to the development said..."

6. **BREAKING NEWS URGENCY**
   - "JUST IN:" or "BREAKING:"
   - "This is developing"
   - "More details awaited"
   - "We are tracking this story"

7. **RHETORICAL QUESTIONS AND DIRECT ADDRESS**
   - "But what does this mean for the common person?"
   - "You might be wondering why this matters"
   - "Here's the thing nobody is talking about"
   - "Let me explain simply"

8. **OPINION AND ANALYSIS**
   - "In my view", "I believe", "It seems to me"
   - "This is problematic because", "The real concern is"
   - "Experts I spoke with agreed that"

9. **NUMBERS - BE SPECIFIC**
   - NOT "about 50%" → EXACTLY "47.3%"
   - NOT "thousands" → EXACTLY "4,782 people"
   - NOT "crores" → EXACTLY "₹847 crore"
   - Specific dates and times

10. **BOLD KEY POINTS - BE GENEROUS**
    - <b>47.3% increase</b>
    - <b>₹847 crore</b>
    - <b>this is significant</b>
    - <b>key development</b>

11. **AVOID AI PATTERNS - CRITICAL**
    - NO "In conclusion" → Use "So what does this mean?"
    - NO "Furthermore" or "Moreover" → Use "And also" or "Plus"
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
      prompt = `You are a tired cricket journalist at Eden Gardens writing after talking to team officials. Write an IPL preview for ${matchData.team1} vs ${matchData.team2}.

Match Details:
- Teams: ${matchData.team1} vs ${matchData.team2}
- Venue: ${matchData.venue}
- Date: ${matchData.matchDate}

CRITICAL - WRITE LIKE A HUMAN:
- Start with "Kolkata, March 18:" or "At the pre-match press conference today..."
- Add imperfections: "And honestly", "The thing is", "You know"
- Include anonymous sources: "A team official who didn't want to be named said..."
- Use Indian English: "bhai", "dada", "yaar" naturally
- Add specific details: exact prices, times, crowd estimates
- Bold key stats and player names
- Use sentence fragments and vary sentence length
- NO "In conclusion" - use "So who wins?"
- Add local context: Eden Gardens crowd, Kolkata weather, pitch conditions

Write 900-1100 words with <b>bold</b> emphasis.`;
      break;
      
    case 'result':
      prompt = `You just watched the match at ${matchData.venue} and are typing the result article immediately. Write for ${matchData.team1} vs ${matchData.team2}.

Match Result:
- Winner: ${matchData.winner}
- Result: ${matchData.result}

HUMAN WRITING - DO THIS:
- Start with the result immediately, like breaking news
- Add your personal reaction: "What. A. Match." or "Honestly, nobody saw this coming"
- Include "Sources in the dressing room told me..."
- Add specific moments: "That catch in the 14th over, honestly..."
- Use "And then" for narrative flow
- Bold key stats: <b>87 runs</b>, <b>4 wickets</b>
- Mention crowd reaction at the venue
- Add expert quotes from commentators
- Use fragments: "Unbelievable. Simply unbelievable."
- NO formal conclusions - end with impact

Write 900-1100 words with <b>bold</b> emphasis.`;
      break;
      
    case 'live':
      prompt = `You're live at ${matchData.venue} providing ball-by-ball commentary for ${matchData.team1} vs ${matchData.team2}. You're excited, maybe a bit tired, typing fast.

HUMAN COMMENTARY STYLE:
- Write like you're texting a friend who's a cricket fan
- Use "And..." "But..." "So..."
- Add "(EDEN GARDENS GOES WILD!)" or "(silence in the stadium)"
- Include "Sources say" for team changes
- Bold every boundary, wicket, milestone
- Use fragments: "Gone! That's it! Bowled him!"
- Add local flavor: "The Kolkata crowd is on their feet"
- Mention specific field placements
- Use "you know" and "I mean" naturally
- Reference the pitch, weather, atmosphere

Write 800-1000 words with <b>bold</b> for every important moment.`;
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
