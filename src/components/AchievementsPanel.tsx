'use client';

import React, { useState } from 'react';
import { Achievement, getUnlockedAchievements, getLockedAchievements, getAchievementStats, getAchievementName, getAchievementDescription, claimAchievementReward, hasClaimableReward, isRewardClaimed } from '@/utils/achievementSystem';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentPoints } from '@/utils/economyManager';
import { AVAILABLE_BACKGROUNDS, getBackgroundName } from '@/utils/backgroundsManager';
import { AVAILABLE_TRACKS, getTrackName } from '@/utils/jukeboxManager';
import { AVAILABLE_BADGES, getBadgeName } from '@/utils/badgesManager';
import { AVAILABLE_FRAMES, getFrameName } from '@/utils/framesManager';
import { AVAILABLE_TITLES, getTitleName } from '@/utils/titlesManager';

// Componente de icono de puntos personalizable
const PointsIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <img
    src="/icons/points-icon.png"
    alt="Puntos"
    className={className}
    onError={(e) => {
      // Fallback a un icono SVG si no existe la imagen
      e.currentTarget.style.display = 'none';
      const parent = e.currentTarget.parentElement;
      if (parent) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', className);
        svg.setAttribute('viewBox', '0 0 20 20');
        svg.setAttribute('fill', 'currentColor');
        svg.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />';
        parent.appendChild(svg);
      }
    }}
  />
);

// Componente para iconos de logros (emoji o imagen)
const AchievementIcon: React.FC<{ icon: string; alt: string; className?: string }> = ({
  icon,
  alt,
  className = "text-3xl"
}) => {
  if (icon.startsWith('/') || icon.startsWith('http')) {
    // Es una ruta de imagen
    return (
      <img
        src={icon}
        alt={alt}
        className={`${className} object-contain`}
        onError={(e) => {
          // Fallback a emoji si no se puede cargar la imagen
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const span = document.createElement('span');
            span.className = 'text-3xl';
            span.textContent = '🏆'; // Emoji por defecto
            parent.appendChild(span);
          }
        }}
      />
    );
  } else {
    // Es un emoji
    return <div className={className}>{icon}</div>;
  }
};

interface AchievementsPanelProps {
  className?: string;
}

// Función para obtener nombre de título traducido usando el manager
const getTitleNameLocal = (titleId: string, language: 'es' | 'en' | 'it'): string => {
  const title = AVAILABLE_TITLES.find(t => t.id === titleId);
  return title ? getTitleName(title, language) : titleId;
};

