'use client';

import React, { useState } from 'react';
import { Achievement, getUnlockedAchievements, getLockedAchievements, getAchievementStats } from '@/utils/achievementSystem';

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

interface AchievementsPanelProps {
  className?: string;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();
  const stats = getAchievementStats();
  
  const categories = [
    { id: 'all', name: 'Todos', icon: '🏆' },
    { id: 'collection', name: 'Colección', icon: '📚' },
    { id: 'tribe', name: 'Tribus', icon: '👥' },
    { id: 'game', name: 'Juegos', icon: '🎮' },
    { id: 'rank', name: 'Rangos', icon: '⭐' },
    { id: 'special', name: 'Especiales', icon: '✨' }
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
            🏆 Logros
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {stats.unlocked}/{stats.total}
            </div>
            <div className="text-sm text-gray-600">
              {stats.percentage}% completado
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
        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center">
            <PointsIcon className="w-4 h-4 mr-1" />
            <span>Ganados: <strong className="text-yellow-600">{stats.earnedPoints}</strong></span>
          </span>
          <span className="flex items-center">
            <PointsIcon className="w-4 h-4 mr-1" />
            <span>Total: <strong>{stats.totalPoints}</strong></span>
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
          onClick={() => setActiveTab('unlocked')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'unlocked'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ✅ Desbloqueados ({filterAchievements(unlockedAchievements).length})
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'locked'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔒 Bloqueados ({filterAchievements(lockedAchievements).length})
        </button>
      </div>
      
      {/* Lista de logros */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'unlocked' ? (
          <div className="space-y-3">
            {filterAchievements(unlockedAchievements).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p>No hay logros desbloqueados en esta categoría</p>
                <p className="text-sm">¡Sigue jugando para desbloquear logros!</p>
              </div>
            ) : (
              filterAchievements(unlockedAchievements).map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg"
                >
                  <div className="text-3xl mr-4">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
                      {achievement.reward?.points && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium flex items-center">
                          <PointsIcon className="w-3 h-3 mr-1" />
                          <span>+{achievement.reward.points}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    {achievement.reward?.title && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          🏷️ Título: {achievement.reward.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div className="text-green-600 font-medium">✅ Desbloqueado</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filterAchievements(lockedAchievements).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>¡Has desbloqueado todos los logros de esta categoría!</p>
              </div>
            ) : (
              filterAchievements(lockedAchievements).map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                >
                  <div className="text-3xl mr-4 grayscale">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-600">{achievement.name}</h3>
                      {achievement.reward?.points && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium flex items-center">
                          <PointsIcon className="w-3 h-3 mr-1" />
                          <span>+{achievement.reward.points}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                    {achievement.reward?.title && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          🏷️ Título: {achievement.reward.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <div>🔒 Bloqueado</div>
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
