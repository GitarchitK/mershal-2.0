# Mershal News Portal

A modern news portal built with Astro SSR and Firebase backend.

## Features

- Server-Side Rendering (SSR) with Astro
- Firebase Firestore for data storage
- Firebase Storage for media files
- Responsive design with Tailwind CSS
- Category-based news organization
- Mobile-first design with bottom navigation
- Article detail pages with related content
- REST API endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Storage
   - Create a service account for Admin SDK
   - Copy `.env.example` to `.env` and fill in your Firebase credentials

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Project Structure

```
mershal/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── NewsCard.astro
│   │   └── BottomNav.astro
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro
│   ├── pages/           # Routes
│   │   ├── index.astro
│   │   ├── [category].astro
│   │   ├── news/
│   │   │   └── [id].astro
│   │   └── api/
│   │       └── articles.ts
│   ├── lib/             # Utilities
│   │   ├── firebase.ts
│   │   └── firebase-admin.ts
│   └── types/           # TypeScript types
│       └── news.ts
└── public/              # Static assets
```

## Firebase Collections

### articles
```typescript
{
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  publishedAt: Timestamp;
  views: number;
  featured: boolean;
}
```

## API Endpoints

- `GET /api/articles` - Fetch articles (supports ?category=X&limit=Y)
- `POST /api/articles` - Create new article

## Deployment

Deploy to Vercel, Netlify, or any Node.js hosting platform that supports SSR.

For Vercel:
```bash
npm run build
vercel deploy
```

## License

MIT
