
import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../components/UIComponents';
import { ApiService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import { SocialAccount } from '../types';
import { PLATFORM_ICONS } from '../constants';

export const Connections: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    ApiService.getAccounts()
      .then(setAccounts)
      .catch(err => {
        console.error("Failed to load accounts", err);
        showNotification("Failed to load accounts. Is the server running?", 'error');
      });
  }, []);

  const handleConnect = async (id: string, platform: string) => {
    setLoading(id);
    try {
      // Fetch OAuth URL from backend
      const response = await fetch(`http://localhost:5000/api/auth/${platform.toLowerCase()}`);
      const data = await response.json();

      if (data.url) {
        // Redirect to platform auth page
        window.location.href = data.url;
      } else {
        showNotification("Failed to get auth URL", 'error');
        setLoading(null);
      }
    } catch (e) {
      console.error(e);
      showNotification("Connection failed", 'error');
      setLoading(null);
    }
  };

  // Check for status query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const status = params.get('status');
    if (status === 'success') {
      showNotification("Successfully connected account!", 'success');
      // Refresh accounts
      ApiService.getAccounts().then(setAccounts);
      // Clean URL
      window.history.replaceState({}, '', '/#/connections');
    } else if (status === 'error') {
      showNotification("Failed to connect account.", 'error');
      window.history.replaceState({}, '', '/#/connections');
    }
  }, [showNotification]);

  const handleDisconnect = async (id: string) => {
    setLoading(id);
    try {
      const updated = await ApiService.disconnectAccount(id);
      setAccounts(updated);
    } catch (e) {
      alert("Failed to disconnect account.");
    }
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
