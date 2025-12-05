'use client';

import { useEffect, useCallback } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { loadMedallium } from '@/utils/medalliumManager';
import { loadAchievements } from '@/utils/achievementSystem';

export function useSocialStats() {
  const { user, updatePublicStats } = useSocialAuth();

  // Función para calcular estadísticas públicas desde localStorage
  const calculatePublicStats = useCallback(() => {
    try {
      // Obtener estado del juego
      const gameStateStr = localStorage.getItem('yokaidleGameState');
      const gameState = gameStateStr ? JSON.parse(gameStateStr) : null;

      console.log('📊 Raw gameState for stats:', {
        totalPlayed: gameState?.totalPlayed,
        maxStreak: gameState?.maxStreak,
        streak: gameState?.streak,
        gameState: gameState
      });

      // Obtener medallium
      const medallium = loadMedallium();

      // Obtener logros
      const achievements = loadAchievements();
      const achievementsCount = Object.values(achievements).filter(Boolean).length;

      // Calcular Yo-kais desbloqueados
      const yokaiUnlockedCount = Array.isArray(medallium.unlockedYokai)
        ? medallium.unlockedYokai.length
        : Object.keys(medallium.unlockedYokai || {}).length;

      // Calcular estadísticas públicas (usando los nombres correctos)
      const publicStats = {
        total_played: gameState?.totalPlayed || 0,
        best_streak: gameState?.maxStreak || 0,  // Corregido: usar maxStreak
        current_streak: gameState?.streak || 0,  // Corregido: usar streak
        yokai_unlocked: yokaiUnlockedCount,
        achievements_count: achievementsCount
      };

      return publicStats;
    } catch (error) {
      console.error('Error calculating public stats:', error);
      return {
        total_played: 0,
        best_streak: 0,
        current_streak: 0,
        yokai_unlocked: 0,
        achievements_count: 0
      };
    }
  }, []);

  // Función para actualizar estadísticas en la base de datos
  const syncStatsToCloud = useCallback(async () => {
    if (!user) {
      console.log('📊 Skipping stats sync - no user authenticated');
      return;
    }

    try {
      console.log('📊 Starting stats sync for user:', user.id);
      const stats = calculatePublicStats();
      console.log('📊 Calculated stats:', stats);

      await updatePublicStats(stats);
      console.log('✅ Public stats synced successfully');
    } catch (error) {
      console.error('❌ Error syncing stats to cloud:', error);
    }
  }, [user, updatePublicStats, calculatePublicStats]);

  // Sincronizar estadísticas cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      // Sincronizar inmediatamente al cargar
      syncStatsToCloud();

      // Sincronizar cada 5 minutos
      const interval = setInterval(syncStatsToCloud, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, syncStatsToCloud]);

  // Escuchar cambios en localStorage para sincronizar automáticamente
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      // Solo sincronizar cuando cambien datos relevantes
      const relevantKeys = [
        'yokaidleGameState',
        'medalliumData',
        'achievementsData'
      ];

      if (e.key && relevantKeys.includes(e.key)) {
        // Debounce reducido para cambios automáticos
        setTimeout(syncStatsToCloud, 1000);
      }
    };

    // Escuchar cambios de localStorage
    window.addEventListener('storage', handleStorageChange);

    // También escuchar eventos personalizados (para cambios en la misma pestaña)
    const handleCustomStorageChange = (e: CustomEvent) => {
      const { key } = e.detail;
      const relevantKeys = [
        'yokaidleGameState',
        'medalliumData',
        'achievementsData'
      ];

      if (relevantKeys.includes(key)) {
        setTimeout(syncStatsToCloud, 1000);
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener);

    // Escuchar eventos de sincronización forzada (al terminar partidas)
    const handleForcedSync = () => {
      console.log('🚀 Forced social stats sync triggered');
      syncStatsToCloud();
    };

    window.addEventListener('forceSocialStatsSync', handleForcedSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener);
      window.removeEventListener('forceSocialStatsSync', handleForcedSync);
    };
  }, [user, syncStatsToCloud]);

  return {
    syncStatsToCloud,
    calculatePublicStats
  };
}

// Helper function para disparar eventos de cambio de localStorage
export function triggerStatsSync(key: string, value: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key, value }
    }));
  }
}

// Helper function para forzar sincronización inmediata de estadísticas sociales
export function triggerSocialStatsSync() {
  if (typeof window !== 'undefined') {
    console.log('🎮 Game finished - triggering immediate social stats sync');
    window.dispatchEvent(new CustomEvent('forceSocialStatsSync'));
  }
}
