# ✅ Deployment Checklist - Mershal Automated News Platform

Use this checklist to ensure everything is properly configured before going live.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] Firebase account created
- [ ] Google Cloud account created
- [ ] Vercel/Cloudflare account created

### 2. Project Setup

- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created from `.env.example`
- [ ] All environment variables filled in

### 3. Firebase Configuration

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Service account created
- [ ] Private key downloaded
- [ ] Credentials added to `.env`:
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`)

### 4. Google Indexing API

- [ ] Web Search Indexing API enabled in Google Cloud
- [ ] Service account created for indexing
- [ ] Service account key downloaded
- [ ] Credentials added to `.env`:
  - [ ] `GOOGLE_INDEXING_EMAIL`
  - [ ] `GOOGLE_INDEXING_PRIVATE_KEY`
- [ ] Site verified in Google Search Console
- [ ] Service account added as owner in Search Console

### 5. AI Configuration

- [ ] Gemini API key obtained from https://makersuite.google.com/app/apikey
- [ ] API key added to `.env`:
  - [ ] `GEMINI_API_KEY`
- [ ] (Optional) OpenAI API key if using GPT-4:
  - [ ] `OPENAI_API_KEY`

### 6. Setup Verification

- [ ] Setup script run successfully (`npm run setup`)
- [ ] Firestore connection verified
- [ ] IPL data initialized
- [ ] AI connection tested
- [ ] Indexing API verified

### 7. Local Testing

- [ ] Astro dev server runs (`npm run dev`)
- [ ] Homepage loads correctly
- [ ] Test article generated (`npm run publish`)
- [ ] Article appears in Firestore
- [ ] Article displays on website
- [ ] Automation runs without errors (`npm run automation:dev`)

## 🚀 Deployment Steps

### 1. Code Repository

- [ ] Code pushed to GitHub
- [ ] Repository is public or accessible to deployment platform
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] All changes committed

### 2. Vercel Deployment

- [ ] Vercel account created
- [ ] New project created in Vercel
- [ ] GitHub repository connected
- [ ] Build settings configured:
  - [ ] Framework: Astro
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`
- [ ] Environment variables added in Vercel:
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
  - [ ] `GEMINI_API_KEY`
  - [ ] `GOOGLE_INDEXING_EMAIL`
  - [ ] `GOOGLE_INDEXING_PRIVATE_KEY`
- [ ] Initial deployment successful
- [ ] Site accessible at Vercel URL

### 3. Deployment Webhook

- [ ] Deploy Hook created in Vercel (Settings → Git → Deploy Hooks)
- [ ] Webhook URL copied
- [ ] Webhook URL added to `.env`:
  - [ ] `DEPLOY_WEBHOOK_URL`
- [ ] Webhook tested (trigger manual deployment)

### 4. Domain Configuration (Optional)

- [ ] Custom domain purchased
- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Site accessible via custom domain

## 🤖 Automation Setup

### 1. Server Setup

Choose one option:

**Option A: Local Server / VPS**
- [ ] Server has Node.js 18+ installed
- [ ] Repository cloned on server
- [ ] Dependencies installed
- [ ] `.env` file configured on server
- [ ] PM2 installed (`npm install -g pm2`)
- [ ] Automation started with PM2:
  ```bash
  pm2 start automation/index.js --name mershal-automation
  pm2 save
  pm2 startup
  ```
- [ ] PM2 logs accessible (`pm2 logs mershal-automation`)

**Option B: Cloud Function / Serverless**
- [ ] Automation code deployed to cloud function
- [ ] Environment variables configured
- [ ] Cron trigger configured
- [ ] Function logs accessible

### 2. Automation Verification

- [ ] Automation running without errors
- [ ] First article generated automatically
- [ ] Article saved to Firestore
- [ ] Deployment triggered
- [ ] URL submitted to Google
- [ ] Logs show successful operations

## 🔍 SEO Configuration

### 1. Google Search Console

- [ ] Site added to Search Console
- [ ] Ownership verified
- [ ] Sitemap submitted (`https://yourdomain.com/sitemap.xml`)
- [ ] News sitemap submitted (`https://yourdomain.com/news-sitemap.xml`)
- [ ] No critical errors in Coverage report

### 2. Google Analytics (Optional)

- [ ] Google Analytics account created
- [ ] Property created for website
- [ ] Tracking code added to site
- [ ] Real-time data showing

### 3. Google AdSense (Optional)

- [ ] AdSense account created
- [ ] Site added to AdSense
- [ ] Ad units created
- [ ] Ad code added to site

### 4. Sitemaps

- [ ] `sitemap.xml` accessible
- [ ] `news-sitemap.xml` accessible
- [ ] Sitemaps update automatically
- [ ] Sitemaps submitted to Search Console

## 📊 Monitoring Setup

### 1. Performance Monitoring

- [ ] Lighthouse audit run (score 95+)
- [ ] Core Web Vitals checked
- [ ] Mobile responsiveness verified
- [ ] Page speed optimized

