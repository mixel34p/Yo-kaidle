'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import TribeRestrictionsSelector from '@/components/TribeRestrictionsSelector';
import { saveGameSources, loadGameSources, saveTribeRestrictions, loadTribeRestrictions, TribeRestrictions } from '@/utils/gameSourcePreferences';
import { loadMedallium, unlockYokai } from '@/utils/medalliumManager';
import { checkAchievements } from '@/utils/achievementSystem';
import { checkCircleCompletion } from '@/utils/circlesManager';
import { getAllYokai } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getCurrentPoints, addPointsForGuess } from '@/utils/economyManager';
import HintsPanel from '@/components/HintsPanel';
import ActiveHints from '@/components/ActiveHints';
import BackgroundsPanel from '@/components/BackgroundsPanel';
import { initializeBackgrounds } from '@/utils/backgroundsManager';
import JukeboxPanel from '@/components/JukeboxPanel';
import SocialAvatar from '@/components/SocialAvatar';
import EventButton, { useEventVisibility } from '@/components/EventButton';
import SocialLoginButton from '@/components/SocialLoginButton';

import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useSocialStats, triggerSocialStatsSync } from '@/hooks/useSocialStats';
import { getActiveEvents, getEventFilterForRandomYokai } from '@/utils/eventManager';


import {
  loadHintsState,
  saveHintsState,
  useHint,
  GameHintsState,
  HintType
} from '@/utils/hintsManager';


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

// Juegos deshabilitados (no disponibles aún)
const DISABLED_GAMES: Game[] = ['Yo-kai Watch 4', 'Yo-kai Watch Busters 2'];

// Juegos habilitados para selección por defecto
const ENABLED_GAMES: Game[] = AVAILABLE_GAMES.filter(game => !DISABLED_GAMES.includes(game));

