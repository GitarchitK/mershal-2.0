import fetch from 'node-fetch';
import { config } from '../config.js';

export async function triggerDeployment() {
  if (!config.deployment.webhookUrl) {
    console.warn('No deployment webhook configured');
    return false;
  }
  
  try {
    console.log('Triggering deployment...');
    
    const response = await fetch(config.deployment.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✓ Deployment triggered successfully');
      return true;
    } else {
      console.error('Deployment trigger failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error triggering deployment:', error);
    return false;
  }
}

export async function waitForDeployment(timeout = 300000) {
  // Wait for deployment to complete (5 minutes default)
  console.log('Waiting for deployment to complete...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✓ Deployment wait period completed');
      resolve(true);
    }, timeout);
  });
}
