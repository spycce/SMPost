
import { Platform, Tone, Plan } from './types';

export const PLATFORM_ICONS: Record<Platform, string> = {
  [Platform.Instagram]: '📸',
  [Platform.Twitter]: '🐦',
  [Platform.LinkedIn]: '💼',
  [Platform.Facebook]: '📘',
};

export const TONE_OPTIONS = Object.values(Tone);
export const PLATFORM_OPTIONS = Object.values(Platform);

// UI Display mock user (since we don't have full auth backend active in browser)
export const MOCK_USER = {
  id: 'u_123',
  name: 'Alex Marketer',
  email: 'alex@agency.com',
  avatar: 'https://picsum.photos/id/64/100/100',
  plan: 'Agency'
};

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    features: ['5 AI Posts/mo', '1 Social Account', 'Basic Analytics']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    features: ['50 AI Posts/mo', '5 Social Accounts', 'Advanced Analytics', 'Trend Scanner'],
    recommended: true
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 99,
    features: ['Unlimited AI Posts', 'Unlimited Accounts', 'White-label Reports', 'API Access', 'Team Seats']
  }
];
