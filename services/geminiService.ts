
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, Platform, Tone, Post } from '../types';
import { ApiService } from "./apiService";

// Initialize Gemini Client Lazily
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY || '';
  if (!apiKey) throw new Error("API Key missing. Please set VITE_API_KEY in .env");
  return new GoogleGenAI({ apiKey });
};

// Helper to check key (deprecated, handled in getAiClient)
const checkKey = () => {
  // no-op, getAiClient handles it
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
    const response = await getAiClient().models.generateContent({
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

export const analyzePostScore = async (content: string, platform: Platform): Promise<{ score: number, critique: string }> => {
  checkKey();
  const prompt = `
        Analyze this social media post for ${platform}:
        "${content}"
        
        Rate it from 0 to 100 based on engagement potential, clarity, and platform best practices.
        Provide a short critique on how to improve it.
        
        Return JSON:
        { "score": 85, "critique": "Good use of emojis, but add a call to action." }
    `;

  const response = await getAiClient().models.generateContent({
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

  const response = await getAiClient().models.generateContent({
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

  const response = await getAiClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });

  return response.text || "Professional and concise.";
};

export const generateCreativeImage = async (prompt: string): Promise<string> => {
  // Use Pollinations AI for free, real-time image generation
  // This is a robust alternative to requiring specific high-tier API access for Imagen
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true`;

  // Simulate a short delay to make it feel like "generating" (and allow the external service to process)
  await new Promise(resolve => setTimeout(resolve, 1500));

  return imageUrl;
};

export const generateHashtags = async (topic: string, platform: Platform): Promise<string[]> => {
  checkKey();
  const prompt = `
    Generate 10 trending and relevant hashtags for a ${platform} post about "${topic}".
    Return ONLY a JSON array of strings, e.g. ["#tag1", "#tag2"].
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Hashtag Generation Error:", error);
    return [];
  }
};

export const repurposeContent = async (content: string, targetPlatform: Platform): Promise<string> => {
  checkKey();
  const prompt = `
    Repurpose the following content for ${targetPlatform}.
    Original Content: "${content}"
    
    Adapt the tone, length, and style to fit ${targetPlatform} best practices.
    Return only the new post text.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Repurpose Error:", error);
    return "";
  }
};

// AUTO-PILOT FUNCTION
export const runAutoPilot = async (industry: string = 'Digital Marketing'): Promise<Post[]> => {
  // 0. Check Connections
  const accounts = await ApiService.getAccounts();
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
      id: Date.now().toString() + i, // Temporary ID, backend will assign _id
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

    const savedPost = await ApiService.savePost(post);
    newPosts.push(savedPost);
  }

  return newPosts;
};
