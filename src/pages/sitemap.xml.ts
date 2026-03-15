export const prerender = false;

import type { APIRoute } from 'astro';
import { adminDb } from '../lib/firebase-admin';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://mershal.in';
  
  let posts: any[] = [];
  
  // Fetch all published posts
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
      }));
    } catch (error) {
      console.error('Error fetching posts for sitemap:', error);
    }
  }
  
  // Categories
  const categories = [
    'sports',
    'technology',
    'business',
    'politics',
    'entertainment',
    'world',
  ];
  
  // Generate sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/ipl</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  // Add category pages
  categories.forEach(category => {
    sitemap += `  <url>
    <loc>${baseUrl}/category/${category}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
`;
  });
  
  // Add all posts
  posts.forEach(post => {
    sitemap += `  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });
  
  sitemap += `</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
