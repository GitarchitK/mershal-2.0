import cron from 'node-cron';
import { config } from './config.js';
import { generateArticle } from './utils/ai-generator.js';
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
    console.log(`\n📝 Generating article: "${topic}" [${category}]`);
    
    // Check for duplicates
    const isDuplicate = await checkDuplicatePost(topic);
    if (isDuplicate) {
      console.log('⚠️  Duplicate article detected, skipping...');
      return false;
    }
    
    // Generate article (automatically fetches Unsplash thumbnail inside generator)
    const article = await generateArticle(topic, category);
    
    // Save to Firestore
    const postId = await savePost(article);
    console.log(`✓ Article saved to Firestore articles collection: ${postId}`);
    
    // Trigger deployment
    await triggerDeployment();
    
    // Wait for deployment
    await waitForDeployment(60000); // 1 minute
    
    // Submit to Google Indexing
    const articleUrl = `${config.site.url}/articles/${article.slug}`;
    await submitUrlToGoogle(articleUrl).catch(e => console.warn('Indexing skipped:', e.message));
    
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
    // Fetch programmatic topics from local pool
    const { getRandomTopics } = await import('./topics.js');
    const topics = getRandomTopics(1);
    
    if (topics.length === 0) {
      console.log('No programmatic topics found');
      return;
    }
    
    const selectedTopic = topics[0];
    
    // Publish article
    await publishArticle(selectedTopic.topic, selectedTopic.category);
    
  } catch (error) {
    console.error('Automation cycle error:', error);
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
