'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import YokaiGrid from '@/components/YokaiGrid';
import YokaiSearch from '@/components/YokaiSearch';
import Confetti from '@/components/Confetti';
import GameOverMessage from '@/components/GameOverMessage';
import MotivationalHint from '@/components/MotivationalHint';
import GameRules from '@/components/GameRules';
import { Yokai, GameState, GameMode, Game } from '@/types/yokai';
import { normalizeYokai } from '@/utils/gameLogic';
import { getDailyYokai, getRandomYokai } from '@/lib/supabase';
import { compareYokai, getTodayDateString, formatDateForDisplay, saveGameToLocalStorage, loadGameFromLocalStorage, createNewInfiniteGame } from '@/utils/gameLogic';
import GameModeSelector from '@/components/GameModeSelector';
import GameSourceSelector from '@/components/GameSourceSelector';
import { saveGameSources, loadGameSources } from '@/utils/gameSourcePreferences';
import { loadMedallium, unlockYokai } from '@/utils/medalliumManager';

const MAX_GUESSES = 6;

// Lista de todos los juegos disponibles obtenidos de los tipos
const AVAILABLE_GAMES: Game[] = [
  'Yo-kai Watch 1',
  'Yo-kai Watch 2', 
  'Yo-kai Watch 3', 
  'Yo-kai Watch 4', 
  'Yo-kai Watch Blasters', 
  'Yo-kai Watch Busters 2',
  'Yo-kai Watch Sangokushi'
];

