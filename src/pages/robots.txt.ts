export const prerender = true;

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://mershal.in/sitemap.xml
Sitemap: https://mershal.in/news-sitemap.xml

# Disallow admin/private areas (if any)
Disallow: /api/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
