'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Zap, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEventById, getEventFilterForRandomYokai } from '@/utils/eventManager';
import { getRandomYokai } from '@/lib/supabase';
import type { EventConfiguration } from '@/types/events';
import type { Yokai, GuessResult } from '@/types/yokai';
import { gameLogos, tribeIcons, rankIcons, elementIcons, tribeTranslations, elementTranslations } from '@/types/yokai';
import { compareYokai, normalizeYokai } from '@/utils/gameLogic';
import YokaiGrid from '@/components/YokaiGrid';
import YokaiSearch from '@/components/YokaiSearch';
import { addPoints } from '@/utils/economyManager';
import { unlockBackground } from '@/utils/backgroundsManager';
import { unlockFrame } from '@/utils/framesManager';
import { unlockTrack } from '@/utils/jukeboxManager';
import { unlockTitle } from '@/utils/titlesManager';

export default function EventBlasters2Page() {
  const router = useRouter();
  const { language, t, getYokaiName, getTribeTranslation, getElementTranslation } = useLanguage();
  const eventId = 'blasters2'; // Hardcoded para esta página

  // Estado del evento
  const [event, setEvent] = useState<EventConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado del juego Wordle
  const [targetYokai, setTargetYokai] = useState<Yokai | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [guesses, setGuesses] = useState<Yokai[]>([]);
  const [guessResults, setGuessResults] = useState<{yokai: Yokai, result: GuessResult}[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [openedChests, setOpenedChests] = useState<string[]>([]);
  const [showChestModal, setShowChestModal] = useState(false);
  const [currentChest, setCurrentChest] = useState<any>(null);
  const maxGuesses = 6;

  // Cargar progreso del localStorage al iniciar
  useEffect(() => {
    const savedProgress = loadEventProgress();
    setProgress(savedProgress);

    // Cargar cofres abiertos
    const savedChests = localStorage.getItem('blasters2_opened_chests');
    if (savedChests) {
      setOpenedChests(JSON.parse(savedChests));
    }
  }, []);

  // Ahora usamos el sistema de traducciones oficial

  // Funciones para LocalStorage del evento
  const getEventProgressKey = () => `blasters2_event_progress`;

  const saveEventProgress = (newProgress: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getEventProgressKey(), newProgress.toString());
    }
  };

  const loadEventProgress = (): number => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getEventProgressKey());
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  };

  // Cargar evento
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        if (eventData && eventData.status === 'active') {
          setEvent(eventData);
          await loadNewYokai(eventData);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [router]);

  // Cargar nuevo Yo-kai objetivo
  const loadNewYokai = async (eventConfig: EventConfiguration) => {
    try {
      setGameLoading(true);
      const eventFilter = await getEventFilterForRandomYokai(eventConfig);
      const yokai = await getRandomYokai(undefined, true, eventFilter);

      if (yokai) {
        // Normalizar el Yo-kai para asegurar que tenga favoriteFood correctamente
        const normalizedYokai = normalizeYokai(yokai);
        setTargetYokai(normalizedYokai);
        setGuesses([]);
        setGuessResults([]);
        setGameStatus('playing');
        setMessage('');
      }
    } catch (error) {
      console.error('Error loading Yo-kai:', error);
    } finally {
      setGameLoading(false);
    }
  };

  // Manejar adivinanza de Wordle
  const handleGuess = (yokai: Yokai) => {
    if (gameStatus !== 'playing' || !targetYokai) {
      return;
    }

    // Comprobar si ya se ha adivinado este Yo-kai
    if (guesses.some(g => g.id === yokai.id)) {
      setMessage(t.alreadyGuessed);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Normalizar ambos Yo-kai antes de comparar
    const normalizedTarget = normalizeYokai(targetYokai);
    const normalizedGuess = normalizeYokai(yokai);

    const result = compareYokai(normalizedTarget, normalizedGuess);
    const newGuesses = [...guesses, normalizedGuess];
    const newGuessResults = [...guessResults, { yokai: normalizedGuess, result }];

    let newGameStatus: 'playing' | 'won' | 'lost' = gameStatus;

    if (result.isCorrect) {
      newGameStatus = 'won';
      const newProgress = progress + 1;
      setProgress(newProgress);
      saveEventProgress(newProgress); // Guardar en localStorage

      // Verificar si hay cofres nuevos disponibles
      setTimeout(() => checkForNewChests(newProgress), 1000);
    } else if (newGuesses.length >= maxGuesses) {
      newGameStatus = 'lost';
    }

    setGuesses(newGuesses);
    setGuessResults(newGuessResults);
    setGameStatus(newGameStatus);
  };

  // Siguiente Yo-kai
  const handleNext = () => {
    if (event) {
      loadNewYokai(event);
    }
  };

  // Calcular progreso
  const getProgressPercentage = () => {
    if (!event) return 0;
    return Math.min((progress / event.total_progress_required) * 100, 100);
  };

  // Obtener siguiente milestone
  const getNextMilestone = () => {
    if (!event) return null;
    return event.milestones.find(m => m.progress_required > progress);
  };

  // Funciones para manejar cofres
  const checkForNewChests = (newProgress: number) => {
    if (!event) return;

    const availableChests = event.milestones.filter(
      milestone => newProgress >= milestone.progress_required &&
                  !openedChests.includes(milestone.id)
    );

    if (availableChests.length > 0) {
      // Mostrar el primer cofre disponible
      setCurrentChest(availableChests[0]);
      setShowChestModal(true);
    }
  };

  const openChest = (chestId: string) => {
    if (!currentChest) return;

    // Aplicar recompensas reales
    currentChest.rewards.forEach((reward: any) => {
      switch (reward.type) {
        case 'points':
          if (reward.amount) {
            addPoints(
              reward.amount,
              'event_chest',
              `Cofre del evento Blasters 2: ${reward.name[language] || reward.name.es}`
            );
          }
          break;
        case 'background':
          if (reward.item_id) {
            unlockBackground(reward.item_id);
          }
          break;
        case 'frame':
          if (reward.item_id) {
            unlockFrame(reward.item_id);
          }
          break;
        case 'music':
          if (reward.item_id) {
            unlockTrack(reward.item_id);
          }
          break;
        case 'title':
          if (reward.item_id) {
            unlockTitle(reward.item_id);
          }
          break;
        default:
          console.log(`Tipo de recompensa no implementado: ${reward.type}`);
      }
    });

    // Marcar cofre como abierto
    const newOpenedChests = [...openedChests, chestId];
    setOpenedChests(newOpenedChests);
    localStorage.setItem('blasters2_opened_chests', JSON.stringify(newOpenedChests));
    setShowChestModal(false);
    setCurrentChest(null);

    // Mostrar mensaje de éxito
    setMessage(t.rewardsReceived);
    setTimeout(() => setMessage(''), 3000);
  };

  const isChestAvailable = (milestone: any) => {
    return progress >= milestone.progress_required && !openedChests.includes(milestone.id);
  };

  const isChestOpened = (milestone: any) => {
    return openedChests.includes(milestone.id);
  };

  // Componente de silueta
  const YokaiSilhouette = ({ yokai }: { yokai: Yokai }) => {
    const imageUrl = yokai.imageurl || yokai.image_url || '';

    return (
      <div className="relative w-48 h-48 mx-auto mb-6">
        {/* Marco decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 to-yellow-700/30 rounded-2xl border-4 border-amber-400/60 shadow-lg">
          <div className="absolute inset-2 bg-gradient-to-br from-yellow-200/20 to-amber-300/20 rounded-xl" />
        </div>

        {/* Silueta del Yo-kai */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {imageUrl ? (
            <div className="relative w-40 h-40">
              <img
                src={imageUrl}
                alt="Silueta misteriosa"
                className="w-full h-full object-contain"
                style={{
                  filter: 'brightness(0) saturate(100%)',
                  opacity: 0.8
                }}
              />
              {/* Efectos de misterio */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent rounded-xl" />
            </div>
          ) : (
            <div className="text-6xl opacity-80" style={{ filter: 'brightness(0)' }}>👻</div>
          )}
        </div>

        {/* Efectos decorativos */}
        <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-bounce">❓</div>
        <div className="absolute -bottom-2 -left-2 text-amber-400 text-lg animate-pulse">🔍</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">{t.loading}</div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const nextMilestone = getNextMilestone();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-yellow-400">
      {/* Fondo de isla desierta */}
      <div className="absolute inset-0">
        {/* Cielo y nubes */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-sky-300 to-yellow-200" />

        {/* Nubes flotantes */}
        <div className="absolute top-10 left-10 w-20 h-8 bg-white/60 rounded-full animate-pulse" />
        <div className="absolute top-16 right-20 w-16 h-6 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-8 left-1/3 w-12 h-5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Sol */}
        <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg animate-pulse">
          <div className="absolute inset-2 bg-yellow-200 rounded-full" />
        </div>

        {/* Arena de la playa */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-yellow-600 via-yellow-500 to-yellow-400" />

        {/* Ondas del mar */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-500 via-cyan-400 to-transparent opacity-80">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-cyan-300/50 to-blue-400/50 animate-pulse" />
        </div>

        {/* Palmeras */}
        <div className="absolute bottom-20 left-8 text-6xl transform -rotate-12">🌴</div>
        <div className="absolute bottom-24 right-12 text-5xl transform rotate-6">🌴</div>
        <div className="absolute bottom-16 left-1/4 text-4xl transform rotate-12">🌴</div>

        {/* Elementos de tesoro dispersos */}
        <div className="absolute bottom-32 left-1/3 text-2xl animate-bounce">💎</div>
        <div className="absolute bottom-28 right-1/4 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚱️</div>
        <div className="absolute bottom-36 left-2/3 text-lg animate-bounce" style={{ animationDelay: '1s' }}>🗝️</div>

        {/* Elementos en el horizonte */}
        <div className="absolute bottom-24 right-4 text-3xl animate-pulse">⛵</div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header del evento */}
        <div className="bg-gradient-to-r from-amber-900/80 via-orange-900/80 to-red-900/80 backdrop-blur-sm border-b border-amber-400/30 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-800/50 hover:bg-amber-700/60 text-amber-100 rounded-lg transition-colors border border-amber-600/50"
            >
              <ArrowLeft size={20} />
              {t.backToGame}
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-amber-100">
                {event.name[language] || event.name.es}
              </h1>
            </div>

            <div className="w-24" />
          </div>
        </div>

        {/* Banner del evento con logo */}
        <div className="relative border-b-4 border-amber-400 overflow-hidden">
          {/* Imagen de fondo personalizable */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/events/blasters2-banner.jpg)' // Cambia esta ruta por tu imagen
            }}
          />

          {/* Filtro anaranjado para distinguir el texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-800/80 via-amber-700/80 to-red-800/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-600/30 to-amber-900/60" />

          {/* Decoraciones del banner */}
          <div className="absolute top-2 left-4 text-yellow-400 text-xl animate-bounce">💎</div>
          <div className="absolute top-1 right-6 text-amber-300 text-lg animate-pulse">🗝️</div>
          <div className="absolute bottom-1 left-8 text-orange-400 text-sm">⚱️</div>
          <div className="absolute bottom-2 right-4 text-red-400 text-lg">⭐</div>

          <div className="relative z-10 container mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-6">
              {/* Logo del juego */}
              <div className="flex-shrink-0">
                <img
                  src="/images/games/ywb2.png"
                  alt="Yo-kai Watch Blasters 2"
                  className="h-16 w-auto object-contain drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback si no se encuentra la imagen
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Información del evento */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-amber-100 mb-2 drop-shadow-lg">
                  🏝️ {t.islandTreasure} 🏝️
                </h2>
                <p className="text-amber-200 text-lg font-semibold">
                  {t.discoverSecrets}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2 text-amber-300">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    30 {t.yokaiToFind}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    6 {t.treasuresToUnlock}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transform -skew-x-12 animate-pulse" />
        </div>

        {/* Barra de progreso y recompensas - Temática de mapa del tesoro */}
        <div className="bg-gradient-to-r from-amber-900/90 via-yellow-800/90 to-orange-900/90 backdrop-blur-sm border-b border-amber-400/30 p-4">
          <div className="container mx-auto">
            {/* Progreso actual */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-100 font-bold flex items-center gap-2 text-lg">
                  <span className="text-yellow-400 animate-pulse">🗺️</span>
                  {t.treasureMap}: {progress} / {event.total_progress_required} Yo-kai encontrados
                </span>
                <span className="text-amber-200 font-bold text-lg">{Math.round(getProgressPercentage())}%</span>
              </div>

              {/* Barra de progreso estilo mapa del tesoro */}
              <div className="relative w-full bg-amber-900/50 rounded-full h-6 overflow-hidden border-2 border-amber-600/50">
                {/* Fondo del mapa */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-800/30 to-amber-700/30" />

                {/* Progreso */}
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full transition-all duration-700 relative overflow-hidden"
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  {/* Efecto de brillo del tesoro */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent animate-pulse" />

                  {/* Indicador de progreso */}
                  {getProgressPercentage() > 15 && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-900 text-sm font-bold">
                      💎 {Math.round(getProgressPercentage())}%
                    </div>
                  )}
                </div>

                {/* Marcadores de tesoro en la barra */}
                {event.milestones.map((milestone) => {
                  const position = (milestone.progress_required / event.total_progress_required) * 100;
                  const isReached = progress >= milestone.progress_required;

                  return (
                    <div
                      key={milestone.id}
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                      style={{ left: `${position}%` }}
                    >
                      <div className={`text-lg ${isReached ? 'animate-bounce' : 'opacity-60'}`}>
                        {isReached ? '💎' : '📍'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cofres del tesoro (Milestones) */}
            <div className="flex gap-3 overflow-x-auto pb-4">
              {event.milestones.map((milestone, index) => {
                const isReachable = progress >= milestone.progress_required;
                const isOpened = isChestOpened(milestone);
                const isAvailable = isChestAvailable(milestone);
                // const isCurrent = nextMilestone?.id === milestone.id;

                // Icono personalizable del cofre (puedes cambiar la imagen)
                const chestIcon = '/images/events/chest.png'; // Cambia esta ruta por tu imagen

                return (
                  <div
                    key={milestone.id}
                    className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all transform hover:scale-105 min-w-[160px] ${
                      isOpened
                        ? 'bg-gradient-to-br from-green-400/30 to-emerald-500/30 border-green-400 shadow-lg shadow-green-400/20'
                        : isAvailable
                        ? 'bg-gradient-to-br from-yellow-400/30 to-amber-500/30 border-yellow-400 shadow-lg shadow-yellow-400/20 animate-pulse'
                        : isReachable
                        ? 'bg-gradient-to-br from-orange-400/20 to-red-500/20 border-orange-400 shadow-lg shadow-orange-400/20'
                        : 'bg-gradient-to-br from-amber-800/30 to-brown-700/30 border-amber-600/50'
                    }`}
                  >
                    {/* Icono del cofre */}
                    <div className="text-center mb-2 relative">
                      <img
                        src={chestIcon}
                        alt="Cofre"
                        className="w-12 h-12 mx-auto object-contain"
                        onError={(e) => {
                          // Fallback si no se encuentra la imagen
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          ((e.currentTarget.nextElementSibling as HTMLElement)).style.display = 'block';
                        }}
                      />
                      <div className="text-3xl hidden">📦</div>

                      {/* Efectos según estado */}
                      {isOpened && (
                        <div className="absolute -top-1 -right-1 text-green-400 text-lg animate-bounce">✅</div>
                      )}
                      {isAvailable && !isOpened && (
                        <div className="absolute -top-1 -right-1 text-yellow-400 text-lg animate-bounce">✨</div>
                      )}
                      {isReachable && !isAvailable && !isOpened && (
                        <div className="absolute -top-1 -right-1 text-orange-400 text-lg animate-pulse">🔥</div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-amber-100 font-bold text-sm mb-1">
                        {t.chest} #{index + 1}
                      </div>
                      <div className="text-yellow-300 font-bold text-xs mb-2">
                        {milestone.progress_required} Yo-kai
                      </div>
                      <div className="text-amber-200 text-xs mb-3 font-semibold">
                        {milestone.name[language] || milestone.name.es}
                      </div>

                      {/* Recompensas del cofre */}
                      <div className="space-y-1 mb-3">
                        <div className="text-amber-300 text-xs font-bold">{t.treasure}:</div>
                        {milestone.rewards.map((reward) => (
                          <div key={reward.id} className="flex items-center justify-center gap-1 text-xs text-amber-100">
                            {reward.type === 'points' ? (
                              <img
                                src="/icons/points-icon.png"
                                alt="Puntos"
                                className="w-3 h-3"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                  ((e.currentTarget.nextElementSibling as HTMLElement)).style.display = 'inline';
                                }}
                              />
                            ) : reward.type === 'background' ? (
                              <span className="text-blue-400">🖼️</span>
                            ) : reward.type === 'frame' ? (
                              <span className="text-purple-400">🔳</span>
                            ) : reward.type === 'music' ? (
                              <span className="text-green-400">🎵</span>
                            ) : reward.type === 'title' ? (
                              <span className="text-yellow-400">👑</span>
                            ) : (
                              <span className="text-gray-400">🎁</span>
                            )}
                            <span className="hidden">💰</span>
                            <span>
                              {reward.amount && `${reward.amount} `}
                              {reward.name[language] || reward.name.es}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Botón o estado del cofre */}
                      {isOpened ? (
                        <div className="text-green-400 text-xs font-bold animate-bounce">
                          {t.opened} ✅
                        </div>
                      ) : isAvailable ? (
                        <button
                          onClick={() => {
                            setCurrentChest(milestone);
                            setShowChestModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white py-2 px-3 rounded-lg font-bold text-xs transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          🎁 {t.openChest}
                        </button>
                      ) : isReachable ? (
                        <div className="text-orange-300 text-xs font-bold">
                          Disponible
                        </div>
                      ) : (
                        <div className="text-amber-600 text-xs">
                          {milestone.progress_required - progress} restantes
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Área de exploración */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {gameLoading ? (
              <div className="text-center">
                <div className="text-amber-100 text-xl mb-4">🔍 {t.exploring}</div>
                <div className="text-yellow-400 text-lg animate-pulse">{t.searchingYokai}</div>
              </div>
            ) : targetYokai ? (
              <div className="space-y-6">
                {/* Título del juego */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-amber-100 flex items-center justify-center gap-2 mb-2">
                    <span className="animate-pulse">🔍</span>
                    {t.yokaiFound}
                    <span className="animate-pulse">🔍</span>
                  </h3>
                  <p className="text-amber-300 text-sm">{t.wildYokaiAppears}</p>
                </div>

                {/* Silueta del Yo-kai objetivo */}
                <YokaiSilhouette yokai={targetYokai} />

                {/* Mensaje de estado */}
                {message && (
                  <div className="text-center text-amber-200 bg-amber-900/30 rounded-lg p-2 border border-amber-600/50">
                    {message}
                  </div>
                )}

                {/* Grid de Wordle */}
                <div className="bg-gradient-to-br from-amber-900/80 via-yellow-800/80 to-orange-900/80 backdrop-blur-md rounded-2xl p-6 border-2 border-amber-400/50 shadow-2xl">
                  <YokaiGrid
                    guesses={guessResults}
                    maxGuesses={maxGuesses}
                  />
                </div>

                {/* Búsqueda de Yo-kai */}
                {gameStatus === 'playing' && (
                  <div className="bg-gradient-to-br from-amber-900/60 via-yellow-800/60 to-orange-900/60 backdrop-blur-md rounded-xl p-4 border border-amber-400/30">
                    <div className="relative">
                      <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-md z-10">
                        {maxGuesses - guessResults.length}
                      </div>
                      <YokaiSearch onSelect={handleGuess} disabled={gameStatus !== 'playing'} />
                    </div>
                  </div>
                )}

                {/* Resultado del juego */}
                {gameStatus !== 'playing' && (
                  <div className="text-center space-y-4">
                    <div className={`text-3xl font-bold ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                      {gameStatus === 'won' ? (
                        <div className="space-y-2">
                          <div className="text-4xl">🎉</div>
                          <div>{t.discoverySuccessful}</div>
                          <div className="text-yellow-400 text-lg animate-bounce">{t.yokaiFoundProgress}</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-4xl">❌</div>
                          <div>{t.incorrectIdentification}</div>
                          <div className="text-orange-400 text-lg">{t.tryAgainExplorer}</div>
                        </div>
                      )}
                    </div>

                    {/* Información del Yo-kai revelado - Diseño mejorado */}
                    <div className="bg-gradient-to-br from-amber-900/40 via-yellow-800/40 to-orange-900/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-400/30 shadow-xl">
                      {/* Header con icono */}
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">📋</span>
                        </div>
                        <h4 className="text-2xl font-bold text-amber-100 drop-shadow-lg">
                          {t.explorerData}
                        </h4>
                      </div>

                      {/* Nombre destacado */}
                      <div className="text-center mb-6">
                        <div className="bg-amber-700/30 rounded-xl p-4 border border-amber-500/40">
                          <div className="text-amber-300 text-sm font-semibold mb-1">{t.name}</div>
                          <div className="text-2xl font-bold text-amber-100 drop-shadow-md">
                            {getYokaiName(targetYokai)}
                          </div>
                        </div>
                      </div>

                      {/* Iconos en fila horizontal */}
                      <div className="flex items-center justify-center gap-8 mb-6">
                        {/* Tribu */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wide">
                            {t.tribe}
                          </div>
                          <div className="w-12 h-12 bg-amber-800/50 rounded-xl border-2 border-amber-600/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <img
                              src={tribeIcons[targetYokai.tribe]}
                              alt={targetYokai.tribe}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>

                        {/* Rango */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wide">
                            {t.rank}
                          </div>
                          <div className="w-12 h-12 bg-amber-800/50 rounded-xl border-2 border-amber-600/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <img
                              src={rankIcons[targetYokai.rank]}
                              alt={targetYokai.rank}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>

                        {/* Elemento */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wide">
                            {t.element}
                          </div>
                          <div className="w-12 h-12 bg-amber-800/50 rounded-xl border-2 border-amber-600/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <img
                              src={elementIcons[targetYokai.element]}
                              alt={targetYokai.element}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Intentos con diseño especial */}
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 bg-amber-700/30 rounded-full px-6 py-3 border border-amber-500/40">
                          <span className="text-2xl">🎯</span>
                          <div className="text-amber-100">
                            <span className="font-bold text-lg">{guessResults.length}</span>
                            <span className="text-amber-300 mx-2">/</span>
                            <span className="text-amber-300">{maxGuesses}</span>
                          </div>
                          <span className="text-amber-300 text-sm font-semibold">{t.attempts}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón para siguiente Yo-kai */}
                    <button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 border-2 border-green-400/50"
                    >
                      <div className="flex items-center gap-2">
                        <span>🗺️</span>
                        {t.continueExploration}
                        <span>🗺️</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-amber-100 text-xl">Error cargando Yo-kai</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de apertura de cofre */}
      {showChestModal && currentChest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-amber-900/90 via-yellow-800/90 to-orange-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border-2 border-amber-400/50 shadow-2xl">
            <div className="text-center">
              {/* Animación del cofre */}
              <div className="mb-6">
                <div className="relative">
                  <img
                    src="/images/events/chest.png"
                    alt="Cofre del tesoro"
                    className="w-24 h-24 mx-auto object-contain animate-bounce"
                    onError={(e) => {
                      // Fallback al emoji si no se encuentra la imagen
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      ((e.currentTarget.nextElementSibling as HTMLElement)).style.display = 'block';
                    }}
                  />
                  <div className="text-6xl animate-bounce mb-4 hidden">📦</div>

                  {/* Efectos de apertura */}
                  <div className="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-bounce">✨</div>
                  <div className="absolute -bottom-2 -left-2 text-amber-400 text-xl animate-pulse">💎</div>
                  <div className="absolute -top-2 -left-2 text-orange-400 text-lg animate-spin">⭐</div>
                </div>
                <div className="text-4xl animate-pulse mt-4">✨ 🎉 ✨</div>
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-amber-100 mb-4">
                🎉 {t.chestUnlocked} 🎉
              </h3>

              {/* Nombre del milestone */}
              <h4 className="text-xl font-semibold text-yellow-300 mb-4">
                {currentChest.name[language] || currentChest.name.es}
              </h4>

              {/* Descripción */}
              <p className="text-amber-200 mb-6">
                {currentChest.description[language] || currentChest.description.es}
              </p>

              {/* Recompensas */}
              <div className="bg-amber-800/30 rounded-xl p-4 mb-6 border border-amber-600/50">
                <h5 className="text-amber-300 font-bold mb-3">🎁 Recompensas:</h5>
                <div className="space-y-2">
                  {currentChest.rewards.map((reward: any) => (
                    <div key={reward.id} className="flex items-center justify-center gap-2 text-amber-100">
                      {reward.type === 'points' ? (
                        <img
                          src="/icons/points-icon.png"
                          alt="Puntos"
                          className="w-4 h-4"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : reward.type === 'background' ? (
                        <span className="text-blue-400 text-lg">🖼️</span>
                      ) : reward.type === 'frame' ? (
                        <span className="text-purple-400 text-lg">🔳</span>
                      ) : reward.type === 'music' ? (
                        <span className="text-green-400 text-lg">🎵</span>
                      ) : reward.type === 'title' ? (
                        <span className="text-yellow-400 text-lg">👑</span>
                      ) : (
                        <span className="text-gray-400 text-lg">🎁</span>
                      )}
                      <span className="font-semibold">
                        {reward.amount && `${reward.amount} `}
                        {reward.name[language] || reward.name.es}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón para reclamar */}
              <button
                onClick={() => openChest(currentChest.id)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎁</span>
                  {t.claimRewards}
                  <span>🎁</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
