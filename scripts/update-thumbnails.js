import { getFirestore } from '../automation/utils/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

// Category-based fallback images
const categoryImages = {
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=630&fit=crop',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop',
  business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop',
  politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=630&fit=crop',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=630&fit=crop',
  world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=630&fit=crop',
  ipl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=630&fit=crop',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=630&fit=crop',
};

async function updateThumbnails() {
  console.log('🖼️  Updating article thumbnails...\n');
  
  const db = getFirestore();
  
  try {
    // Fetch all published posts without featuredImage
    const snapshot = await db
      .collection('posts')
      .where('status', '==', 'published')
      .get();
    
    console.log(`Found ${snapshot.size} articles\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Skip if already has featuredImage
      if (data.featuredImage) {
        console.log(`⏭️  Skipping: ${data.title} (already has image)`);
        skipped++;
        continue;
      }
      
      // Get category-based image
      const category = data.category?.toLowerCase() || 'world';
      const featuredImage = categoryImages[category] || categoryImages.world;
      
      // Update document
      await doc.ref.update({
        featuredImage,
        updatedAt: new Date()
      });
      
      console.log(`✅ Updated: ${data.title}`);
      console.log(`   Image: ${featuredImage}\n`);
      updated++;
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} articles`);
    console.log(`   ⏭️  Skipped: ${skipped} articles`);
    console.log('\n✨ Done! All articles now have thumbnails.');
    
  } catch (error) {
    console.error('❌ Error updating thumbnails:', error);
    process.exit(1);
  }
}

updateThumbnails();
