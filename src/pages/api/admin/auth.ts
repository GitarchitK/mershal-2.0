import type { APIRoute } from 'astro';
import { adminAuth } from '../../../lib/firebase-admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return new Response(JSON.stringify({ error: 'ID Token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!adminAuth) {
      return new Response(JSON.stringify({ error: 'Firebase Admin Auth is not initialized. Please verify environment credentials.' }), {
        status: 550,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify ID Token on server using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Set authenticated session cookie
    cookies.set('admin_session', 'authenticated', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return new Response(JSON.stringify({ success: true, email: decodedToken.email }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Admin Auth verification error:', error);
    return new Response(JSON.stringify({ error: 'Authentication verification failed: ' + error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
