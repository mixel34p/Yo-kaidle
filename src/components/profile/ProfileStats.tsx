'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Target } from 'lucide-react';
import { getAllYokai } from '@/lib/supabase';

interface UserStats {
  total_played: number;
  best_streak: number;
  current_streak: number;
  yokai_unlocked: number;
  achievements_count: number;
  updated_at: string;
}

interface ProfileTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: 'default' | 'gradient' | 'pattern';
  layout: 'default' | 'compact' | 'detailed';
}

interface ProfileStatsProps {
  stats: UserStats;
  theme: ProfileTheme;
}



export default function ProfileStats({ stats, theme }: ProfileStatsProps) {
  const { t, language } = useLanguage();

  // Obtener número REAL de Yo-kais desde la base de datos (como hace el medallium)
  const [totalYokaiAvailable, setTotalYokaiAvailable] = useState(0);

  useEffect(() => {
    // Cargar total de Yo-kais disponibles REAL desde Supabase
    const loadTotalYokai = async () => {
      try {
        const allYokaiData = await getAllYokai();
        setTotalYokaiAvailable(allYokaiData.length);
      } catch (error) {
        console.error('Error loading total yokai count:', error);
        setTotalYokaiAvailable(0);
      }
    };
    loadTotalYokai();
  }, []);

  const calculateYokaiPercentage = () => {
    if (totalYokaiAvailable === 0) return 0;
    return Math.min((stats.yokai_unlocked / totalYokaiAvailable) * 100, 100);
  };

  return (
    <div className={`profile-stats theme-${theme.primaryColor} layout-${theme.layout} mt-8`}>
      {/* Título de la sección */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Target size={24} className="text-blue-400" />
          {t.statistics}
        </h2>
        <p className="text-white/60 text-sm">
          {language === 'es'
            ? 'Progreso y logros principales'
            : language === 'it'
              ? 'Progresso e risultati principali'
              : 'Main progress and achievements'}
        </p>
      </div>

      {/* Grid de estadísticas - Solo números, sin barras estúpidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Mejor Racha */}
        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 shadow-xl text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/icons/stats/best-streak.png"
              alt="Mejor Racha"
              className="w-7 h-7"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '🏆';
                fallback.className = 'text-yellow-400 text-xl';
                e.currentTarget.parentElement!.insertBefore(fallback, e.currentTarget);
              }}
            />
            <h3 className="text-lg font-semibold text-white">
              {t.profileBestStreak}
            </h3>
          </div>
          <div className="text-4xl font-bold text-yellow-300 mb-2">
            {stats.best_streak}
          </div>
          <div className="text-yellow-200/70 text-sm font-medium">
            {t.consecutiveDays}
          </div>
        </div>

        {/* Racha Actual */}
        <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 shadow-xl text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/icons/stats/current-streak.png"
              alt="Racha Actual"
              className="w-7 h-7"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '🔥';
                fallback.className = 'text-orange-400 text-xl';
                e.currentTarget.parentElement!.insertBefore(fallback, e.currentTarget);
              }}
            />
            <h3 className="text-lg font-semibold text-white">
              {t.profileCurrentStreak}
            </h3>
          </div>
          <div className="text-4xl font-bold text-orange-300 mb-2">
            {stats.current_streak}
          </div>
          <div className="text-orange-200/70 text-sm font-medium">
            {t.consecutiveDays}
          </div>
        </div>

        {/* Partidas Jugadas - NUEVO */}
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 shadow-xl text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/icons/stats/total-played.png"
              alt="Partidas Jugadas"
              className="w-7 h-7"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '🎮';
                fallback.className = 'text-green-400 text-xl';
                e.currentTarget.parentElement!.insertBefore(fallback, e.currentTarget);
              }}
            />
            <h3 className="text-lg font-semibold text-white">
              {t.gamesPlayed}
            </h3>
          </div>
          <div className="text-4xl font-bold text-green-300 mb-2">
            {stats.total_played}
          </div>
          <div className="text-green-200/70 text-sm font-medium">
            {language === 'es' ? 'partidas totales' : language === 'it' ? 'partite totali' : 'total games'}
          </div>
        </div>

        {/* Yo-kais Desbloqueados - SOLO ESTE con barra porque tiene sentido */}
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/icons/game-modes/medallium.png"
              alt="Medallium"
              className="w-7 h-7"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '⭐';
                fallback.className = 'text-purple-400 text-xl';
                e.currentTarget.parentElement!.insertBefore(fallback, e.currentTarget);
              }}
            />
            <h3 className="text-lg font-semibold text-white text-center">
              {t.profileYokaiUnlocked}
            </h3>
          </div>

          <div className="text-center mb-5">
            <div className="text-4xl font-bold text-purple-300 mb-2">
              {stats.yokai_unlocked}
            </div>
            <div className="text-purple-200/70 text-sm font-medium">
              {t.ofTotal} {totalYokaiAvailable} {language === 'es' ? 'totales' : language === 'it' ? 'totali' : 'total'}
            </div>
          </div>

          {/* Barra de progreso SOLO para Yo-kais */}
          <div className="relative">
            <div className="w-full h-3 bg-gray-800/60 rounded-full overflow-hidden border border-gray-600/40 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${calculateYokaiPercentage()}%` }}
              />
            </div>
            <div className="text-center mt-3 text-sm font-medium text-purple-300">
              {calculateYokaiPercentage().toFixed(1)}% completado
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
