import { getFirestore } from '../automation/utils/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkImages() {
  console.log('🔍 Checking article images...\n');
  
  const db = getFirestore();
  
  try {
    const snapshot = await db
      .collection('posts')
      .where('status', '==', 'published')
      .limit(5)
      .get();
    
    console.log(`Checking ${snapshot.size} articles:\n`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log(`📰 ${data.title}`);
      console.log(`   Slug: ${data.slug}`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Image: ${data.featuredImage || 'MISSING'}`);
      console.log(`   URL: https://mershal.in/news/${data.slug}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkImages();
