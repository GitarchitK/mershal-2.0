# 🚀 Quick Start Guide - Mershal Automated News Platform

Get your automated SEO news website running in 30 minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase account
- Google Cloud account
- Gemini API key (or OpenAI)
- Vercel/Cloudflare account (for deployment)

## ⚡ 5-Step Setup

### Step 1: Install Dependencies (2 min)

```bash
npm install
```

### Step 2: Firebase Setup (10 min)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Name it (e.g., "mershal-news")
   - Disable Google Analytics (optional)

2. **Enable Firestore**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Start in production mode
   - Choose location closest to your users

3. **Create Service Account**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Extract these values for `.env`:
     - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
     - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

4. **Deploy Firestore Rules**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

### Step 3: Google Indexing API Setup (10 min)

1. **Enable API**
   - Go to https://console.cloud.google.com
   - Select your Firebase project
   - Go to "APIs & Services" → "Library"
   - Search "Web Search Indexing API"
   - Click "Enable"

2. **Create Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: "indexing-service"
   - Grant role: "Owner" (or custom with indexing permissions)
   - Create key (JSON format)
   - Extract values for `.env`:
     - `client_email` → `GOOGLE_INDEXING_EMAIL`
     - `private_key` → `GOOGLE_INDEXING_PRIVATE_KEY`

3. **Verify Site in Search Console**
   - Go to https://search.google.com/search-console
   - Add your domain
   - Verify ownership
   - Go to Settings → Users and permissions
   - Add service account email as owner

### Step 4: Get Gemini API Key (3 min)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key → `GEMINI_API_KEY` in `.env`

### Step 5: Configure Environment (5 min)

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# AI Configuration
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Deployment (get this after deploying to Vercel)
DEPLOY_WEBHOOK_URL=https://api.vercel.com/v1/integrations/deploy/xxxxx

# Google Indexing API
GOOGLE_INDEXING_EMAIL=indexing-service@your-project.iam.gserviceaccount.com
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Indexing-Key-Here\n-----END PRIVATE KEY-----\n"
```

## ✅ Verify Setup

Run the setup script:

```bash
npm run setup
```

This will:
- ✓ Test Firebase connection
- ✓ Initialize Firestore collections
- ✓ Setup IPL team data
- ✓ Test AI connection
- ✓ Verify Indexing API

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variables:
   - Copy all variables from `.env`
   - Paste in Vercel dashboard

6. Click "Deploy"

### 3. Get Deployment Webhook

1. In Vercel project settings
2. Go to "Git" → "Deploy Hooks"
3. Create hook named "automation"
4. Copy webhook URL
5. Add to `.env` as `DEPLOY_WEBHOOK_URL`

## 🤖 Start Automation

### Local Testing

```bash
# Terminal 1: Run Astro dev server
npm run dev

# Terminal 2: Run automation
npm run automation:dev
```

### Production

On your server (or use PM2):

```bash
npm run automation
```

Or with PM2:

```bash
npm install -g pm2
pm2 start automation/index.js --name mershal-automation
pm2 save
pm2 startup
```

## 📊 Monitor

### Check Automation Logs

```bash
# If using PM2
pm2 logs mershal-automation

# Or check console output
```

### Verify Articles

1. Check Firestore Console
2. Visit your deployed site
3. Check Google Search Console for indexing status

## 🎯 What Happens Next?

The automation system will:

1. **Every 30 minutes**:
   - Fetch trending topics
   - Generate AI article
   - Save to Firestore
   - Trigger deployment
   - Submit to Google Indexing

2. **Daily**:
   - Publish 20-50 articles
   - Update sitemaps
   - Reset counters

3. **During IPL Season**:
   - Generate match previews
   - Create result articles
   - Update points table
   - Track player stats

## 📈 Expected Results

### Week 1
- 150-300 articles published
- Site indexed by Google
- Initial traffic starts

### Month 1
- 1,000+ articles
- Ranking for long-tail keywords
- Growing organic traffic

### Month 3
- 3,000+ articles
- Ranking for competitive keywords
- Significant traffic during IPL season

## 🔧 Configuration

### Adjust Publishing Rate

Edit `automation/config.js`:

```javascript
content: {
  articlesPerDay: 30,        // Change this
  schedulerInterval: 30,     // Minutes between runs
}
```

### Change Categories

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

### Enable/Disable IPL

```javascript
ipl: {
  enabled: true,  // Set to false to disable
  season: 2026,
}
```

## 🐛 Troubleshooting

### "Firebase not configured"
- Check `.env` file exists
- Verify Firebase credentials
- Ensure private key has `\n` for line breaks

### "AI generation failed"
- Verify Gemini API key
- Check API quota limits
- Try OpenAI as alternative

### "Indexing API error"
- Verify service account email in Search Console
- Check API is enabled in Google Cloud
- Ensure site is verified

### "No articles appearing"
- Check Firestore rules allow public read
- Verify `status` field is 'published'
- Check browser console for errors

## 📚 Next Steps

1. ✅ Customize design in `src/` folder
2. ✅ Add your logo and branding
3. ✅ Configure Google Analytics
4. ✅ Setup Google AdSense
5. ✅ Monitor Search Console
6. ✅ Optimize based on performance

## 🎓 Learn More

- [Complete Automation Guide](./AUTOMATION_GUIDE.md)
- [Full README](./README_AUTOMATION.md)
- [Astro Documentation](https://docs.astro.build)
- [Firebase Documentation](https://firebase.google.com/docs)

## 💡 Tips for Success

1. **Start Small**: Begin with 10-20 articles/day
2. **Monitor Quality**: Review AI-generated content regularly
3. **Track Rankings**: Use Search Console to monitor performance
4. **Optimize**: Adjust based on what works
5. **Scale Up**: Increase volume as you see results

## 🆘 Need Help?

- Check logs for error messages
- Review Firestore data
- Verify all API keys are correct
- Ensure deployment is successful

---

**You're all set! Your automated news platform is ready to publish. 🎉**

Watch as articles are automatically generated, published, and indexed by Google!
