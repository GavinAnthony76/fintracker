import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { seedDatabase } from '@/db/seed';
import PWAStatus from '@/components/PWAStatus';

export default function App(): JSX.Element {
  const location = useLocation();

  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Income', path: '/income' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Net Worth', path: '/net-worth' },
    { label: 'Import', path: '/import' },
    { label: 'Reports', path: '/reports' },
    { label: 'Help', path: '/help' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Financial Tracker</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-4 inline-block border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  location.pathname === item.path
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* PWA Status Indicator */}
      <PWAStatus />
    </div>
  );
}
