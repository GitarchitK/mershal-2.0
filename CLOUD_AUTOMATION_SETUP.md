# Cloud Automation Setup - No Computer Needed!

Your articles can publish automatically 24/7 without keeping your computer on!

## Option 1: GitHub Actions (Recommended - FREE)

GitHub Actions runs your automation in the cloud for free!

### Setup Steps

1. **Push the workflow file** (already done):
   ```bash
   git add .github/workflows/auto-publish.yml
   git commit -m "Add GitHub Actions automation"
   git push origin main
   ```

2. **Add Secrets to GitHub**:
   - Go to your repo: https://github.com/GitarchitK/mershal-2.0
   - Click "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Add each secret:

   ```
   OPENAI_API_KEY
   FIREBASE_ADMIN_PROJECT_ID
   FIREBASE_ADMIN_CLIENT_EMAIL
   FIREBASE_ADMIN_PRIVATE_KEY
   FIREBASE_API_KEY
   FIREBASE_AUTH_DOMAIN
   FIREBASE_PROJECT_ID
   FIREBASE_STORAGE_BUCKET
   FIREBASE_MESSAGING_SENDER_ID
   FIREBASE_APP_ID
   GOOGLE_INDEXING_EMAIL
   GOOGLE_INDEXING_PRIVATE_KEY
   DEPLOY_WEBHOOK_URL
   WEATHER_API_KEY
   UNSPLASH_ACCESS_KEY
   ```

3. **Enable GitHub Actions**:
   - Go to "Actions" tab in your repo
   - Click "I understand my workflows, go ahead and enable them"

4. **Done!** Articles will publish automatically:
   - Every 2 hours (12 times per day)
   - 2-3 articles per run
   - ~30 articles per day total

### Manual Trigger

You can also trigger manually:
1. Go to "Actions" tab
2. Click "Auto Publish Articles"
3. Click "Run workflow"
4. Choose how many articles to publish

### Schedule Options

Edit `.github/workflows/auto-publish.yml` to change frequency:

```yaml
# Every hour
- cron: '0 * * * *'

# Every 2 hours (current)
- cron: '0 */2 * * *'

# Every 4 hours
- cron: '0 */4 * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Twice a day (9 AM and 9 PM)
- cron: '0 9,21 * * *'
```

## Option 2: Vercel Cron Jobs (Paid)

Vercel Pro plan ($20/month) includes cron jobs.

### Setup:
1. Upgrade to Vercel Pro
2. Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/auto-publish",
       "schedule": "0 */2 * * *"
     }]
   }
   ```
3. Create API endpoint at `src/pages/api/auto-publish.ts`

## Option 3: Cloud Functions (Firebase/AWS)

Deploy automation as serverless function.

### Firebase Functions:
```bash
firebase init functions
# Deploy automation code
firebase deploy --only functions
```

### AWS Lambda:
- Package automation code
- Deploy to Lambda
- Set CloudWatch trigger

## Option 4: Keep Computer Running (Not Recommended)

If you must run locally:

```bash
# Run continuously
npm run automation

# Or use PM2 for auto-restart
npm install -g pm2
pm2 start automation/index.js --name mershal-automation
pm2 save
pm2 startup
```

## Testing

Test the auto-publish script locally:

```bash
# Publish 1 article
npm run auto:publish 1

# Publish 3 articles
npm run auto:publish 3
```

## Monitoring

### GitHub Actions:
- Go to "Actions" tab to see all runs
- Check logs for each run
- Get email notifications on failures

### Logs:
- Each run shows:
  - Articles generated
  - Firestore saves
  - Deployment triggers
  - Google indexing submissions

## Cost Comparison

| Option | Cost | Reliability | Setup |
|--------|------|-------------|-------|
| GitHub Actions | FREE | ⭐⭐⭐⭐⭐ | Easy |
| Vercel Cron | $20/mo | ⭐⭐⭐⭐⭐ | Easy |
| Firebase Functions | ~$5/mo | ⭐⭐⭐⭐ | Medium |
| AWS Lambda | ~$3/mo | ⭐⭐⭐⭐ | Hard |
| Local Computer | $0 | ⭐⭐ | Easy |

## Recommended: GitHub Actions

**Why?**
- ✅ Completely free
- ✅ No computer needed
- ✅ Runs 24/7 reliably
- ✅ Easy to monitor
- ✅ Can trigger manually
- ✅ Email notifications
- ✅ 2,000 minutes/month free (plenty for this)

**Each run uses ~2 minutes**, so:
- 12 runs per day = 24 minutes/day
- 30 days = 720 minutes/month
- Well within free tier!

## Next Steps

1. Push the workflow file to GitHub
2. Add secrets to GitHub repo
3. Enable GitHub Actions
4. Watch articles publish automatically!

Your news platform is now fully automated! 🎉
