import { google } from 'googleapis';
import { config } from '../config.js';

let indexingClient = null;

function getIndexingClient() {
  if (!indexingClient && config.indexing.enabled) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.indexing.serviceAccountEmail,
        private_key: config.indexing.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    
    indexingClient = google.indexing({ version: 'v3', auth });
  }
  return indexingClient;
}

export async function submitUrlToGoogle(url) {
  if (!config.indexing.enabled) {
    console.log('Indexing disabled, skipping:', url);
    return;
  }
  
  try {
    const client = getIndexingClient();
    
    const response = await client.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    
    console.log('✓ URL submitted to Google:', url);
    return response.data;
  } catch (error) {
    console.error('Error submitting URL to Google:', error.message);
    throw error;
  }
}

export async function submitBatchUrls(urls) {
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await submitUrlToGoogle(url);
      results.push({ url, success: true, result });
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ url, success: false, error: error.message });
    }
  }
  
  return results;
}

export async function getIndexingStatus(url) {
  if (!config.indexing.enabled) {
    return null;
  }
  
  try {
    const client = getIndexingClient();
    
    const response = await client.urlNotifications.getMetadata({
      url: url,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting indexing status:', error.message);
    return null;
  }
}
