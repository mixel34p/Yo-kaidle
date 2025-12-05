'use client';

import React, { useState } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useSocialStats } from '@/hooks/useSocialStats';

export default function SocialDebug() {
  const { user, profile } = useSocialAuth();
  const { calculatePublicStats, syncStatsToCloud } = useSocialStats();
  const [isVisible, setIsVisible] = useState(false);

  if (!user) return null;

  const handleTestSync = async () => {
    try {
      console.log('🧪 Testing manual sync...');
      await syncStatsToCloud();
    } catch (error) {
      console.error('🧪 Test sync failed:', error);
    }
  };

  const stats = calculatePublicStats();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded-full text-xs z-50"
      >
        🐛
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-black/90 text-white p-4 rounded-lg max-w-sm text-xs z-50 max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-2">🐛 Social Auth Debug</h3>
          
          <div className="space-y-2">
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            
            <div>
              <strong>Profile:</strong> {profile ? '✅' : '❌'}
              {profile && (
                <div className="ml-2">
                  <div>Username: {profile.username}</div>
                  <div>Discord ID: {profile.discord_id}</div>
                </div>
              )}
            </div>

            <div>
              <strong>Calculated Stats:</strong>
              <pre className="text-xs bg-gray-800 p-2 rounded mt-1">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>

            <button
              onClick={handleTestSync}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs w-full"
            >
              🔄 Test Sync
            </button>

            <div className="text-xs opacity-75">
              <div>📊 Auto-sync: Every 10 minutes</div>
              <div>🎮 Game sync: After each game</div>
              <div>🔄 Manual sync: Button above</div>
              <div>Check console for detailed logs</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
