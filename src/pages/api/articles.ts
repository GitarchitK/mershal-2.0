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
    
    let query = adminDb.collection('articles')
      .orderBy('publishedAt', 'desc')
      .limit(limit);
    
    if (category) {
      query = query.where('category', '==', category) as any;
    }
    
    const snapshot = await query.get();
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
