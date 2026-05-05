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

  // Build real facts block from fetched news
  const hasFacts = trendContext.realFacts?.length > 0;
  const factsBlock = hasFacts
    ? `\n\nREAL NEWS FACTS (verified from Google News — use these as your factual foundation):\n${
        trendContext.realFacts.map((f, i) =>
          `[${i+1}] "${f.headline}" — ${f.source}${f.snippet ? `\n    Context: ${f.snippet}` : ''}`
        ).join('\n')
      }\n\nYou MUST base your article on these real facts. Do NOT invent statistics, quotes, or events not supported by the above.`
    : `\n\nNOTE: No real-time news data available for this topic. Write only what you know to be factually accurate. Do NOT fabricate quotes, statistics, or specific events. Use general, verifiable background information only.`;

  const relatedBlock = trendContext.relatedHeadlines?.length
    ? `\nRELATED HEADLINES FROM GOOGLE TRENDS:\n${trendContext.relatedHeadlines.map(h => `- ${h.headline}`).join('\n')}`
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
TRENDING TRAFFIC: ${trendContext.traffic || 'High'}${factsBlock}${relatedBlock}

ARTICLE REQUIREMENTS:

1. LENGTH: 900-1300 words

2. FACTUAL ACCURACY — THIS IS CRITICAL:
   - ONLY use facts from the REAL NEWS FACTS section above
   - If a fact is not in the provided sources, do NOT include it
   - Do NOT invent quotes — only use quotes if they appear in the source material
   - Do NOT fabricate statistics, dates, or names
   - If you are uncertain about a detail, write around it or omit it
   - You may add verified background context (e.g. historical facts about a country, general knowledge about a company) but clearly distinguish analysis from reported facts

3. STRUCTURE:
<h2>Subheading</h2> — 3-4 subheadings
<p>Paragraph</p>
<blockquote>Direct quote from source material only</blockquote>
<ul><li>List item</li></ul> — for key points
<strong>Term</strong> — sparingly

4. NEWS WRITING FORMAT:
- Lead paragraph: Most important verified fact first
- Second paragraph: Context and background
- Middle: Details from sources, analysis, implications
- Close: What happens next / why it matters

5. ENGAGING WRITING:
- Vary sentence length — mix short punchy sentences with longer analytical ones
- Use specific details from the source material (names, places, numbers)
- Explain WHY this story matters to the reader
- Add editorial analysis: "This marks a shift...", "The decision raises questions..."
- Use active voice
- Write with genuine curiosity and engagement

6. WHAT TO AVOID:
- Do NOT start with "In today's world" or "In recent years"
- Do NOT use "It is worth noting", "Delve into", "Comprehensive", "Multifaceted"
- Do NOT fabricate ANY quotes, statistics, or events
- Do NOT repeat the topic keyword more than 4 times
- Do NOT write like a listicle

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
