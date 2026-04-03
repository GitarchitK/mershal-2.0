import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';

function isAuthenticated(cookies: any) {
  return cookies.get('admin_session')?.value === 'authenticated';
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!adminDb) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });

  try {
    const snapshot = await adminDb.collection('categories').orderBy('name').get();
    const categories = await Promise.all(snapshot.docs.map(async doc => {
      const postsSnap = await adminDb!.collection('posts').where('category', '==', doc.data().slug).where('status', '==', 'published').get();
      return { id: doc.id, ...doc.data(), postCount: postsSnap.size };
    }));
    return new Response(JSON.stringify(categories), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!adminDb) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });

  try {
    const { name, slug, description } = await request.json();
    const existing = await adminDb.collection('categories').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) return new Response(JSON.stringify({ error: 'Category slug already exists' }), { status: 409 });

    const ref = await adminDb.collection('categories').add({
      name, slug, description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return new Response(JSON.stringify({ id: ref.id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!adminDb) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });

  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  try {
    await adminDb.collection('categories').doc(id).delete();
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
