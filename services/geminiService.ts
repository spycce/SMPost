
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, Platform, Tone, Post } from '../types';
import { MockBackend } from "./mockBackend";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

// Helper to check key
const checkKey = () => {
    if (!apiKey) throw new Error("API Key missing. Please set process.env.API_KEY");
}

export const generatePostContent = async (
  topic: string,
  platform: Platform,
  tone: Tone,
  includeEmoji: boolean,
  brandVoice?: string,
  variantsCount: number = 1
): Promise<GeneratedContent> => {
  checkKey();

  const systemInstruction = brandVoice 
    ? `You are an expert social media manager. Adopt the following Brand Voice: "${brandVoice}".`
    : "You are an expert social media manager.";

  const prompt = `
    Generate ${variantsCount} post variation(s) for ${platform}.
    Topic: ${topic}
    Tone: ${tone}
    Include Emojis: ${includeEmoji}

    If requesting multiple variants, provide distinctly different angles (e.g., one question-based, one story-based, one value-based).

    Return JSON:
    {
      "text": "The main best option",
      "variants": ["variant 1", "variant 2", "variant 3"],
      "hashtags": ["tag1", "tag2"],
      "imagePrompt": "A detailed prompt to generate an image for this post"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            variants: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING }
          },
          required: ["text", "hashtags", "imagePrompt"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No content generated");
    
    return JSON.parse(jsonText) as GeneratedContent;
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    throw error;
  }
};

export const analyzePostScore = async (content: string, platform: Platform): Promise<{score: number, critique: string}> => {
    checkKey();
    const prompt = `
        Analyze this social media post for ${platform}:
        "${content}"
        
        Rate it from 0 to 100 based on engagement potential, clarity, and platform best practices.
        Provide a short critique on how to improve it.
        
        Return JSON:
        { "score": 85, "critique": "Good use of emojis, but add a call to action." }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    critique: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}');
};

export const generateTrends = async (industry: string): Promise<any[]> => {
    checkKey();
    const prompt = `
        Identify 3 trending topics or hashtags relevant to the ${industry} industry right now.
        Return JSON array of objects with topic, sentiment (Positive/Neutral/Negative), and relevance score (1-10).
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || '[]');
};

export const trainBrandVoice = async (sampleText: string): Promise<string> => {
    checkKey();
    const prompt = `
        Analyze the following text samples and define the "Brand Voice" (tone, style, vocabulary, sentence structure).
        Summarize it in 2-3 sentences that can be used as instructions for an AI writer.
        
        Text: "${sampleText.substring(0, 2000)}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    return response.text || "Professional and concise.";
};

export const generateCreativeImage = async (prompt: string): Promise<string> => {
  checkKey();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned from model");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 10))}/800/800`;
  }
};

// AUTO-PILOT FUNCTION
export const runAutoPilot = async (industry: string = 'Digital Marketing'): Promise<Post[]> => {
    // 0. Check Connections
    const accounts = await MockBackend.getAccounts();
    const connectedAccounts = accounts.filter(a => a.connected);
    
    if (connectedAccounts.length === 0) {
        throw new Error("No connected accounts found. Please connect an account in the Connections page.");
    }

    // 1. Get Trends
    const trends = await generateTrends(industry);
    const topTrends = trends.slice(0, 3); // Take top 3
    
    // Ensure we have at least 3 trends to create 3 posts
    while (topTrends.length < 3) {
        topTrends.push({ topic: `${industry} Updates`, relevance: 5, sentiment: 'Neutral', volume: 'Medium' });
    }

    const newPosts: Post[] = [];
    let dateCursor = new Date();
    dateCursor.setDate(dateCursor.getDate() + 1); // Start tomorrow
    dateCursor.setHours(10, 0, 0, 0); // 10 AM

    // 2. Generate 3 Posts (one for each trend)
    for (let i = 0; i < 3; i++) {
        const trend = topTrends[i];
        
        // Pick a platform from connected accounts (round-robin)
        const account = connectedAccounts[i % connectedAccounts.length];
        
        const content = await generatePostContent(
            trend.topic, 
            account.platform, 
            Tone.Professional, 
            true
        );

        const post: Post = {
            id: Date.now().toString() + i,
            platform: account.platform,
            content: content.text,
            hashtags: content.hashtags,
            imagePrompt: content.imagePrompt,
            status: 'Scheduled',
            createdAt: new Date().toISOString(),
            scheduledDate: dateCursor.toISOString(),
            engagementScore: 85 // Predicted score
        };
        
        // Add 4 hours for next post spacing
        dateCursor = new Date(dateCursor.getTime() + 4 * 60 * 60 * 1000);
        
        await MockBackend.savePost(post);
        newPosts.push(post);
    }
    
    return newPosts;
};
