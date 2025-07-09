'use client';

import React, { useState, useEffect } from 'react';
import { getRecentYokaiStats, getRecentYokaiHistory, clearRecentYokaiHistory, RecentYokaiEntry } from '@/utils/recentYokaiManager';

interface InfiniteStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfiniteStatsModal: React.FC<InfiniteStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(getRecentYokaiStats());
  const [history, setHistory] = useState<RecentYokaiEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(getRecentYokaiStats());
      setHistory(getRecentYokaiHistory().slice(0, 20));
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">📊 Estadísticas del Modo Infinito</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {stats.totalPlayed === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">¡Aún no has jugado!</h3>
              <p>Juega algunas partidas en modo infinito para ver tus estadísticas aquí.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estadísticas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalPlayed}</div>
                  <div className="text-sm text-gray-600 mt-1">Total jugados</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{stats.totalWon}</div>
                  <div className="text-sm text-gray-600 mt-1">Ganados</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{stats.winRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Tasa de aciertos</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">{stats.averageAttempts}</div>
                  <div className="text-sm text-gray-600 mt-1">Promedio intentos</div>
                </div>
              </div>

              {/* Rachas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">🔥 {stats.currentStreak}</div>
                  <div className="text-sm text-gray-600 mt-1">Racha actual</div>
                  {stats.currentStreak > 0 && (
                    <div className="mt-2 text-xs text-yellow-700">¡Sigue así!</div>
                  )}
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">🏆 {stats.bestStreak}</div>
                  <div className="text-sm text-gray-600 mt-1">Mejor racha</div>
                  {stats.currentStreak >= stats.bestStreak && stats.bestStreak > 0 && (
                    <div className="mt-2 text-xs text-red-700">¡Nuevo récord!</div>
                  )}
                </div>
              </div>

              {/* Progreso visual de racha */}
              {stats.bestStreak > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso de racha</span>
                    <span className="text-sm text-gray-500">{stats.currentStreak} / {stats.bestStreak}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((stats.currentStreak / stats.bestStreak) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Historial */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Historial Reciente</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showHistory ? 'Ocultar' : 'Mostrar'} historial
                    </button>
                    {history.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
                
                {showHistory && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay historial disponible</p>
                    ) : (
                      history.map((entry, index) => (
                        <div
                          key={`${entry.id}-${entry.timestamp}`}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            entry.won 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">
                              {entry.won ? '✅' : '❌'}
                            </span>
                            <div>
                              <div className="font-medium text-gray-800 truncate max-w-48">
                                {entry.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {entry.attempts} intentos • {formatDate(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.won 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.won ? 'Ganado' : 'Perdido'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfiniteStatsModal;
