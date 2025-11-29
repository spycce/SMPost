import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UIComponents';
import { trainBrandVoice } from '../services/geminiService';

export const BrandVoicePage: React.FC = () => {
  const [sampleText, setSampleText] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceDefinition, setVoiceDefinition] = useState('');

  const handleTrain = async () => {
    if (!sampleText) return;
    setLoading(true);
    try {
      const result = await trainBrandVoice(sampleText);
      setVoiceDefinition(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brand Voice Trainer</h1>
        <p className="mt-1 text-sm text-gray-500">Upload sample content to train the AI on your unique brand identity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-medium text-gray-900">1. Paste Sample Content</h2>
          <p className="text-xs text-gray-500">Paste recent blog posts, newsletters, or high-performing captions.</p>
          <textarea
            className="w-full h-64 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Paste text here..."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
          />
          <Button onClick={handleTrain} isLoading={loading} disabled={!sampleText} className="w-full">
            Analyze Voice
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 h-full bg-brand-50 border-brand-100">
             <h2 className="font-medium text-brand-900 mb-4">2. AI Voice Definition</h2>
             {voiceDefinition ? (
                 <div className="prose prose-sm text-brand-800 animate-fade-in">
                     <p className="whitespace-pre-wrap">{voiceDefinition}</p>
                     <div className="mt-6 pt-4 border-t border-brand-200">
                        <Button size="sm" variant="primary">Save Voice Profile</Button>
                     </div>
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center h-40 text-brand-300">
                     <span className="text-4xl mb-2">🤖</span>
                     <p className="text-sm">Waiting for analysis...</p>
                 </div>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
};