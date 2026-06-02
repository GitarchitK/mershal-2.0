import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getFirestore } from '../automation/utils/firebase.js';

dotenv.config();

const db = getFirestore();
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'articles');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function downloadImage(url, slug) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 15000
    });
    
    if (!res.ok) {
      console.warn(`      ⚠️ Failed to download image from ${url}: Status ${res.status}`);
      return null;
    }
    
    const contentType = res.headers.get('content-type') || '';
    let ext = 'jpg';
    if (contentType.includes('image/png')) ext = 'png';
    else if (contentType.includes('image/webp')) ext = 'webp';
    else if (contentType.includes('image/gif')) ext = 'gif';
    else if (contentType.includes('image/jpeg')) ext = 'jpg';
    
    const filename = `${slug}.${ext}`;
    const destPath = path.join(IMAGES_DIR, filename);
    
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    
    console.log(`      ✓ Saved local image: /images/articles/${filename}`);
    return `/images/articles/${filename}`;
  } catch (error) {
    console.error(`      ❌ Error downloading image for ${slug}:`, error.message);
    return null;
  }
}

async function processCollection(collectionName) {
  console.log(`\n📚 Scanning collection '${collectionName}'...`);
  const snapshot = await db.collection(collectionName).get();
  console.log(`   Found ${snapshot.size} documents.`);
  
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const slug = data.slug || doc.id;
    const featuredImage = data.featured_image || data.featuredImage || '';
    
    // If it's a remote URL, download and store locally
    if (featuredImage && (featuredImage.startsWith('http://') || featuredImage.startsWith('https://'))) {
      console.log(`   👉 Downloading remote image for article: "${data.title}"`);
      const localPath = await downloadImage(featuredImage, slug);
      if (localPath) {
        await doc.ref.update({
          featured_image: localPath,
          featuredImage: localPath, // keep both fields in sync
          updated_date: new Date()
        });
        count++;
      }
    }
  }
  console.log(`   Processed ${count} remote images in '${collectionName}'.`);
}

async function main() {
  try {
    await processCollection('articles');
    await processCollection('posts');
    console.log('\n✨ Local image sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Local image sync failed:', error);
    process.exit(1);
  }
}

main();
