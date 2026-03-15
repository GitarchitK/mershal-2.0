import { getFirestore } from '../automation/utils/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

// Proper category-based fallback images
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

async function fixImageUrls() {
  console.log('🔧 Fixing article image URLs...\n');
  
  const db = getFirestore();
  
  try {
    const snapshot = await db
      .collection('posts')
      .where('status', '==', 'published')
      .get();
    
    console.log(`Found ${snapshot.size} articles\n`);
    
    let fixed = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const currentImage = data.featuredImage || '';
      
      // Check if image URL is incomplete or invalid
      const needsFix = !currentImage || 
                       currentImage.includes('?w=800') || 
                       !currentImage.includes('w=1200&h=630');
      
      if (needsFix) {
        const category = data.category?.toLowerCase() || 'world';
        const newImage = categoryImages[category] || categoryImages.world;
        
        await doc.ref.update({
          featuredImage: newImage,
          updatedAt: new Date()
        });
        
        console.log(`✅ Fixed: ${data.title}`);
        console.log(`   Old: ${currentImage}`);
        console.log(`   New: ${newImage}\n`);
        fixed++;
      } else {
        console.log(`⏭️  OK: ${data.title}`);
      }
    }
    
    console.log(`\n📊 Summary: Fixed ${fixed} articles`);
    console.log('✨ Done! All images now have proper URLs.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixImageUrls();
