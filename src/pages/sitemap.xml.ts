export const prerender = false;

import type { APIRoute } from 'astro';
import { adminDb } from '../lib/firebase-admin';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://mershal.in';

  let posts: any[] = [];

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection('posts')
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .get();

      posts = snapshot.docs.map(doc => ({
        slug: doc.data().slug,
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        category: doc.data().category,
      }));
    } catch (error) {
      console.error('Error fetching posts for sitemap:', error);
    }
  }

  const categories = ['vibe-coding', 'web-development', 'tutorials', 'tools'];
  const now = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
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
  posts.forEach(post => {
    sitemap += `  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
