import type { APIRoute } from 'astro';
import { adminDb } from '../../lib/firebase-admin';

export const GET: APIRoute = async ({ url }) => {
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'Firebase not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Attempt to query articles by publish_date or fallback to publishedAt
    let snapshot;
    try {
      let query = adminDb.collection('articles')
        .orderBy('publish_date', 'desc');
        
      if (category) {
        query = query.where('category', '==', category);
      }
      
      snapshot = await query.limit(limit).get();
    } catch (e) {
      // Fallback
      let query = adminDb.collection('articles')
        .orderBy('publishedAt', 'desc');
        
      if (category) {
        query = query.where('category', '==', category);
      }
      
      snapshot = await query.limit(limit).get();
    }

    if (snapshot.empty) {
      // Try posts legacy collection fallback
      let query = adminDb.collection('posts')
        .orderBy('publishedAt', 'desc');
      if (category) {
        query = query.where('category', '==', category);
      }
      snapshot = await query.limit(limit).get();
    }
    
    const articles = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        slug: d.slug || doc.id,
        title: d.title || '',
        excerpt: d.excerpt || '',
        content: d.content || '',
        category: d.category || 'AI Tools',
        tags: d.tags || [],
        publish_date: d.publish_date || d.publishedAt || null
      };
    });
    
    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'Firebase not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();
    
    const docRef = await adminDb.collection('articles').add({
      ...data,
      publishedAt: new Date(),
      views: 0
    });
    
    return new Response(JSON.stringify({ id: docRef.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