// Componente interno que usa las traducciones
function HomeContent() {
  // Hook para traducciones
  const { t, language } = useLanguage();

  // Hook para auth social
  const { user } = useSocialAuth();
  const router = useRouter();

  // Hook para sincronizar estadísticas sociales
  useSocialStats();

  // Hook para eventos (temporalmente deshabilitado hasta que se implementen Yo-kai de Blasters 2)
  const { shouldShowEventButton } = useEventVisibility();

  // Función para obtener filtro de evento activo
  const getEventFilter = async () => {
    try {
      const activeEvents = await getActiveEvents();
      if (activeEvents.length > 0) {
        const primaryEvent = activeEvents[0];
        return await getEventFilterForRandomYokai(primaryEvent);
      }
    } catch (error) {
      console.error('Error getting event filter:', error);
    }
    return undefined;
  };



  // Estado para la configuración de juegos
  const [selectedGameSources, setSelectedGameSources] = useState<Game[]>([]);
  const [showGameConfig, setShowGameConfig] = useState(false);

  // Estado para las restricciones de tribus
  const [tribeRestrictions, setTribeRestrictions] = useState<TribeRestrictions>({ excludeBossTribes: false });

  // Estado para los puntos del usuario
  const [currentPoints, setCurrentPoints] = useState<number>(0);

  // Estado para las ayudas
  const [showHintsPanel, setShowHintsPanel] = useState<boolean>(false);
  const [hintsState, setHintsState] = useState<GameHintsState | null>(null);

  // Estado para puntos ganados en la partida actual
  const [pointsEarnedThisGame, setPointsEarnedThisGame] = useState<number>(0);

  // Estado para el panel de fondos
  const [showBackgroundsPanel, setShowBackgroundsPanel] = useState<boolean>(false);

  // Estado para el panel del jukebox
  const [showJukeboxPanel, setShowJukeboxPanel] = useState<boolean>(false);

  // Cargar configuración de juegos guardada
  useEffect(() => {
    const savedSources = loadGameSources();
    if (savedSources && savedSources.length > 0) {
      // Filtrar juegos guardados para excluir los deshabilitados
      const enabledSavedSources = savedSources.filter(game => !DISABLED_GAMES.includes(game));
      setSelectedGameSources(enabledSavedSources.length > 0 ? enabledSavedSources : [...ENABLED_GAMES]);
    } else {
      // Si no hay nada guardado, seleccionar solo los juegos habilitados por defecto
      setSelectedGameSources([...ENABLED_GAMES]);
    }
  }, []);

  // Cargar restricciones de tribus guardadas
  useEffect(() => {
    const savedRestrictions = loadTribeRestrictions();
    setTribeRestrictions(savedRestrictions);
  }, []);

  // Cargar puntos actuales
  useEffect(() => {
    setCurrentPoints(getCurrentPoints());
  }, []);

  // Cargar estado de ayudas para la fecha actual
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentHintsState = loadHintsState(today);
    setHintsState(currentHintsState);
  }, []);

  // Inicializar sistema de fondos
  useEffect(() => {
    initializeBackgrounds();
  }, []);



  // Actualizar puntos cuando el usuario regrese a la página (por ejemplo, desde el medallium)
  useEffect(() => {
    const handleFocus = () => {
      setCurrentPoints(getCurrentPoints());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Función para usar una ayuda
  const handleUseHint = (hintType: HintType) => {
    if (!hintsState) return;

    // Determinar qué Yo-kai objetivo se debe usar según el modo de juego
    const targetYokai = gameState.gameMode === 'daily' ?
      gameState.dailyYokai :
      gameState.infiniteYokai || gameState.dailyYokai;

    if (!targetYokai) return;

    const result = useHint(hintType, targetYokai, hintsState);

    if (result.success && result.newState) {
      setHintsState(result.newState);
      setCurrentPoints(getCurrentPoints()); // Actualizar puntos

      // Si es intento extra, actualizar maxGuesses
      if (hintType === 'extra_attempt') {
        setGameState(prev => ({
          ...prev,
          maxGuesses: prev.maxGuesses + 1
        }));
      }

      // Mostrar notificación de éxito (opcional)
      console.log('Ayuda usada:', result.revealedInfo);
    } else {
      // Mostrar error (opcional)
      console.error('Error usando ayuda:', result.error);
    }
  };

  // El popup de actualizaciones ahora se gestiona en el layout global
  // Reiniciar partida infinita: nuevo yokai y limpiar intentos
  const handleNewInfiniteGame = async () => {
    setLoading(true);
    const today = getTodayDateString();
    const eventFilter = await getEventFilter();
    const randomYokai = await getRandomYokai(selectedGameSources, tribeRestrictions.excludeBossTribes, eventFilter);
    if (randomYokai) {
      const newGameState = createNewInfiniteGame(today, randomYokai, gameState);
      setGameState(newGameState);
      setGuessResults([]);
      setShowGameOver(false);
      setMessage("");
      setFoodIconTimestamp(Date.now());
      setPointsEarnedThisGame(0); // Resetear puntos ganados
      saveGameToLocalStorage(newGameState);

      // 🎮 SINCRONIZAR ESTADÍSTICAS SOCIALES AL EMPEZAR NUEVA PARTIDA INFINITA
      if (user) {
        console.log('🎮 New infinite game started - syncing social stats');
        triggerSocialStatsSync();
      }
    }
    setLoading(false);
  };

  // Manejar cambios en la selección de juegos
  const handleGameSourcesChange = (sources: Game[]) => {
    setSelectedGameSources(sources);
    saveGameSources(sources);
  };

  // Manejar cambios en las restricciones de tribus
  const handleTribeRestrictionsChange = (restrictions: TribeRestrictions) => {
    setTribeRestrictions(restrictions);
    saveTribeRestrictions(restrictions);
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

      // 🎮 SINCRONIZAR ESTADÍSTICAS SOCIALES AL TERMINAR PARTIDA
      if (user) {
        console.log('🎮 Game finished - syncing social stats immediately');
        triggerSocialStatsSync();
      }
    } else if (!loading) {
      setShowGameOver(false);
    }
  }, [gameState.gameStatus, loading, user]);

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
                // Normalizar tanto el Yo-kai adivinado como el objetivo
                const normalizedYokai = normalizeYokai(yokai);
                const normalizedTargetYokai = normalizeYokai(savedGame.dailyYokai as Yokai);
                return {
                  yokai: normalizedYokai,
                  result: compareYokai(normalizedTargetYokai, normalizedYokai)
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
            const eventFilter = await getEventFilter();
            const randomYokai = await getRandomYokai(selectedGameSources, tribeRestrictions.excludeBossTribes, eventFilter);
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
              // Normalizar tanto el Yo-kai adivinado como el objetivo
              const normalizedYokai = normalizeYokai(yokai);
              const targetYokai = savedGame.infiniteYokai;
              const normalizedTargetYokai = targetYokai ? normalizeYokai(targetYokai as Yokai) : null;
              return {
                yokai: normalizedYokai,
                result: normalizedTargetYokai ? compareYokai(normalizedTargetYokai, normalizedYokai) : null
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
    setPointsEarnedThisGame(0); // Resetear puntos ganados al cambiar modo

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
    const newGuessResults = [...guessResults, { yokai: normalizedYokai, result }];

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

      // Añadir puntos por adivinar correctamente (solo en modos daily e infinite)
      if (gameState.gameMode === 'daily' || gameState.gameMode === 'infinite') {
        const pointsEarned = addPointsForGuess(gameState.gameMode, targetYokai.name);
        setPointsEarnedThisGame(pointsEarned);
        setCurrentPoints(getCurrentPoints()); // Actualizar puntos mostrados
      }

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
      const updatedMedallium = unlockYokai(medallium, targetYokai);

      // Verificar círculos completados
      const circleResults = checkCircleCompletion(targetYokai, updatedMedallium);
      const newlyCompletedCircles = circleResults.filter(result =>
        !result.wasCompleted && result.isNowCompleted
      );

      if (newlyCompletedCircles.length > 0) {
        console.log('¡Círculos completados!', newlyCompletedCircles.map(c => c.circleId));
        // Aquí podrías mostrar una notificación de círculos completados
      }

      // Verificar logros nuevos (async para no bloquear la UI)
      getAllYokai().then(allYokaiData => {
        const newAchievements = checkAchievements(updatedMedallium, allYokaiData);
        if (newAchievements.length > 0) {
          // Aquí podrías mostrar una notificación de logros desbloqueados
          console.log('¡Nuevos logros desbloqueados!', newAchievements.map(a => a.name_es));
        }
      }).catch(error => {
        console.error('Error verificando logros:', error);
      });

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

    // 🎮 SINCRONIZAR ESTADÍSTICAS SOCIALES DESPUÉS DE CADA ADIVINANZA
    if (user && (newGameStatus === 'won' || newGameStatus === 'lost')) {
      console.log('🎮 Game ended with guess - syncing social stats immediately');
      triggerSocialStatsSync();
    }
  }

  return (
    <div className="app-container">

      {/* CABECERA */}
      <header className="mb-6 text-center relative z-50">
        {/* Puntos del usuario en la esquina superior izquierda */}
        <div className="absolute top-0 left-0">
          <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg shadow-sm">
            <img
              src="/icons/points-icon.png"
              alt="Puntos"
              className="w-5 h-5 mr-2"
            />
            <span className="font-bold text-lg">{currentPoints}</span>
          </div>
        </div>

        {/* Avatar social y selector de idioma en la esquina superior derecha */}
        <div className="absolute top-0 right-0 flex items-center gap-2 z-[60]">
          <SocialAvatar />
          <SocialLoginButton />
          <LanguageSwitcher />
        </div>

        {/* Espaciador para separar los elementos superiores del logo */}
        <div className="h-16"></div>

        {/* Logo */}
        <div className="flex justify-center mb-4 px-1 relative z-10">
          <img
            src="/images/logo/logo.png"
            alt="Yo-kaidle Logo"
            className="w-full object-contain drop-shadow-2xl relative z-10"
            style={{ maxHeight: 'calc(30vh)' }}
          />
        </div>
        <p className="mt-2 text-gray-600 font-medium">{t.appSubtitle}</p>
      </header>


      {/* BOTONES DE PERSONALIZACIÓN */}
      <div className="mb-4 text-center space-y-2">
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setShowBackgroundsPanel(true)}
            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            <img
              src="/icons/menu/backgrounds.png"
              alt="Backgrounds"
              className="w-5 h-5 mr-2"
            />
            <span>
              {language === 'es' ? 'Fondos' : language === 'en' ? 'Backgrounds' : 'Sfondi'}
            </span>
          </button>

          <button
            onClick={() => setShowJukeboxPanel(true)}
            className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            <img
              src="/icons/menu/music.png"
              alt="Music"
              className="w-5 h-5 mr-2"
            />
            <span>
              {language === 'es' ? 'Jukebox' : language === 'en' ? 'Jukebox' : 'Jukebox'}
            </span>
          </button>

          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            <img
              src="/icons/menu/shop.png"
              alt="Shop"
              className="w-5 h-5 mr-2"
            />
            <span>
              {language === 'es' ? 'Tienda' : language === 'en' ? 'Shop' : 'Negozio'}
            </span>
          </button>



          {/* Event Button - Now enabled for testing */}
          {shouldShowEventButton && (
            <EventButton />
          )}
        </div>
      </div>

      {/* REGLAS DEL JUEGO */}
      <GameRules />

      {/* BOTÓN PARA ACCEDER AL MEDALLIUM */}
      <div className="mb-6 mt-4 text-center">
        <Link href="/medallium" className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg shadow-lg hover:from-yellow-600 hover:to-amber-700 transition transform hover:scale-105">
          <img
            src="/icons/game-modes/medallium.png"
            alt="Icono Medallium"
            className="h-5 w-5 mr-2"
            onError={(e) => {
              // Fallback a un icono SVG si la imagen no se encuentra
              e.currentTarget.style.display = 'none';
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svg.setAttribute('class', 'h-5 w-5 mr-2');
              svg.setAttribute('viewBox', '0 0 20 20');
              svg.setAttribute('fill', 'currentColor');
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('fillRule', 'evenodd');
              path.setAttribute('d', 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z');
              path.setAttribute('clipRule', 'evenodd');
              svg.appendChild(path);
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.insertBefore(svg, parent.firstChild);
              }
            }}
          />
          <span>{t.medallium}</span>
        </Link>
      </div>

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
          onMidnightReached={handleMidnightReached}
          guesses={gameState.guesses}
          maxGuesses={gameState.maxGuesses}
          pointsEarned={pointsEarnedThisGame}
        />
      ))}

      {/* SELECCIÓN DE MODO DE JUEGO */}
      <div className="mb-4">
        <GameModeSelector currentMode={gameState.gameMode} onModeChange={handleModeChange} />
        {gameState.gameMode === 'infinite' && (
          <div className="mt-4 flex flex-col items-center">
            {showGameConfig ? (
              <div className="w-full max-w-md mb-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-primary-600">{t.configuration}</h3>
                  <button
                    onClick={() => setShowGameConfig(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <GameSourceSelector
                  availableGames={AVAILABLE_GAMES}
                  initialSelectedGames={selectedGameSources}
                  onSourcesChange={handleGameSourcesChange}
                />
                <TribeRestrictionsSelector
                  restrictions={tribeRestrictions}
                  onRestrictionsChange={handleTribeRestrictionsChange}
                />
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      setShowGameConfig(false);
                      handleNewInfiniteGame();
                    }}
                    disabled={loading || selectedGameSources.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t.play}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowGameConfig(true)}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.newYokai}
              </button>
            )}
          </div>
        )}
      </div>



      {/* BOTÓN DE AYUDAS - Solo en modo diario */}
      {
        gameState.gameStatus === 'playing' && gameState.gameMode === 'daily' && hintsState && (
          <div className="mb-4 text-center">
            <button
              onClick={() => setShowHintsPanel(true)}
              className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-lg shadow-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 transform hover:scale-105 font-medium"
            >
              <img
                src="/icons/menu/help.png"
                alt="Help"
                className="w-6 h-6 mr-2"
              />
              <span>
                {language === 'es' ? 'Usar Ayudas' : language === 'en' ? 'Use Hints' : 'Usa Suggerimenti'}
              </span>
            </button>
          </div>
        )
      }

      {/* PISTAS ACTIVAS - Solo en modo diario */}
      {
        gameState.gameMode === 'daily' && hintsState && (
          <ActiveHints hintsState={hintsState} />
        )
      }

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
      {
        gameState.gameStatus !== 'playing' && !showGameOver && (
          <div className="text-center mt-6 p-4 bg-gradient-to-r from-blue-600/80 to-blue-800/80 rounded-lg shadow-md border border-blue-300/30 backdrop-blur-sm text-white">
            <button
              className="btn-primary transform hover:scale-105 transition-transform"
              onClick={() => setShowStats(true)}
            >
              {t.showStats}
            </button>
          </div>
        )
      }

      {/* ESTADÍSTICAS */}
      {
        showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative max-w-md w-11/12 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
              style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(66, 196, 255, 0.4)', color: 'white' }}>
              {/* Cabecera con fondo de gradiente */}
              <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, var(--dark-blue), var(--secondary-color))' }}>
                <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">{t.statistics.toUpperCase()}</h2>
                <p className="text-white text-opacity-90 text-lg">{t.yourProgress}</p>
              </div>
              <div className="p-6">
                {/* Selector de modo para estadísticas */}
                <div className="mb-6">
                  <div className="flex p-1 rounded-lg shadow-inner" style={{ background: 'rgba(15, 82, 152, 0.3)', backdropFilter: 'blur(4px)' }}>
                    <button
                      onClick={() => handleModeChange('daily')}
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 font-medium ${gameState.gameMode === 'daily'
                        ? 'text-white shadow-md transform scale-105'
                        : 'text-white text-opacity-70 hover:bg-opacity-30 hover:bg-white'
                        }`}
                      style={gameState.gameMode === 'daily' ? { background: 'linear-gradient(135deg, var(--primary-color), #FF6384)' } : {}}
                    >
                      <div className="flex items-center justify-center">
                        <img
                          src="/icons/game-modes/daily-mode.png"
                          alt="Modo diario"
                          className="w-6 h-6 mr-2 object-contain"
                          onError={(e) => {
                            // Fallback al icono SVG si la imagen no se encuentra
                            e.currentTarget.style.display = 'none';
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('class', 'w-6 h-6 mr-2');
                            svg.setAttribute('fill', 'none');
                            svg.setAttribute('stroke', 'currentColor');
                            svg.setAttribute('viewBox', '0 0 24 24');
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('strokeLinecap', 'round');
                            path.setAttribute('strokeLinejoin', 'round');
                            path.setAttribute('strokeWidth', '2');
                            path.setAttribute('d', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z');
                            svg.appendChild(path);
                            e.currentTarget.parentElement!.insertBefore(svg, e.currentTarget.parentElement!.firstChild);
                          }}
                        />
                        <span>{t.daily}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleModeChange('infinite')}
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 font-medium ${gameState.gameMode === 'infinite'
                        ? 'text-white shadow-md transform scale-105'
                        : 'text-white text-opacity-70 hover:bg-opacity-30 hover:bg-white'
                        }`}
                      style={gameState.gameMode === 'infinite' ? { background: 'linear-gradient(135deg, var(--secondary-color), #1E75D3)' } : {}}
                    >
                      <div className="flex items-center justify-center">
                        <img
                          src="/icons/game-modes/infinite-mode.png"
                          alt="Modo infinito"
                          className="w-6 h-6 mr-2 object-contain"
                          onError={(e) => {
                            // Fallback al icono SVG si la imagen no se encuentra
                            e.currentTarget.style.display = 'none';
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('class', 'w-6 h-6 mr-2');
                            svg.setAttribute('fill', 'none');
                            svg.setAttribute('stroke', 'currentColor');
                            svg.setAttribute('viewBox', '0 0 24 24');
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('strokeLinecap', 'round');
                            path.setAttribute('strokeLinejoin', 'round');
                            path.setAttribute('strokeWidth', '2');
                            path.setAttribute('d', 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4');
                            svg.appendChild(path);
                            e.currentTarget.parentElement!.insertBefore(svg, e.currentTarget.parentElement!.firstChild);
                          }}
                        />
                        <span>{t.infinite}</span>
                      </div>
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: 'var(--gold-accent)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                  {gameState.gameMode === 'daily' ? t.dailyModeStats : t.infiniteModeStats}
                </h3>
                {/* Estadísticas con iconos y datos */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Juegos jugados */}
                  <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                    <div className="mr-3 flex-shrink-0 flex items-center justify-center" style={{ color: 'white' }}>
                      <img
                        src="/icons/stats/games-played.png"
                        alt="Partidas"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          // Fallback al icono SVG si la imagen no se encuentra
                          e.currentTarget.style.display = 'none';
                          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                          svg.setAttribute('class', 'w-6 h-6');
                          svg.setAttribute('fill', 'currentColor');
                          svg.setAttribute('viewBox', '0 0 20 20');
                          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                          path.setAttribute('d', 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z');
                          svg.appendChild(path);
                          e.currentTarget.parentElement!.appendChild(svg);
                        }}
                      />
                    </div>
                    <div>
                      <p className="stat-value font-bold text-xl">
                        {gameState.gameMode === 'daily'
                          ? gameState.dailyStats.totalPlayed
                          : gameState.infiniteStats.totalPlayed}
                      </p>
                      <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.gamesPlayed.toUpperCase()}</p>
                    </div>
                  </div>
                  {/* Porcentaje de victorias */}
                  <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                    <div className="mr-3 flex-shrink-0 flex items-center justify-center" style={{ color: 'white' }}>
                      <img
                        src="/icons/stats/victories.png"
                        alt="Victorias"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          // Fallback al icono SVG si la imagen no se encuentra
                          e.currentTarget.style.display = 'none';
                          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                          svg.setAttribute('class', 'w-6 h-6');
                          svg.setAttribute('fill', 'currentColor');
                          svg.setAttribute('viewBox', '0 0 20 20');
                          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                          path.setAttribute('fillRule', 'evenodd');
                          path.setAttribute('d', 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z');
                          path.setAttribute('clipRule', 'evenodd');
                          svg.appendChild(path);
                          e.currentTarget.parentElement!.appendChild(svg);
                        }}
                      />
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
                      <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.winRate.toUpperCase()}</p>
                    </div>
                  </div>
                  {/* Racha actual (solo en modo diario) */}
                  {gameState.gameMode === 'daily' && (
                    <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                      <div className="mr-3 flex-shrink-0 flex items-center justify-center" style={{ color: 'white' }}>
                        <img
                          src="/icons/stats/current-streak.png"
                          alt="Racha Actual"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback al icono SVG si la imagen no se encuentra
                            e.currentTarget.style.display = 'none';
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('class', 'w-6 h-6');
                            svg.setAttribute('fill', 'currentColor');
                            svg.setAttribute('viewBox', '0 0 20 20');
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('fillRule', 'evenodd');
                            path.setAttribute('d', 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z');
                            path.setAttribute('clipRule', 'evenodd');
                            svg.appendChild(path);
                            e.currentTarget.parentElement!.appendChild(svg);
                          }}
                        />
                      </div>
                      <div>
                        <p className="stat-value font-bold text-xl">{gameState.dailyStats.streak}</p>
                        <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.currentStreak.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                  {/* Mejor racha (solo en modo diario) */}
                  {gameState.gameMode === 'daily' && (
                    <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                      <div className="mr-3 flex-shrink-0 flex items-center justify-center" style={{ color: 'white' }}>
                        <img
                          src="/icons/stats/best-streak.png"
                          alt="Mejor Racha"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback al icono SVG si la imagen no se encuentra
                            e.currentTarget.style.display = 'none';
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('class', 'w-6 h-6');
                            svg.setAttribute('fill', 'currentColor');
                            svg.setAttribute('viewBox', '0 0 20 20');
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z');
                            svg.appendChild(path);
                            e.currentTarget.parentElement!.appendChild(svg);
                          }}
                        />
                      </div>
                      <div>
                        <p className="stat-value font-bold text-xl">{gameState.dailyStats.maxStreak}</p>
                        <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.bestStreak.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                  {/* Juegos ganados (solo en modo infinito) */}
                  {gameState.gameMode === 'infinite' && (
                    <div className="p-3 rounded-lg shadow-sm flex items-center col-span-2" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
                      <div className="mr-3 flex-shrink-0 flex items-center justify-center" style={{ color: 'white' }}>
                        <img
                          src="/icons/stats/infinite-wins.png"
                          alt="Total Victorias Infinito"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback al icono SVG si la imagen no se encuentra
                            e.currentTarget.style.display = 'none';
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('class', 'w-6 h-6');
                            svg.setAttribute('fill', 'currentColor');
                            svg.setAttribute('viewBox', '0 0 20 20');
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('fillRule', 'evenodd');
                            path.setAttribute('d', 'M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z');
                            path.setAttribute('clipRule', 'evenodd');
                            svg.appendChild(path);
                            e.currentTarget.parentElement!.appendChild(svg);
                          }}
                        />
                      </div>
                      <div>
                        <p className="stat-value font-bold text-xl">{gameState.infiniteStats.totalWins}</p>
                        <p className="stat-label text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.totalInfiniteWins.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="w-full py-3 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--dark-blue))' }}
                  onClick={() => setShowStats(false)}
                >
                  {t.continuePlaying}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Panel de Ayudas */}
      {
        hintsState && (
          <HintsPanel
            isOpen={showHintsPanel}
            onClose={() => setShowHintsPanel(false)}
            currentHintsState={hintsState}
            onUseHint={handleUseHint}
            gameFinished={gameState.gameStatus !== 'playing'}
          />
        )
      }

      {/* Panel de Fondos */}
      <BackgroundsPanel
        isOpen={showBackgroundsPanel}
        onClose={() => setShowBackgroundsPanel(false)}
      />

      {/* Panel del Jukebox */}
      <JukeboxPanel
        isOpen={showJukeboxPanel}
        onClose={() => setShowJukeboxPanel(false)}
      />





      {/* El pie de página ahora está en el layout */}
    </div >
  );
}

// Componente principal
export default function Home() {
  return <HomeContent />;
}
