import cron from 'node-cron';
import { config } from './config.js';
import { getTrendingTopics, getIPLTrendingTopics } from './utils/trending.js';
import { generateArticle, generateIPLArticle } from './utils/ai-generator.js';
import { savePost, checkDuplicatePost } from './utils/firebase.js';
import { triggerDeployment, waitForDeployment } from './utils/deployment.js';
import { submitUrlToGoogle } from './utils/indexing.js';

let articlesPublishedToday = 0;
let lastResetDate = new Date().toDateString();

function resetDailyCounter() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    articlesPublishedToday = 0;
    lastResetDate = today;
  }
}

async function publishArticle(topic, category) {
  try {
    console.log(`\n📝 Generating article: "${topic}"`);
    
    // Check for duplicates
    const isDuplicate = await checkDuplicatePost(topic);
    if (isDuplicate) {
      console.log('⚠️  Duplicate article detected, skipping...');
      return false;
    }
    
    // Generate article
    const article = await generateArticle(topic, category);
    
    // Add featured image (you can integrate with Unsplash API)
    article.featuredImage = `https://images.unsplash.com/photo-${Date.now()}?w=800`;
    
    // Save to Firestore
    const postId = await savePost(article);
    console.log(`✓ Article saved to Firestore: ${postId}`);
    
    // Trigger deployment
    await triggerDeployment();
    
    // Wait for deployment
    await waitForDeployment(60000); // 1 minute
    
    // Submit to Google Indexing
    const articleUrl = `${config.site.url}/news/${article.slug}`;
    await submitUrlToGoogle(articleUrl);
    
    articlesPublishedToday++;
    console.log(`✓ Article published successfully! (${articlesPublishedToday}/${config.content.articlesPerDay} today)`);
    
    return true;
  } catch (error) {
    console.error('Error publishing article:', error);
    return false;
  }
}

async function runAutomation() {
  resetDailyCounter();
  
  if (articlesPublishedToday >= config.content.articlesPerDay) {
    console.log(`Daily limit reached (${config.content.articlesPerDay} articles)`);
    return;
  }
  
  console.log('\n🤖 Running automation cycle...');
  console.log(`Articles published today: ${articlesPublishedToday}/${config.content.articlesPerDay}`);
  
  try {
    // Fetch trending topics
    const topics = await getTrendingTopics();
    
    if (topics.length === 0) {
      console.log('No trending topics found');
      return;
    }
    
    // Select a random topic
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    // Publish article
    await publishArticle(randomTopic.topic, randomTopic.category);
    
  } catch (error) {
    console.error('Automation cycle error:', error);
  }
}

async function runIPLAutomation() {
  if (!config.ipl.enabled) {
    return;
  }
  
  console.log('\n🏏 Running IPL automation...');
  
  try {
    // Get IPL trending topics
    const iplTopics = await getIPLTrendingTopics();
    
    // Generate IPL articles
    // This would integrate with cricket APIs to get match data
    
    console.log('IPL automation completed');
  } catch (error) {
    console.error('IPL automation error:', error);
  }
}

export function startScheduler() {
  console.log('🚀 Starting automation scheduler...');
  console.log(`Interval: Every ${config.content.schedulerInterval} minutes`);
  console.log(`Daily target: ${config.content.articlesPerDay} articles\n`);
  
  // Run every X minutes
  const cronExpression = `*/${config.content.schedulerInterval} * * * *`;
  
  cron.schedule(cronExpression, async () => {
    await runAutomation();
  });
  
  // Run IPL automation every hour during IPL season
  if (config.ipl.enabled) {
    cron.schedule('0 * * * *', async () => {
      await runIPLAutomation();
    });
  }
  
  // Reset counter at midnight
  cron.schedule('0 0 * * *', () => {
    articlesPublishedToday = 0;
    console.log('🔄 Daily counter reset');
  });
  
  console.log('✓ Scheduler started successfully');
  
  // Run immediately on start
  runAutomation();
}

// Manual trigger function
export async function publishManualArticle(topic, category) {
  return await publishArticle(topic, category);
}
