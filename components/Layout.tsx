import React from 'react';
import { MOCK_USER } from '../constants';
import { Link, useLocation } from 'react-router-dom';

const NavItem: React.FC<{ to: string; icon: string; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 transition-colors ${
      active 
        ? 'bg-brand-50 text-brand-700' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <span className={`mr-3 text-lg ${active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
      {icon}
    </span>
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // Don't show layout on auth pages
  if (path === '/login' || path === '/signup') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 bg-white border-r border-gray-200 z-50">
        <div className="flex-1 flex flex-col min-h-0 pt-5 pb-4">
          <div className="flex items-center px-4 mb-8">
            <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">SocialAI Pro</span>
          </div>
          
          <nav className="mt-2 flex-1 px-3 space-y-1 overflow-y-auto">
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
              Create
            </div>
            <NavItem to="/" icon="📊" label="Dashboard" active={path === '/'} />
            <NavItem to="/generator" icon="✨" label="AI Content Gen" active={path === '/generator'} />
            <NavItem to="/designer" icon="🎨" label="Creative Studio" active={path === '/designer'} />
            
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
              Strategy
            </div>
            <NavItem to="/scheduler" icon="📅" label="Calendar" active={path === '/scheduler'} />
            <NavItem to="/trends" icon="🔥" label="Trend Scanner" active={path === '/trends'} />
            <NavItem to="/brand-voice" icon="🎙️" label="Brand Voice" active={path === '/brand-voice'} />
            
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
              Admin
            </div>
            <NavItem to="/accounts" icon="🔗" label="Connections" active={path === '/accounts'} />
            <NavItem to="/billing" icon="💳" label="Subscription" active={path === '/billing'} />
          </nav>
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <img className="inline-block h-9 w-9 rounded-full" src={MOCK_USER.avatar} alt="" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{MOCK_USER.name}</p>
              <div className="flex items-center text-xs font-medium text-gray-500">
                {MOCK_USER.plan}
                <span className="mx-1">•</span>
                <Link to="/login" className="text-brand-600 hover:text-brand-800">Logout</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col flex-1 w-full">
         <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
            <span className="font-bold text-lg text-gray-900">SocialAI Pro</span>
            <button className="p-2 rounded-md bg-gray-100">
               <span className="text-xl">☰</span>
            </button>
         </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};