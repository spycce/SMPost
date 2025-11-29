import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Generator } from './pages/Generator';
import { Connections } from './pages/Connections';
import { Scheduler } from './pages/Scheduler';
import { Designer } from './pages/Designer';
import { TrendsPage } from './pages/Trends';
import { BrandVoicePage } from './pages/BrandVoice';
import { Billing } from './pages/Billing';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationContainer } from './components/Notification';
import { Card } from './components/UIComponents';
import { Login } from './pages/Login';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="h-full flex flex-col items-center justify-center">
    <Card className="p-8 text-center max-w-md">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500">This module is under construction.</p>
    </Card>
  </div>
);

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <HashRouter>
        <NotificationContainer />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="generator" element={<Generator />} />
            <Route path="designer" element={<Designer />} />
            <Route path="scheduler" element={<Scheduler />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="brand-voice" element={<BrandVoicePage />} />
            <Route path="connections" element={<Connections />} />
            <Route path="accounts" element={<Connections />} /> {/* Alias for accounts */}
            <Route path="billing" element={<Billing />} />
            <Route path="*" element={<ComingSoon title="Coming Soon" />} />
          </Route>
        </Routes>
      </HashRouter>
    </NotificationProvider>
  );
};

export default App;
