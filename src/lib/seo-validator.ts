export interface SeoAudit {
  score: number;
  warnings: string[];
  recommendations: string[];
  headingStructure: { tag: string; text: string }[];
}

export function auditArticle(article: {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image?: string;
  featuredImage?: string;
  meta_title?: string;
  meta_description?: string;
  faq_items?: any[];
}): SeoAudit {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const title = article.title || '';
  const excerpt = article.excerpt || '';
  const content = article.content || '';
  const featuredImage = article.featured_image || article.featuredImage || '';
  const metaTitle = article.meta_title || '';
  const metaDescription = article.meta_description || '';
  const faqItems = article.faq_items || [];

  // 1. Meta Title checks
  if (!metaTitle) {
    score -= 15;
    warnings.push('Missing SEO Meta Title');
    recommendations.push('Add a Meta Title using your article settings to improve CTR in search engine results.');
  } else if (metaTitle.length < 30 || metaTitle.length > 65) {
    score -= 5;
    warnings.push(`Sub-optimal SEO Title length (${metaTitle.length} chars)`);
    recommendations.push('Format your SEO Meta Title between 40 and 60 characters for best display on mobile and desktop SERPs.');
  }

  // 2. Meta Description checks
  if (!metaDescription) {
    score -= 20;
    warnings.push('Missing SEO Meta Description');
    recommendations.push('Write an SEO Meta Description targeting your main long-tail search terms.');
  } else if (metaDescription.length < 100 || metaDescription.length > 160) {
    score -= 5;
    warnings.push(`Sub-optimal SEO Description length (${metaDescription.length} chars)`);
    recommendations.push('Write between 120 and 150 characters for your SEO Meta Description to prevent truncation.');
  }

  // 3. Featured Image checks
  if (!featuredImage) {
    score -= 10;
    warnings.push('Missing Featured Image');
    recommendations.push('Attach a featured banner image. This is required for rich media Search Schema objects.');
  }

  // 4. Word count checks (Thin content detection)
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  if (wordCount === 0) {
    score -= 30;
    warnings.push('Empty article body content');
    recommendations.push('Add comprehensive HTML content to your article layout.');
  } else if (wordCount < 600) {
    score -= 15;
    warnings.push(`Thin content warning (${wordCount} words)`);
    recommendations.push('Expand your article length to 1200+ words to rank competitively for USA terms.');
  } else if (wordCount < 1200) {
    score -= 5;
    warnings.push(`Short guide length (${wordCount} words)`);
    recommendations.push('Expand sections or add side-by-side comparison tables to push the article to 1200+ words.');
  }

  // 5. Heading hierarchy & single H1 check
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length > 0) {
    score -= 10;
    warnings.push(`Multiple H1 tags in body (${h1Matches.length} found)`);
    recommendations.push('Remove H1 tags from your article body. The page title already acts as the primary H1.');
  }

  // Check heading hierarchy
  const headings = [...content.matchAll(/<(h[2-4])[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m => ({
    tag: m[1].toLowerCase(),
    text: m[2].replace(/<[^>]*>/g, '').trim()
  }));

  let hierarchyOk = true;
  let hasH2 = false;
  for (const h of headings) {
    if (h.tag === 'h2') hasH2 = true;
    if (h.tag === 'h3' && !hasH2) {
      hierarchyOk = false;
    }
  }

  if (!hierarchyOk) {
    score -= 10;
    warnings.push('Broken heading hierarchy (H3 used before H2)');
    recommendations.push('Ensure H3 headings are only used within H2 sections. Avoid starting article content sections with an H3.');
  }

  // 6. Image alt text check
  const imgMatches = [...content.matchAll(/<img[^>]+>/gi)];
  let missingAlt = false;
  for (const img of imgMatches) {
    const imgHtml = img[0];
    if (!imgHtml.includes('alt=') || /alt=(["'])\1/i.test(imgHtml)) {
      missingAlt = true;
      break;
    }
  }

  if (imgMatches.length > 0 && missingAlt) {
    score -= 10;
    warnings.push('Images in body are missing alt text attributes');
    recommendations.push('Add descriptive alt attributes to every img tag in your body content to rank in Google Images.');
  }

  // 7. Schema / FAQ checks
  if (faqItems.length === 0) {
    const hasDetectedFaqs = /<h4>Q:\s*(.*?)<\/h4>/i.test(content) || /<h4[^>]*>(?:FAQ|Frequently Asked Questions)<\/h4>/i.test(content);
    if (!hasDetectedFaqs) {
      score -= 5;
      warnings.push('Missing FAQ accordion and schema data');
      recommendations.push('Append 3-4 FAQ items to target Google Featured Snippets and People Also Ask modules.');
    }
  }

  return {
    score: Math.max(0, score),
    warnings,
    recommendations,
    headingStructure: headings
  };
}
