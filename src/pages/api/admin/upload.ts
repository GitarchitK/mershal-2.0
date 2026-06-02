import type { APIRoute } from 'astro';
import { adminStorage } from '../../../lib/firebase-admin';

function isAuthenticated(cookies: any) {
  return cookies.get('admin_session')?.value === 'authenticated';
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!adminStorage) {
    return new Response(JSON.stringify({ error: 'Storage bucket not configured' }), { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'articles';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket();
    const filename = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUpload = bucket.file(filename);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file publicly readable
    await fileUpload.makePublic();

    // Direct Google Cloud Storage public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
