#!/usr/bin/env node

import dotenv from 'dotenv';
import { generateArticle } from './utils/ai-generator.js';
import { savePost, checkDuplicatePost } from './utils/firebase.js';
import { triggerDeployment } from './utils/deployment.js';
import { submitUrlToGoogle } from './utils/indexing.js';
import { getTrendingTopics } from './utils/trending.js';
import { config } from './config.js';

dotenv.config();

async function publishArticle(topic, category, trendContext = {}) {
  try {
    console.log(`\n📝 Topic: "${topic}" [${category}]`);

    // Skip if we already have an article on this topic
    const isDuplicate = await checkDuplicatePost(topic);
    if (isDuplicate) {
      console.log(`⏭️  Skipping duplicate: "${topic}"`);
      return false;
    }

    // Generate article with Editor in Chief persona
    console.log('🤖 Generating article...');
    const article = await generateArticle(topic, category, trendContext);

    console.log(`✓ Generated: "${article.title}" (${article.wordCount} words)`);

    // Save to Firestore articles collection
    const docId = await savePost(article);
    console.log(`💾 Saved: ${docId}`);

    // Submit to Google Indexing API
    const url = `${config.site.url}/articles/${article.slug}`;
    await submitUrlToGoogle(url).catch(e => console.warn('Indexing skipped:', e.message));
    console.log(`🔍 Indexed: ${url}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed for "${topic}":`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isProgrammaticMode = args.includes('--programmatic') || args.includes('-p');
  
  // Extract first positional argument that is not a flag
  const countArg = args.find(arg => !arg.startsWith('-'));
  const count = countArg ? parseInt(countArg) : 1;

  console.log(`\n🌐 Mershal Auto-Publisher — Target: ${count} articles\n`);

  let topics = [];

  if (isProgrammaticMode) {
    console.log('📚 Running in Programmatic SEO Mode (using local topics pool)...');
    const { getRandomTopics } = await import('./topics.js');
    topics = getRandomTopics(count * 3); // grab a pool to select from
  } else {
    console.log('📡 Fetching trending topics from Google Trends...');
    topics = await getTrendingTopics('US');

    if (topics.length === 0) {
      console.warn('⚠️  No trending topics found. Falling back to local programmatic topics pool...');
      const { getRandomTopics } = await import('./topics.js');
      topics = getRandomTopics(count * 3);
    }
  }

  if (topics.length === 0) {
    console.warn('⚠️  No topics available. Exiting.');
    process.exit(1);
  }

  console.log(`✓ ${topics.length} topics available for selection\n`);

  // Shuffle to get variety
  topics = topics.sort(() => Math.random() - 0.5);

  let published = 0;
  let attempted = 0;

  for (const topic of topics) {
    if (published >= count) break;
    attempted++;

    const success = await publishArticle(
      topic.topic,
      topic.category,
      topic.realFacts ? { relatedHeadlines: topic.relatedHeadlines, traffic: topic.traffic, realFacts: topic.realFacts } : {}
    );

    if (success) published++;

    // Wait 15 seconds between articles to avoid API rate limits
    if (published < count && success) {
      console.log('⏳ Waiting 15s before next generation...');
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  // Trigger Vercel rebuild to regenerate static pages
  if (published > 0) {
    console.log('\n🚀 Triggering deployment...');
    await triggerDeployment().catch(e => console.warn('Deploy skipped:', e.message));
  }

  console.log(`\n✅ Done: ${published}/${count} articles published (${attempted} topics tried)`);
  process.exit(published > 0 ? 0 : 1);
}

main();
