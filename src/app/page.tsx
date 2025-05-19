'use client';

import React, { useState, useEffect } from 'react';
import YokaiGrid from '@/components/YokaiGrid';
import YokaiSearch from '@/components/YokaiSearch';
import Confetti from '@/components/Confetti';
import GameOverMessage from '@/components/GameOverMessage';
import MotivationalHint from '@/components/MotivationalHint';
import GameRules from '@/components/GameRules';
import { Yokai, GameState, GameMode } from '@/types/yokai';
import { normalizeYokai } from '@/utils/gameLogic';
import { getDailyYokai, getRandomYokai } from '@/lib/supabase';
import { compareYokai, getTodayDateString, formatDateForDisplay, saveGameToLocalStorage, loadGameFromLocalStorage, createNewInfiniteGame } from '@/utils/gameLogic';
import GameModeSelector from '@/components/GameModeSelector';
// El Footer y UpdatesPopup ahora están en el layout global

const MAX_GUESSES = 6;

export default function Home() {
  // El popup de actualizaciones ahora se gestiona en el layout global
  // Reiniciar partida infinita: nuevo yokai y limpiar intentos
  const handleNewInfiniteGame = async () => {
    setLoading(true);
    const today = getTodayDateString();
    const randomYokai = await getRandomYokai();
    if (randomYokai) {
      const newGameState = createNewInfiniteGame(today, randomYokai, gameState);
      setGameState(newGameState);
      setGuessResults([]);
      setShowGameOver(false);
      setMessage("");
      setFoodIconTimestamp(Date.now());
      saveGameToLocalStorage(newGameState);
    }
    setLoading(false);
  };

  // Timestamp para forzar recarga de iconos
  const [foodIconTimestamp, setFoodIconTimestamp] = useState<number>(Date.now());
  
  // Estado inicial con modo diario por defecto
  const [gameState, setGameState] = useState<GameState>({
    currentDate: getTodayDateString(),
    dailyYokai: null,
    infiniteYokai: null, // Añadir el campo para separar el Yo-kai diario del infinito
    guesses: [],
    maxGuesses: MAX_GUESSES,
    gameStatus: 'playing',
    lastPlayedDate: null,
    gameMode: 'daily',
    streak: 0,
    maxStreak: 0,
    totalPlayed: 0,
    totalWins: 0,
    dailyStats: {
      streak: 0,
      maxStreak: 0,
      totalPlayed: 0,
      totalWins: 0
    },
    infiniteStats: {
      totalPlayed: 0,
      totalWins: 0
    }
  });

  const [guessResults, setGuessResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Estado para controlar si estamos cambiando de modo
  const [changingMode, setChangingMode] = useState(false);

  // Mostrar Game Over siempre que el estado sea 'won' o 'lost'
  useEffect(() => {
    if (!loading && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost')) {
      setShowGameOver(true);
    } else if (!loading) {
      setShowGameOver(false);
    }
  }, [gameState.gameStatus, loading]);

  // Cargar el juego guardado o iniciar uno nuevo basándonos en el modo
  useEffect(() => {
    // Evitar recargar si estamos cambiando de modo
    if (changingMode) return;

    const loadGame = async () => {
      try {
        const today = getTodayDateString();
        const currentMode = gameState.gameMode; // Usar el modo actual
        
        // Intentar cargar juego guardado para el modo actual
        const savedGame = loadGameFromLocalStorage(currentMode);
        
        // Lógica para el modo diario
        if (currentMode === 'daily') {
          // Si hay un juego diario guardado y es de hoy
          if (savedGame && savedGame.currentDate === today && savedGame.gameMode === 'daily') {
            setGameState(savedGame);
            setGuessResults(savedGame.guesses.map((yokai: Yokai) => {
              // Normaliza el campo favoriteFood si viene en snake_case
              const normalizedYokai = {
                ...yokai,
                favoriteFood: yokai.favoriteFood || (yokai as any).favorite_food || 'None'
              };
              return {
                yokai: normalizedYokai,
                result: compareYokai(savedGame.dailyYokai as Yokai, normalizedYokai)
              };
            }));
            
            // Mostrar la ventana de fin de juego si el juego no está en progreso
            if (savedGame.gameStatus !== 'playing') {
              setShowGameOver(true);
            }
          } else {
            // Obtener un nuevo Yo-kai diario
            const dailyYokai = await getDailyYokai(today);
            
            if (dailyYokai) {
              // Crear nuevo estado para modo diario
              const newGameState: GameState = {
                currentDate: today,
                dailyYokai,
                infiniteYokai: null, // Campo necesario después de actualizar GameState
                guesses: [],
                maxGuesses: MAX_GUESSES,
                gameStatus: 'playing',
                lastPlayedDate: null,
                gameMode: 'daily',
                streak: savedGame?.dailyStats?.streak || 0,
                maxStreak: savedGame?.dailyStats?.maxStreak || 0,
                totalPlayed: savedGame?.dailyStats?.totalPlayed || 0,
                totalWins: savedGame?.dailyStats?.totalWins || 0,
                dailyStats: {
                  streak: savedGame?.dailyStats?.streak || 0,
                  maxStreak: savedGame?.dailyStats?.maxStreak || 0,
                  totalPlayed: savedGame?.dailyStats?.totalPlayed || 0,
                  totalWins: savedGame?.dailyStats?.totalWins || 0
                },
                infiniteStats: savedGame?.infiniteStats || {
                  totalPlayed: 0,
                  totalWins: 0
                }
              };
              
              setGameState(newGameState);
              saveGameToLocalStorage(newGameState);
            }
          }
        } 
        // Lógica para el modo infinito
        else if (currentMode === 'infinite') {
          // En modo infinito, si NO hay juego guardado, creamos uno nuevo
          if (!savedGame || savedGame.gameMode !== 'infinite') {
            // Obtener un Yo-kai aleatorio para modo infinito
            const randomYokai = await getRandomYokai();
            if (randomYokai) {
              // Usar la función auxiliar para crear un nuevo juego infinito
              const newGameState = createNewInfiniteGame(today, randomYokai, savedGame);
              setGameState(newGameState);
              saveGameToLocalStorage(newGameState);
              setGuessResults([]);
              // Mostrar Game Over si el estado inicial no es 'playing'
              if (newGameState.gameStatus !== 'playing') {
                setShowGameOver(true);
              } else {
                setShowGameOver(false);
              }
            }
          } else {
            // Continuar con el juego infinito guardado (sin importar el estado)
            setGameState(savedGame);
            setGuessResults(savedGame.guesses.map((yokai: Yokai) => {
              // Normaliza el campo favoriteFood si viene en snake_case
              const normalizedYokai = {
                ...yokai,
                favoriteFood: yokai.favoriteFood || (yokai as any).favorite_food || 'None'
              };
              // Usar solo infiniteYokai como objetivo
              const targetYokai = savedGame.infiniteYokai;
              return {
                yokai: normalizedYokai,
                result: targetYokai ? compareYokai(targetYokai as Yokai, normalizedYokai) : null
              };
            }));
            // Mostrar Game Over si el estado no es 'playing'
            if (savedGame.gameStatus !== 'playing') {
              setShowGameOver(true);
            } else {
              setShowGameOver(false);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading game:', error);
        setLoading(false);
      }
    };
    
    loadGame();
  }, [gameState.gameMode, changingMode]);

  // Función para cambiar entre modos de juego
  const handleModeChange = async (newMode: GameMode) => {
    if (newMode === gameState.gameMode) return;
    
    setChangingMode(true);
    
    // Guardar el estado actual antes de cambiar
    saveGameToLocalStorage(gameState);
    
    // Actualizar el estado con el nuevo modo
    setGameState(prev => ({
      ...prev,
      gameMode: newMode
    }));
    
    // Desactivar modo de cambio para permitir la carga
    setTimeout(() => setChangingMode(false), 100);
  };

  // Manejar una nueva adivinanza
  const handleGuess = (yokai: Yokai) => {
    // Determinar qué Yo-kai objetivo se debe usar según el modo de juego
    const targetYokai = gameState.gameMode === 'daily' ? 
      gameState.dailyYokai : 
      gameState.infiniteYokai || gameState.dailyYokai; // Fallback al dailyYokai para compatibilidad
    
    if (gameState.gameStatus !== 'playing' || !targetYokai) {
      return;
    }

    // Normalizar el Yokai igual que en GameOverMessage
    const normalizedYokai = normalizeYokai(yokai);

    // Comprobar si ya se ha adivinado este Yo-kai
    if (gameState.guesses.some(g => g.id === yokai.id)) {
      setMessage('Ya has intentado con este Yo-kai');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const result = compareYokai(targetYokai, normalizedYokai);
    const newGuesses = [...gameState.guesses, normalizedYokai];
    const newGuessResults = [...guessResults, { yokai, result }];
    
    // Preparar las estadísticas según el modo de juego
    const isDaily = gameState.gameMode === 'daily';
    
    // Clonar las estadísticas actuales
    const newDailyStats = { ...gameState.dailyStats };
    const newInfiniteStats = { ...gameState.infiniteStats };
    
    let newGameStatus: 'playing' | 'won' | 'lost' = gameState.gameStatus;
    let newStreak = gameState.streak;
    let newMaxStreak = gameState.maxStreak;
    
    // Comprobar si el juego ha terminado
    if (result.isCorrect) {
      newGameStatus = 'won';
      
      // Actualizar estadísticas según el modo
      if (isDaily) {
        newDailyStats.streak++;
        newDailyStats.maxStreak = Math.max(newDailyStats.streak, newDailyStats.maxStreak);
        newDailyStats.totalPlayed++;
        newDailyStats.totalWins++;
        
        // En modo diario también actualizamos la racha general
        newStreak = newDailyStats.streak;
        newMaxStreak = newDailyStats.maxStreak;
      } else {
        newInfiniteStats.totalPlayed++;
        newInfiniteStats.totalWins++;
        // No hay rachas en modo infinito
      }
      
      setMessage('');
      // Retrasar la pantalla de victoria para permitir que se complete la animación de todas las celdas
      const animationDuration = 3000; // 1s para la última celda + 2s adicionales para asegurar que todo termina
      setTimeout(() => setShowGameOver(true), animationDuration);
    } else if (newGuesses.length >= MAX_GUESSES) {
      newGameStatus = 'lost';
      
      // Actualizar estadísticas según el modo
      if (isDaily) {
        newDailyStats.streak = 0; // Resetear racha solo en modo diario
        newDailyStats.totalPlayed++;
        
        // En modo diario también actualizamos la racha general
        newStreak = 0;
      } else {
        newInfiniteStats.totalPlayed++;
      }
      
      setMessage('');
      // Retrasar la pantalla de derrota para permitir que se complete la animación de todas las celdas
      const animationDuration = 3000; // 1s para la última celda + 2s adicionales para asegurar que todo termina
      setTimeout(() => setShowGameOver(true), animationDuration);
    }
    
    // Actualizar el estado del juego
    const newGameState: GameState = {
      ...gameState,
      guesses: newGuesses,
      gameStatus: newGameStatus,
      streak: newStreak,
      maxStreak: newMaxStreak,
      dailyStats: newDailyStats,
      infiniteStats: newInfiniteStats,
      lastPlayedDate: newGameStatus !== 'playing' ? getTodayDateString() : gameState.lastPlayedDate,
    };

    setGameState(newGameState);
    setGuessResults(newGuessResults);
    saveGameToLocalStorage(newGameState);
    // Forzar recarga de iconos de comida con un nuevo timestamp
    setFoodIconTimestamp(Date.now());
  }

return (
  <div className="app-container">

    {/* CABECERA */}
    <header className="mb-6 text-center">
      <div className="flex justify-center mb-4 px-1">
        <img 
          src="/images/logo/logo.png" 
          alt="Yo-kaidle Logo" 
          className="w-full object-contain drop-shadow-2xl" 
          style={{ maxHeight: 'calc(30vh)' }}
        />
      </div>
      <p className="mt-2 text-gray-600 font-medium">Un wordle de Yo-kai Watch.</p>
    </header>


    {/* REGLAS DEL JUEGO */}
    <GameRules />

    {/* MENSAJE DE MOTIVACIÓN */}
    <MotivationalHint guessCount={guessResults.length} maxGuesses={gameState.maxGuesses} />

    {/* MENSAJE DE ERROR/INFO */}
    {message && (
      <div className="mb-4 p-2 bg-red-100 text-red-700 rounded shadow text-center animate-pulse">
        {message}
      </div>
    )}

    {/* CONFFETI AL GANAR */}
    {gameState.gameStatus === 'won' && <Confetti active={true} />}

    {/* GAME OVER MESSAGE */}
    {showGameOver && ((gameState.gameMode === 'daily' ? gameState.dailyYokai : gameState.infiniteYokai) && (
      <GameOverMessage
        dailyYokai={(gameState.gameMode === 'daily' ? gameState.dailyYokai : gameState.infiniteYokai) as Yokai}
        won={gameState.gameStatus === 'won'}
        gameMode={gameState.gameMode}
        gameStatus={gameState.gameStatus}
        onClose={() => setShowGameOver(false)}
        showStats={() => setShowStats(true)}
        playAgain={gameState.gameMode === 'infinite' ? handleNewInfiniteGame : undefined}
      />
    ))}

    {/* SELECCIÓN DE MODO DE JUEGO */}
    <div className="mb-4">
      <GameModeSelector currentMode={gameState.gameMode} onModeChange={handleModeChange} />
      {gameState.gameMode === 'infinite' && (
        <button
          className="mt-3 w-full py-2 rounded-lg font-semibold text-base shadow bg-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-150"
          onClick={handleNewInfiniteGame}
          
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity="0.12" />
            <circle cx="8" cy="8" r="1.5" fill="white" />
            <circle cx="16" cy="8" r="1.5" fill="white" />
            <circle cx="12" cy="12" r="1.5" fill="white" />
            <circle cx="8" cy="16" r="1.5" fill="white" />
            <circle cx="16" cy="16" r="1.5" fill="white" />
          </svg>
          Nuevo Yo-kai
        </button>
      )}
    </div>

    {/* CUADRÍCULA DE ADIVINANZAS */}
    <YokaiGrid 
      guesses={guessResults} 
      maxGuesses={gameState.maxGuesses} 
      foodIconTimestamp={foodIconTimestamp} 
    />

    {/* CONTADOR DE INTENTOS Y BÚSQUEDA */}
    <div className="w-full mb-6 mt-4">
      <div className="relative">
        <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-md z-10">
          {MAX_GUESSES - guessResults.length}
        </div>
        <YokaiSearch onSelect={handleGuess} disabled={gameState.gameStatus !== 'playing'} />
      </div>
    </div>

    {/* MENSAJE DE FINAL DE PARTIDA Y BOTÓN DE ESTADÍSTICAS */}
    {gameState.gameStatus !== 'playing' && !showGameOver && (
      <div className="text-center mt-6 p-4 bg-gradient-to-r from-blue-600/80 to-blue-800/80 rounded-lg shadow-md border border-blue-300/30 backdrop-blur-sm text-white">
        <button 
          className="btn-primary transform hover:scale-105 transition-transform"
          onClick={() => setShowStats(true)}
        >
          Ver estadísticas
        </button>
      </div>
    )}

    {/* ESTADÍSTICAS */}
    {showStats && (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative max-w-md w-11/12 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
             style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(66, 196, 255, 0.4)', color: 'white' }}>
          {/* Cabecera con fondo de gradiente */}
          <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, var(--dark-blue), var(--secondary-color))' }}>
            <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">ESTADÍSTICAS</h2>
            <p className="text-white text-opacity-90 text-lg">Tu progreso en Yo-kaidle</p>
          </div>
          <div className="p-6">
            {/* Selector de modo para estadísticas */}
            <div className="mb-6">
              <GameModeSelector 
                currentMode={gameState.gameMode} 
                onModeChange={handleModeChange} 
              />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: 'var(--gold-accent)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
              {gameState.gameMode === 'daily' ? 'Estadísticas del Modo Diario' : 'Estadísticas del Modo Infinito'}
            </h3>
            {/* Estadísticas con iconos y datos */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Juegos jugados */}
              <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(66, 196, 255, 0.3)', color: 'white' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  </svg>
                </div>
                <div>
                  <p className="stat-value font-bold text-xl">
                    {gameState.gameMode === 'daily' 
                      ? gameState.dailyStats.totalPlayed 
                      : gameState.infiniteStats.totalPlayed}
                  </p>
                  <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>PARTIDAS</p>
                </div>
              </div>
              {/* Porcentaje de victorias */}
              <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(39, 199, 90, 0.3)', color: 'white' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="stat-value font-bold text-xl">
                    {gameState.gameMode === 'daily'
                      ? (gameState.dailyStats.totalPlayed > 0 
                          ? Math.round((gameState.dailyStats.totalWins / gameState.dailyStats.totalPlayed) * 100) 
                          : 0)
                      : (gameState.infiniteStats.totalPlayed > 0 
                          ? Math.round((gameState.infiniteStats.totalWins / gameState.infiniteStats.totalPlayed) * 100) 
                          : 0)
                    }%
                  </p>
                  <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>VICTORIAS</p>
                </div>
              </div>
              {/* Racha actual (solo en modo diario) */}
              {gameState.gameMode === 'daily' && (
                <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                  <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(255, 149, 0, 0.3)', color: 'white' }}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="stat-value font-bold text-xl">{gameState.dailyStats.streak}</p>
                    <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>RACHA ACTUAL</p>
                  </div>
                </div>
              )}
              {/* Mejor racha (solo en modo diario) */}
              {gameState.gameMode === 'daily' && (
                <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                  <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(175, 82, 222, 0.3)', color: 'white' }}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <div>
                    <p className="stat-value font-bold text-xl">{gameState.dailyStats.maxStreak}</p>
                    <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>MEJOR RACHA</p>
                  </div>
                </div>
              )}
              {/* Juegos ganados (solo en modo infinito) */}
              {gameState.gameMode === 'infinite' && (
                <div className="p-3 rounded-lg shadow-sm flex items-center col-span-2" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                  <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(255, 205, 41, 0.3)', color: 'white' }}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="stat-value font-bold text-xl">{gameState.infiniteStats.totalWins}</p>
                    <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>TOTAL DE VICTORIAS EN MODO INFINITO</p>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="w-full py-3 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--dark-blue))' }}
              onClick={() => setShowStats(false)}
            >
              Continuar jugando
            </button>
          </div>
        </div>
      </div>
    )}


    {/* El pie de página ahora está en el layout */}
  </div>
)
}
