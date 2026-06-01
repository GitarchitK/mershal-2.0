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
  
  let articles: any[] = [];
  
  // Fetch posts from last 2 days (Google News requirement)
  if (adminDb) {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      // Perform in-memory date filtering to avoid Firestore composite index requirement
      let snapshot = await adminDb
        .collection('articles')
        .where('status', '==', 'published')
        .get();
        
      let allArticles: any[] = [];
      if (!snapshot.empty) {
        allArticles = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            slug: d.slug || doc.id,
            title: d.title || '',
            publishedAt: d.publish_date?.toDate?.() || d.publishedAt?.toDate?.() || new Date(),
          };
        });
      } else {
        // Fallback to legacy posts
        snapshot = await adminDb
          .collection('posts')
          .where('status', '==', 'published')
          .get();
          
        allArticles = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            slug: d.slug || doc.id,
            title: d.title || '',
            publishedAt: d.publishedAt?.toDate?.() || d.publish_date?.toDate?.() || new Date(),
          };
        });
      }
      
      articles = allArticles
        .filter(art => art.publishedAt >= twoDaysAgo)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    } catch (error) {
      console.error('Error fetching articles for news sitemap:', error);
    }
  }
  
  // Generate news sitemap XML
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  articles.forEach(art => {
    newsSitemap += `  <url>
    <loc>${baseUrl}/articles/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${art.publishedAt.toISOString()}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>
`;
  });
  
  newsSitemap += `</urlset>`;
  
  return new Response(newsSitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
