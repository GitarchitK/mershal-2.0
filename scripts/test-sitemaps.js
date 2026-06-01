import { getFirestore } from '../automation/utils/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSitemapsQueries() {
  console.log('🔍 Running Firestore sitemap queries validation...\n');
  const db = getFirestore();

  // Test 1: Query for main sitemap
  let hasArticles = false;
  try {
    console.log('Testing Main Sitemap query (all published articles)...');
    let snapshot = await db.collection('articles')
      .where('status', '==', 'published')
      .get();
      
    if (!snapshot.empty) {
      hasArticles = true;
    } else {
      console.log('ℹ️ articles collection empty, testing legacy posts fallback...');
      snapshot = await db.collection('posts')
        .where('status', '==', 'published')
        .get();
    }
    console.log(`✅ Success! Main sitemap query returned ${snapshot.size} published documents.\n`);
  } catch (error) {
    console.error('❌ Main sitemap query failed:', error);
  }

  // Test 2: Query for Google News sitemap using in-memory date filtering
  try {
    console.log('Testing Google News Sitemap query (in-memory filtering)...');
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    let articlesList = [];
    if (hasArticles) {
      const snapshot = await db.collection('articles')
        .where('status', '==', 'published')
        .get();
      
      const allArticles = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          slug: d.slug || doc.id,
          title: d.title || '',
          publishedAt: d.publish_date?.toDate?.() || d.publishedAt?.toDate?.() || new Date(),
        };
      });
      articlesList = allArticles.filter(art => art.publishedAt >= twoDaysAgo);
    } else {
      console.log('ℹ️ Querying posts collection for fallback...');
      const snapshot = await db.collection('posts')
        .where('status', '==', 'published')
        .get();
      
      const allPosts = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          slug: d.slug || doc.id,
          title: d.title || '',
          publishedAt: d.publishedAt?.toDate?.() || d.publish_date?.toDate?.() || new Date(),
        };
      });
      articlesList = allPosts.filter(art => art.publishedAt >= twoDaysAgo);
    }

    console.log(`✅ Success! News sitemap query returned ${articlesList.length} recent published documents.`);
  } catch (error) {
    console.error('❌ News sitemap query failed:', error);
  }
}

testSitemapsQueries();
