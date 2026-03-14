# Mershal News Portal - Setup Guide

## ✅ Current Status

The development server is running successfully at **http://localhost:4321/**

## 🚀 Quick Start

The project is already set up with mock data, so you can start developing immediately without Firebase configuration.

### View the Site

Open your browser and visit:
- **Home Page**: http://localhost:4321/
- **Category Pages**: 
  - http://localhost:4321/kolkata
  - http://localhost:4321/bangladesh
  - http://localhost:4321/videos
- **Article Detail**: http://localhost:4321/news/1

## 🔧 Development Commands

```bash
# Start development server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔥 Firebase Configuration (Optional)

Currently, the site uses mock data. To connect to Firebase:

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create a new project named "Mershal"
   - Enable Firestore Database
   - Enable Storage

2. **Get Firebase Credentials**
   - Go to Project Settings > General
   - Copy your Firebase config
   - Go to Project Settings > Service Accounts
   - Generate new private key (downloads JSON file)

3. **Update .env File**
   Edit `mershal/.env` with your actual Firebase credentials:
   ```env
   FIREBASE_API_KEY=your_actual_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. **Seed Sample Data**
   ```bash
   # Place your service-account.json in the root
   npm run seed
   ```

5. **Restart Development Server**
   The site will automatically use Firebase data instead of mock data.

## 🌤️ Weather API Configuration (Optional)

The site displays real-time weather for Kolkata using WeatherAPI.com:

1. **Get Free API Key**
   - Visit https://www.weatherapi.com/signup.aspx
   - Sign up for a free account (1 million calls/month)
   - Copy your API key from the dashboard

2. **Add to .env File**
   Edit `mershal/.env`:
   ```env
   WEATHER_API_KEY=your_weatherapi_key_here
   ```

3. **Restart Development Server**
   The weather widget will now show real-time data. Without the API key, it falls back to mock data.

## 📁 Project Structure

```
mershal/
├── src/
│   ├── components/       # UI components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── NewsCard.astro
│   │   └── BottomNav.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/            # Routes (SSR)
│   │   ├── index.astro   # Home page
│   │   ├── [category].astro  # Category pages
│   │   ├── news/[id].astro   # Article detail
│   │   └── api/
│   │       └── articles.ts   # REST API
│   ├── lib/
│   │   ├── firebase.ts       # Client SDK
│   │   └── firebase-admin.ts # Admin SDK
│   └── types/
│       └── news.ts
└── public/               # Static assets
```

## 🎨 Customization

### Change Branding Colors
Edit `mershal/src/components/Header.astro` and other components to change the red color scheme.

### Add More Categories
Edit the `categories` array in `mershal/src/components/Header.astro`:
```javascript
const categories = [
  { name: 'হোম', slug: '/' },
  { name: 'নতুন বিভাগ', slug: '/new-category' },
  // Add more...
];
```

### Modify Layout
Edit `mershal/src/layouts/Layout.astro` to change the overall page structure.

## 📱 Mobile View

The site is mobile-first with a bottom navigation bar. Test it by:
1. Opening DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device

## 🌐 Deployment

### Deploy to Vercel
```bash
npm run build
vercel deploy
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod
```

## 🐛 Troubleshooting

### Port Already in Use
If port 4321 is busy:
```bash
npm run dev -- --port 3000
```

### Firebase Errors
If you see Firebase errors, the site will automatically fall back to mock data. This is normal during development.

## 📝 Next Steps

1. ✅ Development server is running
2. ⏳ Configure Firebase (optional)
3. ⏳ Customize design and content
4. ⏳ Add more features
5. ⏳ Deploy to production

## 🆘 Need Help?

- Check the README.md for more details
- Review the code comments
- Test the API at http://localhost:4321/api/articles

---

**Happy Coding! 🎉**
