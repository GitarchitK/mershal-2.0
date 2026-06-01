import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);

// Debug validation to help identify missing variables in client-side bundling
if (typeof window !== 'undefined') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => 'PUBLIC_FIREBASE_' + key.replace(/([A-Z])/g, '_$1').toUpperCase());
  if (missingKeys.length > 0) {
    console.error('❌ Firebase Client Configuration Error: Missing environment variables in client bundle:', missingKeys);
    console.error('If running locally, restart your dev server. If on Vercel, add these to your Vercel Project Settings and redeploy.');
  }
}

export const db = getFirestore(app);
export const storage = getStorage(app);
