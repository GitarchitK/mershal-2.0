#!/usr/bin/env node

import dotenv from 'dotenv';
import { generateArticle } from './utils/ai-generator.js';
import { savePost, getFirestore } from './utils/firebase.js';
import { triggerDeployment } from './utils/deployment.js';
import { submitUrlToGoogle } from './utils/indexing.js';
import { config } from './config.js';
import { allTopics, getRandomTopics } from './topics.js';

dotenv.config();

async function getNextTopic() {
  const db = getFirestore();
  
  // Try to get topic from Firestore first
  try {
    const snapshot = await db.collection('topicQueue')
      .orderBy('createdAt', 'asc')
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const topicData = doc.data();
      const topicId = doc.id;
      
      // Delete from queue after getting
      await doc.ref.delete();
      
      console.log(`📱 Mobile app topic: ${topicData.topic}`);
      return { topic: topicData.topic, category: topicData.category };
    }
  } catch (error) {
    console.log('No topics in Firestore, using local topics...');
  }
  
  // Fall back to local topics
  return getRandomTopics(1)[0];
}

async function publishArticle() {
  try {
    // Get next topic (from mobile app or local)
    const randomTopic = await getNextTopic();
    
    console.log(`\n📝 Generating article about: ${randomTopic.topic}`);
    console.log(`   Category: ${randomTopic.category}\n`);
    
    // Generate article
    const article = await generateArticle(
      randomTopic.topic,
      randomTopic.category,
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
  
  console.log(`\n🤖 Auto-Publishing ${count} article(s)...\n`);
  
  let published = 0;
  
  for (let i = 0; i < count; i++) {
    console.log(`\n--- Article ${i + 1} of ${count} ---`);
    const success = await publishArticle();
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
