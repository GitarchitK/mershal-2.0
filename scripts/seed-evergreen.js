import { getFirestore } from '../automation/utils/firebase.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const db = getFirestore();

const categories = [
  { name: 'AI Tools', slug: 'ai-tools', description: 'Reviews, comparison guides, and workflows for generative AI models and automation tools.', icon: '🤖', order: 1 },
  { name: 'SaaS Reviews', slug: 'saas-reviews', description: 'In-depth analyses, pricing updates, and features comparison of software platforms.', icon: '💻', order: 2 },
  { name: 'Productivity', slug: 'productivity', description: 'Apps, frameworks, and workflows to optimize daily outputs and scale operations.', icon: '📈', order: 3 },
  { name: 'Freelancing', slug: 'freelancing', description: 'Client acquisition, contract negotiation, pricing models, and gig scaling resources.', icon: '✍️', order: 4 },
  { name: 'Online Business', slug: 'online-business', description: 'Ecommerce strategy, remote agency models, and scaling digital assets.', icon: '💼', order: 5 },
  { name: 'CRM Software', slug: 'crm', description: 'Reviews and implementation guides for customer relationships pipelines and sales systems.', icon: '👥', order: 6 },
  { name: 'Digital Marketing', slug: 'marketing', description: 'SEO audits, conversions optimization, funnel setups, and email list marketing guides.', icon: '📣', order: 7 },
];

const author = {
  name: 'Archit Karmakar',
  slug: 'archit-karmakar',
  role: 'Founder & Tech Analyst',
  bio: 'Digital marketer, automation expert, and SaaS builder writing actionable tech reviews and productivity guides.',
  avatar: '',
  twitter_url: 'https://twitter.com/archit_karmakar',
  linkedin_url: 'https://linkedin.com/in/archit-karmakar',
};

const sampleArticles = [
  {
    title: 'Best AI Coding Assistants: Cursor, GitHub Copilot, and Tabnine compared',
    slug: 'best-ai-coding-assistants',
    excerpt: 'We review the top generative AI code compilers and editors of 2026, comparing code generation, project indexing, and inline chat features.',
    content: `<h2>The Rise of AI Coding Editors</h2>
<p>Generative artificial intelligence has completely transformed modern software development workflows. With tools like Cursor and GitHub Copilot, developers can index entire directories, compile clean boilerplate blocks, and write complete unit tests inside seconds.</p>

<h2>1. Cursor: The Elite Fork of VS Code</h2>
<p>Cursor has quickly emerged as the developer favorite. Built as a direct fork of VS Code, it fully supports all extensions while offering native, multi-file code editing. Its indexing features allow the model to scan your entire workspace folder and understand complex module relationships.</p>
<blockquote>"Cursor's composer feature allows the model to write multi-file edits simultaneously, saving hours of manual coding."</blockquote>

<h2>2. GitHub Copilot: The Industry Standard</h2>
<p>Backed by Microsoft and OpenAI, GitHub Copilot remains the most popular autocomplete extension. It is deeply integrated into standard IDEs like JetBrains, Neovim, and VS Code, offering fast, context-aware suggestions as you type.</p>

<h2>3. Tabnine: Secure & Local Models</h2>
<p>For enterprise teams requiring strict data privacy, Tabnine offers local LLM execution. It trains private models on your codebase without leaking proprietary code to external APIs.</p>

<h2>Conclusion: Which AI Assistant is Best?</h2>
<p>If you want a dedicated AI-native editor with multi-file edit capabilities, choose <strong>Cursor</strong>. If you want a lightweight autocomplete extension inside your existing JetBrains setup, <strong>GitHub Copilot</strong> remains the optimal choice.</p>`,
    category: 'AI Tools',
    tags: ['ai', 'coding', 'saas', 'productivity'],
    publish_date: admin.firestore.Timestamp.fromDate(new Date()),
    updated_date: admin.firestore.Timestamp.fromDate(new Date()),
    author: 'Archit Karmakar',
    author_id: 'archit',
    status: 'published',
    readingTime: 6,
    views: 124,
    faq_items: [
      { question: 'Is Cursor free to use?', answer: 'Cursor offers a free hobby tier with basic model usage, and a paid Pro tier at $20/month for unlimited advanced models.' },
      { question: 'Does GitHub Copilot train on my private code?', answer: 'GitHub Copilot Business and Enterprise tiers ensure that your private code is never retained or used to train public models.' }
    ],
    schema_data: { article_type: 'TechArticle' }
  },
  {
    title: 'Top 10 CRM Software Platforms for Remote Marketing Agencies in 2026',
    slug: 'top-crm-platforms-remote-agencies',
    excerpt: 'We compare the best Customer Relationship Management (CRM) tools for managing lead pipelines, remote teams, and automated follow-ups.',
    content: `<h2>Choosing the Right CRM for Your Remote Team</h2>
<p>For remote agencies, keeping track of client leads and deals is critical. Traditional CRMs are often bloated and complex, requiring dedicated administrators. Modern agencies need lightweight, automated CRM systems that integrate with Slack, Gmail, and active funnels.</p>

<h2>1. HubSpot CRM</h2>
<p>HubSpot is the industry behemoth. Its free tier is highly capable for early-stage agencies, offering contact lists, email tracking, and basic forms. However, its premium plans scale in cost quickly.</p>

<h2>2. Pipedrive</h2>
<p>Pipedrive is built around visual deal pipelines. It makes it incredibly simple to track deal stages, assign actions to remote account managers, and automate follow-up email campaigns.</p>

<h2>3. Monday Sales CRM</h2>
<p>Monday.com's sales dashboard is highly customizable, combining project management features directly with deal tracking metrics.</p>

<h2>Key CRM Evaluation Factors</h2>
<ul>
  <li>Lead pipeline automation & API triggers</li>
  <li>Team delegation and conversation threading</li>
  <li>Native email sequences and open-tracking</li>
</ul>`,
    category: 'CRM Software',
    tags: ['crm', 'saas', 'business', 'automation'],
    publish_date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)),
    updated_date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)),
    author: 'Archit Karmakar',
    author_id: 'archit',
    status: 'published',
    readingTime: 5,
    views: 98,
    faq_items: [
      { question: 'Which CRM has the best free plan?', answer: 'HubSpot CRM offers the most comprehensive free plan, supporting unlimited users and basic pipeline management.' }
    ],
    schema_data: { article_type: 'Review', rating_value: 4.8, best_rating: 5 }
  }
];

async function seed() {
  try {
    console.log('Seeding categories...');
    for (const cat of categories) {
      await db.collection('categories').doc(cat.slug).set(cat);
      console.log(`✓ Seeded category: ${cat.name}`);
    }

    console.log('Seeding author profile...');
    await db.collection('authors').doc('archit').set(author);
    console.log(`✓ Seeded author: ${author.name}`);

    console.log('Seeding settings config...');
    await db.collection('settings').doc('adsense').set({
      header_code: '',
      sidebar_code: '',
      content_code: '',
      footer_code: '',
    });
    console.log('✓ Seeded empty settings document');

    console.log('Seeding sample evergreen articles...');
    for (const art of sampleArticles) {
      await db.collection('articles').doc(art.slug).set(art);
      console.log(`✓ Seeded article: ${art.title}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
