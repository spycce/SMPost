import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UIComponents';
import { generateCreativeImage } from '../services/geminiService';

export const Designer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const imgUrl = await generateCreativeImage(prompt);
      setImage(imgUrl);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Creative Designer</h1>
           <p className="text-sm text-gray-500">Generate studio-quality visuals with AI.</p>
        </div>
        {image && (
            <Button variant="secondary" onClick={() => {
                const link = document.createElement('a');
                link.download = 'generated-creative.png';
                link.href = image;
                link.click();
            }}>Download Asset</Button>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Controls */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <Card className="p-5 flex-1 flex flex-col gap-4">
             <h3 className="font-semibold text-gray-800">Prompt settings</h3>
             
             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">Description</label>
                 <textarea 
                    className="w-full h-32 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    placeholder="Describe the image you want... e.g. A futuristic workspace with neon lights, 4k render"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                 />
             </div>

             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">Style Preset</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['Photorealistic', '3D Render', 'Minimalist', 'Pop Art'].map(style => (
                        <button 
                            key={style}
                            className="px-3 py-2 text-xs border rounded hover:bg-gray-50 bg-white"
                            onClick={() => setPrompt(prev => `${prev}, ${style} style`)}
                        >
                            {style}
                        </button>
                    ))}
                 </div>
             </div>

             <div className="mt-auto">
                 <Button className="w-full" onClick={handleGenerateImage} isLoading={loading} disabled={!prompt}>
                    Generate Visual
                 </Button>
             </div>
          </Card>
        </div>

        {/* Canvas / Preview */}
        <div className="flex-1 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center flex-col">
                    <div className="animate-spin h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-brand-700 font-medium">Dreaming up your design...</p>
                </div>
            )}
            
            {image ? (
                <img src={image} alt="Generated" className="max-w-full max-h-full object-contain shadow-2xl" />
            ) : (
                <div className="text-center text-gray-400">
                    <p className="text-6xl mb-4">🎨</p>
                    <p>Your canvas is empty.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
