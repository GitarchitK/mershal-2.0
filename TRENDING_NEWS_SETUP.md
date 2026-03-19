# Trending News Integration

This system fetches trending headlines from top international news sources and generates original articles based on those topics.

## How It Works

1. **Fetches Headlines** from:
   - BBC News
   - CNN
   - Reuters
   - Al Jazeera English
   - The New York Times
   - The Guardian
   - The Washington Post
   - Bloomberg
   - TechCrunch
   - ESPN

2. **Generates Original Content**: The AI writes a completely new article about the topic (NOT copying the original)

3. **Legal & Ethical**: 
   - ✅ Uses only headlines/topics (not full articles)
   - ✅ Generates 100% original content
   - ✅ AdSense-safe
   - ✅ No copyright issues

## Setup

### 1. Get NewsAPI Key (Free)

1. Go to https://newsapi.org/register
2. Sign up for free account (500 requests/day)
3. Copy your API key

### 2. Add to Environment Variables

Add to your `.env` file:
```env
NEWS_API_KEY=your_api_key_here
```

Add to GitHub Secrets:
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NEWS_API_KEY`
4. Value: Your API key

### 3. Enable Trending Mode

**Option A: Always use trending topics**

Update `.env`:
```env
USE_TRENDING=true
```

**Option B: Use trending via command line**

```bash
# Use trending topics
node automation/auto-publish.js 2 --trending

# Use custom topics (default)
node automation/auto-publish.js 2
```

### 4. Update GitHub Actions Workflow

Edit `.github/workflows/auto-publish.yml`:

```yaml
- name: Publish articles
  env:
    NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
    USE_TRENDING: true  # Add this line
  run: node automation/auto-publish.js 2
```

## Testing Locally

```bash
# Test trending topics fetch
node automation/utils/trending.js

# Publish 1 article using trending topics
node automation/auto-publish.js 1 --trending
```

## How Articles Are Generated

1. System fetches 100 latest headlines from top sources
2. Picks a random headline
3. AI generates a completely NEW article about that topic:
   - Different angle
   - Original research
   - Professional journalism style
   - 1000-1200 words
   - Proper attribution

## Example

**Original Headline (BBC):**
"Tesla announces new Cybertruck production facility"

**Generated Article:**
- Completely rewritten
- Different perspective
- Additional context
- Expert analysis
- Original content

## Benefits

- ✅ Always covers trending topics
- ✅ 100% original content
- ✅ AdSense-safe
- ✅ SEO-friendly (trending keywords)
- ✅ Professional quality
- ✅ Legal and ethical

## Limitations

- Free tier: 500 requests/day (enough for 250 articles)
- Headlines only (no full article access)
- 24-hour delay on some sources

## Troubleshooting

**"No trending topics found"**
- Check NEWS_API_KEY is set correctly
- Verify API key is active at newsapi.org
- Check API quota (500/day on free tier)

**"Using custom topics"**
- This is normal fallback behavior
- System will use topics.js if NewsAPI fails
