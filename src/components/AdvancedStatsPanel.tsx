'use client';

import React, { useState } from 'react';
import { AdvancedMedalliumStats } from '@/utils/advancedStats';
import { tribeTranslations, elementTranslations } from '@/types/yokai';

interface AdvancedStatsPanelProps {
  stats: AdvancedMedalliumStats;
  className?: string;
}

const AdvancedStatsPanel: React.FC<AdvancedStatsPanelProps> = ({ stats, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tribes' | 'games' | 'activity'>('overview');
  
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
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
          📊 Estadísticas Avanzadas
        </h2>
        
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.unlockedYokai}</div>
            <div className="text-sm text-gray-600">Desbloqueados</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.percentage}%</div>
            <div className="text-sm text-gray-600">Completado</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.collectionStreak}</div>
            <div className="text-sm text-gray-600">Racha actual</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.averagePerDay}</div>
            <div className="text-sm text-gray-600">Por día</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Resumen', icon: '📈' },
          { id: 'tribes', label: 'Tribus', icon: '👥' },
          { id: 'games', label: 'Juegos', icon: '🎮' },
          { id: 'activity', label: 'Actividad', icon: '📅' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
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
          <div className="space-y-6">
            {/* Próximos hitos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Próximos Objetivos</h3>
              {stats.nextMilestones.length === 0 ? (
                <p className="text-gray-500 text-center py-4">¡Has completado todos los objetivos principales!</p>
              ) : (
                <div className="space-y-3">
                  {stats.nextMilestones.map((milestone, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{milestone.description}</span>
                        <span className="text-sm text-gray-600">
                          {milestone.current}/{milestone.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor((milestone.current / milestone.target) * 100)}`}
                          style={{ width: `${(milestone.current / milestone.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Faltan {milestone.remaining} para completar
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Distribución por rango */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">⭐ Distribución por Rango</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.rankStats.map(rank => (
                  <div key={rank.rank} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{rank.unlocked}</div>
                    <div className="text-sm text-gray-600">Rango {rank.rank}</div>
                    <div className="text-xs text-gray-500">{rank.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Información temporal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📅 Información Temporal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Primer Yo-kai</div>
                  <div className="font-medium text-gray-800">{formatDate(stats.firstYokaiDate)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Último Yo-kai</div>
                  <div className="font-medium text-gray-800">{formatDate(stats.lastYokaiDate)}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Mejor Racha</div>
                  <div className="font-medium text-gray-800">{stats.bestStreak} días</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'tribes' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Progreso por Tribu</h3>
            <div className="space-y-3">
              {stats.tribeStats.map(tribe => (
                <div key={tribe.tribe} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {tribeTranslations[tribe.tribe] || tribe.tribe}
                    </span>
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
                      Último desbloqueado: {formatDate(tribe.lastUnlocked)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'games' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 Progreso por Juego</h3>
            <div className="space-y-3">
              {stats.gameStats.map(game => (
                <div key={game.game} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{game.game}</span>
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
                      Último desbloqueado: {formatDate(game.lastUnlocked)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Actividad Reciente</h3>
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.slice(-10).reverse().map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">
                        {formatDate(activity.date)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        +{activity.count} Yo-kai
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.yokaiNames.slice(0, 3).join(', ')}
                      {activity.yokaiNames.length > 3 && ` y ${activity.yokaiNames.length - 3} más`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedStatsPanel;
