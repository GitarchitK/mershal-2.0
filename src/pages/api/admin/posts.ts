import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';
import { google } from 'googleapis';
import { auditArticle } from '../../../lib/seo-validator';

function isAuthenticated(cookies: any) {
  return cookies.get('admin_session')?.value === 'authenticated';
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function countWords(text: string) {
  return text.trim().split(/\s+/).length;
}

// Submit URL to Google Indexing API
async function notifyGoogle(slug: string) {
  try {
    const email = process.env.GOOGLE_INDEXING_EMAIL;
    let key = process.env.GOOGLE_INDEXING_PRIVATE_KEY;
    if (!email || !key) return;

    if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: key },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing({ version: 'v3', auth });
    const url = `https://mershal.in/articles/${slug}`;

    await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    });

    console.log('✓ Submitted to Google Indexing:', url);
  } catch (err: any) {
    console.warn('Google Indexing skipped:', err.message);
  }
}

// GET - list all articles or single article
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });
  }

  const id = url.searchParams.get('id');

  try {
    if (id) {
      let doc = await adminDb.collection('articles').doc(id).get();
      if (!doc.exists) {
        // Fallback search in legacy posts
        doc = await adminDb.collection('posts').doc(id).get();
      }
      if (!doc.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      
      const d = doc.data() || {};
      const audit = auditArticle({
        title: d.title || '',
        excerpt: d.excerpt || '',
        content: d.content || '',
        category: d.category || 'AI Tools',
        featured_image: d.featured_image || d.featuredImage || '',
        meta_title: d.meta_title || d.seoTitle || '',
        meta_description: d.meta_description || d.seoDescription || '',
        faq_items: d.faq_items || []
      });

      return new Response(JSON.stringify({
        id: doc.id,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        category: d.category,
        tags: d.tags || [],
        featuredImage: d.featured_image || d.featuredImage || '',
        author: d.author,
        status: d.status,
        meta_title: d.meta_title || d.seoTitle || '',
        meta_description: d.meta_description || d.seoDescription || '',
        faq_items: d.faq_items || [],
        schema_data: d.schema_data || {},
        seo: {
          score: audit.score,
          warnings: audit.warnings,
          recommendations: audit.recommendations
        }
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all articles
    let snapshot = await adminDb.collection('articles').orderBy('publish_date', 'desc').limit(100).get();
    
    if (snapshot.empty) {
      // Fallback list
      snapshot = await adminDb.collection('posts').orderBy('publishedAt', 'desc').limit(100).get();
    }

    // To check duplicate titles and descriptions, we collect them first
    const titlesMap = new Map<string, string[]>();
    const descMap = new Map<string, string[]>();
    
    snapshot.docs.forEach(doc => {
      const d = doc.data();
      const metaTitle = (d.meta_title || d.seoTitle || d.title || '').trim().toLowerCase();
      const metaDesc = (d.meta_description || d.seoDescription || d.excerpt || '').trim().toLowerCase();
      
      if (metaTitle) {
        if (!titlesMap.has(metaTitle)) titlesMap.set(metaTitle, []);
        titlesMap.get(metaTitle)!.push(doc.id);
      }
      if (metaDesc) {
        if (!descMap.has(metaDesc)) descMap.set(metaDesc, []);
        descMap.get(metaDesc)!.push(doc.id);
      }
    });

    const posts = snapshot.docs.map(doc => {
      const d = doc.data();
      const audit = auditArticle({
        title: d.title || '',
        excerpt: d.excerpt || '',
        content: d.content || '',
        category: d.category || 'AI Tools',
        featured_image: d.featured_image || d.featuredImage || '',
        meta_title: d.meta_title || d.seoTitle || '',
        meta_description: d.meta_description || d.seoDescription || '',
        faq_items: d.faq_items || []
      });

      // Check for duplicate titles and descriptions
      const metaTitle = (d.meta_title || d.seoTitle || d.title || '').trim().toLowerCase();
      const metaDesc = (d.meta_description || d.seoDescription || d.excerpt || '').trim().toLowerCase();
      
      if (metaTitle && titlesMap.has(metaTitle) && titlesMap.get(metaTitle)!.length > 1) {
        audit.score = Math.max(0, audit.score - 10);
        audit.warnings.push('Duplicate SEO Meta Title shared with other articles');
        audit.recommendations.push('Write a unique SEO Meta Title to avoid search cannibalization.');
      }
      if (metaDesc && descMap.has(metaDesc) && descMap.get(metaDesc)!.length > 1) {
        audit.score = Math.max(0, audit.score - 10);
        audit.warnings.push('Duplicate SEO Meta Description shared with other articles');
        audit.recommendations.push('Write a unique SEO Meta Description to differentiate search snippets.');
      }

      // Generate internal linking suggestions
      const suggestions: string[] = [];
      const currentCategory = d.category || '';
      snapshot.docs.forEach(otherDoc => {
        if (otherDoc.id !== doc.id) {
          const od = otherDoc.data();
          if (od.category === currentCategory) {
            suggestions.push(`Link to: "${od.title}" (/articles/${od.slug || otherDoc.id})`);
          }
        }
      });
      const internalLinkingSuggestions = suggestions.slice(0, 3);

      return {
        id: doc.id,
        title: d.title,
        slug: d.slug,
        category: d.category,
        status: d.status,
        author: d.author,
        publishedAt: d.publish_date?.toDate?.()?.toISOString() || d.publishedAt?.toDate?.()?.toISOString() || null,
        wordCount: d.wordCount || d.word_count || 0,
        seo: {
          score: audit.score,
          warnings: audit.warnings,
          recommendations: audit.recommendations,
          internalLinkingSuggestions
        }
      };
    });

    return new Response(JSON.stringify(posts), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 550 });
  }
};

// POST - create new article
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });
  }

  try {
    const data = await request.json();
    const slug = data.slug || generateSlug(data.title);
    const wordCount = countWords(data.content?.replace(/<[^>]*>/g, '') || '');
    const readingTime = Math.ceil(wordCount / 200);

    // Check duplicate slug in articles
    const existing = await adminDb.collection('articles').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) {
      return new Response(JSON.stringify({ error: 'An article with this slug already exists' }), { status: 409 });
    }

    const articleDoc = {
      title: data.title,
      slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      category: data.category || 'AI Tools',
      tags: data.tags || [],
      featured_image: data.featuredImage || data.featured_image || '',
      author: data.author || 'Archit Karmakar',
      status: data.status || 'published',
      meta_title: data.meta_title || data.seoTitle || data.title,
      meta_description: data.meta_description || data.seoDescription || data.excerpt || '',
      wordCount,
      readingTime,
      publish_date: admin.firestore.FieldValue.serverTimestamp(),
      updated_date: admin.firestore.FieldValue.serverTimestamp(),
      faq_items: data.faq_items || [],
      schema_data: data.schema_data || { article_type: 'BlogPosting' },
    };

    const ref = await adminDb.collection('articles').add(articleDoc);

    // Auto-submit to Google Indexing if published
    if (articleDoc.status === 'published') {
      notifyGoogle(slug);
    }

    return new Response(JSON.stringify({ id: ref.id, slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// PUT - update article
export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });
  }

  try {
    const data = await request.json();
    const { id, ...fields } = data;
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    const wordCount = countWords(fields.content?.replace(/<[^>]*>/g, '') || '');
    const readingTime = Math.ceil(wordCount / 200);

    const articleDoc = {
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt || '',
      content: fields.content || '',
      category: fields.category || 'AI Tools',
      tags: fields.tags || [],
      featured_image: fields.featuredImage || fields.featured_image || '',
      author: fields.author || 'Archit Karmakar',
      status: fields.status || 'published',
      meta_title: fields.meta_title || fields.seoTitle || fields.title,
      meta_description: fields.meta_description || fields.seoDescription || fields.excerpt || '',
      wordCount,
      readingTime,
      updated_date: admin.firestore.FieldValue.serverTimestamp(),
      faq_items: fields.faq_items || [],
      schema_data: fields.schema_data || { article_type: 'BlogPosting' },
    };

    // Check if updating in articles or legacy posts
    let ref = adminDb.collection('articles').doc(id);
    const checkDoc = await ref.get();
    if (!checkDoc.exists) {
      ref = adminDb.collection('posts').doc(id);
    }
    
    await ref.update(articleDoc);

    // Auto-submit to Google Indexing if publishing
    if (fields.status === 'published' && fields.slug) {
      notifyGoogle(fields.slug);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// DELETE - delete article
export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });
  }

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  try {
    let ref = adminDb.collection('articles').doc(id);
    const checkDoc = await ref.get();
    if (!checkDoc.exists) {
      ref = adminDb.collection('posts').doc(id);
    }

    await ref.delete();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
