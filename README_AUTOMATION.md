# 🤖 Mershal - Automated SEO News Platform

A fully automated news publishing platform powered by AI, optimized for SEO and designed to capture high-traffic events like IPL.

## ✨ Features

### 🚀 Automation
- **Automated Content Generation** - AI-powered article writing using Gemini/OpenAI
- **Trending Topics Detection** - Monitors Google Trends, News APIs, Reddit
- **Smart Scheduling** - Publishes 20-50 articles daily automatically
- **Duplicate Prevention** - Checks existing content before publishing
- **Auto-Deployment** - Triggers builds after each publication

### 🏏 IPL Special Features
- Match preview articles
- Live match commentary
- Match result analysis
- Player performance tracking
- Team statistics pages
- Head-to-head comparisons
- Points table updates

### 🔍 SEO Optimization
- **Server-Side Rendering** - Hybrid SSR for dynamic content
- **Automatic Sitemaps** - XML and News sitemaps
- **Google Indexing API** - Instant URL submission
- **Structured Data** - Schema.org JSON-LD
- **Meta Optimization** - Auto-generated SEO titles and descriptions
- **Internal Linking** - Smart cross-linking between articles
- **Performance** - Lighthouse score 95+

### 📊 Content Management
- **Firestore CMS** - Scalable NoSQL database
- **Category System** - Sports, Tech, Business, Politics, Entertainment, World
- **Tag Management** - Automatic tag generation
- **Reading Time** - Auto-calculated
- **View Tracking** - Article analytics

## 🛠️ Tech Stack

- **Frontend**: Astro (Hybrid SSR)
- **Database**: Firebase Firestore
- **AI**: Google Gemini API / OpenAI
- **Automation**: Node.js + Cron
- **Deployment**: Vercel / Cloudflare Pages
- **Indexing**: Google Indexing API
- **Styling**: Tailwind CSS

## 📦 Installation

### 1. Clone and Install

```bash
git clone <your-repo>
cd mershal
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in your credentials:

```env
# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI
GEMINI_API_KEY=your-gemini-api-key

# Deployment
DEPLOY_WEBHOOK_URL=https://api.vercel.com/v1/integrations/deploy/your-hook

# Google Indexing
GOOGLE_INDEXING_EMAIL=indexing-account@project.iam.gserviceaccount.com
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create service account:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Add credentials to `.env`

4. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### 4. Google Indexing API Setup

1. Go to https://console.cloud.google.com
2. Enable "Web Search Indexing API"
3. Create service account with Indexing API permissions
4. Download credentials and add to `.env`
5. Verify site in Google Search Console
6. Add service account email as owner in Search Console

### 5. Run Setup Script

```bash
npm run setup
```

This will:
- Initialize Firestore collections
- Setup IPL team data
- Test AI connection
- Verify Indexing API

## 🚀 Usage

### Development

```bash
# Run Astro dev server
npm run dev

# Run automation (development mode with auto-restart)
npm run automation:dev
```

### Production

```bash
# Build site
npm run build

# Run automation
npm run automation
```

### Manual Operations

```bash
# Generate sitemaps
npm run generate:sitemap

# Seed sample data
npm run seed
```

## 📁 Project Structure

```
mershal/
├── automation/                 # Automation system
│   ├── config.js              # Configuration
│   ├── index.js               # Entry point
│   ├── scheduler.js           # Cron scheduler
│   └── utils/
│       ├── ai-generator.js    # AI article generation
│       ├── firebase.js        # Firestore operations
│       ├── trending.js        # Trending topics
│       ├── indexing.js        # Google Indexing API
│       ├── deployment.js      # Deploy triggers
│       └── sitemap.js         # Sitemap generation
│
├── src/
│   ├── pages/
│   │   ├── index.astro        # Homepage (SSR)
│   │   ├── news/
│   │   │   └── [slug].astro   # Article pages (SSR)
│   │   ├── category/
│   │   │   └── [category].astro  # Category pages (SSR)
│   │   ├── ipl.astro          # IPL hub (SSR)
│   │   ├── about.astro        # Static
│   │   ├── contact.astro      # Static
│   │   ├── privacy.astro      # Static
│   │   └── terms.astro        # Static
│   │
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── NewsCard.astro
│   │   └── BottomNav.astro
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── lib/
│   │   ├── firebase-admin.ts
│   │   ├── firebase.ts
│   │   └── weather.ts
│   │
│   └── types/
│       ├── post.ts
│       └── news.ts
│
├── scripts/
│   ├── setup-automation.js    # Setup script
│   └── seed-data.js           # Sample data
│
├── public/
│   ├── sitemap.xml            # Generated
│   └── news-sitemap.xml       # Generated
│
├── firestore.rules            # Security rules
├── astro.config.mjs           # Astro config
└── package.json
```

