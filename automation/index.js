#!/usr/bin/env node

import dotenv from 'dotenv';
import { startScheduler } from './scheduler.js';
import { initializeFirebase } from './utils/firebase.js';

// Load environment variables
dotenv.config();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖  MERSHAL AUTOMATED NEWS PLATFORM                    ║
║                                                           ║
║   Automated SEO News Generation & Publishing System      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Validate environment variables
function validateEnvironment() {
  const required = [
    'GEMINI_API_KEY',
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✓ Environment variables validated\n');
}

async function main() {
  try {
    // Validate environment
    validateEnvironment();
    
    // Initialize Firebase
    console.log('Initializing Firebase...');
    initializeFirebase();
    console.log('✓ Firebase initialized\n');
    
    // Start scheduler
    startScheduler();
    
    console.log('\n✓ System running. Press Ctrl+C to stop.\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the application
main();
