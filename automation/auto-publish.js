#!/usr/bin/env node

import dotenv from 'dotenv';
import { generateArticle } from './utils/ai-generator.js';
import { savePost } from './utils/firebase.js';
import { triggerDeployment } from './utils/deployment.js';
import { submitUrlToGoogle } from './utils/indexing.js';
import { config } from './config.js';
import { allTopics, getRandomTopics } from './topics.js';
import { getTrendingTopics } from './utils/trending.js';

dotenv.config();

async function publishArticle(useTrending = false) {
  try {
    let selectedTopic;
    
    if (useTrending && process.env.NEWS_API_KEY) {
      // Fetch trending topics from top news sources
      console.log('📰 Fetching trending topics from international news sources...\n');
      const trendingTopics = await getTrendingTopics();
      
      if (trendingTopics.length > 0) {
        // Pick a random trending topic
        selectedTopic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];
        console.log(`✓ Selected trending topic from ${selectedTopic.source}`);
      } else {
        console.log('⚠️  No trending topics found, using custom topics');
        selectedTopic = getRandomTopics(1)[0];
      }
    } else {
      // Use custom topics from topics.js
      selectedTopic = getRandomTopics(1)[0];
    }
    
    console.log(`\n📝 Generating article about: ${selectedTopic.topic}`);
    console.log(`   Category: ${selectedTopic.category}`);
    if (selectedTopic.source) {
      console.log(`   Source: ${selectedTopic.source}`);
    }
    console.log();
    
    // Generate article
    const article = await generateArticle(
      selectedTopic.topic,
      selectedTopic.category,
      []
    );
    
    console.log('✓ Article generated successfully!');
    console.log(`  Title: ${article.title}`);
    console.log(`  Words: ${article.wordCount}`);
    console.log(`  Slug: ${article.slug}\n`);
    
    // Save to Firestore
    console.log('💾 Saving to Firestore...');
    const docId = await savePost(article);
    console.log(`✓ Saved with ID: ${docId}\n`);
    
    // Trigger deployment
    console.log('🚀 Triggering deployment...');
    await triggerDeployment();
    console.log('✓ Deployment triggered\n');
    
    // Submit to Google
    const articleUrl = `${config.site.url}/news/${article.slug}`;
    console.log('🔍 Submitting to Google...');
    await submitUrlToGoogle(articleUrl);
    console.log(`✓ Submitted: ${articleUrl}\n`);
    
    console.log('✅ Article published successfully!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  }
}

async function main() {
  const count = parseInt(process.argv[2]) || 1;
  const useTrending = process.argv.includes('--trending') || process.env.USE_TRENDING === 'true';
  
  console.log(`\n🤖 Auto-Publishing ${count} article(s)...`);
  if (useTrending) {
    console.log('📰 Using trending topics from top news sources\n');
  } else {
    console.log('📋 Using custom topics\n');
  }
  
  let published = 0;
  
  for (let i = 0; i < count; i++) {
    console.log(`\n--- Article ${i + 1} of ${count} ---`);
    const success = await publishArticle(useTrending);
    if (success) published++;
    
    // Wait 10 seconds between articles
    if (i < count - 1) {
      console.log('⏳ Waiting 10 seconds before next article...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log(`\n📊 Summary: Published ${published} of ${count} articles`);
  process.exit(published === count ? 0 : 1);
}

main();
