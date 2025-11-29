
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Gemini Setup
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing in environment variables!");
} else {
    console.log(`API_KEY loaded: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
}
const ai = new GoogleGenAI({ apiKey: apiKey });

// Models
const Post = require('./models/Post');
const Account = require('./models/Account');

// --- BACKGROUND SCHEDULER SERVICE ---
const SCHEDULER_INTERVAL = 60000; // Check every 1 minute

const uploadToPlatform = async (post) => {
    console.log(`[Worker] Uploading post ${post._id} to ${post.platform}...`);

    // Simulate network delay (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    try {
        // In a real app, you'd fetch tokens from the Account model
        const account = await Account.findOne({ platform: post.platform, connected: true });

        if (!account) {
            throw new Error(`No connected account found for ${post.platform}`);
        }

        console.log(`[Mock ${post.platform} API] Using token ${account.accessToken.substring(0, 5)}...`);
        console.log(`[Mock ${post.platform} API] Posted: ${post.content}`);
        return true;
    } catch (e) {
        console.error(`[Worker] Upload Failed: ${e.message}`);
        return false;
    }
};

const runScheduler = async () => {
    try {
        const now = new Date();
        const duePosts = await Post.find({
            status: 'Scheduled',
            scheduledDate: { $lte: now }
        });

        if (duePosts.length > 0) {
            console.log(`[Worker] Found ${duePosts.length} posts due for publication.`);
        }

        for (const post of duePosts) {
            const success = await uploadToPlatform(post);
            if (success) {
                post.status = 'Published';
                await post.save();
                console.log(`[Worker] Post ${post._id} marked as Published.`);
            } else {
                post.status = 'Failed';
                await post.save();
            }
        }
    } catch (e) {
        console.error("Scheduler Error:", e);
    }
};

setInterval(runScheduler, SCHEDULER_INTERVAL);
console.log('[Worker] Scheduler service started.');


// --- Routes ---

// POSTS API
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ACCOUNTS API
app.get('/api/accounts', async (req, res) => {
    try {
        let accounts = await Account.find();
        if (accounts.length === 0) {
            // Seed default accounts if none exist
            const defaults = [
                { platform: 'Instagram', connected: false },
                { platform: 'Twitter', connected: false },
                { platform: 'LinkedIn', connected: false },
                { platform: 'Facebook', connected: false },
            ];
            accounts = await Account.insertMany(defaults);
        }
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/accounts/connect', async (req, res) => {
    const { id, handle } = req.body;
    try {
        // In a real app, we would exchange the 'code' (if provided) for an access token here.
        // For this mock, we generate a token.
        const account = await Account.findByIdAndUpdate(id, {
            connected: true,
            handle: handle,
            lastSync: 'Just now',
            accessToken: `mock_token_${Math.random().toString(36).substring(7)}`
        }, { new: true });

        const allAccounts = await Account.find();
        res.json(allAccounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/accounts/disconnect', async (req, res) => {
    const { id } = req.body;
    try {
        await Account.findByIdAndUpdate(id, {
            connected: false,
            handle: '',
            lastSync: null,
            accessToken: ''
        });
        const allAccounts = await Account.find();
        res.json(allAccounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// AI Generation Endpoint
app.post('/api/ai/generate', async (req, res) => {
    const { topic, platform, tone, variantsCount } = req.body;

    try {
        const prompt = `Generate ${variantsCount || 1} social media posts for ${platform} about "${topic}" with a ${tone} tone. Return JSON.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Image Generation Endpoint
app.post('/api/ai/image', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt,
        });
        // Extract base64 logic would go here, returning mock for now if undefined
        res.json({ success: true, data: "base64_string_placeholder" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Auto-Pilot Endpoint
app.post('/api/automation/run', async (req, res) => {
    try {
        // 1. Get Trends
        const trendPrompt = `Identify 3 top trending topics in Marketing. Return JSON list.`;
        const trendRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: trendPrompt,
            config: { responseMimeType: "application/json" }
        });

        let trends = [];
        try {
            trends = JSON.parse(trendRes.text);
        } catch (e) {
            trends = [{ topic: 'AI Marketing' }, { topic: 'SEO Tips' }, { topic: 'Brand Storytelling' }];
        }

        const createdPosts = [];

        // 2. Generate Posts for Trends
        for (const trend of trends) {
            const contentPrompt = `Write a professional LinkedIn post about ${trend.topic || trend}`;
            const contentRes = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contentPrompt,
            });

            const newPost = new Post({
                platform: 'LinkedIn',
                content: contentRes.text,
                status: 'Scheduled',
                scheduledDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // Tomorrow
            });
            await newPost.save();
            createdPosts.push(newPost);
        }

        res.json({ success: true, posts: createdPosts });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Auth Endpoints (Real OAuth)
const axios = require('axios');

// Helper to get OAuth URL
const getOAuthUrl = (platform) => {
    if (platform === 'Twitter') {
        const rootUrl = 'https://twitter.com/i/oauth2/authorize';
        const options = {
            response_type: 'code',
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: 'http://localhost:5000/api/auth/twitter/callback',
            scope: 'tweet.read tweet.write users.read',
            state: 'state',
            code_challenge: 'challenge',
            code_challenge_method: 'plain'
        };
        const qs = new URLSearchParams(options).toString();
        return `${rootUrl}?${qs}`;
    } else if (platform === 'LinkedIn') {
        const rootUrl = 'https://www.linkedin.com/oauth/v2/authorization';
        const options = {
            response_type: 'code',
            client_id: process.env.LINKEDIN_CLIENT_ID,
            redirect_uri: 'http://localhost:5000/api/auth/linkedin/callback',
            scope: 'w_member_social r_liteprofile',
            state: 'state'
        };
        const qs = new URLSearchParams(options).toString();
        return `${rootUrl}?${qs}`;
    }
    return null;
};

app.get('/api/auth/:platform', (req, res) => {
    const { platform } = req.params;
    const url = getOAuthUrl(platform);
    if (url) {
        res.json({ url });
    } else {
        res.status(400).json({ error: 'Unsupported platform' });
    }
});

app.get('/api/auth/:platform/callback', async (req, res) => {
    const { platform } = req.params;
    const { code } = req.query;

    try {
        let accessToken = '';
        let handle = '';

        if (platform === 'twitter') {
            // Exchange code for token (Twitter)
            // Note: In a real app, you'd use Basic Auth with Client ID & Secret
            const tokenRes = await axios.post('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: 'http://localhost:5000/api/auth/twitter/callback',
                code_verifier: 'challenge'
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            accessToken = tokenRes.data.access_token;
            handle = '@RealTwitterUser'; // In real app, fetch from /2/users/me
        } else if (platform === 'linkedin') {
            // Exchange code for token (LinkedIn)
            const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: 'http://localhost:5000/api/auth/linkedin/callback',
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            accessToken = tokenRes.data.access_token;
            handle = '@RealLinkedInUser'; // In real app, fetch from /v2/me
        }

        // Update DB
        // For simplicity, we update the first matching platform account or create one
        await Account.findOneAndUpdate(
            { platform: platform.charAt(0).toUpperCase() + platform.slice(1) },
            {
                connected: true,
                accessToken,
                handle,
                lastSync: new Date().toISOString()
            },
            { upsert: true, new: true }
        );

        // Redirect back to frontend
        res.redirect('http://localhost:3000/#/connections?status=success');

    } catch (error) {
        console.error("OAuth Error:", error.response?.data || error.message);
        res.redirect('http://localhost:3000/#/connections?status=error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
