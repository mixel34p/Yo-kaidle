'use client';

import React, { useState, useEffect } from 'react';
import { getRecentYokaiStats, getRecentYokaiHistory, clearRecentYokaiHistory, RecentYokaiEntry } from '@/utils/recentYokaiManager';

const RecentYokaiStats: React.FC = () => {
  const [stats, setStats] = useState(getRecentYokaiStats());
  const [history, setHistory] = useState<RecentYokaiEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(getRecentYokaiStats());
      if (showHistory) {
        setHistory(getRecentYokaiHistory().slice(0, 20)); // Mostrar últimos 20
      }
    };

    updateStats();
    
    // Actualizar cada vez que se abre el componente
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [showHistory]);

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el historial de yokais recientes?')) {
      clearRecentYokaiHistory();
      setStats(getRecentYokaiStats());
      setHistory([]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (stats.totalPlayed === 0) {
    return (
      <div className="recent-yokai-stats bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Estadísticas Recientes</h3>
        <div className="text-center text-gray-500 py-8">
          <p>¡Juega algunas partidas en modo infinito para ver tus estadísticas!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-yokai-stats bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">📊 Estadísticas Recientes</h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showHistory ? 'Ocultar' : 'Ver'} historial
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPlayed}</div>
          <div className="text-sm text-gray-600">Jugados</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalWon}</div>
          <div className="text-sm text-gray-600">Ganados</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.winRate}%</div>
          <div className="text-sm text-gray-600">Aciertos</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.averageAttempts}</div>
          <div className="text-sm text-gray-600">Promedio</div>
        </div>
      </div>

      {/* Rachas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">🔥 {stats.currentStreak}</div>
          <div className="text-sm text-gray-600">Racha actual</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">🏆 {stats.bestStreak}</div>
          <div className="text-sm text-gray-600">Mejor racha</div>
        </div>
      </div>

      {/* Historial */}
      {showHistory && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Historial Reciente</h4>
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Limpiar historial
            </button>
          </div>
          
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay historial disponible</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={`${entry.id}-${entry.timestamp}`}
                  className={`flex items-center justify-between p-2 rounded text-sm ${
                    entry.won 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${entry.won ? '✅' : '❌'}`}>
                      {entry.won ? '✅' : '❌'}
                    </span>
                    <span className="font-medium text-gray-800 truncate max-w-32">
                      {entry.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>{entry.attempts} intentos</span>
                    <span>•</span>
                    <span>{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentYokaiStats;
