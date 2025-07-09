'use client';

import React, { useState, useEffect } from 'react';
import { Yokai, tribeTranslations, elementTranslations } from '@/types/yokai';

interface InfiniteHintsProps {
  yokai: Yokai;
  attemptsCount: number;
  hintsEnabled: boolean;
  hintsAfterAttempts: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

interface Hint {
  id: string;
  type: 'tribe' | 'rank' | 'element' | 'game' | 'weight' | 'food';
  message: string;
  icon: string;
  revealed: boolean;
}

const InfiniteHints: React.FC<InfiniteHintsProps> = ({
  yokai,
  attemptsCount,
  hintsEnabled,
  hintsAfterAttempts,
  gameStatus
}) => {
  const [availableHints, setAvailableHints] = useState<Hint[]>([]);
  const [revealedHints, setRevealedHints] = useState<Hint[]>([]);
  const [showHints, setShowHints] = useState(false);

  // Generar pistas disponibles
  useEffect(() => {
    const hints: Hint[] = [
      {
        id: 'tribe',
        type: 'tribe',
        message: `Es de la tribu ${tribeTranslations[yokai.tribe]}`,
        icon: '👥',
        revealed: false
      },
      {
        id: 'rank',
        type: 'rank',
        message: `Su rango es ${yokai.rank}`,
        icon: '⭐',
        revealed: false
      },
      {
        id: 'element',
        type: 'element',
        message: `Su elemento es ${elementTranslations[yokai.element]}`,
        icon: '🔥',
        revealed: false
      },
      {
        id: 'game',
        type: 'game',
        message: `Aparece en ${yokai.game}`,
        icon: '🎮',
        revealed: false
      },
      {
        id: 'weight',
        type: 'weight',
        message: `Pesa ${yokai.weight}kg`,
        icon: '⚖️',
        revealed: false
      },
      {
        id: 'food',
        type: 'food',
        message: `Su comida favorita es ${yokai.favoriteFood}`,
        icon: '🍽️',
        revealed: false
      }
    ];
    
    setAvailableHints(hints);
    setRevealedHints([]); // Reset al cambiar yokai
  }, [yokai]);

  // Revelar pistas automáticamente según intentos
  useEffect(() => {
    if (!hintsEnabled || gameStatus !== 'playing') return;
    
    const hintsToReveal = Math.floor((attemptsCount - hintsAfterAttempts) / 2) + 1;
    
    if (attemptsCount >= hintsAfterAttempts && hintsToReveal > 0) {
      const newRevealedHints = availableHints
        .filter(hint => !revealedHints.some(r => r.id === hint.id))
        .slice(0, hintsToReveal)
        .map(hint => ({ ...hint, revealed: true }));
      
      if (newRevealedHints.length > 0) {
        setRevealedHints(prev => [...prev, ...newRevealedHints]);
      }
    }
  }, [attemptsCount, hintsAfterAttempts, hintsEnabled, availableHints, revealedHints, gameStatus]);

  // No mostrar si las pistas están deshabilitadas
  if (!hintsEnabled) return null;

  // No mostrar si no hay pistas reveladas y no se pueden revelar aún
  if (revealedHints.length === 0 && attemptsCount < hintsAfterAttempts) {
    return (
      <div className="hints-container mb-4">
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <span>💡</span>
            <span className="text-sm">
              Las pistas estarán disponibles después de {hintsAfterAttempts} intentos
            </span>
          </div>
        </div>
      </div>
    );
  }

  // No mostrar si no hay pistas reveladas
  if (revealedHints.length === 0) return null;

  return (
    <div className="hints-container mb-4">
      {/* Botón para mostrar/ocultar pistas */}
      <button
        onClick={() => setShowHints(!showHints)}
        className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 text-yellow-800 rounded-lg border border-yellow-300 transition-all duration-300 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">💡</span>
          <span className="font-medium">
            Pistas disponibles ({revealedHints.length})
          </span>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${showHints ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Lista de pistas reveladas */}
      {showHints && (
        <div className="space-y-3 animate-fadeIn">
          {revealedHints.map((hint, index) => (
            <div
              key={hint.id}
              className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'slideInFromLeft 0.5s ease-out forwards'
              }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{hint.icon}</span>
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">{hint.message}</p>
                  <p className="text-xs text-yellow-600 mt-1 capitalize">
                    Pista de {hint.type === 'tribe' ? 'tribu' : 
                              hint.type === 'rank' ? 'rango' :
                              hint.type === 'element' ? 'elemento' :
                              hint.type === 'game' ? 'juego' :
                              hint.type === 'weight' ? 'peso' : 'comida'}
                  </p>
                </div>
                <div className="text-yellow-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
          
          {/* Información sobre próximas pistas */}
          {gameStatus === 'playing' && revealedHints.length < availableHints.length && (
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600">
                {attemptsCount < hintsAfterAttempts + (revealedHints.length * 2) ? (
                  <>
                    <span className="font-medium">
                      Próxima pista en {hintsAfterAttempts + (revealedHints.length * 2) - attemptsCount} intentos más
                    </span>
                  </>
                ) : (
                  <span className="font-medium">¡Nueva pista disponible!</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InfiniteHints;
