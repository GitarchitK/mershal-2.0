import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';
import { google } from 'googleapis';

function isAuthenticated(cookies: any) {
  return cookies.get('admin_session')?.value === 'authenticated';
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function countWords(text: string) {
  return text.trim().split(/\s+/).length;
}

// Submit URL to Google Indexing API (fire-and-forget, won't block the response)
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
    const url = `https://mershal.in/news/${slug}`;

    await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    });

    console.log('✓ Submitted to Google Indexing:', url);
  } catch (err: any) {
    // Non-fatal — log and continue
    console.warn('Google Indexing skipped:', err.message);
  }
}

// GET - list all posts or single post
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
      const doc = await adminDb.collection('posts').doc(id).get();
      if (!doc.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      return new Response(JSON.stringify({ id: doc.id, ...doc.data() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const snapshot = await adminDb.collection('posts').orderBy('publishedAt', 'desc').limit(100).get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      slug: doc.data().slug,
      category: doc.data().category,
      status: doc.data().status,
      author: doc.data().author,
      publishedAt: doc.data().publishedAt?.toDate?.()?.toISOString() || null,
      wordCount: doc.data().wordCount || 0,
    }));

    return new Response(JSON.stringify(posts), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// POST - create new post
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

    // Check duplicate slug
    const existing = await adminDb.collection('posts').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) {
      return new Response(JSON.stringify({ error: 'A post with this slug already exists' }), { status: 409 });
    }

    const post = {
      title: data.title,
      slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      category: data.category || 'technology',
      tags: data.tags || [],
      featuredImage: data.featuredImage || '',
      author: data.author || 'Archit Karmakar',
      status: data.status || 'published',
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt || '',
      wordCount,
      readingTime,
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await adminDb.collection('posts').add(post);

    // Auto-submit to Google Indexing if published
    if (post.status === 'published') {
      notifyGoogle(slug); // fire-and-forget
    }

    return new Response(JSON.stringify({ id: ref.id, slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// PUT - update post
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

    await adminDb.collection('posts').doc(id).update({
      ...fields,
      wordCount,
      readingTime,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Auto-submit to Google Indexing if publishing
    if (fields.status === 'published' && fields.slug) {
      notifyGoogle(fields.slug); // fire-and-forget
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// DELETE - delete post
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
    await adminDb.collection('posts').doc(id).delete();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
