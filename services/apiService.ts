import { Post, SocialAccount } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ApiService = {
  getPosts: async (): Promise<Post[]> => {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  savePost: async (post: Post): Promise<Post> => {
    // Check if post has an ID (update) or not (create)
    // Note: MongoDB uses _id, but our client app uses id. We might need to handle this mapping.
    // For now, let's assume if it has a valid MongoDB ObjectId-like ID, it's an update.
    // But our client generates timestamp-based IDs for new posts initially.

    // Strategy: If we are "scheduling" a new post from Generator, we POST.
    // If we are updating status, we PUT.

    // Ideally, the backend should handle ID generation.
    // Let's try to POST if it looks like a new post (or we can check if it exists).

    // Simplified: Always POST for new creation, PUT for updates.
    // But the client code calls savePost for both.

    // Let's check if the ID exists in the DB (or just try PUT and fallback to POST? No, that's inefficient).
    // Better: The client should know if it's creating or updating.
    // Existing client code generates an ID: Date.now().toString().

    // We'll treat it as a CREATE if it doesn't have a MongoDB-style _id (24 hex chars), 
    // OR just use POST for everything and let backend handle? No.

    // Let's assume if we are saving, we are creating unless we explicitly know it's an update.
    // Actually, looking at the usage, savePost is used for "Schedule" (Create) and "Update Status" (Update).

    // For this refactor, let's try to detect.
    // If the ID is long (MongoDB ObjectId), it's likely an update.
    // If it's short (Date.now()), it's a new post.

    const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (post.id && isMongoId(post.id)) {
      const response = await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    } else {
      // Create new
      const { id, ...postData } = post; // Remove client-generated ID, let Mongo generate _id
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      const newPost = await response.json();
      return { ...newPost, id: newPost._id }; // Map _id to id
    }
  },

  deletePost: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete post');
  },

  getAccounts: async (): Promise<SocialAccount[]> => {
    const response = await fetch(`${API_URL}/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const accounts = await response.json();
    return accounts.map((acc: any) => ({ ...acc, id: acc._id })); // Map _id to id
  },

  connectAccount: async (id: string, handle: string): Promise<SocialAccount[]> => {
    const response = await fetch(`${API_URL}/accounts/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, handle })
    });
    if (!response.ok) throw new Error('Failed to connect account');
    const accounts = await response.json();
    return accounts.map((acc: any) => ({ ...acc, id: acc._id }));
  },

  disconnectAccount: async (id: string): Promise<SocialAccount[]> => {
    const response = await fetch(`${API_URL}/accounts/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to disconnect account');
    const accounts = await response.json();
    return accounts.map((acc: any) => ({ ...acc, id: acc._id }));
  }
};
