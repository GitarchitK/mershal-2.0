import { getFirestore } from '../automation/utils/firebase.js';
import { submitUrlToGoogle } from '../automation/utils/indexing.js';
import { config } from '../automation/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function reindexAllArticles() {
  console.log('🔍 Re-indexing all published articles...\n');
  
  const db = getFirestore();
  
  try {
    // Fetch all published articles
    const snapshot = await db
      .collection('posts')
      .where('status', '==', 'published')
      .get();
    
    console.log(`Found ${snapshot.size} published articles\n`);
    
    let submitted = 0;
    let failed = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const articleUrl = `${config.site.url}/news/${data.slug}`;
      
      try {
        await submitUrlToGoogle(articleUrl);
        console.log(`✅ Submitted: ${data.title}`);
        console.log(`   URL: ${articleUrl}\n`);
        submitted++;
        
        // Rate limiting: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed: ${data.title}`);
        console.error(`   Error: ${error.message}\n`);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully submitted: ${submitted} articles`);
    console.log(`   ❌ Failed: ${failed} articles`);
    console.log('\n✨ Done! All articles have been resubmitted to Google Indexing API');
    console.log('Note: It may take 24-48 hours for URLs to appear in Google Search Console');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reindexAllArticles();