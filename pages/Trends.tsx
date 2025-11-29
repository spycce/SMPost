import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UIComponents';
import { generateTrends } from '../services/geminiService';
import { Trend } from '../types';

export const TrendsPage: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);

  const handleScan = async () => {
    if (!industry) return;
    setLoading(true);
    try {
      const results = await generateTrends(industry);
      setTrends(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Trend Scanner</h1>
            <p className="mt-1 text-sm text-gray-500">Discover viral topics in your niche before they peak.</p>
        </div>
      </div>

      <Card className="p-6">
          <div className="flex gap-4">
              <Input 
                 placeholder="Enter Industry (e.g. SaaS, Fashion, Crypto)" 
                 value={industry}
                 onChange={(e) => setIndustry(e.target.value)}
                 className="max-w-md"
              />
              <Button onClick={handleScan} isLoading={loading}>Scan Now</Button>
          </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((trend, i) => (
              <Card key={i} className="p-6 border-l-4 border-l-brand-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                      <Badge color={trend.sentiment === 'Positive' ? 'green' : 'gray'}>{trend.sentiment}</Badge>
                      <span className="text-xs font-bold text-gray-400">Vol: {trend.volume || 'High'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{trend.topic}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${(trend.relevance || 5) * 10}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-gray-500 mt-1">Relevance Score</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button size="sm" variant="outline" className="w-full">Create Post</Button>
                  </div>
              </Card>
          ))}
      </div>
      
      {trends.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Enter an industry to detect trends.</p>
          </div>
      )}
    </div>
  );
};