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
      let snapshot = await adminDb
        .collection('articles')
        .where('status', '==', 'published')
        .orderBy('publish_date', 'desc')
        .limit(20)
        .get();
        
      if (snapshot.empty) {
        snapshot = await adminDb
          .collection('posts')
          .where('status', '==', 'published')
          .orderBy('publishedAt', 'desc')
          .limit(20)
          .get();
      }
      
      articles = snapshot.docs.map(doc => ({
        slug: doc.data().slug || doc.id,
        title: doc.data().title || '',
        excerpt: doc.data().excerpt || '',
        publishDate: doc.data().publish_date?.toDate?.() || doc.data().publishedAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching articles for RSS feed:', error);
    }
  }

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Mershal — AI Tools &amp; SaaS Reviews</title>
  <link>${baseUrl}</link>
  <description>Expert reviews, comparisons, and guides on AI Tools, SaaS platforms, Productivity Software, and business automation.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

  articles.forEach(art => {
    rss += `  <item>
    <title>${escapeXml(art.title)}</title>
    <link>${baseUrl}/articles/${art.slug}</link>
    <guid>${baseUrl}/articles/${art.slug}</guid>
    <pubDate>${art.publishDate.toUTCString()}</pubDate>
    <description>${escapeXml(art.excerpt)}</description>
  </item>
`;
  });

  rss += `</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
