import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { syncProgress } from '@/lib/auth';

export const useProgressSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      const localProgress = getLocalProgress();
      if (localProgress) {
        syncUserProgress(localProgress);
      }
    }
  }, [user]);

  const getLocalProgress = () => {
    try {
      // Get Medallium data
      const medalliumData = localStorage.getItem('medallium');
      const medallium = medalliumData ? JSON.parse(medalliumData) : { yokais: [] };

      // Get Stats data
      const statsData = localStorage.getItem('stats');
      const stats = statsData ? JSON.parse(statsData) : {
        gamesPlayed: 0,
        victories: 0,
        bestStreak: 0,
        currentStreak: 0,
        infiniteWins: 0
      };

      return { medallium, stats };
    } catch (error) {
      console.error('Error reading local progress:', error);
      return null;
    }
  };

  const syncUserProgress = async (localProgress: any) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await syncProgress(localProgress);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error syncing progress:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    syncUserProgress
  };
};
