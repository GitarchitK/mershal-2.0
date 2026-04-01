#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import { initializeFirebase, getFirestore } from '../automation/utils/firebase.js';
import { config } from '../automation/config.js';

console.log('🚀 Setting up Mershal Automation Platform\n');

async function setupFirestore() {
  console.log('📦 Initializing Firestore...');
  
  try {
    const db = initializeFirebase();
    
    // Create indexes
    console.log('Creating Firestore indexes...');
    console.log('Note: You may need to create these indexes manually in Firebase Console:');
    console.log('  1. Collection: posts');
    console.log('     Fields: category (Ascending), publishedAt (Descending)');
    console.log('  2. Collection: posts');
    console.log('     Fields: status (Ascending), publishedAt (Descending)');
    console.log('  3. Collection: posts');
    console.log('     Fields: slug (Ascending), status (Ascending)');
    
    // Create sample categories document
    await db.collection('config').doc('categories').set({
      categories: config.categories,
      updatedAt: new Date(),
    });
    
    console.log('✓ Firestore setup complete\n');
    return true;
  } catch (error) {
    console.error('❌ Firestore setup failed:', error.message);
    return false;
  }
}

async function setupIPLData() {
  console.log('🏏 Setting up IPL data...');
  
  try {
    const db = getFirestore();
    
    // Add IPL teams
    for (const team of config.ipl.teams) {
      await db.collection('ipl_teams').doc(team.code).set({
        ...team,
        season: config.ipl.season,
        createdAt: new Date(),
      });
    }
    
    console.log(`✓ Added ${config.ipl.teams.length} IPL teams\n`);
    return true;
  } catch (error) {
    console.error('❌ IPL setup failed:', error.message);
    return false;
  }
}

async function testAIConnection() {
  console.log('🤖 Testing AI connection...');
  
  try {
    const { generateArticle } = await import('../automation/utils/ai-generator.js');
    
    console.log('Generating test article...');
    const article = await generateArticle(
      'Test Article: Technology News',
      'technology'
    );
    
    console.log('✓ AI connection successful');
    console.log(`  Generated: "${article.title}"`);
    console.log(`  Word count: ${article.wordCount}`);
    console.log(`  Reading time: ${article.readingTime} min\n`);
    
    return true;
  } catch (error) {
    console.error('❌ AI connection failed:', error.message);
    return false;
  }
}

async function testIndexingAPI() {
  console.log('🔍 Testing Google Indexing API...');
  
  if (!config.indexing.enabled) {
    console.log('⚠️  Indexing API disabled in config\n');
    return true;
  }
  
  try {
    const { getIndexingStatus } = await import('../automation/utils/indexing.js');
    
    console.log('✓ Indexing API credentials valid\n');
    return true;
  } catch (error) {
    console.error('❌ Indexing API test failed:', error.message);
    console.log('   Make sure you have:');
    console.log('   1. Enabled Indexing API in Google Cloud Console');
    console.log('   2. Created service account with Indexing API permissions');
    console.log('   3. Added service account as owner in Search Console\n');
    return false;
  }
}

async function main() {
  console.log('Starting setup process...\n');
  
  const results = {
    firestore: await setupFirestore(),
    ipl: await setupIPLData(),
    ai: await testAIConnection(),
    indexing: await testIndexingAPI(),
  };
  
  console.log('\n📊 Setup Summary:');
  console.log('─────────────────────────────────────');
  console.log(`Firestore:     ${results.firestore ? '✓' : '✗'}`);
  console.log(`IPL Data:      ${results.ipl ? '✓' : '✗'}`);
  console.log(`AI Connection: ${results.ai ? '✓' : '✗'}`);
  console.log(`Indexing API:  ${results.indexing ? '✓' : '✗'}`);
  console.log('─────────────────────────────────────\n');
  
  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('✅ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('  2. Start automation: npm run automation');
    console.log('  3. Deploy site: npm run build && deploy to Vercel/Cloudflare\n');
  } else {
    console.log('⚠️  Setup completed with warnings');
    console.log('Please fix the issues above before running automation\n');
  }
  
  process.exit(allSuccess ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
