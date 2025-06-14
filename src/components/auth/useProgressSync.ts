'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { syncProgress, getCurrentUser, supabase } from '@/lib/auth';
import SyncDialog from './SyncDialog';

export const useProgressSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [cloudData, setCloudData] = useState<any>(null);
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      handleInitialSync();
    }
  }, [user]);

  const getLocalProgress = () => {
    try {
      // Get Medallium data
      const medalliumData = localStorage.getItem('medallium');
      const medallium = medalliumData ? JSON.parse(medalliumData).yokais || [] : [];

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

  const getCloudProgress = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cloud progress:', error);
      return null;
    }

    return data;
  };

  const handleInitialSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const local = getLocalProgress();
      const cloud = await getCloudProgress();

      setLocalData(local);
      setCloudData(cloud);

      if (!cloud) {
        // Si no hay datos en la nube, subimos los locales
        await syncUserProgress(local, false);
      } else if (local) {
        // Si hay datos en ambos lados, mostramos el diálogo
        setShowSyncDialog(true);
      }
    } catch (error) {
      console.error('Error in initial sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncUserProgress = async (progress: any, useCloud: boolean) => {
    if (isSyncing || !user) return;
    
    setIsSyncing(true);
    try {
      let finalProgress;
      if (useCloud && cloudData) {
        finalProgress = cloudData;
        // Actualizar localStorage con datos de la nube
        localStorage.setItem('medallium', JSON.stringify({ yokais: cloudData.medallium }));
        localStorage.setItem('stats', JSON.stringify(cloudData.statistics));
      } else {
        finalProgress = {
          id: user.id,
          medallium: progress.medallium,
          statistics: progress.stats,
          updated_at: new Date().toISOString()
        };
        // Los datos locales ya están en localStorage
      }

      await syncProgress(finalProgress);
      setLastSyncTime(new Date());
      setShowSyncDialog(false);
    } catch (error) {
      console.error('Error syncing progress:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncChoice = (useCloud: boolean) => {
    syncUserProgress(localData, useCloud);
  };

  return {
    isSyncing,
    lastSyncTime,
    syncUserProgress,
    showSyncDialog,
    setShowSyncDialog,
    cloudData,
    localData,
    handleSyncChoice
  };
};