### 2. Error Monitoring

- [ ] Automation logs accessible
- [ ] Error alerts configured (optional)
- [ ] Firestore monitoring enabled
- [ ] Deployment logs reviewed

### 3. Analytics

- [ ] Google Analytics tracking
- [ ] Search Console monitoring
- [ ] Firestore usage tracking
- [ ] API quota monitoring

## 🔒 Security Checklist

### 1. API Keys

- [ ] All API keys stored in environment variables
- [ ] No keys in source code
- [ ] `.env` file in `.gitignore`
- [ ] Keys rotated if exposed

### 2. Firestore Security

- [ ] Security rules deployed
- [ ] Public read only for published posts
- [ ] Write access restricted
- [ ] Rules tested in Firebase Console

### 3. Service Accounts

- [ ] Minimal permissions granted
- [ ] Keys stored securely
- [ ] Access audited regularly

## ✅ Post-Deployment Verification

### 1. Website Functionality

- [ ] Homepage loads correctly
- [ ] Articles display properly
- [ ] Category pages work
- [ ] IPL page loads
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] Images load
- [ ] Links work

### 2. Automation Functionality

- [ ] Articles being generated
- [ ] Articles appearing in Firestore
- [ ] Articles showing on website
- [ ] Deployments triggering
- [ ] URLs being indexed
- [ ] No errors in logs

### 3. SEO Verification

- [ ] Meta tags present
- [ ] OpenGraph tags working
- [ ] Sitemaps accessible
- [ ] Robots.txt configured
- [ ] Canonical URLs correct
- [ ] Structured data valid (optional)

### 4. Performance

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score 95+
- [ ] Mobile performance good
- [ ] No console errors
- [ ] Images optimized

## 📈 First Week Checklist

### Day 1
- [ ] 20-50 articles published
- [ ] All articles in Firestore
- [ ] All articles on website
- [ ] URLs submitted to Google

### Day 3
- [ ] 100+ articles published
- [ ] Google starting to index
- [ ] No critical errors
- [ ] Automation running smoothly

### Day 7
- [ ] 150-300 articles published
- [ ] Significant indexing progress
- [ ] Initial traffic appearing
- [ ] Rankings for long-tail keywords

## 🎯 Optimization Checklist

### Week 2-4

- [ ] Review article quality
- [ ] Adjust AI prompts if needed
- [ ] Optimize meta descriptions
- [ ] Improve internal linking
- [ ] Add more categories
- [ ] Increase publishing rate
- [ ] Monitor Search Console
- [ ] Track rankings
- [ ] Analyze traffic patterns
- [ ] Optimize based on data

## 🏏 IPL Season Checklist

### Before IPL Season

- [ ] IPL teams data updated
- [ ] Match schedule imported
- [ ] Player database updated
- [ ] IPL automation enabled
- [ ] Match preview templates ready

### During IPL Season

- [ ] Match previews generating
- [ ] Live blogs publishing
- [ ] Result articles automatic
- [ ] Points table updating
- [ ] Player stats tracking
- [ ] High traffic handling

## 🆘 Troubleshooting Checklist

If something isn't working:

### Articles Not Publishing

- [ ] Check automation logs
- [ ] Verify Firebase credentials
- [ ] Check Gemini API key
- [ ] Review Firestore rules
- [ ] Check API quotas

### Indexing Issues

- [ ] Verify service account in Search Console
- [ ] Check Indexing API enabled
- [ ] Ensure site verified
- [ ] Review quota limits
- [ ] Check URL accessibility

### Deployment Failures

- [ ] Verify webhook URL
- [ ] Check Vercel status
- [ ] Review build logs
- [ ] Check environment variables
- [ ] Verify build command

### Performance Issues

- [ ] Run Lighthouse audit
- [ ] Check image sizes
- [ ] Review JavaScript usage
- [ ] Verify CDN caching
- [ ] Check server response times

## ✅ Final Verification

Before considering deployment complete:

- [ ] All checklist items above completed
- [ ] No critical errors in any system
- [ ] Automation running for 24+ hours successfully
- [ ] At least 20 articles published
- [ ] Articles appearing on website
- [ ] Google indexing started
- [ ] Performance metrics good
- [ ] Monitoring in place
- [ ] Documentation reviewed
- [ ] Backup plan ready

## 🎉 Launch!

Once all items are checked:

- [ ] Announce launch
- [ ] Share on social media
- [ ] Submit to directories
- [ ] Start marketing
- [ ] Monitor closely for first week
- [ ] Gather feedback
- [ ] Iterate and improve

---

## 📞 Support Resources

- **Documentation**: Check all `.md` files in project root
- **Logs**: Review automation and deployment logs
- **Firebase Console**: Monitor Firestore data
- **Search Console**: Track indexing and rankings
- **Vercel Dashboard**: Check deployments and analytics

---

**Congratulations on deploying your automated news platform! 🎉**

Keep this checklist handy for future reference and troubleshooting.
