import { getFirestore } from '../automation/utils/firebase.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const db = getFirestore();

async function migratePostsToArticles() {
  console.log('🚀 Starting Firestore migration: "posts" -> "articles"...\n');

  try {
    // 1. Fetch all documents from the legacy 'posts' collection
    const postsSnapshot = await db.collection('posts').get();
    console.log(`Found ${postsSnapshot.size} legacy posts in the "posts" collection.`);

    if (postsSnapshot.empty) {
      console.log('ℹ️ No legacy posts to migrate. Exiting.');
      process.exit(0);
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of postsSnapshot.docs) {
      const data = doc.data();
      const slug = data.slug || doc.id;
      const docId = doc.id;

      try {
        // 2. Check if a document with this slug already exists in 'articles'
        const existingArticles = await db.collection('articles')
          .where('slug', '==', slug)
          .limit(1)
          .get();

        if (!existingArticles.empty) {
          console.log(`⚠️ Skipping "${data.title || docId}": already exists in "articles" collection.`);
          skipped++;
          continue;
        }

        // 3. Map legacy post fields to the new article schema
        // Preserving original creation/update timestamps if they exist, falling back to ServerTimestamp
        const publishDate = data.publishedAt || data.publish_date || admin.firestore.FieldValue.serverTimestamp();
        const updatedDate = data.updatedAt || data.updated_date || publishDate;

        const articleDoc = {
          title: data.title || '',
          slug: slug,
          excerpt: data.excerpt || '',
          content: data.content || '',
          category: data.category || 'AI Tools',
          tags: data.tags || [],
          // Map featured image variants (both formats)
          featured_image: data.featuredImage || data.featured_image || data.imageUrl || '',
          featuredImage: data.featuredImage || data.featured_image || data.imageUrl || '',
          author: data.author || 'Mershal Editorial Team',
          status: data.status || 'published',
          meta_title: data.meta_title || data.seoTitle || data.title || '',
          meta_description: data.meta_description || data.seoDescription || data.excerpt || '',
          wordCount: data.wordCount || data.word_count || 0,
          readingTime: data.readingTime || data.reading_time || 5,
          publish_date: publishDate,
          updated_date: updatedDate,
          publishedAt: publishDate, // fallback/compatibility
          updatedAt: updatedDate,    // fallback/compatibility
          faq_items: data.faq_items || data.faqItems || [],
          schema_data: data.schema_data || { article_type: 'BlogPosting' },
        };

        // 4. Save to the 'articles' collection using the same document ID to preserve links
        await db.collection('articles').doc(docId).set(articleDoc);
        console.log(`✅ Migrated: "${data.title}" (ID: ${docId})`);
        migrated++;

      } catch (postError) {
        console.error(`❌ Error migrating post "${data.title || docId}":`, postError.message);
        errors++;
      }
    }

    console.log('\n📊 Migration complete!');
    console.log(`──────────────────────────────────`);
    console.log(`   Migrated successfully : ${migrated}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Failed with errors    : ${errors}`);
    console.log(`──────────────────────────────────\n`);

    process.exit(errors === 0 ? 0 : 1);

  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

migratePostsToArticles();
