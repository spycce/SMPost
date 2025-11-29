
export enum Platform {
  Instagram = 'Instagram',
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
  Facebook = 'Facebook'
}

export enum Tone {
  Professional = 'Professional',
  Funny = 'Funny',
  Trendy = 'Trendy',
  Motivational = 'Motivational',
  Educational = 'Educational',
  Empathetic = 'Empathetic',
  Sales = 'Sales-driven'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Pro' | 'Agency';
  role: 'Admin' | 'Editor' | 'Viewer';
}

export interface BrandVoice {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export interface GeneratedContent {
  text: string;
  hashtags: string[];
  imageUrl?: string;
  imagePrompt?: string;
  score?: number;
  critique?: string;
  variants?: string[]; // For A/B/C testing
}

export interface Post {
  id: string;
  platform: Platform;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  scheduledDate?: string; // ISO string
  status: 'Draft' | 'Scheduled' | 'Published' | 'Failed';
  createdAt: string;
  hashtags: string[];
  engagementScore?: number;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  connected: boolean;
  avatar: string;
  lastSync?: string;
  accessToken?: string; // Simulates the auth token
}

export interface Trend {
  topic: string;
  volume: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  relevance: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export interface SubscriptionDetails {
  planId: string;
  status: 'active' | 'past_due' | 'canceled';
  nextBillingDate: string;
  paymentMethod: string;
}
