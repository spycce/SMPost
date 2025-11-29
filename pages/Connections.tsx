
import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../components/UIComponents';
import { MockBackend } from '../services/mockBackend';
import { SocialAccount } from '../types';
import { PLATFORM_ICONS } from '../constants';

export const Connections: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    MockBackend.getAccounts().then(setAccounts);
  }, []);

  const handleConnect = async (id: string, platform: string) => {
    setLoading(id);
    
    // Simulate OAuth Popup
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    // In a real app, this would be the OAuth URL from your backend
    const popup = window.open(
        `about:blank`, 
        'Connect', 
        `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
        popup.document.write(`
            <div style="font-family: sans-serif; text-align: center; padding: 40px;">
                <h1>Connect to ${platform}</h1>
                <p>Simulating secure authorization...</p>
                <div style="margin-top: 20px; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        `);
        
        // Simulate user logging in and redirecting back
        setTimeout(async () => {
            popup.close();
            const updated = await MockBackend.connectAccount(id, `@demo_${platform.toLowerCase()}`);
            setAccounts(updated);
            setLoading(null);
            alert(`Successfully connected to ${platform}! You can now auto-publish.`);
        }, 2000);
    } else {
        setLoading(null);
        alert("Popup blocked. Please allow popups to connect accounts.");
    }
  };

  const handleDisconnect = async (id: string) => {
      setLoading(id);
      await new Promise(r => setTimeout(r, 500));
      const updated = await MockBackend.disconnectAccount(id);
      setAccounts(updated);
      setLoading(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
           <p className="mt-1 text-sm text-gray-500">Manage your linked social media profiles to enable Auto-Posting.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${account.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {PLATFORM_ICONS[account.platform]}
               </div>
               <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      {account.platform}
                      {account.connected && <Badge color="green">Active</Badge>}
                  </h3>
                  {account.connected ? (
                      <p className="text-sm text-gray-500">Connected as <span className="font-semibold">{account.handle}</span> • Ready to Post</p>
                  ) : (
                      <p className="text-sm text-gray-500">Connect to enable auto-scheduling</p>
                  )}
               </div>
            </div>
            
            <Button 
                variant={account.connected ? 'secondary' : 'primary'}
                onClick={() => account.connected ? handleDisconnect(account.id) : handleConnect(account.id, account.platform)}
                isLoading={loading === account.id}
                className={account.connected ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200' : ''}
            >
                {account.connected ? 'Disconnect' : 'Connect Account'}
            </Button>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-8">
          <h4 className="text-blue-800 font-medium mb-2">ℹ️ Auto-Pilot Requirements</h4>
          <p className="text-sm text-blue-600">
              For the Auto-Pilot to work, you must connect at least one account. Posts created by Auto-Pilot will be automatically scheduled and pushed to these connected accounts.
          </p>
      </div>
    </div>
  );
};
