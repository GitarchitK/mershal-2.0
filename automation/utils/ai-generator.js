import OpenAI from 'openai';
import { config } from '../config.js';

let openai = null;
if (config.ai.openaiApiKey) {
  openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function countWords(text) {
  return text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
}

function calculateReadingTime(wordCount) {
  return Math.ceil(wordCount / 200);
}

async function generateThumbnail(topic, category) {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const fallbacks = {
    politics:      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=630&fit=crop&auto=format&q=80',
    business:      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&auto=format&q=80',
    technology:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop&auto=format&q=80',
    sports:        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=630&fit=crop&auto=format&q=80',
    entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=630&fit=crop&auto=format&q=80',
    world:         'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=630&fit=crop&auto=format&q=80',
  };

  if (unsplashKey) {
    try {
      const query = topic.split(' ').slice(0, 3).join(' ');
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        return `${data.urls.raw}&w=1200&h=630&fit=crop&auto=format&q=80`;
      }
    } catch (e) {
      // fall through to fallback
    }
  }

  return fallbacks[category] || fallbacks.world;
}

/**
 * Generate a news article using GPT-4o.
 * The AI is instructed to write as the Editor in Chief of Mershal.
 *
 * @param {string} topic - The trending topic/headline
 * @param {string} category - world | politics | business | technology | sports | entertainment
 * @param {object} trendContext - Optional: { relatedHeadlines, traffic }
 */
export async function generateArticle(topic, category, trendContext = {}) {
  if (!openai) throw new Error('OpenAI not initialized. Check OPENAI_API_KEY.');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Build context from related headlines if available
  const contextBlock = trendContext.relatedHeadlines?.length
    ? `\n\nRELATED HEADLINES FROM GOOGLE TRENDS (use as factual context, do NOT copy):\n${trendContext.relatedHeadlines.map(h => `- ${h.headline}: ${h.snippet}`).join('\n')}`
    : '';

  const systemPrompt = `You are the Editor in Chief of Mershal (mershal.in), a professional world news publication. 

Your writing style:
- Authoritative, clear, and direct — like a senior journalist at Reuters or BBC
- Varied sentence length: mix short punchy sentences with longer analytical ones
- Use active voice predominantly
- Include specific details, numbers, and named sources where plausible
- Write with genuine editorial perspective — not just summarizing, but analyzing
- Natural paragraph flow with smooth transitions
- Occasional rhetorical questions to engage readers
- Never use AI-sounding phrases like "In conclusion", "It is worth noting", "Delve into", "Comprehensive", "Multifaceted"
- Never start consecutive sentences with the same word
- Use contractions naturally (it's, don't, we've, there's)
- Vary your vocabulary — don't repeat the same adjective twice

You always respond with valid JSON only.`;

  const userPrompt = `Write a professional news article for Mershal about this trending topic.

TOPIC: "${topic}"
CATEGORY: ${category}
DATE: ${today}
TRENDING TRAFFIC: ${trendContext.traffic || 'High'}${contextBlock}

ARTICLE REQUIREMENTS:

1. LENGTH: 800-1200 words (news article, not a blog post)

2. STRUCTURE (use these HTML tags):
<h2>Subheading</h2> — 3-4 subheadings throughout
<p>Paragraph text</p>
<blockquote>Key quote or important statement</blockquote>
<ul><li>List item</li></ul> — for key points when appropriate
<strong>Important term</strong> — sparingly for emphasis

3. NEWS ARTICLE FORMAT:
- Opening paragraph: The most important fact first (inverted pyramid)
- Second paragraph: Context and background
- Middle sections: Details, analysis, different perspectives
- Closing: Implications, what happens next

4. HUMAN WRITING TECHNIQUES:
- Start with a specific, concrete detail or surprising fact
- Include at least one attributed quote (can be from a named official, expert, or spokesperson — make it plausible)
- Use specific numbers and statistics where relevant
- Reference real places, organizations, and context
- Show cause and effect relationships
- Include one moment of editorial analysis ("This marks a significant shift..." / "The decision raises questions about...")

5. WHAT TO AVOID:
- Do NOT start with "In today's world" or "In recent years"
- Do NOT use bullet points for the main narrative
- Do NOT write like a listicle
- Do NOT use passive voice excessively
- Do NOT repeat the topic keyword more than 4 times

6. SEO:
- Title: 55-65 characters, specific and compelling
- Excerpt: 150-160 characters, summarizes the key news
- Tags: 5-7 relevant keywords

Respond ONLY with this JSON (no markdown, no code blocks):
{
  "title": "Specific, compelling news headline (55-65 chars)",
  "excerpt": "One-sentence summary of the key news (150-160 chars)",
  "content": "Full HTML article 800-1200 words",
  "seoTitle": "SEO headline - Mershal (under 60 chars)",
  "seoDescription": "Meta description with key facts (150-160 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const completion = await openai.chat.completions.create({
    model: config.ai.model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.85,       // High enough for natural variation
    top_p: 0.92,
    frequency_penalty: 0.5,  // Strongly discourages word repetition
    presence_penalty: 0.4,   // Encourages covering different aspects
  });

  const articleData = JSON.parse(completion.choices[0].message.content);

  const wordCount = countWords(articleData.content);
  const readingTime = calculateReadingTime(wordCount);
  const slug = generateSlug(articleData.title);
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
}
