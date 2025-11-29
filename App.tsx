
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Generator } from './pages/Generator';
import { Designer } from './pages/Designer';
import { Scheduler } from './pages/Scheduler';
import { BrandVoicePage } from './pages/BrandVoice';
import { TrendsPage } from './pages/Trends';
import { Login } from './pages/Login';
import { Connections } from './pages/Connections';
import { Billing } from './pages/Billing';
import { Card } from './components/UIComponents';

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
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login isSignup />} />
          
          <Route path="/" element={<Dashboard />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/brand-voice" element={<BrandVoicePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          
          <Route path="/accounts" element={<Connections />} />
          <Route path="/billing" element={<Billing />} />
          
          <Route path="/templates" element={<ComingSoon title="Template Library" />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
