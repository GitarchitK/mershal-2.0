import type { APIRoute } from 'astro';
import { cloudinary } from '../../../lib/cloudinary';

function isAuthenticated(cookies: any) {
  return cookies.get('admin_session')?.value === 'authenticated';
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Check if Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || import.meta.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return new Response(JSON.stringify({ error: 'Cloudinary credentials not configured' }), { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'articles';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload buffer to Cloudinary using upload_stream
    const uploadToCloudinary = (fileBuffer: Buffer, folderName: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folderName,
            resource_type: 'image',
          },
          (error, result) => {
            if (result) {
              resolve(result.secure_url);
            } else {
              reject(error || new Error('Cloudinary upload failed'));
            }
          }
        );
        stream.write(fileBuffer);
        stream.end();
      });
    };

    const secureUrl = await uploadToCloudinary(buffer, folder);

    return new Response(JSON.stringify({ url: secureUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Cloudinary upload API error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
