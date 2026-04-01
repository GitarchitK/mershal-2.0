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

  const prompt = `You are a professional tech writer creating content for Mershal.in. Write a comprehensive, human-like article that passes AI detection and meets AdSense quality standards.

TOPIC: "${topic}"
CATEGORY: ${category}
DATE: March 31, 2026

CRITICAL: PASS AI DETECTION & ADSENSE REQUIREMENTS

**HUMAN WRITING TECHNIQUES (ESSENTIAL):**

1. **VARIED SENTENCE STRUCTURE**
   - Mix short (5-10 words) and long sentences (20-30 words)
   - Use fragments occasionally. Like this.
   - Start sentences with: And, But, So, Because, However
   - Avoid repetitive patterns
   - Example: "Python is powerful. But it's also beginner-friendly. And that's why I love it."

2. **NATURAL IMPERFECTIONS**
   - Use contractions: don't, can't, won't, I'm, you're
   - Add filler words: actually, basically, essentially, literally
   - Include hedging: probably, maybe, might, could be
   - Personal uncertainty: "I think", "In my experience", "From what I've seen"

3. **CONVERSATIONAL ELEMENTS**
   - Direct address: "You might be wondering...", "Let me show you..."
   - Rhetorical questions: "Why does this matter?", "What's the catch?"
   - Casual transitions: "Anyway", "Moving on", "Here's the thing"
   - Personal anecdotes: "Last week, I was working on..."

4. **EMOTIONAL & SUBJECTIVE LANGUAGE**
   - Express opinions: "I personally prefer", "In my view", "I'd argue that"
   - Show enthusiasm: "This is amazing!", "I was blown away", "Super useful"
   - Admit struggles: "This confused me at first", "I got stuck here"
   - Use informal words: "stuff", "things", "pretty cool", "kinda tricky"

5. **HUMAN STORYTELLING**
   - Start with a relatable problem or story
   - Include specific details: "It was 2 AM on a Friday..."
   - Share mistakes: "I wasted 3 hours because I forgot..."
   - Add dialogue or quotes: "My colleague said, 'Why not try...'"

6. **NATURAL PARAGRAPH FLOW**
   - Vary paragraph length (1-6 sentences)
   - Use single-sentence paragraphs for emphasis
   - Don't make every paragraph the same length
   - Add transitional phrases between ideas

7. **AUTHENTIC EXPERTISE**
   - Cite real sources: "According to the official docs..."
   - Reference actual tools/versions: "In React 18...", "With Python 3.11..."
   - Mention real companies/products: "Google recommends...", "VS Code has..."
   - Include current year context: "As of 2026..."

8. **ADSENSE-COMPLIANT CONTENT**
   - Original, valuable information (not copied)
   - Proper grammar and spelling
   - Professional yet friendly tone
   - No prohibited content
   - Clear, helpful explanations
   - Actionable advice

9. **SEO WITHOUT STUFFING**
   - Use keyword naturally 3-5 times
   - Include variations and synonyms
   - Focus on user intent
   - Answer questions directly
   - Use descriptive headings

10. **ENGAGEMENT ELEMENTS**
    - Ask questions to readers
    - Encourage comments: "What's your experience with this?"
    - Offer help: "Stuck? Drop a comment below"
    - Promise updates: "I'll update this if things change"

**CONTENT STRUCTURE (1800-2500 words):**

<h2>Introduction</h2>
<p>Start with a hook - a question, story, or relatable problem. Be conversational. Share why this topic matters.</p>

<h2>What You'll Learn</h2>
<ul>
<li>Bullet point 1</li>
<li>Bullet point 2</li>
<li>Bullet point 3</li>
</ul>

<h2>Main Section 1 (with keyword)</h2>
<p>Detailed explanation with examples. Mix short and long sentences. Add personal experience.</p>

<h3>Subsection</h3>
<p>More specific details. Include code if relevant.</p>

<h2>Main Section 2</h2>
<p>Continue with varied structure. Use transitions.</p>

<h2>Common Mistakes (or Tips/Best Practices)</h2>
<p>Share what NOT to do. Personal stories of errors.</p>

<h2>Frequently Asked Questions</h2>
<h3>Question 1?</h3>
<p>Direct answer in 50-100 words.</p>

<h3>Question 2?</h3>
<p>Another helpful answer.</p>

<h2>Conclusion</h2>
<p>Summarize key points. Call to action. Encourage engagement.</p>

**WRITING STYLE EXAMPLES:**

❌ AI-like: "This comprehensive guide will explore the fundamental concepts of Python programming, providing readers with essential knowledge."

✅ Human-like: "So you want to learn Python? Great choice. I've been coding in Python for 5 years, and honestly, it's one of the most beginner-friendly languages out there. Let me show you what I wish someone had told me when I started."

❌ AI-like: "It is important to note that proper error handling is crucial for application stability."

✅ Human-like: "Here's the thing about error handling - I learned this the hard way. My app crashed in production because I didn't handle a simple null value. Not fun. Let me save you from that embarrassment."

**FORMAT AS JSON:**
{
  "title": "Practical, benefit-focused title (50-60 chars)",
  "excerpt": "Compelling summary that sounds human (150-160 chars)",
  "content": "Full HTML article with natural flow, varied sentences, personal touches, 1800-2500 words",
  "seoTitle": "Keyword + benefit - Mershal (55-60 chars)",
  "seoDescription": "Natural meta description with CTA (150-160 chars)",
  "tags": ["primary-keyword", "secondary-keyword", "tutorial", "2026", "guide"]
}

REMEMBER: Write like a real person sharing knowledge, not a robot generating content. Be helpful, authentic, and conversational. Vary your sentence structure constantly. Add personality and imperfections.`;

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
            content: 'You are a professional human tech writer. Write naturally with varied sentence structure, personal touches, and authentic voice. NEVER use repetitive patterns or robotic language. Mix short and long sentences. Use contractions. Add personality. Be conversational yet professional. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
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
