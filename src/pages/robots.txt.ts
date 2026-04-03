export const prerender = true;

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://mershal.in/sitemap.xml
Sitemap: https://mershal.in/news-sitemap.xml

# Block admin and API routes from indexing
Disallow: /admin/
Disallow: /api/

# Allow Google AdSense crawlers
User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

# Allow Google Image bot
User-agent: Googlebot-Image
Allow: /
`;

  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
