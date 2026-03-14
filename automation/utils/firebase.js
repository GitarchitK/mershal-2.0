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
  const docRef = await db.collection('posts').add({
    ...post,
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function checkDuplicatePost(title) {
  const db = getFirestore();
  const snapshot = await db
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