export default function Home() {
  // Estado para controlar si el juego está activo
  const [isGameActive, setIsGameActive] = useState(false);
  // Estado para la configuración de juegos
  const [selectedGameSources, setSelectedGameSources] = useState<Game[]>([]);
  const [showGameConfig, setShowGameConfig] = useState(false);
  
  // Cargar configuración de juegos guardada
  useEffect(() => {
    const savedSources = loadGameSources();
    if (savedSources && savedSources.length > 0) {
      setSelectedGameSources(savedSources);
    } else {
      // Si no hay nada guardado, seleccionar todos los juegos por defecto
      setSelectedGameSources([...AVAILABLE_GAMES]);
    }
  }, []);
  
  // El popup de actualizaciones ahora se gestiona en el layout global
  // Reiniciar partida infinita: nuevo yokai y limpiar intentos
  const handleNewInfiniteGame = async () => {
    setLoading(true);
    const today = getTodayDateString();
    const randomYokai = await getRandomYokai(selectedGameSources);
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
  
  // Manejar cambios en la selección de juegos
  const handleGameSourcesChange = (sources: Game[]) => {
    setSelectedGameSources(sources);
    saveGameSources(sources);
  };
  
  // Función para recargar el Yo-kai diario cuando llega medianoche
  const handleMidnightReached = async () => {
    console.log('Medianoche alcanzada - cargando nuevo Yo-kai diario');
    if (gameState.gameMode !== 'daily') return;
    
    try {
      setLoading(true);
      const today = getTodayDateString();
      const dailyYokai = await getDailyYokai(today);
      
      if (dailyYokai) {
        // Crear nuevo estado para modo diario pero mantener estadísticas
        const newGameState: GameState = {
          ...gameState,
          currentDate: today,
          dailyYokai,
          guesses: [], // Reiniciar intentos
          gameStatus: 'playing', // Reiniciar estado a jugando
          duelYokai: null,
          duelStats: gameState.duelStats || { totalPlayed: 0, totalWins: 0, totalLosses: 0 },
        };
        
        setGameState(newGameState);
        setGuessResults([]);
        setShowGameOver(false);
        saveGameToLocalStorage(newGameState);
        console.log('Nuevo Yo-kai diario cargado automáticamente:', dailyYokai.name);
      }
    } catch (error) {
      console.error('Error al cargar el nuevo Yo-kai diario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timestamp para forzar recarga de iconos
  const [foodIconTimestamp, setFoodIconTimestamp] = useState<number>(Date.now());
  
  // Estado inicial con modo diario por defecto
  const [gameState, setGameState] = useState<GameState>({
    currentDate: getTodayDateString(),
    dailyYokai: null,
    infiniteYokai: null, // Añadir el campo para separar el Yo-kai diario del infinito
    duelYokai: null, // Añadido para cumplir con GameState
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
    },
    duelStats: {
      totalPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
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

  // Función para verificar si hay un nuevo día y recargar el Yo-kai diario
  const checkForNewDay = async () => {
    const today = getTodayDateString();
    // Si estamos en modo diario y la fecha guardada es diferente a la actual
    if (gameState.gameMode === 'daily' && gameState.currentDate !== today) {
      console.log('Detectado nuevo día, recargando Yo-kai diario...');
      try {
        const dailyYokai = await getDailyYokai(today);
        
        if (dailyYokai) {
          // Crear nuevo estado para modo diario pero mantener estadísticas
          const newGameState: GameState = {
            ...gameState,
            currentDate: today,
            dailyYokai,
            guesses: [], // Reiniciar intentos
            gameStatus: 'playing', // Reiniciar estado a jugando
            duelYokai: null,
            duelStats: gameState.duelStats || { totalPlayed: 0, totalWins: 0, totalLosses: 0 },
          };
          
          setGameState(newGameState);
          setGuessResults([]);
          setShowGameOver(false);
          saveGameToLocalStorage(newGameState);
          console.log('Nuevo Yo-kai diario cargado:', dailyYokai.name);
        }
      } catch (error) {
        console.error('Error al verificar nuevo día:', error);
      }
    }
  };

  // Verificar fecha actual periódicamente
  useEffect(() => {
    // Verificar al montar el componente
    checkForNewDay();
    
    // Verificar cada minuto por si cambia el día mientras la app está abierta
    const intervalId = setInterval(checkForNewDay, 60000);
    
    return () => clearInterval(intervalId);
  }, [gameState.gameMode, gameState.currentDate]);

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
          // Si hay un juego diario guardado
          if (savedGame && savedGame.gameMode === 'daily') {
            // Comprobamos si el juego guardado es del día de hoy o de un día anterior
            if (savedGame.currentDate === today) {
              // Si es del mismo día, continuamos el juego normalmente
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
              // Si es de un día anterior, obtenemos el nuevo Yo-kai diario y reiniciamos el juego
              // pero conservamos las estadísticas
              const dailyYokai = await getDailyYokai(today);
              
              if (dailyYokai) {
                console.log('Nuevo día detectado. Reiniciando juego diario con nuevo Yo-kai:', dailyYokai.name);
                // Crear nuevo estado para modo diario pero mantener estadísticas
                const newGameState: GameState = {
                  currentDate: today,
                  dailyYokai,
                  infiniteYokai: null,
                  guesses: [], // Reiniciar intentos
                  maxGuesses: MAX_GUESSES,
                  gameStatus: 'playing', // Reiniciar estado a jugando
                  lastPlayedDate: null,
                  gameMode: 'daily',
                  streak: savedGame.dailyStats?.streak || 0,
                  maxStreak: savedGame.dailyStats?.maxStreak || 0,
                  totalPlayed: savedGame.dailyStats?.totalPlayed || 0,
                  totalWins: savedGame.dailyStats?.totalWins || 0,
                  dailyStats: {
                    streak: savedGame.dailyStats?.streak || 0,
                    maxStreak: savedGame.dailyStats?.maxStreak || 0,
                    totalPlayed: savedGame.dailyStats?.totalPlayed || 0,
                    totalWins: savedGame.dailyStats?.totalWins || 0
                  },
                  infiniteStats: savedGame.infiniteStats || {
                    totalPlayed: 0,
                    totalWins: 0
                  },
                  duelYokai: null,
                  duelStats: savedGame.duelStats || {
                    totalPlayed: 0,
                    totalWins: 0,
                    totalLosses: 0
                  }
                };
                
                setGameState(newGameState);
                setGuessResults([]);
                saveGameToLocalStorage(newGameState);
              }
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
                duelYokai: null,
                guesses: [],
                maxGuesses: MAX_GUESSES,
                gameStatus: 'playing',
                lastPlayedDate: null,
                gameMode: 'daily',
                streak: gameState.dailyStats?.streak || 0,
                maxStreak: gameState.dailyStats?.maxStreak || 0,
                totalPlayed: gameState.dailyStats?.totalPlayed || 0,
                totalWins: gameState.dailyStats?.totalWins || 0,
                dailyStats: gameState.dailyStats || {
                  streak: 0,
                  maxStreak: 0,
                  totalPlayed: 0,
                  totalWins: 0
                },
                infiniteStats: gameState.infiniteStats || {
                  totalPlayed: 0,
                  totalWins: 0
                },
                duelStats: gameState.duelStats || {
                  totalPlayed: 0,
                  totalWins: 0,
                  totalLosses: 0
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
    setLoading(true);
    
    try {
      // Guardar el estado actual antes de cambiar
      saveGameToLocalStorage(gameState);
      
      const today = getTodayDateString();
      
      // Si estamos cambiando al modo diario, verificar si ya existe un juego diario guardado
      if (newMode === 'daily') {
        // Intentar cargar el estado específico del modo diario
        const savedDailyGame = localStorage.getItem('yokaidle_daily_state');
        
        if (savedDailyGame) {
          const parsedDailyGame = JSON.parse(savedDailyGame) as GameState;
          
          // Verificar si ya existe un juego para el día actual o si necesitamos uno nuevo
          if (parsedDailyGame.currentDate === today) {
            // Si ya existe un juego para hoy, usarlo tal cual
            console.log('Cambiando a modo diario: juego existente para hoy encontrado');
            setGameState(parsedDailyGame);
            setGuessResults(parsedDailyGame.guesses.map((yokai: Yokai) => {
              const normalizedYokai = normalizeYokai(yokai);
              return {
                yokai: normalizedYokai,
                result: compareYokai(parsedDailyGame.dailyYokai as Yokai, normalizedYokai)
              };
            }));
            
            if (parsedDailyGame.gameStatus !== 'playing') {
              setShowGameOver(true);
            } else {
              setShowGameOver(false);
            }
            
            // Desactivar modo de cambio
            setTimeout(() => {
              setChangingMode(false);
              setLoading(false);
            }, 100);
            return;
          } else {
            // Si no existe un juego para hoy pero hay uno de días anteriores
            // Obtener un nuevo Yo-kai diario manteniendo las estadísticas
            console.log('Cambiando a modo diario: necesita un nuevo Yo-kai para hoy');
            const dailyYokai = await getDailyYokai(today);
            
            if (dailyYokai) {
              const newGameState: GameState = {
                currentDate: today,
                dailyYokai,
                infiniteYokai: null,
                guesses: [],
                maxGuesses: MAX_GUESSES,
                gameStatus: 'playing',
                lastPlayedDate: null,
                gameMode: 'daily',
                streak: parsedDailyGame.dailyStats?.streak || 0,
                maxStreak: parsedDailyGame.dailyStats?.maxStreak || 0,
                totalPlayed: parsedDailyGame.dailyStats?.totalPlayed || 0,
                totalWins: parsedDailyGame.dailyStats?.totalWins || 0,
                dailyStats: parsedDailyGame.dailyStats || {
                  streak: 0,
                  maxStreak: 0,
                  totalPlayed: 0,
                  totalWins: 0
                },
                infiniteStats: parsedDailyGame.infiniteStats || {
                  totalPlayed: 0,
                  totalWins: 0
                },
                duelYokai: null,
                duelStats: parsedDailyGame.duelStats || {
                  totalPlayed: 0,
                  totalWins: 0,
                  totalLosses: 0
                }
              };
              
              setGameState(newGameState);
              setGuessResults([]);
              saveGameToLocalStorage(newGameState);
            }
          }
        } else {
          // No hay juego diario guardado, crear uno nuevo
          console.log('Cambiando a modo diario: no hay juego diario guardado');
          const dailyYokai = await getDailyYokai(today);
          
          if (dailyYokai) {
            // Crear un nuevo estado para el modo diario
            const newGameState: GameState = {
              currentDate: today,
              dailyYokai,
              infiniteYokai: null,
              duelYokai: null,
              guesses: [],
              maxGuesses: MAX_GUESSES,
              gameStatus: 'playing',
              lastPlayedDate: null,
              gameMode: 'daily',
              streak: gameState.dailyStats?.streak || 0,
              maxStreak: gameState.dailyStats?.maxStreak || 0,
              totalPlayed: gameState.dailyStats?.totalPlayed || 0,
              totalWins: gameState.dailyStats?.totalWins || 0,
              dailyStats: gameState.dailyStats || {
                streak: 0,
                maxStreak: 0,
                totalPlayed: 0,
                totalWins: 0
              },
              infiniteStats: gameState.infiniteStats || {
                totalPlayed: 0,
                totalWins: 0
              },
              duelStats: gameState.duelStats || {
                totalPlayed: 0,
                totalWins: 0,
                totalLosses: 0
              }
            };
            
            setGameState(newGameState);
            setGuessResults([]);
            saveGameToLocalStorage(newGameState);
          }
        }
      } else if (newMode === 'infinite') {
        // Cambio a modo infinito - simplemente actualizar el modo y permitir que el useEffect maneje la carga
        setGameState(prev => ({
          ...prev,
          gameMode: 'infinite'
        }));
      }
    } catch (error) {
      console.error('Error cambiando de modo de juego:', error);
    }
    
    // Desactivar modo de cambio para permitir la carga
    setTimeout(() => {
      setChangingMode(false);
      setLoading(false);
    }, 100);
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
      
      // Añadir el Yo-kai al Medallium si es acertado
      const medallium = loadMedallium();
      unlockYokai(medallium, targetYokai);
      
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
      duelYokai: gameState.duelYokai ?? null,
      duelStats: gameState.duelStats ?? { totalPlayed: 0, totalWins: 0, totalLosses: 0 },
    };

    setGameState(newGameState);
    setGuessResults(newGuessResults);
    saveGameToLocalStorage(newGameState);
    // Forzar recarga de iconos de comida con un nuevo timestamp
    setFoodIconTimestamp(Date.now());
  }

  useEffect(() => {
    // Considerar el juego activo si hay intentos
    setIsGameActive(guesses.length > 0);
  }, [guesses]);

  return (
    <div className={`home-layout ${isGameActive ? 'game-active' : ''}`}>
      <section className="header-section">
        <h1 className="game-title text-4xl sm:text-5xl font-bold mb-2 text-white text-shadow-md">
          Yo-kaidle
        </h1>
        <p className="game-subtitle text-lg sm:text-xl text-white/90 mb-4">
          ¡Adivina el Yo-kai del día!
        </p>
      </section>

      <section className="controls-section">
        <GameModeSelector
          selectedMode={gameMode}
          onModeSelect={handleModeSelect}
          disableInfinite={infiniteDisabled}
        />
        <GameSourceSelector
          availableGames={AVAILABLE_GAMES}
          selectedGames={selectedGameSources}
          onChange={handleGameSourcesChange}
          disabled={selectedGameSources.length === 0}
        />
      </section>

      <section className="game-section">
        {/* Buscador */}
        <YokaiSearch onSelect={handleGuess} disabled={gameEnded || !selectedTarget} />
        
        {/* Grid de intentos */}
        <YokaiGrid 
          guesses={guesses} 
          maxGuesses={MAX_GUESSES}
          foodIconTimestamp={foodIconTimestamp}
        />

        {/* Mensaje motivacional o pista */}
        {!gameEnded && guesses.length > 0 && (
          <MotivationalHint 
            lastGuess={guesses[guesses.length - 1]} 
            targetYokai={selectedTarget!}
          />
        )}

        {/* Mensaje de fin de juego */}
        {gameEnded && (
          <GameOverMessage
            victory={isVictory}
            yokai={selectedTarget!}
            attempts={guesses.length}
            onShareClick={handleShare}
            onNextClick={gameMode === 'infinite' ? handleNextInfinite : undefined}
            gameMode={gameMode}
          />
        )}
      </section>

      {confetti && <Confetti />}
    </div>
  );
}
