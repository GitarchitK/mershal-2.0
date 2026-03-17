import { getFirestore } from '../automation/utils/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSimpleQuery() {
  console.log('🔍 Testing simple category query for "world"...\n');
  
  const db = getFirestore();
  
  try {
    // Test simple query without orderBy
    console.log('Testing simple query: category == "world"');
    const snapshot = await db.collection('posts')
      .where('category', '==', 'world')
      .limit(10)
      .get();
    
    console.log(`Found ${snapshot.size} articles with category == "world"`);
    
    if (snapshot.size > 0) {
      console.log('\n📄 Sample articles:');
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.title}`);
        console.log(`   Category: "${data.category}"`);
        console.log(`   Status: "${data.status}"`);
        console.log(`   Has slug: ${!!data.slug}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSimpleQuery();