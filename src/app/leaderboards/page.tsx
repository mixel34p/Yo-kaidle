'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { supabase } from '@/lib/supabase';
import { Star, Flame, User, ArrowLeft } from 'lucide-react';
import AvatarWithFrame from '@/components/AvatarWithFrame';

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

type LeaderboardType = 'bestStreak' | 'yokaiUnlocked';

export default function LeaderboardsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useSocialAuth();

  const [activeTab, setActiveTab] = useState<LeaderboardType>('bestStreak');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    bestStreak: [],
    yokaiUnlocked: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRanks, setUserRanks] = useState<{
    bestStreak: number | null;
    yokaiUnlocked: number | null;
  }>({
    bestStreak: null,
    yokaiUnlocked: null
  });

  // Cargar datos de leaderboards
  useEffect(() => {
    const loadLeaderboards = async () => {
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
        const allUserIds = Array.from(new Set([
          ...bestStreakStats.map(s => s.id),
          ...yokaiStats.map(s => s.id)
        ]));

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

        setLeaderboardData({
          bestStreak: processedBestStreak,
          yokaiUnlocked: processedYokaiUnlocked
        });

        // Calcular ranking del usuario actual
        if (user) {
          const bestStreakRank = processedBestStreak.findIndex(entry => entry.id === user.id) + 1;
          const yokaiRank = processedYokaiUnlocked.findIndex(entry => entry.id === user.id) + 1;

          setUserRanks({
            bestStreak: bestStreakRank > 0 ? bestStreakRank : null,
            yokaiUnlocked: yokaiRank > 0 ? yokaiRank : null
          });
        }

      } catch (error) {
        console.error('Error loading leaderboards:', error);
        setError(t.errorLoadingLeaderboards);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboards();
  }, [user, t]);

  const handleBackToGame = () => {
    router.push('/');
  };

  const handleViewProfile = (username: string) => {
    router.push(`/profile?u=${username}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">{t.loadingLeaderboards}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
          <button
            onClick={handleBackToGame}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {t.profileBackToGame}
          </button>
        </div>
      </div>
    );
  }

  const currentData = leaderboardData[activeTab];
  const currentUserRank = userRanks[activeTab];

  return (
    <div className="app-container min-h-screen">
      {/* Botón para volver */}
      <div className="mb-6">
        <button
          onClick={handleBackToGame}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          {t.profileBackToGame}
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <img
            src="/icons/social/leaderboards.png"
            alt="Leaderboards"
            className="w-8 h-8"
          />
          {t.globalLeaderboards}
        </h1>
        <p className="text-white/60">{t.topPlayers}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-blue-900/50 rounded-lg p-1 border border-blue-500/30">
          <button
            onClick={() => setActiveTab('bestStreak')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${activeTab === 'bestStreak'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Flame size={20} />
            {t.bestStreakRanking}
          </button>
          <button
            onClick={() => setActiveTab('yokaiUnlocked')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${activeTab === 'yokaiUnlocked'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Star size={20} />
            {t.yokaiUnlockedRanking}
          </button>
        </div>
      </div>

      {/* Tu ranking */}
      {user && currentUserRank && (
        <div className="mb-6 bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-center">
          <p className="text-green-300 font-medium">
            {t.yourRank}: #{currentUserRank}
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-blue-900/30 rounded-lg border border-blue-500/30 overflow-hidden">
        {currentData.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            {t.noDataAvailable}
          </div>
        ) : (
          <div className="divide-y divide-blue-500/20">
            {currentData.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-4 flex items-center gap-4 hover:bg-blue-800/30 transition-colors cursor-pointer ${user?.id === entry.id ? 'bg-green-900/20 border-l-4 border-green-500' : ''
                  }`}
                onClick={() => handleViewProfile(entry.username)}
              >
                {/* Ranking */}
                <div className="flex-shrink-0 w-12 text-center">
                  {index < 3 ? (
                    <div className="flex items-center justify-center">
                      <img
                        src={`/icons/leaderboard/${index + 1}.png`}
                        alt={`Position ${index + 1}`}
                        className="w-8 h-8"
                      />
                    </div>
                  ) : (
                    <div className="text-white/60 font-bold text-lg">
                      #{entry.rank}
                    </div>
                  )}
                </div>

                {/* Avatar con marco */}
                <div className="flex-shrink-0">
                  <AvatarWithFrame
                    avatarUrl={entry.avatar_url || undefined}
                    frameId={entry.avatar_frame || 'default'}
                    size="sm"
                    alt={entry.username}
                  />
                </div>

                {/* Username */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    {entry.username}
                  </h3>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-white">
                    {activeTab === 'bestStreak' ? entry.best_streak : entry.yokai_unlocked}
                  </div>
                  <div className="text-white/60 text-sm">
                    {activeTab === 'bestStreak' ? t.consecutiveDays : 'Yo-kais'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
