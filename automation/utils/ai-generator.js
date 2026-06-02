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
    'ai-tools':          'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&h=630&fit=crop&auto=format&q=80',
    'saas-reviews':      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&auto=format&q=80',
    'productivity':      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=630&fit=crop&auto=format&q=80',
    'freelancing':       'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&auto=format&q=80',
    'online-business':   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&auto=format&q=80',
    'crm-software':      'https://images.unsplash.com/photo-1552581230-c01591d6f597?w=1200&h=630&fit=crop&auto=format&q=80',
    'digital-marketing': 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=1200&h=630&fit=crop&auto=format&q=80',
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

  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return fallbacks[categorySlug] || fallbacks['ai-tools'];
}

/**
 * Generate a programmatic SEO article using GPT-4o.
 * The AI is instructed to write as the Editor in Chief of Mershal.
 *
 * @param {string} topic - The keyword/topic
 * @param {string} category - Category display name
 * @param {object} trendContext - Optional: { relatedHeadlines, traffic }
 */
export async function generateArticle(topic, category, trendContext = {}) {
  if (!openai) throw new Error('OpenAI not initialized. Check OPENAI_API_KEY.');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const systemPrompt = `You are the Editor in Chief of Mershal (mershal.in), a premium SaaS, AI, and online business operations authority blog. 

Your writing style:
- Authoritative, clear, actionable, and engaging — like a senior writer at HubSpot, Ahrefs, or Zapier
- Varied sentence length: mix short punchy sentences with longer analytical ones
- Use active voice predominantly
- Include specific details, real-world examples, and numbers where plausible
- Natural paragraph flow with smooth transitions
- Occasional rhetorical questions to engage readers
- Never use AI-sounding phrases like "In conclusion", "It is worth noting", "Delve into", "Comprehensive", "Multifaceted"
- Never start consecutive sentences with the same word
- Use contractions naturally (it's, don't, we've, there's)
- Vary your vocabulary — don't repeat the same adjective twice

You always respond with valid JSON only.`;

  const userPrompt = `Write a comprehensive, high-quality, 1200+ word evergreen article/guide for Mershal about this topic.

TOPIC: "${topic}"
CATEGORY: ${category}
DATE: ${today}

ARTICLE REQUIREMENTS:

1. LENGTH: 1200+ words

2. VISUAL CALLOUTS & FORMATTING (CRITICAL FOR BRANDING):
   You MUST inject these exact HTML class wrappers directly into the article content where appropriate (do not escape HTML tags inside the JSON string, output them directly):
   - TIP CALLOUTS (For recommendations or insider tips):
     <div class="tip-box"><p>💡 <strong>Tip:</strong> [Tip content here]</p></div>
   - WARNING CALLOUTS (For critical mistakes, risks, or warnings):
     <div class="warning-box"><p>⚠️ <strong>Warning:</strong> [Warning content here]</p></div>
   - INFO/NOTE CALLOUTS (For extra context, facts, or statistics):
     <div class="info-box"><p>ℹ️ <strong>Note:</strong> [Context content here]</p></div>
   - STEP-BY-STEP SECTIONS (Use this exact structure for numbered instructions/steps):
     <div class="step">
       <div class="step-number">1</div>
       <div>
         <h4>[Step Title]</h4>
         <p>[Step explanation...]</p>
       </div>
     </div>
     (Repeat sequentially for Steps 2, 3, etc.)
   - KEYWORD HIGHLIGHTS:
     Use <span class="highlight">keyword or key phrase</span> to emphasize important terms.

3. STRUCTURE:
   - Introduction (~150 words): Hook, identify core user pain points, state the solution clearly, and outline what the article covers.
   - H2 headings for major sections (use 3-4 descriptive H2s).
   - A comparison table comparing options/tools (use standard HTML table tags: <table>, <thead>, <tbody>, <tr>, <th>, <td>).
   - Paragraphs should be short (2-3 sentences max) to improve readability on mobile devices.
   - Do NOT use H1 in the content (the page title acts as H1).

4. FAQ SECTION:
   - Provide 3-4 frequently asked questions with highly concise, direct answers. You will return these separately in the "faqItems" JSON field as well.

Respond ONLY with this JSON structure (no markdown, no code blocks):
{
  "title": "Compelling, benefit-driven SEO article title (55-65 chars)",
  "excerpt": "One-sentence summary of the key takeaways (150-160 chars)",
  "content": "Full HTML article content (1200+ words) formatted with the requested custom HTML wrappers",
  "seoTitle": "SEO meta title - Mershal (under 60 chars)",
  "seoDescription": "Meta description targeting high-value search terms (150-160 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "faqItems": [
    { "question": "Question 1?", "answer": "Answer 1" },
    { "question": "Question 2?", "answer": "Answer 2" },
    { "question": "Question 3?", "answer": "Answer 3" }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: config.ai.model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.85,
    top_p: 0.92,
    frequency_penalty: 0.5,
    presence_penalty: 0.4,
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
