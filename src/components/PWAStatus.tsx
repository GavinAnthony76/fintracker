import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAStatus(): JSX.Element | null {
  const { isOffline, canInstall } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-xs z-50">
        <p className="font-semibold text-yellow-800 text-sm">⚠️ You are offline</p>
        <p className="text-yellow-700 text-xs mt-1">Your changes will sync when you reconnect</p>
      </div>
    );
  }

  if (canInstall && showInstallPrompt) {
    return (
      <div className="fixed bottom-4 right-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4 shadow-lg max-w-xs z-50">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-indigo-800 text-sm">📱 Install FinTracker</p>
            <p className="text-indigo-700 text-xs mt-1">Install as an app for quick access</p>
          </div>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="text-indigo-600 hover:text-indigo-800 text-lg leading-none ml-2"
          >
            ×
          </button>
        </div>
        <button className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 font-medium">
          Install Now
        </button>
      </div>
    );
  }

  return null;
}
