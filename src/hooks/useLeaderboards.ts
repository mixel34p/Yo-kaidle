'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  avatar_frame: string | null;
  best_streak: number;
  yokai_unlocked: number;
  rank: number;
}

interface LeaderboardData {
  bestStreak: LeaderboardEntry[];
  yokaiUnlocked: LeaderboardEntry[];
}

interface UserRanks {
  bestStreak: number | null;
  yokaiUnlocked: number | null;
}

export function useLeaderboards(userId?: string) {
  const [data, setData] = useState<LeaderboardData>({
    bestStreak: [],
    yokaiUnlocked: []
  });
  const [userRanks, setUserRanks] = useState<UserRanks>({
    bestStreak: null,
    yokaiUnlocked: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas y perfiles por separado, luego hacer JOIN manual
      const { data: bestStreakStats, error: bestStreakError } = await supabase
        .from('user_stats')
        .select('id, best_streak')
        .order('best_streak', { ascending: false })
        .gt('best_streak', 0)
        .limit(50);

      if (bestStreakError) throw bestStreakError;

      const { data: yokaiStats, error: yokaiError } = await supabase
        .from('user_stats')
        .select('id, yokai_unlocked')
        .order('yokai_unlocked', { ascending: false })
        .gt('yokai_unlocked', 0)
        .limit(50);

      if (yokaiError) throw yokaiError;

      // Obtener todos los IDs únicos de usuarios
      const allUserIds = [...new Set([
        ...bestStreakStats.map(s => s.id),
        ...yokaiStats.map(s => s.id)
      ])];

      // Cargar perfiles de todos los usuarios
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url, avatar_frame')
        .in('id', allUserIds);

      if (profilesError) throw profilesError;

      // Crear un mapa de perfiles para acceso rápido
      const profilesMap = new Map(profiles.map(p => [p.id, p]));

      if (yokaiError) throw yokaiError;

      // Procesar datos de mejor racha con JOIN manual
      const processedBestStreak: LeaderboardEntry[] = bestStreakStats
        .map((entry, index) => {
          const profile = profilesMap.get(entry.id);
          if (!profile) return null;

          return {
            id: entry.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
            avatar_frame: profile.avatar_frame,
            best_streak: entry.best_streak,
            yokai_unlocked: 0,
            rank: index + 1
          };
        })
        .filter(entry => entry !== null) as LeaderboardEntry[];

      // Procesar datos de Yo-kais desbloqueados con JOIN manual
      const processedYokaiUnlocked: LeaderboardEntry[] = yokaiStats
        .map((entry, index) => {
          const profile = profilesMap.get(entry.id);
          if (!profile) return null;

          return {
            id: entry.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
            avatar_frame: profile.avatar_frame,
            best_streak: 0,
            yokai_unlocked: entry.yokai_unlocked,
            rank: index + 1
          };
        })
        .filter(entry => entry !== null) as LeaderboardEntry[];

      setData({
        bestStreak: processedBestStreak,
        yokaiUnlocked: processedYokaiUnlocked
      });

      // Calcular ranking del usuario actual
      if (userId) {
        const bestStreakRank = processedBestStreak.findIndex(entry => entry.id === userId) + 1;
        const yokaiRank = processedYokaiUnlocked.findIndex(entry => entry.id === userId) + 1;
        
        setUserRanks({
          bestStreak: bestStreakRank > 0 ? bestStreakRank : null,
          yokaiUnlocked: yokaiRank > 0 ? yokaiRank : null
        });
      }

    } catch (error) {
      console.error('Error loading leaderboards:', error);
      setError('Error loading leaderboards');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  const refreshLeaderboards = useCallback(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  return {
    data,
    userRanks,
    loading,
    error,
    refreshLeaderboards
  };
}
