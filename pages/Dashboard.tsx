
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../components/UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { runAutoPilot } from '../services/geminiService';
import { MockBackend } from '../services/mockBackend';
import { Post, Platform } from '../types';
import { PLATFORM_ICONS } from '../constants';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Mon', posts: 4, engagement: 240 },
  { name: 'Tue', posts: 3, engagement: 139 },
  { name: 'Wed', posts: 9, engagement: 980 },
  { name: 'Thu', posts: 6, engagement: 390 },
  { name: 'Fri', posts: 5, engagement: 480 },
  { name: 'Sat', posts: 2, engagement: 380 },
  { name: 'Sun', posts: 1, engagement: 430 },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; positive: boolean }> = ({ title, value, trend, positive }) => (
  <Card className="p-6">
    <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
    <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
    <div className={`mt-2 flex items-baseline text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive ? '↑' : '↓'} {trend}
      <span className="ml-2 text-gray-500 font-medium">from last week</span>
    </div>
  </Card>
);

const RecentActivity = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        MockBackend.getPosts().then(res => {
            setPosts(res.slice(0, 5));
            setLoading(false);
        });
    }, []);

    if (loading) return <Card className="p-6">Loading activity...</Card>;

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Generated Posts</h3>
            </div>
            {posts.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                    <li key={post.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl">
                            {PLATFORM_ICONS[post.platform]}
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-md">{post.content}</p>
                            <p className="text-sm text-gray-500">
                                {post.status} • {new Date(post.scheduledDate || post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        </div>
                        <Badge color={post.status === 'Published' ? 'green' : post.status === 'Scheduled' ? 'blue' : 'gray'}>
                            {post.status}
                        </Badge>
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No recent activity.</p>
                    <p className="text-sm">Use the Content Generator or Auto-Pilot to get started.</p>
                </div>
            )}
        </Card>
    );
};

const AutoPilotWidget = () => {
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [count, setCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRun = async () => {
        setStatus('running');
        setErrorMessage('');
        try {
            const posts = await runAutoPilot('Technology & Marketing');
            setCount(posts.length);
            setStatus('done');
            // Refresh dashboard (optional, in real app use context)
            setTimeout(() => window.location.reload(), 1500);
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            // Check if it's the "No connected accounts" error
            setErrorMessage(e.message || "An error occurred.");
        }
    };

    return (
        <Card className="p-6 bg-gradient-to-r from-brand-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">✨ AI Auto-Pilot</h3>
                        <p className="text-brand-100 text-sm mt-1 max-w-sm">
                            Automatically detect trends and schedule 3 high-performing posts for your connected accounts.
                        </p>
                    </div>
                    <div className="text-4xl">🚀</div>
                </div>
                
                <div className="mt-6">
                    {status === 'idle' && (
                        <Button onClick={handleRun} className="bg-white text-brand-700 hover:bg-gray-50 border-none shadow-lg">
                            Run Auto-Pilot
                        </Button>
                    )}
                    {status === 'running' && (
                         <div className="flex items-center space-x-3">
                             <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                             <span className="font-medium">Scanning trends & creating posts...</span>
                         </div>
                    )}
                    {status === 'error' && (
                         <div className="flex flex-col items-start space-y-2">
                             <div className="flex items-center space-x-2 text-red-200 bg-red-900/20 px-3 py-1 rounded">
                                 <span>⚠️</span>
                                 <span className="text-sm font-medium">{errorMessage}</span>
                             </div>
                             {errorMessage.toLowerCase().includes('connect') && (
                                 <Link to="/accounts">
                                     <Button size="sm" className="bg-white text-red-600 hover:bg-gray-50 border-none mt-2">
                                         Go to Connections
                                     </Button>
                                 </Link>
                             )}
                             {!errorMessage.toLowerCase().includes('connect') && (
                                <Button size="sm" onClick={() => setStatus('idle')} className="bg-white/20 hover:bg-white/30 text-white border-none">
                                    Try Again
                                </Button>
                             )}
                         </div>
                    )}
                    {status === 'done' && (
                        <div className="flex items-center justify-between">
                             <span className="font-bold">✅ Successfully scheduled {count} posts based on latest trends!</span>
                             <Link to="/scheduler" className="text-sm underline hover:text-brand-100">View Schedule</Link>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your content performance and upcoming schedule.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Posts Generated" value="128" trend="12%" positive={true} />
        <StatCard title="Scheduled Posts" value="14" trend="4%" positive={true} />
        <StatCard title="Avg. Engagement" value="4.2%" trend="0.8%" positive={false} />
        <StatCard title="Credits Remaining" value="850" trend="Used 150" positive={true} />
      </div>
      
      {/* Auto Pilot Section */}
      <AutoPilotWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Output</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="posts" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Engagement</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
};
