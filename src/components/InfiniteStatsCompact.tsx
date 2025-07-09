'use client';

import React, { useState, useEffect } from 'react';
import { getRecentYokaiStats } from '@/utils/recentYokaiManager';

const InfiniteStatsCompact: React.FC = () => {
  const [stats, setStats] = useState(getRecentYokaiStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(getRecentYokaiStats());
    };

    updateStats();
    
    // Actualizar cada 5 segundos
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (stats.totalPlayed === 0) {
    return null; // No mostrar nada si no hay estadísticas
  }

  return (
    <div className="infinite-stats-compact bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-3 shadow-sm">
      {/* Vista compacta */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-700">📊</span>
            <span className="text-sm font-medium text-gray-700">Estadísticas</span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-blue-600 font-bold">{stats.totalPlayed}</span>
              <span className="text-gray-500">jugados</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-green-600 font-bold">{stats.winRate}%</span>
              <span className="text-gray-500">aciertos</span>
            </div>
            
            {stats.currentStreak > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-orange-600 font-bold">🔥{stats.currentStreak}</span>
                <span className="text-gray-500">racha</span>
              </div>
            )}
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Vista expandida */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-blue-200 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-lg font-bold text-blue-600">{stats.totalPlayed}</div>
              <div className="text-xs text-gray-600">Total jugados</div>
            </div>
            
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-lg font-bold text-green-600">{stats.totalWon}</div>
              <div className="text-xs text-gray-600">Ganados</div>
            </div>
            
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-lg font-bold text-purple-600">{stats.averageAttempts}</div>
              <div className="text-xs text-gray-600">Promedio intentos</div>
            </div>
            
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-lg font-bold text-orange-600">{stats.bestStreak}</div>
              <div className="text-xs text-gray-600">Mejor racha</div>
            </div>
          </div>
          
          {/* Barra de progreso de racha actual */}
          {stats.currentStreak > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">Racha actual</span>
                <span className="text-xs text-orange-600 font-bold">🔥 {stats.currentStreak}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((stats.currentStreak / Math.max(stats.bestStreak, 5)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Mensaje motivacional */}
          <div className="mt-3 text-center">
            {stats.currentStreak === 0 ? (
              <p className="text-xs text-gray-500">¡Empieza una nueva racha! 💪</p>
            ) : stats.currentStreak >= stats.bestStreak ? (
              <p className="text-xs text-orange-600 font-medium">¡Nuevo récord personal! 🏆</p>
            ) : stats.currentStreak >= 5 ? (
              <p className="text-xs text-green-600">¡Excelente racha! 🔥</p>
            ) : (
              <p className="text-xs text-blue-600">¡Sigue así! 👍</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteStatsCompact;
