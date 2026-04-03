import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ cookies }) => {
  if (cookies.get('admin_session')?.value !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!adminDb) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });
  }

  try {
    const snapshot = await adminDb.collection('posts').get();
    const posts = snapshot.docs.map(d => d.data());

    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;

    const byCategory: Record<string, number> = {};
    posts.forEach(p => {
      const cat = p.category || 'uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return new Response(JSON.stringify({ total, published, drafts, byCategory }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
