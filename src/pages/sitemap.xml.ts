export const prerender = false;

import type { APIRoute } from 'astro';
import { adminDb } from '../lib/firebase-admin';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const baseUrl = 'https://mershal.in';

  let articles: any[] = [];

  if (adminDb) {
    try {
      // Query articles first
      let snapshot = await adminDb
        .collection('articles')
        .where('status', '==', 'published')
        .get();

      if (snapshot.empty) {
        // Fallback to legacy posts
        snapshot = await adminDb
          .collection('posts')
          .where('status', '==', 'published')
          .get();
      }

      articles = snapshot.docs.map(doc => ({
        slug: doc.data().slug || doc.id,
        title: doc.data().title || '',
        featuredImage: doc.data().featured_image || doc.data().featuredImage || '',
        updatedAt: doc.data().updated_date?.toDate?.() || doc.data().updatedAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
    }
  }

  const categories = ['ai-tools', 'saas-reviews', 'productivity', 'freelancing', 'online-business', 'crm', 'marketing'];
  const now = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${now}</lastmod>
  </url>

  <!-- About -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${now}</lastmod>
  </url>

  <!-- Contact -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Privacy Policy -->
  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Terms -->
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

`;

  // Category pages
  categories.forEach(category => {
    sitemap += `  <!-- Category: ${category} -->
  <url>
    <loc>${baseUrl}/category/${category}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${now}</lastmod>
  </url>

`;
  });

  // Article pages
  articles.forEach(art => {
    const featuredImage = art.featuredImage || '/logo.png';
    const imageUrl = featuredImage.startsWith('http') ? featuredImage : `${baseUrl}${featuredImage}`;
    sitemap += `  <url>
    <loc>${baseUrl}/articles/${art.slug}</loc>
    <lastmod>${art.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(art.title)}</image:title>
    </image:image>
  </url>
`;
  });

  sitemap += `</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
