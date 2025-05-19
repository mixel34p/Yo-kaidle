'use client';

import React, { useState, useEffect } from 'react';
import { Yokai, tribeIcons, elementColors, elementIcons, rankIcons, gameLogos, GameMode, tribeTranslations, elementTranslations, foodTranslations, foodIcons } from '@/types/yokai';
import NextYokaiTimer from './NextYokaiTimer';

interface GameOverMessageProps {
  dailyYokai: Yokai;
  won: boolean;
  gameMode: GameMode; // Agregar el modo de juego
  onClose?: () => void; // Prop para cerrar la ventana
  showStats?: () => void; // Prop para mostrar estadísticas
  playAgain?: () => void; // Nueva prop para jugar de nuevo (solo para modo infinito)
  gameStatus?: 'playing' | 'won' | 'lost'; // Estado actual del juego
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({ 
  dailyYokai, 
  won, 
  gameMode, 
  onClose, 
  showStats,
  playAgain,
  gameStatus = won ? 'won' : 'lost' // Por defecto, usar won para determinar el estado
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Usar los iconos de elementos importados arriba

  // Obtener iconos con el manejo apropiado de extensiones
  const getTribeIcon = () => {
    // Extensiones correctas para tribus
    if (dailyYokai.tribe === 'Brave') {
      return '/images/tribes/Brave.PNG';
    }
    return `/images/tribes/${dailyYokai.tribe.toLowerCase()}.png`;
  };
  
  const getGameIcon = () => {
    // Los juegos usan las iniciales en minúscula
    if (dailyYokai.game === 'Yo-kai Watch 1') return '/images/games/yw1.png';
    if (dailyYokai.game === 'Yo-kai Watch 2') return '/images/games/yw2.png';
    if (dailyYokai.game === 'Yo-kai Watch 3') return '/images/games/yw3.png';
    if (dailyYokai.game === 'Yo-kai Watch 4') return '/images/games/yw4.png';
    if (dailyYokai.game === 'Yo-kai Watch Blasters') return '/images/games/ywb.png';
    if (dailyYokai.game === 'Yo-kai Watch Busters 2') return '/images/games/ywb2.png';
    
    return `/images/games/yw1.png`; // Default fallback
  };
  
  const getElementIcon = () => {
    // Usar la definición de iconos de elementos
    return elementIcons[dailyYokai.element] || '/images/elements/none.png';
  };
  
  const getRankIcon = () => {
    // Asegurar el formato exacto para los rangos
    const rankLower = dailyYokai.rank.toLowerCase();
    // Verificar que sea exactamente este formato para todos los rangos
    return `/images/ranks/rank-${rankLower}.png`;
  };
  
  const tribeIcon = getTribeIcon();
  const gameIcon = getGameIcon();
  const elementIcon = getElementIcon();
  const rankIcon = getRankIcon();

  useEffect(() => {
    // Mostrar la ventana con una pequeña animación de entrada
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (won) {
        setShowConfetti(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [won]);

  const handleCloseClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Dar tiempo para la animación de salida
  };

  const handleStatsClick = () => {
    if (showStats) {
      showStats();
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fondo oscuro con desenfoque */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleCloseClick}></div>
      
      {/* Ventana modal */}
      <div 
        className={`relative max-w-md w-11/12 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
        style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(66, 196, 255, 0.4)' }}
      >
        {/* Se eliminó el botón X de la esquina superior */}
        
        {/* Cabecera con fondo de gradiente */}
        <div className={`p-6 text-center ${won ? 'bg-gradient-to-r from-[#22AD55] to-[#0F5298]' : 'bg-gradient-to-r from-[#FF315B] to-[#8A3FFC]'}`}>
          <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">
            {won ? '¡FELICIDADES!' : 'GAME OVER'}
          </h2>
          <p className="text-white text-opacity-90 text-lg">
            {won 
              ? '¡Has adivinado el Yo-kai!' 
              : 'No has logrado adivinar el Yo-kai'
            }
          </p>
          {gameMode === 'daily' && (
            <p className="text-white text-opacity-75 text-sm mt-1">
              Vuelve mañana para un nuevo Yo-kai
            </p>
          )}
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {/* Imagen y nombre del Yo-kai */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <img 
                src={dailyYokai.image_url || dailyYokai.imageurl || dailyYokai.img || dailyYokai.image} 
                alt={dailyYokai.name}
                className="w-full h-full object-contain drop-shadow-lg animate-float"
              />
              
              {/* Estrella decorativa en la esquina si ganó */}
              {won && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 animate-pulse shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--gold-accent)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>{dailyYokai.name}</h3>
          </div>
          
          {/* Características con iconos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Tribu */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0">
                <img src={tribeIcon} alt={dailyYokai.tribe} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Tribu</p>
                <p className="font-medium text-white">{tribeTranslations[dailyYokai.tribe]}</p>
              </div>
            </div>
            
            {/* Rango */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-md" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                {/* Forzar el nombre exacto del archivo para evitar problemas */}
                {dailyYokai.rank === 'E' ? (
                  <img src="/images/ranks/rank-e.png" alt="Rango E" className="w-8 h-8 object-contain" />
                ) : (
                  <img src={rankIcon} alt={dailyYokai.rank} className="w-8 h-8 object-contain" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Rango</p>
                <p className="font-medium text-white">{dailyYokai.rank}</p>
              </div>
            </div>
            
            {/* Elemento */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center">
                <img src={elementIcon} alt={dailyYokai.element} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Elemento</p>
                <p className="font-medium text-white">{elementTranslations[dailyYokai.element]}</p>
              </div>
            </div>

            {/* Comida Favorita */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center">
                <img 
                  src={foodIcons[dailyYokai.favoriteFood]} 
                  alt={foodTranslations[dailyYokai.favoriteFood]}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Comida Favorita</p>
                <p className="font-medium text-white">{foodTranslations[dailyYokai.favoriteFood]}</p>
              </div>
            </div>
            
            {/* Juego */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0">
                <img src={gameIcon} alt={dailyYokai.game} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Juego</p>
                <p className="font-medium text-white">{dailyYokai.game}</p>
              </div>
            </div>
          </div>
          
          {/* Timer para el próximo Yo-kai (solo en modo diario y cuando el juego ha terminado) */}
          {gameMode === 'daily' && (gameStatus === 'won' || gameStatus === 'lost') && (
            <div className="mt-6">
              <NextYokaiTimer gameStatus={won ? 'won' : 'lost'} gameMode={gameMode} />
            </div>
          )}
          
          {/* Botones */}
          <div className="flex flex-col space-y-3">
            {/* Primer fila de botones */}
            <div className="flex space-x-3">
              <button
                onClick={handleStatsClick}
                className="flex-1 py-3 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--primary-color), #FF6384)' }}
              >
                Ver Estadísticas
              </button>
              
              {/* Mostrar botón de jugar de nuevo solo en modo infinito */}
              {gameMode === 'infinite' && (
                <button
                  onClick={() => {
                    if (playAgain) playAgain();
                    handleCloseClick();
                  }}
                  className="flex-1 py-3 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--secondary-color), #1E75D3)' }}
                >
                  Jugar de nuevo
                </button>
              )}
            </div>
            
            {/* Segunda fila para el botón de cerrar */}
            <button
              onClick={handleCloseClick}
              className="py-2 rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
              style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', color: 'white' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverMessage;
