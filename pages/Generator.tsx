import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UIComponents';
import { generatePostContent, analyzePostScore } from '../services/geminiService';
import { Platform, Tone, GeneratedContent, Post } from '../types';
import { PLATFORM_OPTIONS, TONE_OPTIONS, PLATFORM_ICONS } from '../constants';
import { MockBackend } from '../services/mockBackend';

type Mode = 'generate' | 'analyze';

export const Generator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.LinkedIn);
  const [tone, setTone] = useState<Tone>(Tone.Professional);
  const [variants, setVariants] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [saved, setSaved] = useState(false);

  // Analysis State
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{score: number, critique: string} | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      const content = await generatePostContent(topic, platform, tone, true, undefined, variants);
      setResult(content);
    } catch (e) {
      alert("Failed to generate content. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
      if(!textToAnalyze) return;
      setLoading(true);
      try {
          const res = await analyzePostScore(textToAnalyze, platform);
          setAnalysisResult(res);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
  }

  const handleSave = async (contentStr: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      platform,
      content: contentStr,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      hashtags: result?.hashtags || [],
    };
    await MockBackend.savePost(newPost);
    setSaved(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Content Studio</h1>
            <p className="mt-1 text-sm text-gray-500">Generate, iterate, and optimize your social media presence.</p>
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
            <button 
                onClick={() => setMode('generate')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'generate' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                Generator
            </button>
            <button 
                onClick={() => setMode('analyze')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'analyze' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                Score Analyzer
            </button>
        </div>
      </div>

      {mode === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900">Configuration</h2>
                
                <Input 
                label="Topic or Brand Name" 
                placeholder="e.g., New Eco-friendly Sneaker Launch"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                />

                <Select 
                label="Platform" 
                options={PLATFORM_OPTIONS} 
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                />

                <Select 
                label="Tone of Voice" 
                options={TONE_OPTIONS} 
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variants</label>
                    <div className="flex space-x-4">
                        {[1, 3].map(num => (
                            <button 
                                key={num}
                                onClick={() => setVariants(num)}
                                className={`flex-1 py-2 border rounded-lg text-sm font-medium ${variants === num ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {num === 1 ? 'Single Post' : 'A/B/C Test'}
                            </button>
                        ))}
                    </div>
                </div>

                <Button 
                className="w-full" 
                onClick={handleGenerate} 
                disabled={!topic || loading}
                isLoading={loading}
                >
                {loading ? 'Thinking...' : variants > 1 ? 'Generate Variants' : 'Generate Content'}
                </Button>
            </Card>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-2 space-y-6">
            {result ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Main Result or Variants */}
                    {(result.variants && result.variants.length > 0 ? result.variants : [result.text]).map((variantText, idx) => (
                        <Card key={idx} className="p-6 border-brand-100 ring-1 ring-brand-50/50 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{PLATFORM_ICONS[platform]}</span>
                                <span className="font-semibold text-gray-700">Option {String.fromCharCode(65 + idx)}</span>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(variantText)}>Copy</Button>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{variantText}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {result.hashtags.map(tag => (
                                <span key={tag} className="text-blue-600 text-sm hover:underline cursor-pointer">#{tag}</span>
                                ))}
                            </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button size="sm" onClick={() => handleSave(variantText)}>Save to Schedule</Button>
                            </div>
                        </Card>
                    ))}

                    {/* AI Image Suggestion */}
                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggested Image Prompt</h4>
                        <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-100 flex items-start">
                            <span className="mr-2">🎨</span>
                            {result.imagePrompt}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-96 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <div className="text-6xl mb-4">✨</div>
                    <p>Ready to create something amazing?</p>
                </div>
            )}
            </div>
        </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Content Analyzer</h3>
                  <textarea 
                    className="w-full h-48 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 resize-none"
                    placeholder="Paste your post content here..."
                    value={textToAnalyze}
                    onChange={(e) => setTextToAnalyze(e.target.value)}
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <Select 
                        className="w-40"
                        options={PLATFORM_OPTIONS} 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as Platform)}
                    />
                    <Button onClick={handleAnalyze} isLoading={loading} disabled={!textToAnalyze}>Analyze Score</Button>
                  </div>
              </Card>

              <div>
                  {analysisResult ? (
                      <Card className="p-6 h-full border-l-4 border-l-brand-500">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-gray-900">AI Score</h3>
                              <div className={`text-4xl font-bold ${analysisResult.score > 80 ? 'text-green-600' : analysisResult.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {analysisResult.score}/100
                              </div>
                          </div>
                          <div className="space-y-4">
                              <h4 className="font-medium text-gray-700">Feedback</h4>
                              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                  {analysisResult.critique}
                              </p>
                          </div>
                      </Card>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                          Analytics Results will appear here
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};