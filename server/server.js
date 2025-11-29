
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

// In a real app, import 'bull' or 'node-cron' here
// const cron = require('node-cron'); 

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Gemini Setup
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const Post = require('./models/Post');
const User = require('./models/User');

// --- BACKGROUND SCHEDULER SERVICE ---
// This loop simulates a worker checking for posts ready to publish
// In production, run this in a separate worker process or use BullMQ
const SCHEDULER_INTERVAL = 60000; // Check every 1 minute

const uploadToPlatform = async (post, userTokens) => {
    console.log(`[Worker] Uploading post ${post._id} to ${post.platform}...`);
    
    try {
        switch(post.platform) {
            case 'Twitter':
                // const client = new TwitterApi(userTokens.twitter);
                // await client.v2.tweet(post.content);
                console.log(`[Mock Twitter API] Posted: ${post.content}`);
                break;
            case 'LinkedIn':
                // const client = new LinkedInApi(userTokens.linkedin);
                // await client.posts.create({ ... });
                console.log(`[Mock LinkedIn API] Posted: ${post.content}`);
                break;
            case 'Instagram':
                // await instaClient.publishPhoto({ ... });
                console.log(`[Mock Instagram API] Posted Image & Caption`);
                break;
            case 'Facebook':
                 console.log(`[Mock Facebook API] Posted Status`);
                 break;
        }
        return true;
    } catch (e) {
        console.error(`[Worker] Upload Failed: ${e.message}`);
        return false;
    }
};

const runScheduler = async () => {
    try {
        const now = new Date();
        // Find posts that are Scheduled and due (time has passed)
        const duePosts = await Post.find({
            status: 'Scheduled',
            scheduledDate: { $lte: now }
        }).populate('userId');

        if (duePosts.length > 0) {
            console.log(`[Worker] Found ${duePosts.length} posts due for publication.`);
        }

        for (const post of duePosts) {
            // Mock fetching user tokens from DB
            // const user = await User.findById(post.userId);
            // const tokens = user.socialTokens;
            
            const success = await uploadToPlatform(post, {});
            
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

// Start the scheduler loop
setInterval(runScheduler, SCHEDULER_INTERVAL);
console.log('[Worker] Scheduler service started.');


// --- Routes ---

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

// Auto-Pilot Endpoint (Manual Trigger from Dashboard)
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
            // Fallback
            trends = [{topic: 'AI Marketing'}, {topic: 'SEO Tips'}, {topic: 'Brand Storytelling'}];
        }

        const createdPosts = [];

        // 2. Generate Posts for Trends
        for (const trend of trends) {
            // Mock Content Generation
            const contentPrompt = `Write a professional LinkedIn post about ${trend.topic || trend}`;
            const contentRes = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contentPrompt,
            });
            
            const newPost = new Post({
                userId: new mongoose.Types.ObjectId(), // Mock user ID
                platform: 'LinkedIn',
                content: contentRes.text,
                status: 'Scheduled',
                scheduledDate: new Date(new Date().getTime() + 24*60*60*1000) // Tomorrow
            });
            // await newPost.save(); // Uncomment to save to real DB
            createdPosts.push(newPost);
        }

        res.json({ success: true, posts: createdPosts });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// Social Connections
app.get('/api/connections', (req, res) => {
    res.json([
        { platform: 'Instagram', connected: false },
        { platform: 'Twitter', connected: false }
    ]);
});

// Billing Endpoints
app.post('/api/billing/subscribe', (req, res) => {
    res.json({ success: true, subscriptionId: "sub_123" });
});

// Auth Endpoints (Stub)
app.post('/api/auth/login', (req, res) => {
    res.json({ token: "mock_jwt_token", user: { name: "Demo User" } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
