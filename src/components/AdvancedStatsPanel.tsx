'use client';

import React, { useState } from 'react';
import { AdvancedMedalliumStats } from '@/utils/advancedStats';
import { tribeIcons, gameLogos, rankIcons } from '@/types/yokai';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdvancedStatsPanelProps {
  stats: AdvancedMedalliumStats;
  className?: string;
}

const AdvancedStatsPanel: React.FC<AdvancedStatsPanelProps> = ({ stats, className = '' }) => {
  const { t, getTribeTranslation } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'tribes' | 'games'>('overview');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`advanced-stats-panel bg-white rounded-lg shadow-lg ${className}`}>


      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: t.overview, icon: '📈' },
          { id: 'tribes', label: t.tribes, icon: '👥' },
          { id: 'games', label: t.games, icon: '🎮' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⭐ {t.rankDistribution}</h3>
            <div className="space-y-3">
              {stats.rankStats.map(rank => (
                <div key={rank.rank} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={rankIcons[rank.rank]}
                        alt={`Rango ${rank.rank}`}
                        className="w-8 h-8"
                        title={`Rango ${rank.rank}`}
                      />
                      <span className="font-medium text-gray-800">
                        {t.rank} {rank.rank}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {rank.unlocked}/{rank.total} ({rank.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(rank.percentage)}`}
                      style={{ width: `${rank.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tribes' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 {t.tribeDistribution}</h3>
            <div className="space-y-3">
              {stats.tribeStats.map(tribe => (
                <div key={tribe.tribe} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={tribeIcons[tribe.tribe]}
                        alt={tribe.tribe}
                        className="w-8 h-8"
                        title={getTribeTranslation(tribe.tribe)}
                      />
                      <span className="font-medium text-gray-800">
                        {getTribeTranslation(tribe.tribe)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {tribe.unlocked}/{tribe.total} ({tribe.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(tribe.percentage)}`}
                      style={{ width: `${tribe.percentage}%` }}
                    ></div>
                  </div>
                  {tribe.lastUnlocked && (
                    <div className="text-xs text-gray-500 mt-1">
                      Último: {formatDate(tribe.lastUnlocked)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 {t.gameProgress}</h3>
            <div className="space-y-3">
              {stats.gameStats.map(game => (
                <div key={game.game} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-6 flex items-center justify-center">
                        <img
                          src={gameLogos[game.game as keyof typeof gameLogos]}
                          alt={game.game}
                          className="max-w-full max-h-full object-contain"
                          title={game.game}
                          onError={(e) => {
                            // Fallback a texto abreviado si no hay logo
                            const target = e.currentTarget.parentElement;
                            if (target) {
                              const shortName = game.game
                                .replace(/Yo-kai Watch/i, 'YW')
                                .replace(/Blasters/i, 'B')
                                .replace(/Busters/i, 'B')
                                .replace(/Sangokushi/i, 'S');
                              target.innerHTML = `<span class="text-xs font-bold text-gray-600">${shortName}</span>`;
                            }
                          }}
                        />
                      </div>
                      <span className="font-medium text-gray-800">{game.game}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {game.unlocked}/{game.total} ({game.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(game.percentage)}`}
                      style={{ width: `${game.percentage}%` }}
                    ></div>
                  </div>
                  {game.lastUnlocked && (
                    <div className="text-xs text-gray-500 mt-1">
                      Último: {formatDate(game.lastUnlocked)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvancedStatsPanel;
