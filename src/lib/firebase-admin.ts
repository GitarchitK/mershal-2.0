import admin from 'firebase-admin';

// Use process.env for Vercel compatibility
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || import.meta.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY;

// Fix private key format - handle both escaped and literal newlines
if (privateKey) {
  // If key has literal \n strings, convert to actual newlines
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  // If key doesn't have proper PEM format headers, add them
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }
}

// Check if Firebase Admin credentials are properly configured
const hasValidCredentials = projectId && clientEmail && privateKey;

if (!admin.apps.length && hasValidCredentials) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
} else if (!hasValidCredentials) {
  console.error('Firebase credentials missing:', {
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey
  });
}

// Export with null checks
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
