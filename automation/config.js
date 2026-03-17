import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to fix private key format
function fixPrivateKey(key) {
  if (!key) return key;
  // Handle literal \n strings
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }
  // Ensure proper PEM format
  if (!key.includes('-----BEGIN PRIVATE KEY-----') && !key.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }
  return key;
}

export const config = {
  // AI Configuration
  ai: {
    provider: 'openai', // 'gemini' or 'openai'
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini', // or 'gpt-4o' for better quality
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: fixPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  },

  // Deployment Configuration
  deployment: {
    provider: 'vercel', // 'vercel' or 'cloudflare'
    webhookUrl: process.env.DEPLOY_WEBHOOK_URL,
  },

  // Google Indexing API
  indexing: {
    enabled: true, // Set to true after setting up Google Indexing API
    serviceAccountEmail: process.env.GOOGLE_INDEXING_EMAIL,
    privateKey: fixPrivateKey(process.env.GOOGLE_INDEXING_PRIVATE_KEY),
  },

  // Content Generation Settings
  content: {
    minWordCount: 800,
    maxWordCount: 1200,
    articlesPerDay: 30,
    schedulerInterval: 30, // minutes
  },

  // Categories
  categories: [
    'india',
    'politics',
    'sports',
    'entertainment',
    'business',
    'technology',
  ],

  // IPL Configuration
  ipl: {
    enabled: true,
    season: 2026,
    teams: [
      { code: 'KKR', name: 'Kolkata Knight Riders', slug: 'kolkata-knight-riders' },
      { code: 'MI', name: 'Mumbai Indians', slug: 'mumbai-indians' },
      { code: 'RCB', name: 'Royal Challengers Bangalore', slug: 'royal-challengers-bangalore' },
      { code: 'CSK', name: 'Chennai Super Kings', slug: 'chennai-super-kings' },
      { code: 'DC', name: 'Delhi Capitals', slug: 'delhi-capitals' },
      { code: 'RR', name: 'Rajasthan Royals', slug: 'rajasthan-royals' },
      { code: 'PBKS', name: 'Punjab Kings', slug: 'punjab-kings' },
      { code: 'SRH', name: 'Sunrisers Hyderabad', slug: 'sunrisers-hyderabad' },
    ],
  },

  // Site Configuration
  site: {
    url: 'https://mershal.in',
    name: 'Mershal',
  },
};
