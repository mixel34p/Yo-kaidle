'use client';

import React, { useState, useEffect } from 'react';

interface GameTimerProps {
  isActive: boolean;
  timeLimit: number; // 0 = sin límite, en segundos
  showTimer: boolean;
  onTimeUp?: () => void;
  onTimeUpdate?: (seconds: number) => void;
}

const GameTimer: React.FC<GameTimerProps> = ({
  isActive,
  timeLimit,
  showTimer,
  onTimeUp,
  onTimeUpdate
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Notificar cambio de tiempo
          if (onTimeUpdate) {
            onTimeUpdate(newSeconds);
          }
          
          // Verificar límite de tiempo
          if (timeLimit > 0 && newSeconds >= timeLimit) {
            if (onTimeUp) {
              onTimeUp();
            }
            return newSeconds; // Detener el contador
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLimit, onTimeUp, onTimeUpdate]);

  // Reset cuando se desactiva
  useEffect(() => {
    if (!isActive) {
      setSeconds(0);
    }
  }, [isActive]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (): string => {
    if (timeLimit === 0) return '';
    const remaining = Math.max(0, timeLimit - seconds);
    return formatTime(remaining);
  };

  const getProgressPercentage = (): number => {
    if (timeLimit === 0) return 0;
    return Math.min((seconds / timeLimit) * 100, 100);
  };

  const isTimeRunningOut = (): boolean => {
    if (timeLimit === 0) return false;
    const remaining = timeLimit - seconds;
    return remaining <= 30 && remaining > 0; // Últimos 30 segundos
  };

  const isTimeUp = (): boolean => {
    if (timeLimit === 0) return false;
    return seconds >= timeLimit;
  };

  if (!showTimer && timeLimit === 0) {
    return null; // No mostrar nada si no hay timer ni límite
  }

  return (
    <div className="game-timer mb-4">
      {showTimer && (
        <div className={`text-center p-3 rounded-lg transition-all duration-300 ${
          isTimeUp() 
            ? 'bg-red-100 border-2 border-red-300' 
            : isTimeRunningOut() 
              ? 'bg-yellow-100 border-2 border-yellow-300' 
              : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">
              {isTimeUp() ? '⏰' : isTimeRunningOut() ? '⚠️' : '⏱️'}
            </span>
            
            <div className="text-lg font-mono font-bold">
              {timeLimit > 0 ? (
                <div className="flex items-center space-x-2">
                  <span className={`${
                    isTimeUp() 
                      ? 'text-red-600' 
                      : isTimeRunningOut() 
                        ? 'text-yellow-600' 
                        : 'text-blue-600'
                  }`}>
                    {getTimeRemaining()}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 text-sm">
                    {formatTime(seconds)}
                  </span>
                </div>
              ) : (
                <span className="text-blue-600">
                  {formatTime(seconds)}
                </span>
              )}
            </div>
          </div>
          
          {/* Barra de progreso para límite de tiempo */}
          {timeLimit > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isTimeUp() 
                      ? 'bg-red-500' 
                      : isTimeRunningOut() 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0:00</span>
                <span>{formatTime(timeLimit)}</span>
              </div>
            </div>
          )}
          
          {/* Mensaje de estado */}
          {isTimeUp() && (
            <div className="mt-2 text-sm text-red-600 font-medium">
              ¡Tiempo agotado!
            </div>
          )}
          {isTimeRunningOut() && !isTimeUp() && (
            <div className="mt-2 text-sm text-yellow-600 font-medium">
              ¡Últimos segundos!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameTimer;
