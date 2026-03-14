# Mershal Automated News Platform - Complete Guide

## 🎯 Overview

This is a fully automated SEO news website platform that publishes news articles automatically using AI, with special focus on high-traffic events like IPL.

## 📋 Architecture

```
Trending Topics Engine
        ↓
AI Article Generator (Gemini/OpenAI)
        ↓
Firestore CMS
        ↓
Astro Static Site (Hybrid SSR)
        ↓
Deployment Hook (Vercel/Cloudflare)
        ↓
Google Indexing API
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `DEPLOY_WEBHOOK_URL`
- `GOOGLE_INDEXING_EMAIL`
- `GOOGLE_INDEXING_PRIVATE_KEY`

### 3. Setup Firebase

1. Create a Firebase project
2. Enable Firestore Database
3. Create service account and download credentials
4. Add credentials to `.env`

### 4. Setup Google Indexing API

1. Go to Google Cloud Console
2. Enable Indexing API
3. Create service account with Indexing API permissions
4. Download credentials and add to `.env`
5. Verify your site in Google Search Console
6. Add service account email as owner in Search Console

### 5. Run the Automation

```bash
npm run automation
```

For development with auto-restart:

```bash
npm run automation:dev
```

## 📁 Project Structure

```
mershal/
├── automation/
│   ├── config.js              # Configuration
│   ├── index.js               # Main entry point
│   ├── scheduler.js           # Automation scheduler
│   └── utils/
│       ├── ai-generator.js    # AI article generation
│       ├── firebase.js        # Firebase operations
│       ├── trending.js        # Trending topics fetcher
│       ├── indexing.js        # Google Indexing API
│       ├── deployment.js      # Deployment triggers
│       └── sitemap.js         # Sitemap generation
├── src/
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   ├── news/[slug].astro  # Article pages (SSR)
│   │   ├── category/[category].astro  # Category pages
│   │   └── ipl.astro          # IPL hub page
│   ├── components/
│   ├── layouts/
│   └── types/
│       └── post.ts            # TypeScript types
└── public/
    ├── sitemap.xml
    └── news-sitemap.xml
```

## 🤖 Automation Features

### Content Generation

- **Frequency**: Every 30 minutes (configurable)
- **Daily Target**: 30 articles (configurable)
- **Word Count**: 800-1200 words per article
- **Categories**: Sports, Technology, Business, Politics, Entertainment, World

### Trending Topics Sources

1. **Google Trends** - Real-time trending searches
2. **News API** - Breaking news headlines
3. **Reddit** - Trending discussions
4. **Cricket APIs** - IPL match data (during season)

### Article Generation Process

1. Fetch trending topics
2. Check for duplicates in Firestore
3. Generate article using AI (Gemini)
4. Create SEO metadata
5. Save to Firestore
6. Trigger deployment
7. Submit URL to Google Indexing API

## 🏏 IPL Automation

### Special Features

During IPL season, the system automatically generates:

1. **Match Preview Articles** - Before each match
2. **Live Match Blogs** - During matches
3. **Match Result Articles** - After matches
4. **Player Performance News** - Daily updates
5. **Team Analysis** - Weekly reports

### IPL Page Structure

```
/ipl                          # Main IPL hub
/ipl/news                     # All IPL news
/ipl/match-preview            # Upcoming matches
/ipl/live-score               # Live scores
/ipl/points-table             # Current standings
/ipl/schedule                 # Full schedule
/ipl/teams/[team]             # Team pages
/ipl/players/[player]         # Player profiles
/ipl/head-to-head/[match]     # Team comparisons
```

## 📊 Firestore Structure

### Collection: `posts`

```javascript
{
  title: string,
  slug: string,
  content: string (HTML),
  excerpt: string,
  featuredImage: string (URL),
  category: string,
  tags: string[],
  author: string,
  publishedAt: timestamp,
  updatedAt: timestamp,
  seoTitle: string,
  seoDescription: string,
  readingTime: number,
  wordCount: number,
  status: 'published' | 'draft',
  views: number
}
```

## 🔍 SEO Optimization

### On-Page SEO

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy (H1, H2, H3)
- ✅ Meta titles and descriptions
- ✅ OpenGraph tags
- ✅ Twitter Card metadata
- ✅ Canonical URLs
- ✅ Schema.org structured data (JSON-LD)

### Technical SEO

- ✅ Hybrid SSR for dynamic content
- ✅ Static generation for fast pages
- ✅ Automatic sitemap generation
- ✅ News sitemap for Google News
- ✅ Google Indexing API integration
- ✅ Lazy loading images
- ✅ CDN caching
- ✅ Lighthouse score 95+

### Internal Linking

Articles automatically link to:
- Related articles in same category
- Category hub pages
- Important landing pages (IPL hub, etc.)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Enable deployment webhooks
6. Add webhook URL to `.env`

### Cloudflare Pages

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables
5. Enable deployment webhooks

## 📈 Performance Optimization

### Build Optimization

- Hybrid rendering (static + SSR)
- Image optimization
- CSS/JS minification
- CDN caching headers

### Runtime Optimization

- Lazy loading
- Code splitting
- Minimal JavaScript
- Efficient database queries

## 🔒 Security

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if false; // Only automation server can write
    }
  }
}
```

### API Keys

- Store all keys in environment variables
- Never commit `.env` to version control
- Use service accounts with minimal permissions
- Rotate keys regularly

## 📊 Monitoring

### Metrics to Track

1. **Articles Published** - Daily count
2. **Indexing Status** - Google acceptance rate
3. **Traffic** - Google Analytics
4. **Rankings** - Search Console
5. **Errors** - Automation logs

### Logging

The automation system logs:
- Article generation attempts
- Successful publications
- Indexing submissions
- Errors and failures

## 🛠️ Configuration

### Adjust Publishing Frequency

Edit `automation/config.js`:

```javascript
content: {
  schedulerInterval: 30, // minutes
  articlesPerDay: 30,
}
```

### Change AI Provider

```javascript
ai: {
  provider: 'gemini', // or 'openai'
  model: 'gemini-1.5-flash', // or 'gpt-4'
}
```

### Enable/Disable IPL Mode

```javascript
ipl: {
  enabled: true,
  season: 2026,
}
```

## 🐛 Troubleshooting

### Articles Not Publishing

1. Check Firebase credentials
2. Verify Gemini API key
3. Check Firestore rules
4. Review automation logs

### Indexing Failures

1. Verify site ownership in Search Console
2. Check service account permissions
3. Ensure URL is publicly accessible
4. Review indexing quota limits

### Deployment Not Triggering

1. Verify webhook URL
2. Check deployment platform status
3. Review webhook logs

## 📚 Additional Resources

- [Astro Documentation](https://docs.astro.build)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [Gemini API](https://ai.google.dev/docs)

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Setup Firebase and Firestore
4. ✅ Enable Google Indexing API
5. ✅ Run automation system
6. ✅ Deploy to Vercel/Cloudflare
7. ✅ Monitor performance and rankings

## 📞 Support

For issues or questions, check the logs in `automation/` directory or review the error messages in the console.

---

**Built with ❤️ for automated news publishing**
