import { submitUrlToGoogle, getIndexingStatus } from './utils/indexing.js';
import { config } from './config.js';

async function testIndexing() {
  console.log('🔍 Testing Google Indexing API Configuration\n');
  
  // Check configuration
  console.log('Configuration Check:');
  console.log('- Indexing enabled:', config.indexing.enabled);
  console.log('- Service account email:', config.indexing.serviceAccountEmail ? '✓ Set' : '✗ Missing');
  console.log('- Private key:', config.indexing.privateKey ? '✓ Set' : '✗ Missing');
  console.log('- Site URL:', config.site.url);
  console.log();
  
  if (!config.indexing.enabled) {
    console.log('❌ Indexing is disabled in config.js');
    return;
  }
  
  if (!config.indexing.serviceAccountEmail || !config.indexing.privateKey) {
    console.log('❌ Missing Google Indexing API credentials');
    console.log('\nPlease set these environment variables:');
    console.log('- GOOGLE_INDEXING_EMAIL');
    console.log('- GOOGLE_INDEXING_PRIVATE_KEY');
    return;
  }
  
  // Test URL submission
  const testUrl = `${config.site.url}/news/test-article`;
  console.log('Testing URL submission...');
  console.log('Test URL:', testUrl);
  console.log();
  
  try {
    const result = await submitUrlToGoogle(testUrl);
    console.log('✅ SUCCESS! URL submitted to Google Indexing API');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log();
    console.log('✓ Your Google Indexing API is working correctly!');
    console.log('✓ URLs will be submitted automatically when you publish articles');
    console.log();
    console.log('Note: It may take 24-48 hours for URLs to appear in Google Search Console');
  } catch (error) {
    console.log('❌ ERROR submitting URL to Google');
    console.log('Error message:', error.message);
    console.log();
    
    if (error.message.includes('403')) {
      console.log('This is a permission error. Please check:');
      console.log('1. Service account email is added as Owner in Google Search Console');
      console.log('2. Web Search Indexing API is enabled in Google Cloud Console');
      console.log('3. Service account has correct permissions');
    } else if (error.message.includes('401')) {
      console.log('This is an authentication error. Please check:');
      console.log('1. GOOGLE_INDEXING_EMAIL is correct');
      console.log('2. GOOGLE_INDEXING_PRIVATE_KEY is correct and properly formatted');
    } else {
      console.log('Please check your Google Indexing API setup');
    }
  }
}

testIndexing().catch(console.error);
