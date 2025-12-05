'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { Trophy, Star, Flame, User } from 'lucide-react';
import Link from 'next/link';
import AvatarWithFrame from '@/components/AvatarWithFrame';

export default function LeaderboardPreview() {
  const { t } = useLanguage();
  const { user } = useSocialAuth();
  const { data, userRanks, loading } = useLeaderboards(user?.id);

  if (!user || loading) {
    return null;
  }

  const topBestStreak = data.bestStreak.slice(0, 3);
  const topYokaiUnlocked = data.yokaiUnlocked.slice(0, 3);

  return (
    <div className="bg-blue-900/30 rounded-lg border border-blue-500/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" />
          {t.leaderboards}
        </h3>
        <Link
          href="/leaderboards"
          className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Mejor Racha */}
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
          <h4 className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
            <Flame size={16} />
            {t.profileBestStreak}
          </h4>
          <div className="space-y-2">
            {topBestStreak.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400 font-bold w-6">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <AvatarWithFrame
                    avatarUrl={entry.avatar_url || undefined}
                    frameId={entry.avatar_frame || 'default'}
                    size="xs"
                    alt={entry.username}
                  />
                  <span className="text-white truncate">{entry.username}</span>
                </div>
                <span className="text-yellow-300 font-semibold">
                  {entry.best_streak}
                </span>
              </div>
            ))}
          </div>
          {userRanks.bestStreak && (
            <div className="mt-3 pt-3 border-t border-yellow-500/20 text-xs text-yellow-200">
              {t.yourRank}: #{userRanks.bestStreak}
            </div>
          )}
        </div>

        {/* Top Yo-kais Desbloqueados */}
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
          <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
            <Star size={16} />
            {t.profileYokaiUnlocked}
          </h4>
          <div className="space-y-2">
            {topYokaiUnlocked.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-2 text-sm">
                <span className="text-purple-400 font-bold w-6">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <AvatarWithFrame
                    avatarUrl={entry.avatar_url || undefined}
                    frameId={entry.avatar_frame || 'default'}
                    size="xs"
                    alt={entry.username}
                  />
                  <span className="text-white truncate">{entry.username}</span>
                </div>
                <span className="text-purple-300 font-semibold">
                  {entry.yokai_unlocked}
                </span>
              </div>
            ))}
          </div>
          {userRanks.yokaiUnlocked && (
            <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs text-purple-200">
              {t.yourRank}: #{userRanks.yokaiUnlocked}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
