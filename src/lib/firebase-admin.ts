import admin from 'firebase-admin';

// Check if Firebase Admin credentials are properly configured
const hasValidCredentials = 
  import.meta.env.FIREBASE_ADMIN_PROJECT_ID &&
  import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!admin.apps.length && hasValidCredentials) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: import.meta.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
  }
}

// Export with null checks
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
