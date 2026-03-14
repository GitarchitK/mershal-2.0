#!/usr/bin/env node

import dotenv from 'dotenv';
import readline from 'readline';
import { generateArticle } from './utils/ai-generator.js';
import { savePost } from './utils/firebase.js';
import { triggerDeployment } from './utils/deployment.js';
import { submitUrlToGoogle } from './utils/indexing.js';
import { config } from './config.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🤖 Mershal Article Generator CLI\n');
  
  try {
    // Get topic
    const topic = await question('Enter article topic: ');
    if (!topic.trim()) {
      console.log('❌ Topic is required');
      process.exit(1);
    }
    
    // Get category
    console.log('\nAvailable categories:');
    config.categories.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat}`);
    });
    
    const categoryIndex = await question('\nSelect category (1-6): ');
    const category = config.categories[parseInt(categoryIndex) - 1];
    
    if (!category) {
      console.log('❌ Invalid category');
      process.exit(1);
    }
    
    // Get keywords
    const keywordsInput = await question('\nEnter keywords (comma-separated, optional): ');
    const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim()) : [];
    
    console.log('\n📝 Generating article...');
    
    // Generate article
    const article = await generateArticle(topic, category, keywords);
    
    console.log('\n✓ Article generated successfully!');
    console.log(`  Title: ${article.title}`);
    console.log(`  Word count: ${article.wordCount}`);
    console.log(`  Reading time: ${article.readingTime} min`);
    console.log(`  Slug: ${article.slug}`);
    
    // Confirm publication
    const confirm = await question('\nPublish this article? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Publication cancelled');
      process.exit(0);
    }
    
    // Add featured image
    article.featuredImage = `https://images.unsplash.com/photo-${Date.now()}?w=800`;
    
    // Save to Firestore
    console.log('\n💾 Saving to Firestore...');
    const postId = await savePost(article);
    console.log(`✓ Saved with ID: ${postId}`);
    
    // Trigger deployment
    const deploy = await question('\nTrigger deployment? (y/n): ');
    if (deploy.toLowerCase() === 'y') {
      console.log('🚀 Triggering deployment...');
      await triggerDeployment();
      console.log('✓ Deployment triggered');
    }
    
    // Submit to Google
    const index = await question('\nSubmit to Google Indexing API? (y/n): ');
    if (index.toLowerCase() === 'y') {
      const articleUrl = `${config.site.url}/news/${article.slug}`;
      console.log('🔍 Submitting to Google...');
      await submitUrlToGoogle(articleUrl);
      console.log('✓ Submitted to Google');
    }
    
    console.log('\n✅ All done!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
