import admin from 'firebase-admin';
import { config } from '../config.js';

let db = null;

export function initializeFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  }
  db = admin.firestore();
  return db;
}

export function getFirestore() {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}

export async function savePost(post) {
  const db = getFirestore();
  const articleDoc = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content || '',
    category: post.category || 'AI Tools',
    tags: post.tags || [],
    featured_image: post.featuredImage || post.featured_image || '',
    featuredImage: post.featuredImage || post.featured_image || '', // fallback
    author: post.author || 'Mershal Editorial Team',
    status: post.status || 'published',
    meta_title: post.seoTitle || post.meta_title || post.title,
    meta_description: post.seoDescription || post.meta_description || post.excerpt || '',
    wordCount: post.wordCount || 0,
    readingTime: post.readingTime || 5,
    publish_date: admin.firestore.FieldValue.serverTimestamp(),
    updated_date: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(), // fallback
    updatedAt: admin.firestore.FieldValue.serverTimestamp(), // fallback
    faq_items: post.faqItems || post.faq_items || [],
    schema_data: post.schema_data || { article_type: 'BlogPosting' },
  };

  const docRef = await db.collection('articles').add(articleDoc);
  return docRef.id;
}

export async function checkDuplicatePost(title) {
  const db = getFirestore();
  let snapshot = await db
    .collection('articles')
    .where('title', '==', title)
    .limit(1)
    .get();
  
  if (!snapshot.empty) return true;

  snapshot = await db
    .collection('posts')
    .where('title', '==', title)
    .limit(1)
    .get();

  return !snapshot.empty;
}


export async function getRecentPosts(limit = 10) {
  const db = getFirestore();
  const snapshot = await db
    .collection('posts')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getPostsByCategory(category, limit = 20) {
  const db = getFirestore();
  const snapshot = await db
    .collection('posts')
    .where('category', '==', category)
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
