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

  const prompt = `You are an experienced tech blogger and programmer who writes detailed, practical tutorials and articles. Your writing style is similar to popular tech blogs like FreeCodeCamp, Dev.to, or CSS-Tricks.

TOPIC: "${topic}"
CATEGORY: ${category}
CURRENT DATE: March 23, 2026

CRITICAL REQUIREMENTS - WRITE LIKE A HUMAN TECH WRITER:

1. **LONG, COMPREHENSIVE CONTENT (1500-2500 words)**
   - Write in-depth articles with practical value
   - Include multiple code examples with explanations
   - Break down complex topics into digestible sections
   - Add step-by-step instructions for tutorials
   - Include troubleshooting tips and common mistakes

2. **HUMAN WRITING STYLE (Pass AI Detection)**
   - Write like you're explaining to a colleague
   - Use first-person occasionally: "I've found that...", "In my experience..."
   - Add personal insights: "What surprised me was...", "One thing to note..."
   - Include real-world examples from your own projects
   - Use conversational tone, not robotic

3. **CODE EXAMPLES**
   - Include actual code snippets with syntax highlighting
   - Explain each line or block of code
   - Show both working and broken examples
   - Add comments in the code
   - Use proper formatting with indentation

4. **INTERNAL LINKING (CRITICAL)**
   - Naturally link to related articles you might write:
     - "If you want to learn more about [topic], check out our guide on [related topic]"
     - "This builds on our previous article about [topic]"
     - "For a deeper dive into [concept], see our tutorial on [topic]"
     - "Related: [Article Title](https://mershal.in/news/slug)"
   - Add 3-5 relevant internal links per article

5. **TECHNICAL DEPTH**
   - Explain the "why" not just the "how"
   - Include best practices and industry standards
   - Mention alternative approaches
   - Discuss pros and cons of different solutions
   - Reference official documentation when relevant

6. **HEADINGS AND STRUCTURE**
   - Use clear H2 and H3 headings
   - Add a table of contents for long articles
   - Include an introduction and conclusion
   - Use bullet points for lists
   - Add code blocks with language labels

7. **SEO OPTIMIZATION**
   - Include the main keyword naturally
   - Add meta description
   - Use descriptive headings
   - Include alt text for any images

8. **HUMAN TOUCHES**
   - Add occasional imperfections: "Here's a tip most tutorials miss..."
   - Use "Note:" or "Pro tip:" boxes
   - Include warnings: "Common mistake to avoid..."
   - Add personal anecdotes: "When I first learned this..."
   - Use contractions naturally

9. **AVOID AI PATTERNS**
   - NO generic openings like "In today's digital age..."
   - NO perfectly structured paragraphs
   - NO excessive use of bullet points
   - NO formal robotic tone
   - Vary sentence structure naturally

10. **ACTIONABLE CONTENT**
    - End with clear next steps
    - Provide practice exercises
    - Include "Try it yourself" sections
    - Add resources for further learning

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
            content: 'You are an experienced tech blogger who writes detailed programming tutorials. Always respond with valid JSON only, no additional text. Write long, human-like articles with code examples and internal links.'
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
