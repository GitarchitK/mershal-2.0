import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';

function isAuthenticated(cookies: any) {
  return cookies.get('admin_session')?.value === 'authenticated';
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!adminDb) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 503 });

  // Default categories always shown
  const defaults = [
    { id: 'technology', name: 'Technology', slug: 'technology', description: 'Tech news and updates', builtin: true },
    { id: 'programming', name: 'Programming', slug: 'programming', description: 'Programming guides and tips', builtin: true },
    { id: 'tutorials', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step tutorials', builtin: true },
  ];

  try {
    // Get post counts for each default category
    const withCounts = await Promise.all(defaults.map(async (cat) => {
      try {
        const postsSnap = await adminDb!.collection('posts')
          .where('category', '==', cat.slug)
          .where('status', '==', 'published')
          .get();
        return { ...cat, postCount: postsSnap.size };
      } catch {
        return { ...cat, postCount: 0 };
      }
    }));

    // Also fetch any custom categories added via admin
    let custom: any[] = [];
    try {
      const snapshot = await adminDb.collection('categories').orderBy('name').get();
      custom = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data(), postCount: 0 }))
        .filter((c: any) => !defaults.find(d => d.slug === c.slug)); // avoid duplicates
    } catch {
      // categories collection may not exist yet, that's fine
    }

    return new Response(JSON.stringify([...withCounts, ...custom]), {
      headers: { 'Content-Type': 'application/json' },
    });
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
