import { getFirestore } from '../automation/utils/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugCategories() {
  console.log('🔍 Debugging category issues...\n');
  
  const db = getFirestore();
  
  try {
    // Fetch all published articles
    const snapshot = await db
      .collection('posts')
      .where('status', '==', 'published')
      .get();
    
    console.log(`Found ${snapshot.size} published articles\n`);
    
    // Group articles by category
    const categoryCount = {};
    const categoryExamples = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category;
      
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        if (!categoryExamples[category]) {
          categoryExamples[category] = data.title;
        }
      }
    });
    
    console.log('📊 Articles by Category:');
    console.log('========================');
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`${category}: ${count} articles`);
      console.log(`  Example: ${categoryExamples[category]}`);
      console.log('');
    });
    
    console.log('🔧 Valid categories in code:', ['india', 'politics', 'sports', 'entertainment', 'business', 'technology', 'ipl']);
    
    // Check for case mismatches
    const validCategories = ['india', 'politics', 'sports', 'entertainment', 'business', 'technology', 'ipl'];
    const dbCategories = Object.keys(categoryCount);
    
    console.log('\n⚠️  Potential Issues:');
    console.log('=====================');
    
    dbCategories.forEach(dbCat => {
      if (!validCategories.includes(dbCat.toLowerCase())) {
        console.log(`❌ Category "${dbCat}" not in valid list`);
      }
    });
    
    validCategories.forEach(validCat => {
      const exactMatch = dbCategories.find(dbCat => dbCat === validCat);
      const caseInsensitiveMatch = dbCategories.find(dbCat => dbCat.toLowerCase() === validCat.toLowerCase());
      
      if (!exactMatch && caseInsensitiveMatch) {
        console.log(`⚠️  Case mismatch: "${validCat}" vs "${caseInsensitiveMatch}"`);
      } else if (!exactMatch && !caseInsensitiveMatch) {
        console.log(`❌ No articles found for category: "${validCat}"`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugCategories();