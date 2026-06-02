// Dynamic lists of tools and variables for programmatic SEO combinations
const aiTools = [
  'Claude 3.5 Sonnet', 'GPT-4o', 'ChatGPT Plus', 'Midjourney v6', 'Jasper AI',
  'Copy.ai', 'Runway Gen-3', 'ElevenLabs', 'Perplexity AI', 'Julius AI',
  'v0.dev', 'Cursor AI', 'GitHub Copilot'
];

const saasTools = [
  'ClickUp', 'Notion', 'Monday.com', 'Asana', 'Slack', 'Trello', 'Jira',
  'Zapier', 'Make.com', 'n8n', 'Canva Pro', 'Figma', 'Stripe', 'Gumroad', 'Teachable'
];

const crmTools = [
  'HubSpot CRM', 'Salesforce', 'Zoho CRM', 'Pipedrive', 'Freshsales',
  'ActiveCampaign', 'Keap'
];

const marketingTools = [
  'SEMrush', 'Ahrefs', 'Mailchimp', 'ConvertKit', 'Google Analytics 4',
  'Buffer', 'Klaviyo'
];

const audiences = [
  'Solopreneurs', 'Freelancers', 'SaaS Founders', 'Digital Marketers',
  'Remote Teams', 'Small Businesses', 'Content Creators', 'Agencies'
];

// Helper to generate programmatic SEO topics pool
function generateProgrammaticTopics() {
  const list = [];

  // 1. AI Tools (Category: AI Tools)
  for (let i = 0; i < aiTools.length; i++) {
    const tool = aiTools[i];
    list.push({
      topic: `${tool} Review 2026: Features, Pricing, and Competitors`,
      category: 'AI Tools'
    });
    
    // Tool comparison
    if (i < aiTools.length - 1) {
      const tool2 = aiTools[i + 1];
      list.push({
        topic: `${tool} vs ${tool2} for Coding and Content - Detailed Comparison`,
        category: 'AI Tools'
      });
    }
  }

  // 2. SaaS Reviews (Category: SaaS Reviews)
  for (let i = 0; i < saasTools.length; i++) {
    const tool = saasTools[i];
    list.push({
      topic: `${tool} Review 2026: Features, Pricing, and Integrations`,
      category: 'SaaS Reviews'
    });
    
    // SaaS comparisons
    if (i < saasTools.length - 1) {
      const tool2 = saasTools[i + 1];
      list.push({
        topic: `${tool} vs ${tool2}: Which Platform is Better in 2026?`,
        category: 'SaaS Reviews'
      });
    }
  }

  // 3. CRM Software (Category: CRM Software)
  for (let i = 0; i < crmTools.length; i++) {
    const tool = crmTools[i];
    list.push({
      topic: `Best ${tool} Alternatives for Small Businesses and Startups`,
      category: 'CRM Software'
    });
    
    // CRM comparisons
    if (i < crmTools.length - 1) {
      const tool2 = crmTools[i + 1];
      list.push({
        topic: `${tool} vs ${tool2}: Head-to-Head CRM Comparison 2026`,
        category: 'CRM Software'
      });
    }
  }

  // 4. Productivity (Category: Productivity)
  audiences.forEach(audience => {
    list.push({
      topic: `How to Build a High-Performance Productivity Setup for ${audience}`,
      category: 'Productivity'
    });
    list.push({
      topic: `Top 10 Essential Productivity Apps for ${audience} in 2026`,
      category: 'Productivity'
    });
  });

  // 5. Freelancing (Category: Freelancing)
  const freelanceAudiences = ['Freelancers', 'Agencies', 'Content Creators'];
  freelanceAudiences.forEach(audience => {
    list.push({
      topic: `How to Automate Freelance Client Acquisition and Invoicing`,
      category: 'Freelancing'
    });
    list.push({
      topic: `Value-Based Pricing Playbook for ${audience} in 2026`,
      category: 'Freelancing'
    });
  });

  // 6. Online Business (Category: Online Business)
  audiences.forEach(audience => {
    list.push({
      topic: `How to Launch a Multi-Step Automated Online Business as a ${audience}`,
      category: 'Online Business'
    });
  });

  // 7. Digital Marketing (Category: Digital Marketing)
  marketingTools.forEach(tool => {
    list.push({
      topic: `How to Setup a Automated Marketing Funnel with ${tool}`,
      category: 'Digital Marketing'
    });
  });

  return list;
}

export const customTopics = generateProgrammaticTopics();
export const yourCustomTopics = [];
export const allTopics = [...customTopics, ...yourCustomTopics];

export function getRandomTopics(count = 1) {
  const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getTopicsByCategory(category) {
  return allTopics.filter(t => t.category.toLowerCase() === category.toLowerCase());
}

export function addTopic(topic, category) {
  yourCustomTopics.push({ topic, category });
  allTopics.push({ topic, category });
}
