import React, { useState, useEffect } from 'react';

interface NextYokaiTimerProps {
  gameStatus: 'playing' | 'won' | 'lost';
  gameMode: 'daily' | 'infinite';
  onMidnightReached?: () => void; // Nueva prop para manejar el evento de medianoche
}

const NextYokaiTimer: React.FC<NextYokaiTimerProps> = ({ 
  gameStatus, 
  gameMode, 
  onMidnightReached 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isMidnightReached, setIsMidnightReached] = useState(false);

  useEffect(() => {
    // Solo calcular el tiempo si estamos en modo diario y el juego ha terminado
    if (gameMode !== 'daily' || gameStatus === 'playing') return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeRemaining({
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds
      });
      
      // Verificar si ya llegamos a medianoche
      if (diffMs <= 0 && !isMidnightReached) {
        setIsMidnightReached(true);
        // Llamar al callback para actualizar el juego cuando sea medianoche
        if (onMidnightReached) {
          onMidnightReached();
        }
      }
    };

    // Calcular el tiempo inicial
    calculateTimeRemaining();

    // Actualizar cada segundo
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [gameMode, gameStatus, onMidnightReached, isMidnightReached]);

  // No mostrar nada si no es modo diario o el juego sigue en progreso
  if (gameMode !== 'daily' || gameStatus === 'playing') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600/80 to-blue-800/80 text-white rounded-lg p-4 text-center shadow-lg max-w-md mx-auto mt-4 border border-blue-300/30 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-2 text-blue-100">Próximo Yo-kaidle en</h3>
      <div className="flex justify-center space-x-2 text-2xl font-bold">
        <div className="flex flex-col items-center">
          <span className="bg-blue-900/50 rounded p-2 min-w-[3rem]">{timeRemaining.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs mt-1 text-blue-200">horas</span>
        </div>
        <span className="self-center">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-blue-900/50 rounded p-2 min-w-[3rem]">{timeRemaining.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs mt-1 text-blue-200">minutos</span>
        </div>
        <span className="self-center">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-blue-900/50 rounded p-2 min-w-[3rem]">{timeRemaining.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs mt-1 text-blue-200">segundos</span>
        </div>
      </div>
      
      {/* Mensaje adicional para clarificar que se actualizará automáticamente a medianoche */}
      <p className="text-xs mt-3 text-blue-200">
        El nuevo Yo-kai estará disponible automáticamente a medianoche.
      </p>
    </div>
  );
};

export default NextYokaiTimer;
