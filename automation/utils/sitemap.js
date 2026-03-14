import { getFirestore } from './firebase.js';
import { config } from '../config.js';
import fs from 'fs/promises';
import path from 'path';

export async function generateSitemap() {
  const db = getFirestore();
  const baseUrl = config.site.url;
  
  // Fetch all published posts
  const snapshot = await db
    .collection('posts')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();
  
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  // Generate sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/ipl</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  // Add category pages
  config.categories.forEach(category => {
    sitemap += `  <url>
    <loc>${baseUrl}/category/${category}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });
  
  // Add all posts
  posts.forEach(post => {
    const lastmod = post.updatedAt?.toDate?.() || new Date();
    sitemap += `  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <lastmod>${lastmod.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });
  
  sitemap += `</urlset>`;
  
  return sitemap;
}

export async function generateNewsSitemap() {
  const db = getFirestore();
  const baseUrl = config.site.url;
  
  // Fetch posts from last 2 days (Google News requirement)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const snapshot = await db
    .collection('posts')
    .where('status', '==', 'published')
    .where('publishedAt', '>=', twoDaysAgo)
    .orderBy('publishedAt', 'desc')
    .get();
  
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  posts.forEach(post => {
    const pubDate = post.publishedAt?.toDate?.() || new Date();
    newsSitemap += `  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${config.site.name}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>
`;
  });
  
  newsSitemap += `</urlset>`;
  
  return newsSitemap;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function saveSitemaps(outputDir = './public') {
  try {
    const sitemap = await generateSitemap();
    const newsSitemap = await generateNewsSitemap();
    
    await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap);
    await fs.writeFile(path.join(outputDir, 'news-sitemap.xml'), newsSitemap);
    
    console.log('✓ Sitemaps generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    return false;
  }
}
