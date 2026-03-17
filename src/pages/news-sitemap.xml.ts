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
  const siteName = 'Mershal';
  
  let posts: any[] = [];
  
  // Fetch posts from last 2 days (Google News requirement)
  if (adminDb) {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const snapshot = await adminDb
        .collection('posts')
        .where('status', '==', 'published')
        .where('publishedAt', '>=', twoDaysAgo)
        .orderBy('publishedAt', 'desc')
        .get();
      
      posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          slug: data.slug,
          title: data.title,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
          language: data.language || 'en',
          country: data.country || 'US',
          category: data.category,
        };
      });
    } catch (error) {
      console.error('Error fetching posts for news sitemap:', error);
    }
  }
  
  // Generate news sitemap XML
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  posts.forEach(post => {
    newsSitemap += `  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>${post.language}</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt.toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      <news:genres>PressRelease, Blog</news:genres>
      <news:keywords>${post.category}</news:keywords>
    </news:news>
    <lastmod>${post.publishedAt.toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>1.0</priority>
  </url>
`;
  });
  
  newsSitemap += `</urlset>`;
  
  return new Response(newsSitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
    },
  });
};
