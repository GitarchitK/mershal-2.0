# Article Thumbnail Setup

Your articles now automatically get relevant, high-quality thumbnails!

## How It Works

When you generate an article, the system:
1. Extracts keywords from the article topic
2. Searches for relevant images on Unsplash
3. Returns a high-quality, royalty-free image
4. Falls back to category-specific images if search fails

## Get Unsplash API Key (Free)

### Step 1: Create Unsplash Account
1. Go to https://unsplash.com/join
2. Sign up for a free account

### Step 2: Create Application
1. Go to https://unsplash.com/oauth/applications
2. Click "New Application"
3. Accept the terms
4. Fill in application details:
   - Application name: `Mershal News`
   - Description: `Automated news platform`
5. Click "Create application"

### Step 3: Get Access Key
1. On your application page, find "Keys" section
2. Copy the "Access Key"
3. Add to your `.env` file:
   ```
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
4. Add to Vercel environment variables

### Step 4: Test It
```bash
npm run publish
```

Generate an article and check if it has a relevant thumbnail!

## Free Tier Limits

Unsplash free tier includes:
- 50 requests per hour
- Unlimited images
- No attribution required (but appreciated)
- High-quality, royalty-free images

With 30 articles per day, you'll use about 30 requests per day, well within limits!

## Fallback Images

If Unsplash API is not configured or fails, the system uses category-based fallback images:

- **Sports**: Stadium/sports action
- **Technology**: Tech/coding imagery
- **Business**: Office/business scenes
- **Politics**: Government buildings
- **Entertainment**: Stage/performance
- **World**: Global/travel imagery
- **IPL/Cricket**: Cricket action shots

All fallback images are from Unsplash's free collection.

## Custom Images

Want to use your own images? You can:

1. Upload to Firebase Storage
2. Use your own CDN
3. Modify `generateThumbnail()` in `automation/utils/ai-generator.js`

## Image Specifications

All thumbnails are:
- **Size**: 1200x630px (optimal for social sharing)
- **Format**: JPEG/WebP
- **Orientation**: Landscape
- **Quality**: High resolution
- **Optimized**: For web performance

## Testing Without API Key

The system works without an Unsplash API key! It will use category-based fallback images automatically.

To test:
```bash
npm run publish
```

Articles will have beautiful, relevant images even without the API key.

## Troubleshooting

### Images not loading?
- Check if `UNSPLASH_ACCESS_KEY` is set
- Verify API key is valid
- Check Unsplash dashboard for rate limits
- Fallback images should still work

### Want different images?
- Modify keywords in `generateThumbnail()` function
- Change fallback image URLs
- Use different image service (Pexels, Pixabay, etc.)

## Advanced: Use AI Image Generation

Want AI-generated images instead? You can integrate:
- **DALL-E 3** (OpenAI) - $0.04 per image
- **Stable Diffusion** (Stability AI) - Free/paid
- **Midjourney** (via API) - Subscription

Modify `generateThumbnail()` to call these services instead of Unsplash.

---

**Current Status**: Thumbnails working with category-based fallbacks ✅
**Optional**: Add Unsplash API key for topic-specific images