// Función para obtener nombre de marco usando el manager
const getFrameNameLocal = (frameId: string, language: 'es' | 'en' | 'it'): string => {
  const frame = AVAILABLE_FRAMES.find(f => f.id === frameId);
  return frame ? getFrameName(frame, language) : frameId;
};

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ className = '' }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'uncompleted' | 'completed'>('uncompleted');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [claimingAchievements, setClaimingAchievements] = useState<Set<string>>(new Set());
  
  const allUnlockedAchievements = getUnlockedAchievements();
  const allLockedAchievements = getLockedAchievements();

  // Separar logros desbloqueados sin reclamar y logros bloqueados
  const unlockedButNotClaimed = allUnlockedAchievements.filter(achievement => !isRewardClaimed(achievement.id));

  // "Sin completar" incluye: logros desbloqueados sin reclamar PRIMERO + logros bloqueados
  const uncompletedAchievements = [
    ...unlockedButNotClaimed, // Desbloqueados sin reclamar (PRIORIDAD)
    ...allLockedAchievements  // Logros aún no desbloqueados
  ];

  // "Completados" solo incluye logros desbloqueados con recompensa reclamada
  const completedAchievements = allUnlockedAchievements.filter(achievement =>
    isRewardClaimed(achievement.id)
  );
  const stats = getAchievementStats();

  // Cargar puntos actuales
  React.useEffect(() => {
    setCurrentPoints(getCurrentPoints());
  }, [refreshKey]);

  // Función para reclamar recompensa
  const handleClaimReward = (achievementId: string) => {
    const success = claimAchievementReward(achievementId);
    if (success) {
      setCurrentPoints(getCurrentPoints());
      setRefreshKey(prev => prev + 1); // Forzar re-render
    }
  };
  
  const categories = [
    { id: 'all', name: t.allCategories, icon: '🏆' },
    { id: 'collection', name: t.collectionCategory, icon: '📚' },
    { id: 'tribe', name: t.tribesCategory, icon: '👥' },
    { id: 'game', name: t.gamesCategory, icon: '🎮' },
    { id: 'rank', name: t.ranksCategory, icon: '⭐' },
    { id: 'special', name: t.specialCategory, icon: '✨' }
  ];
  
  const filterAchievements = (achievements: Achievement[]) => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter(achievement => achievement.category === selectedCategory);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <div className={`achievements-panel bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header con estadísticas */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            🏆 {t.achievements}
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {stats.unlocked}/{stats.total}
            </div>
            <div className="text-sm text-gray-600">
              {stats.percentage}% {t.completed}
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
        
        {/* Puntos */}
        <div className="flex justify-center text-sm text-gray-600">
          <span className="flex items-center">
            <PointsIcon className="w-4 h-4 mr-2" />
            <span className="text-blue-600 font-bold text-lg">{currentPoints}</span>
          </span>
        </div>
      </div>
      
      {/* Filtros por categoría */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('uncompleted')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'uncompleted'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⏳ {t.uncompletedAchievements} ({filterAchievements(uncompletedAchievements).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ✅ {t.completedAchievements} ({filterAchievements(completedAchievements).length})
        </button>
      </div>
      
      {/* Lista de logros */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'uncompleted' ? (
          <div className="space-y-3">
            {filterAchievements(uncompletedAchievements).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p>{t.noAchievementsUncompleted}</p>
                <p className="text-sm">{t.keepPlayingToUnlock}</p>
              </div>
            ) : (
              filterAchievements(uncompletedAchievements).map(achievement => {
                const isUnlocked = allUnlockedAchievements.some(a => a.id === achievement.id);
                const isLocked = !isUnlocked;

                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center p-4 rounded-lg relative ${
                      isLocked
                        ? 'bg-gray-50 border border-gray-200 opacity-75'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-md'
                    }`}
                  >
                    {/* Badge de "¡Reclamar!" para logros desbloqueados */}
                    {!isLocked && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        ¡{t.claimReward}!
                      </div>
                    )}
                    <div className={`mr-4 ${isLocked ? 'grayscale' : ''}`}>
                      <AchievementIcon
                        icon={achievement.icon}
                        alt={getAchievementName(achievement, language)}
                        className="w-12 h-12"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1">
                        <h3 className={`font-semibold ${isLocked ? 'text-gray-600' : 'text-gray-800'}`}>
                          {getAchievementName(achievement, language)}
                        </h3>
                      </div>
                      <p className={`text-sm mb-2 ${isLocked ? 'text-gray-500' : 'text-gray-600'}`}>
                        {getAchievementDescription(achievement, language)}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      {isLocked ? (
                        <>
                          <div className="text-gray-500 font-medium text-xs">🔒 {t.achievementUncompleted}</div>
                          {(achievement.reward?.points || achievement.reward?.background || achievement.reward?.track || achievement.reward?.frame || achievement.reward?.title || achievement.reward?.badge) && (
                            <div className="bg-gray-100 px-3 py-2 rounded-lg text-center">
                              <div className="text-xs text-gray-500 mb-1">{t.reward}</div>
                              {achievement.reward?.points && (
                                <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                                  <PointsIcon className="w-4 h-4" />
                                  {achievement.reward.points}
                                </div>
                              )}
                              {achievement.reward?.background && (
                                <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                                  <span className="text-sm">🖼️</span>
                                  <span className="text-xs">
                                    {(() => {
                                      const bg = AVAILABLE_BACKGROUNDS.find(b => b.id === achievement.reward?.background);
                                      return bg ? getBackgroundName(bg, language) : 'Fondo';
                                    })()}
                                  </span>
                                </div>
                              )}
                              {achievement.reward?.track && (
                                <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                                  <span className="text-sm">🎵</span>
                                  <span className="text-xs">
                                    {(() => {
                                      const track = AVAILABLE_TRACKS.find(t => t.id === achievement.reward?.track);
                                      return track ? getTrackName(track, language) : 'Canción';
                                    })()}
                                  </span>
                                </div>
                              )}
                              {achievement.reward?.frame && (
                                <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                                  <span className="text-sm">🔳</span>
                                  <span className="text-xs">{getFrameNameLocal(achievement.reward.frame, language)}</span>
                                </div>
                              )}
                              {achievement.reward?.title && (
                                <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                                  <span className="text-sm">👑</span>
                                  <span className="text-xs">{getTitleNameLocal(achievement.reward.title, language)}</span>
                                </div>
                              )}
                              {achievement.reward?.badge && (
                                <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                                  <span className="text-sm">🏆</span>
                                  <span className="text-xs">
                                    {(() => {
                                      const badge = AVAILABLE_BADGES.find(b => b.id === achievement.reward?.badge);
                                      return badge ? getBadgeName(badge, language) : 'Insignia';
                                    })()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-orange-600 font-medium text-xs">⏳ {t.achievementUncompleted}</div>
                          {(achievement.reward?.points || achievement.reward?.background || achievement.reward?.track || achievement.reward?.frame || achievement.reward?.title || achievement.reward?.badge) && (
                            <div className="bg-yellow-100 px-3 py-2 rounded-lg text-center border border-yellow-200">
                              <div className="text-xs text-yellow-700 mb-1">{t.reward}</div>
                              {achievement.reward?.points && (
                                <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                                  <PointsIcon className="w-4 h-4" />
                                  {achievement.reward.points}
                                </div>
                              )}
                              {achievement.reward?.background && (
                                <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                                  <span className="text-sm">🖼️</span>
                                  <span className="text-xs">
                                    {(() => {
                                      const bg = AVAILABLE_BACKGROUNDS.find(b => b.id === achievement.reward?.background);
                                      return bg ? getBackgroundName(bg, language) : 'Fondo';
                                    })()}
                                  </span>
                                </div>
                              )}
                              {achievement.reward?.track && (
                                <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                                  <span className="text-sm">🎵</span>
                                  <span className="text-xs">
                                    {(() => {
                                      const track = AVAILABLE_TRACKS.find(t => t.id === achievement.reward?.track);
                                      return track ? getTrackName(track, language) : 'Canción';
                                    })()}
                                  </span>
                                </div>
                              )}
                              {achievement.reward?.frame && (
                                <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                                  <span className="text-sm">🔳</span>
                                  <span className="text-xs">{getFrameNameLocal(achievement.reward.frame, language)}</span>
                                </div>
                              )}
                              {achievement.reward?.title && (
                                <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                                  <span className="text-sm">👑</span>
                                  <span className="text-xs">{getTitleNameLocal(achievement.reward.title, language)}</span>
                                </div>
                              )}
                              {achievement.reward?.badge && (
                                <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                                  <span className="text-sm">🏆</span>
                                  <span className="text-xs">
                                    {(() => {
                                      const badge = AVAILABLE_BADGES.find(b => b.id === achievement.reward?.badge);
                                      return badge ? getBadgeName(badge, language) : 'Insignia';
                                    })()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => handleClaimReward(achievement.id)}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-full font-medium flex items-center gap-1 transition-colors"
                          >
                            {achievement.reward?.points ? (
                              <>
                                <PointsIcon className="w-3 h-3" />
                                {t.claimReward} {achievement.reward.points}
                              </>
                            ) : achievement.reward?.background ? (
                              <>
                                <span className="text-xs">🖼️</span>
                                {t.claimReward}
                              </>
                            ) : achievement.reward?.track ? (
                              <>
                                <span className="text-xs">🎵</span>
                                {t.claimReward}
                              </>
                            ) : achievement.reward?.frame ? (
                              <>
                                <span className="text-xs">🔳</span>
                                {t.claimReward}
                              </>
                            ) : achievement.reward?.title ? (
                              <>
                                <span className="text-xs">👑</span>
                                {t.claimReward}
                              </>
                            ) : achievement.reward?.badge ? (
                              <>
                                <span className="text-xs">🏆</span>
                                {t.claimReward}
                              </>
                            ) : (
                              t.claimReward
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filterAchievements(completedAchievements).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p>{t.noAchievementsCompleted}</p>
              </div>
            ) : (
              filterAchievements(completedAchievements).map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg"
                >
                  <div className="mr-4">
                    <AchievementIcon
                      icon={achievement.icon}
                      alt={getAchievementName(achievement, language)}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <h3 className="font-semibold text-gray-800">{getAchievementName(achievement, language)}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{getAchievementDescription(achievement, language)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-green-600 font-medium text-xs">✅ {t.achievementCompleted}</div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                      {t.claimed}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPanel;