## ⚙️ Configuration

### Automation Settings

Edit `automation/config.js`:

```javascript
content: {
  minWordCount: 800,
  maxWordCount: 1200,
  articlesPerDay: 30,        // Daily target
  schedulerInterval: 30,     // Minutes between runs
}
```

### Categories

```javascript
categories: [
  'sports',
  'technology',
  'business',
  'politics',
  'entertainment',
  'world',
]
```

### IPL Configuration

```javascript
ipl: {
  enabled: true,
  season: 2026,
  teams: [
    { code: 'KKR', name: 'Kolkata Knight Riders', slug: 'kolkata-knight-riders' },
    { code: 'MI', name: 'Mumbai Indians', slug: 'mumbai-indians' },
    // ... more teams
  ],
}
```

## 🔄 Automation Workflow

1. **Every 30 minutes**:
   - Fetch trending topics from multiple sources
   - Check for duplicates in Firestore
   - Generate article using AI
   - Create SEO metadata
   - Save to Firestore
   - Trigger deployment
   - Wait for build completion
   - Submit URL to Google Indexing API

2. **Daily at midnight**:
   - Reset article counter
   - Generate sitemap
   - Cleanup old data (optional)

3. **During IPL season** (hourly):
   - Fetch match data
   - Generate match-related articles
   - Update points table
   - Create player performance articles

## 📊 Firestore Collections

### `posts`
```javascript
{
  title: string,
  slug: string,
  content: string,           // HTML
  excerpt: string,
  featuredImage: string,
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

### `ipl_teams`
```javascript
{
  code: string,
  name: string,
  slug: string,
  logo: string,
  captain: string,
  homeGround: string,
  season: number
}
```

### `ipl_matches`
```javascript
{
  team1: string,
  team2: string,
  matchDate: timestamp,
  venue: string,
  matchNumber: number,
  season: number,
  status: 'upcoming' | 'live' | 'completed',
  result: string,
  winner: string
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Get webhook URL:
- Settings → Git → Deploy Hooks
- Create hook and add URL to `.env`

### Cloudflare Pages

1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables
5. Deploy

## 📈 SEO Best Practices

### Content
- ✅ 800-1200 words per article
- ✅ Proper heading hierarchy
- ✅ Internal linking
- ✅ Unique meta descriptions
- ✅ Alt text for images

### Technical
- ✅ Hybrid SSR rendering
- ✅ Automatic sitemaps
- ✅ Google Indexing API
- ✅ Structured data (JSON-LD)
- ✅ Fast page loads (95+ Lighthouse)
- ✅ Mobile responsive

### URL Structure
```
/                              # Homepage
/news/[slug]                   # Article pages
/category/[category]           # Category pages
/ipl                           # IPL hub
/ipl/teams/[team]              # Team pages
/ipl/players/[player]          # Player pages
```

## 🔒 Security

### Firestore Rules
```javascript
// Public read for published posts only
allow read: if resource.data.status == 'published';

// No public writes
allow write: if false;
```

### API Keys
- Store in environment variables
- Never commit to version control
- Use service accounts with minimal permissions
- Rotate regularly

## 📊 Monitoring

### Logs
The automation system logs:
- Article generation attempts
- Publication success/failure
- Indexing submissions
- Errors and warnings

### Metrics to Track
- Articles published per day
- Google indexing acceptance rate
- Page views (Google Analytics)
- Search rankings (Search Console)
- Site performance (Lighthouse)

## 🐛 Troubleshooting

### Articles not publishing
- Check Firebase credentials
- Verify Gemini API key
- Review Firestore rules
- Check automation logs

### Indexing failures
- Verify site ownership in Search Console
- Check service account permissions
- Ensure URLs are publicly accessible
- Review quota limits

### Build failures
- Check deployment webhook
- Verify environment variables
- Review build logs

## 📚 Documentation

- [Complete Automation Guide](./AUTOMATION_GUIDE.md)
- [Astro Docs](https://docs.astro.build)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API](https://ai.google.dev/docs)
- [Google Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart)

## 🎯 Roadmap

- [ ] Image generation using AI
- [ ] Video content integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media auto-posting
- [ ] Email newsletter automation
- [ ] Comment system
- [ ] User accounts

## 📄 License

MIT License - feel free to use for your projects

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines first.

---

**Built with ❤️ for automated news publishing**
