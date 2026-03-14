// Sample script to seed initial data to Firebase
// Run with: node scripts/seed-data.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./service-account.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleArticles = [
  {
    title: 'Breaking: Major Traffic Accident on Highway, Multiple Injuries Reported',
    excerpt: 'A serious accident occurred this morning on the busy highway where a reckless biker injured multiple people...',
    content: '<p>A serious accident occurred this morning on the busy highway where a reckless biker injured multiple people causing widespread concern in the community.</p><p>Local police arrived at the scene and sent the injured to the hospital while arresting the biker. Two of the injured are reported to be in critical condition.</p>',
    category: 'Kolkata',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    author: 'Staff Reporter',
    publishedAt: new Date(),
    views: 1250,
    featured: true
  },
  {
    title: 'New Government Takes Oath in Bangladesh Ceremony',
    excerpt: 'The new government was sworn in today at a ceremony in Dhaka attended by distinguished guests...',
    content: '<p>The new government of Bangladesh was sworn in today at a ceremony in the capital Dhaka. Distinguished guests from various sectors attended the event.</p>',
    category: 'Bangladesh',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    author: 'Dhaka Bureau',
    publishedAt: new Date(Date.now() - 3600000),
    views: 890,
    featured: false
  },
  {
    title: 'IPL 2026: Kolkata Knight Riders Secure Stunning Victory',
    excerpt: 'In today\'s IPL match, Kolkata Knight Riders showed an outstanding performance...',
    content: '<p>In today\'s IPL 2026 match, Kolkata Knight Riders defeated Mumbai Indians by 50 runs with an outstanding performance.</p>',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
    author: 'Sports Correspondent',
    publishedAt: new Date(Date.now() - 7200000),
    views: 2340,
    featured: false
  },
  {
    title: 'Technology: New Smartphone Coming to Market',
    excerpt: 'A new technology smartphone is coming soon to the Indian market...',
    content: '<p>A new technology smartphone is coming soon to the Indian market with many innovative features for users.</p>',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    author: 'Tech Desk',
    publishedAt: new Date(Date.now() - 10800000),
    views: 567,
    featured: false
  }
];

async function seedData() {
  try {
    console.log('Starting data seeding...');
    
    for (const article of sampleArticles) {
      const docRef = await db.collection('articles').add(article);
      console.log(`Added article: ${article.title} (ID: ${docRef.id})`);
    }
    
    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
