'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { syncProgress, getCurrentUser, supabase } from '@/lib/auth';
import SyncDialog from './SyncDialog';

interface GameState {
  gameState: any | null;
  dailyState: any | null;
  infiniteState: any | null;
  medallium: any[] | null;
  medalliumFavorites: string[];
  medalliumUnlockDates: Record<string, string>;
}

interface CloudState {
  game_state: any | null;
  daily_state: any | null;
  infinite_state: any | null;
  medallium: any[] | null;
  medallium_favorites: string[];
  medallium_unlock_dates: Record<string, string>;
}

const DEFAULT_GAME_STATE: GameState = {
  gameState: null,
  dailyState: null,
  infiniteState: null,
  medallium: [],
  medalliumFavorites: [],
  medalliumUnlockDates: {}
};

export const useProgressSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [cloudData, setCloudData] = useState<CloudState | null>(null);
  const [localData, setLocalData] = useState<GameState | null>(null);

  useEffect(() => {
    if (user) {
      handleInitialSync();
    }
  }, [user]);

  const getLocalProgress = (): GameState => {
    try {
      const keys = [
        'yokaidleGameState',
        'yokaidle_daily_state',
        'yokaidle_infinite_state',
        'yokaidle_medallium',
        'medalliumFavorites',
        'medalliumUnlockDates'
      ];

      const localData: Record<string, any> = {};
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            localData[key] = JSON.parse(data);
          } catch (e) {
            console.error(`Error parsing ${key}:`, e);
            localData[key] = null;
          }
        }
      });

      return {
        gameState: localData.yokaidleGameState || null,
        dailyState: localData.yokaidle_daily_state || null,
        infiniteState: localData.yokaidle_infinite_state || null,
        medallium: localData.yokaidle_medallium || null,
        medalliumFavorites: localData.medalliumFavorites || [],
        medalliumUnlockDates: localData.medalliumUnlockDates || {}
      };
    } catch (error) {
      console.error('Error reading local progress:', error);
      return DEFAULT_GAME_STATE;
    }
  };

  const getCloudProgress = async (): Promise<CloudState | null> => {
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

    if (!data) return null;

    return {
      game_state: data.game_state || null,
      daily_state: data.daily_state || null,
      infinite_state: data.infinite_state || null,
      medallium: data.medallium || [],
      medallium_favorites: data.medallium_favorites || [],
      medallium_unlock_dates: data.medallium_unlock_dates || {}
    };
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
  };  const cloudStateToGameState = (cloudData: CloudState): GameState => {
    return {
      gameState: cloudData.game_state,
      dailyState: cloudData.daily_state,
      infiniteState: cloudData.infinite_state,
      medallium: cloudData.medallium,
      medalliumFavorites: cloudData.medallium_favorites,
      medalliumUnlockDates: cloudData.medallium_unlock_dates
    };
  };

  const gameStateToCloudState = (localData: GameState): CloudState => {
    return {
      game_state: localData.gameState,
      daily_state: localData.dailyState,
      infinite_state: localData.infiniteState,
      medallium: Array.from(new Set(localData.medallium || [])),
      medallium_favorites: Array.from(new Set(localData.medalliumFavorites || [])),
      medallium_unlock_dates: localData.medalliumUnlockDates || {}
    };
  };

  const syncUserProgress = async (localData: GameState, useCloud: boolean) => {
    if (isSyncing || !user) return;
    
    setIsSyncing(true);
    try {
      if (useCloud && cloudData) {
        // Usar y sincronizar datos de la nube
        const state = cloudStateToGameState(cloudData);
        
        // Actualizar localStorage
        localStorage.setItem('yokaidleGameState', JSON.stringify(state.gameState));
        localStorage.setItem('yokaidle_daily_state', JSON.stringify(state.dailyState));
        localStorage.setItem('yokaidle_infinite_state', JSON.stringify(state.infiniteState));
        localStorage.setItem('yokaidle_medallium', JSON.stringify(state.medallium));
        localStorage.setItem('medalliumFavorites', JSON.stringify(state.medalliumFavorites));
        localStorage.setItem('medalliumUnlockDates', JSON.stringify(state.medalliumUnlockDates));

        await syncProgress(cloudData);
        setLocalData(state);
      } else {
        // Usar y sincronizar datos locales
        const state = gameStateToCloudState(localData);
        await syncProgress(state);        setCloudData(state);
      }

      // Actualizar el estado local
      setLastSyncTime(new Date());
      setShowSyncDialog(false);

      // Forzar una recarga de la página para asegurar que todos los componentes
      // se actualicen con los nuevos datos
      window.location.reload();
      // se actualicen con los nuevos datos
      window.location.reload();
    } catch (error) {
      console.error('Error syncing progress:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncChoice = (useCloud: boolean) => {
    if (localData) {
      syncUserProgress(localData, useCloud);
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    syncUserProgress,
    showSyncDialog,
    setShowSyncDialog,
    cloudData: cloudData ? cloudStateToGameState(cloudData) : null,
    localData,
    handleSyncChoice
  };
};
