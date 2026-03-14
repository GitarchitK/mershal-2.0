export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
  wordCount: number;
  status: 'published' | 'draft';
  views?: number;
}

export interface IPLMatch {
  id: string;
  team1: string;
  team2: string;
  team1Code: string;
  team2Code: string;
  matchDate: Date;
  venue: string;
  matchNumber: number;
  season: number;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  winner?: string;
}

export interface IPLTeam {
  id: string;
  name: string;
  code: string;
  slug: string;
  logo: string;
  captain: string;
  homeGround: string;
}

export interface IPLPlayer {
  id: string;
  name: string;
  slug: string;
  team: string;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
  nationality: string;
  image: string;
}

export type Category = 
  | 'sports' 
  | 'technology' 
  | 'business' 
  | 'politics' 
  | 'entertainment' 
  | 'world'
  | 'ipl'
  | 'cricket';
