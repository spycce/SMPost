
import { Post, SocialAccount, Platform } from '../types';

const POSTS_KEY = 'socialai_posts';
const ACCOUNTS_KEY = 'socialai_accounts';

// clean slate: no pre-connected accounts
const DEFAULT_ACCOUNTS: SocialAccount[] = [
  { id: '1', platform: Platform.Instagram, handle: '', connected: false, avatar: '' },
  { id: '2', platform: Platform.Twitter, handle: '', connected: false, avatar: '' },
  { id: '3', platform: Platform.LinkedIn, handle: '', connected: false, avatar: '' },
  { id: '4', platform: Platform.Facebook, handle: '', connected: false, avatar: '' },
];

export const MockBackend = {
  getPosts: async (): Promise<Post[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(POSTS_KEY);
        // Return empty array if nothing stored, no fake data
        resolve(stored ? JSON.parse(stored) : []);
      }, 500);
    });
  },

  savePost: async (post: Post): Promise<Post> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(POSTS_KEY);
        const posts: Post[] = stored ? JSON.parse(stored) : [];
        // If post exists, update it, otherwise add it
        const existingIndex = posts.findIndex(p => p.id === post.id);
        if (existingIndex >= 0) {
            posts[existingIndex] = post;
        } else {
            posts.unshift(post);
        }
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        resolve(post);
      }, 600);
    });
  },

  deletePost: async (id: string): Promise<void> => {
    const stored = localStorage.getItem(POSTS_KEY);
    if(stored) {
        const posts: Post[] = JSON.parse(stored);
        const filtered = posts.filter(p => p.id !== id);
        localStorage.setItem(POSTS_KEY, JSON.stringify(filtered));
    }
  },

  getAccounts: async (): Promise<SocialAccount[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const stored = localStorage.getItem(ACCOUNTS_KEY);
            resolve(stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS);
        }, 300);
    })
  },
  
  // Simulate OAuth connection
  connectAccount: async (id: string, handle: string): Promise<SocialAccount[]> => {
     const stored = localStorage.getItem(ACCOUNTS_KEY);
     let accounts: SocialAccount[] = stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS;
     
     accounts = accounts.map(acc => {
         if (acc.id === id) {
             return {
                 ...acc,
                 connected: true,
                 handle: handle,
                 lastSync: 'Just now',
                 accessToken: `mock_token_${Math.random().toString(36).substring(7)}`
             };
         }
         return acc;
     });
     
     localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
     return accounts;
  },

  disconnectAccount: async (id: string): Promise<SocialAccount[]> => {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    let accounts: SocialAccount[] = stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS;
    
    accounts = accounts.map(acc => {
        if (acc.id === id) {
            return {
                ...acc,
                connected: false,
                handle: '',
                lastSync: undefined,
                accessToken: undefined
            };
        }
        return acc;
    });
    
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return accounts;
 }
};
