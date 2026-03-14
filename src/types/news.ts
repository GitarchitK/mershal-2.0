export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  publishedAt: Date;
  views: number;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
