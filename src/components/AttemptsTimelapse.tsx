'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Yokai } from '@/types/yokai';
import YokaiRow from './YokaiRow';

interface AttemptsTimelapseProps {
  guesses: Yokai[];
  dailyYokai: Yokai;
  playbackSpeed?: number; // Velocidad de reproducción (ms por intento)
}

const AttemptsTimelapse: React.FC<AttemptsTimelapseProps> = ({ 
  guesses, 
  dailyYokai,
  playbackSpeed = 800 // Valor predeterminado
}) => {
  const [visibleGuesses, setVisibleGuesses] = useState<Yokai[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Función para comparar Yokai y obtener resultados
  const compareYokai = (targetYokai: Yokai, guessedYokai: Yokai) => {
    const result: any = {
      isCorrect: targetYokai.id === guessedYokai.id
    };
    
    // Verificar tribu
    result.tribe = targetYokai.tribe === guessedYokai.tribe ? 'correct' : 'incorrect';
    
    // Verificar rango (A, B, C, etc.)
    if (targetYokai.rank === guessedYokai.rank) {
      result.rank = 'correct';
    } else {
      // Convertir rango a valor numérico para comparar
      const rankValues: { [key: string]: number } = {
        'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1
      };
      
      const targetRankValue = rankValues[targetYokai.rank] || 0;
      const guessedRankValue = rankValues[guessedYokai.rank] || 0;
      
      if (guessedRankValue > targetRankValue) {
        result.rank = 'lower'; // El rango adivinado es mayor (S es mayor que A)
      } else {
        result.rank = 'higher'; // El rango adivinado es menor
      }
    }
    
    // Verificar elemento
    result.element = targetYokai.element === guessedYokai.element ? 'correct' : 'incorrect';
    
    // Verificar comida favorita
    result.favoriteFood = targetYokai.favoriteFood === guessedYokai.favoriteFood ? 'correct' : 'incorrect';
    
    // Verificar juego
    result.game = targetYokai.game === guessedYokai.game ? 'correct' : 'incorrect';
    
    return result;
  };
  
  // Iniciar/reanudar la reproducción
  const playTimelapse = () => {
    if (currentIndex >= guesses.length) {
      // Si está al final, reiniciar
      setCurrentIndex(0);
      setVisibleGuesses([]);
    }
    
    setIsPlaying(true);
  };
  
  // Pausar la reproducción
  const pauseTimelapse = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Reiniciar la reproducción
  const resetTimelapse = () => {
    pauseTimelapse();
    setCurrentIndex(0);
    setVisibleGuesses([]);
  };
  
  // Efecto para controlar la reproducción
  useEffect(() => {
    if (isPlaying && currentIndex < guesses.length) {
      timerRef.current = setTimeout(() => {
        setVisibleGuesses(prevGuesses => [...prevGuesses, guesses[currentIndex]]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, playbackSpeed);
      
      // Si llegamos al final, detener la reproducción
      if (currentIndex === guesses.length - 1) {
        setTimeout(() => {
          setIsPlaying(false);
        }, playbackSpeed);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex, guesses, playbackSpeed]);
  
  return (
    <div className="attempts-timelapse">
      <div className="mb-4 bg-blue-900 bg-opacity-30 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2 text-white">Progresión de intentos</h3>
        
        <div className="yokai-grid-container mb-4">
          {visibleGuesses.map((yokai, index) => (
            <div key={`timelapse-${index}`} className="yokai-row-wrapper mb-2">
              <YokaiRow 
                yokai={yokai}
                result={compareYokai(dailyYokai, yokai)}
                guessIndex={index}
                isNewRow={index === visibleGuesses.length - 1}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {isPlaying ? (
              <button 
                onClick={pauseTimelapse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={playTimelapse}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            <button 
              onClick={resetTimelapse}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="text-white">
            {currentIndex}/{guesses.length} intentos
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptsTimelapse;
