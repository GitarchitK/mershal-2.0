import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../config.js';
import { getPostsByCategory, getRecentPosts } from './firebase.js';

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

export async function generateArticle(topic, category) {
  // Validate AI client is initialized
  if (config.ai.provider === 'openai' && !openai) {
    throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY in .env file.');
  }
  if (config.ai.provider === 'gemini' && !genAI) {
    throw new Error('Gemini client not initialized. Check GEMINI_API_KEY in .env file.');
  }

  // Fetch existing articles for internal linking
  let existingArticles = [];
  try {
    const categoryPosts = await getPostsByCategory(category, 10);
    const recentPosts = await getRecentPosts(10);
    existingArticles = [...categoryPosts, ...recentPosts]
      .filter((post, index, self) => 
        index === self.findIndex(p => p.slug === post.slug)
      )
      .slice(0, 15)
      .map(post => ({
        title: post.title,
        slug: post.slug,
        category: post.category
      }));
  } catch (error) {
    console.log('Could not fetch existing articles for internal linking:', error.message);
  }

  const internalLinkingContext = existingArticles.length > 0 
    ? `\n\n**INTERNAL LINKING (MANDATORY):**
You MUST include 3-5 internal links to these existing articles naturally within your content:
${existingArticles.map(a => `- "${a.title}" - Link: https://mershal.in/news/${a.slug}`).join('\n')}

Add these links naturally in relevant sections using HTML: <a href="https://mershal.in/news/${existingArticles[0]?.slug}">anchor text</a>
Make sure the anchor text is contextually relevant and flows naturally in the sentence.`
    : '';

  const prompt = `You are Archit Karmakar, a full-stack developer and tech enthusiast writing for Mershal.in. Create a USEFUL, PRACTICAL, and INFORMATIVE article based on REAL information and current tech trends.

TOPIC: "${topic}"
CATEGORY: ${category}
DATE: March 31, 2026
AUTHOR VOICE: Archit Karmakar (Full Stack Developer & Tech Enthusiast)

**CRITICAL REQUIREMENTS:**

1. **REAL & USEFUL CONTENT**
   - Base content on actual, current technology information (2026 context)
   - Include real tools, frameworks, versions, and products
   - Provide actionable advice readers can implement immediately
   - Reference actual documentation, official sources, and industry standards
   - Include specific examples with real code, commands, or configurations
   - Cite real companies, products, and industry leaders when relevant

2. **PRACTICAL VALUE**
   - Solve a real problem or answer a specific question
   - Include step-by-step instructions where applicable
   - Provide working code examples (if relevant to topic)
   - Share real-world use cases and scenarios
   - Include troubleshooting tips and common pitfalls
   - Add performance considerations and best practices

3. **CURRENT & ACCURATE (2026)**
   - Reference latest versions and releases as of 2026
   - Mention recent industry developments and trends
   - Include current statistics and data points
   - Reference recent events or announcements in tech
   - Stay updated with 2026 technology landscape

4. **ARCHIT'S WRITING STYLE**
   - First-person perspective: "I've been working with...", "In my experience..."
   - Share personal insights and lessons learned
   - Conversational yet professional tone
   - Mix technical depth with accessibility
   - Use contractions and natural language
   - Show enthusiasm for technology
   - Admit when things are tricky or confusing
   - Example: "I spent hours debugging this, so let me save you the trouble..."

5. **STRUCTURE & FORMATTING**
   - Use clear H2 and H3 headings
   - Include code blocks with proper syntax: <pre><code>actual code here</code></pre>
   - Add bullet points and numbered lists for clarity
   - Use <strong> tags for important concepts
   - Include blockquotes for key takeaways
   - Break content into digestible sections

6. **CODE EXAMPLES (when relevant)**
   - Provide real, working code snippets
   - Include comments explaining what code does
   - Show both basic and advanced examples
   - Format properly with <pre><code> tags
   - Include file names or context for code

7. **INTERNAL LINKING**
   ${internalLinkingContext}

8. **SEO & ENGAGEMENT**
   - Natural keyword usage (3-5 times)
   - Answer specific questions readers have
   - Include FAQ section with real questions
   - Add call-to-action encouraging comments
   - Use descriptive, benefit-focused headings

**CONTENT STRUCTURE (1800-2500 words):**

<h2>Introduction</h2>
<p>Hook with a real problem or question. Share why you're writing this and what readers will gain. Be personal and relatable.</p>

<h2>What Is [Topic]? (Quick Overview)</h2>
<p>Clear, concise explanation of the core concept. Define terms. Set context.</p>

<h2>Why [Topic] Matters in 2026</h2>
<p>Current relevance. Industry trends. Real-world applications. Statistics if available.</p>

<h2>How [Topic] Works (or How to Use It)</h2>
<p>Detailed explanation with examples. If it's a tutorial, include step-by-step instructions.</p>

<h3>Step 1: [Specific Action]</h3>
<p>Detailed instructions with code/commands if applicable.</p>
<pre><code>// Real code example
const example = "actual working code";
</code></pre>

<h3>Step 2: [Next Action]</h3>
<p>Continue with clear, actionable steps.</p>

<h2>Real-World Examples and Use Cases</h2>
<p>Share specific scenarios where this is useful. Include company examples or project ideas.</p>

<h2>Best Practices and Tips</h2>
<ul>
<li><strong>Tip 1:</strong> Specific, actionable advice</li>
<li><strong>Tip 2:</strong> Another practical tip</li>
<li><strong>Tip 3:</strong> More useful guidance</li>
</ul>

<h2>Common Mistakes to Avoid</h2>
<p>Share pitfalls you've encountered or seen. Help readers avoid these issues.</p>

<h2>Tools and Resources</h2>
<p>List actual tools, libraries, frameworks, or resources. Include links to official documentation.</p>

<h2>Frequently Asked Questions</h2>
<h3>Question 1 about the topic?</h3>
<p>Direct, helpful answer in 50-100 words.</p>

<h3>Question 2 about the topic?</h3>
<p>Another clear answer.</p>

<h3>Question 3 about the topic?</h3>
<p>One more useful answer.</p>

<h2>Conclusion</h2>
<p>Summarize key takeaways. Encourage readers to try it out. Ask for their experiences in comments.</p>

**WRITING EXAMPLES:**

✅ GOOD (Real & Useful):
"I've been using React 19 since it dropped in early 2026, and the new Server Components feature is a game-changer. Here's how to set it up in your Next.js 15 project:

<pre><code>// app/page.tsx
async function HomePage() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}
</code></pre>

This runs on the server, which means zero JavaScript sent to the client. I tested this on a production app, and we cut our bundle size by 40%."

❌ BAD (Vague & Generic):
"React is a popular JavaScript library for building user interfaces. It has many features that developers find useful. You can create components and manage state easily."

✅ GOOD (Practical):
"Here's a mistake I made last week: I forgot to add error handling to my API calls. The app crashed in production. Don't be like me. Always wrap your fetch calls:

<pre><code>try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('API failed');
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
</code></pre>"

**FORMAT AS JSON:**
{
  "title": "Practical, specific title (50-60 chars)",
  "excerpt": "Clear value proposition (150-160 chars)",
  "content": "Full HTML article with real information, code examples, internal links, 1800-2500 words",
  "seoTitle": "Keyword + benefit - Mershal (55-60 chars)",
  "seoDescription": "Compelling meta description with CTA (150-160 chars)",
  "tags": ["primary-keyword", "secondary-keyword", "tutorial", "2026", "guide"]
}

REMEMBER: 
- Write as Archit Karmakar sharing real knowledge
- Include actual code, tools, and examples
- Make it immediately useful and actionable
- Add 3-5 internal links naturally
- Base everything on real, current tech information
- Be specific, not generic`;

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
            content: 'You are Archit Karmakar, a full-stack developer writing practical, useful tech content. Provide real information, working code examples, and actionable advice. Include internal links naturally. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      });

      const responseText = completion.choices[0].message.content;
      articleData = JSON.parse(responseText);
      
    } else {
      console.log('Using Gemini with model:', config.ai.model);
      
      // Use Gemini
      const model = genAI.getGenerativeModel({ 
        model: config.ai.model, 
        generationConfig: { temperature: 0.8 } 
      });
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
      author: 'Archit Karmakar',
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
