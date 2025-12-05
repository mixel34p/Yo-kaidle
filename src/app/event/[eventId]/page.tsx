'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Star, Zap, Target, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEventById, getEventFilterForRandomYokai } from '@/utils/eventManager';
import { getRandomYokai } from '@/lib/supabase';
import type { EventConfiguration } from '@/types/events';
import type { Yokai } from '@/types/yokai';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const eventId = params.eventId as string;

  // Estado del evento
  const [event, setEvent] = useState<EventConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado del juego
  const [currentYokai, setCurrentYokai] = useState<Yokai | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);

  // Traducciones
  const texts = {
    es: {
      backToMenu: 'Volver al Menú',
      progress: 'Progreso',
      discovered: 'descubiertos',
      guess: 'Adivina el Yo-kai',
      submit: 'Enviar',
      correct: '¡Correcto!',
      incorrect: '¡Incorrecto!',
      tryAgain: 'Intentar de nuevo',
      nextYokai: 'Siguiente Yo-kai',
      loading: 'Cargando...',
      placeholder: 'Escribe el nombre del Yo-kai...',
      attempts: 'Intentos',
      milestone: 'Hito',
      reward: 'Recompensa',
      points: 'puntos'
    },
    en: {
      backToMenu: 'Back to Menu',
      progress: 'Progress',
      discovered: 'discovered',
      guess: 'Guess the Yo-kai',
      submit: 'Submit',
      correct: 'Correct!',
      incorrect: 'Incorrect!',
      tryAgain: 'Try Again',
      nextYokai: 'Next Yo-kai',
      loading: 'Loading...',
      placeholder: 'Type the Yo-kai name...',
      attempts: 'Attempts',
      milestone: 'Milestone',
      reward: 'Reward',
      points: 'points'
    },
    it: {
      backToMenu: 'Torna al Menu',
      progress: 'Progresso',
      discovered: 'scoperti',
      guess: 'Indovina lo Yo-kai',
      submit: 'Invia',
      correct: 'Corretto!',
      incorrect: 'Sbagliato!',
      tryAgain: 'Riprova',
      nextYokai: 'Prossimo Yo-kai',
      loading: 'Caricamento...',
      placeholder: 'Scrivi il nome dello Yo-kai...',
      attempts: 'Tentativi',
      milestone: 'Traguardo',
      reward: 'Ricompensa',
      points: 'punti'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.es;

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

    if (eventId) {
      loadEvent();
    }
  }, [eventId, router]);

  // Cargar nuevo Yo-kai
  const loadNewYokai = async (eventConfig: EventConfiguration) => {
    try {
      setGameLoading(true);
      const eventFilter = await getEventFilterForRandomYokai(eventConfig);
      const yokai = await getRandomYokai(undefined, true, eventFilter);

      if (yokai) {
        setCurrentYokai(yokai);
        setGuess('');
        setAttempts(0);
        setIsCorrect(null);
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error loading Yo-kai:', error);
    } finally {
      setGameLoading(false);
    }
  };

  // Manejar envío de respuesta
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentYokai || !guess.trim()) return;

    const userGuess = guess.trim().toLowerCase();
    const correctName = currentYokai.name.toLowerCase();
    const isGuessCorrect = userGuess === correctName;

    setAttempts(prev => prev + 1);
    setIsCorrect(isGuessCorrect);
    setShowResult(true);

    if (isGuessCorrect) {
      setProgress(prev => prev + 1);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background pattern del evento */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${event.theme_color}40 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${event.theme_color}40 0%, transparent 50%)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header del evento */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              {t.backToMenu}
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">{event.icon}</span>
                {event.name[language] || event.name.es}
              </h1>
            </div>

            <div className="w-24" />
          </div>
        </div>

        {/* Barra de progreso y recompensas */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="container mx-auto">
            {/* Progreso actual */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  {t.progress}: {progress} / {event.total_progress_required} {t.discovered}
                </span>
                <span className="text-white/70">{Math.round(getProgressPercentage())}%</span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 relative"
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {event.milestones.map((milestone, index) => {
                const isCompleted = progress >= milestone.progress_required;
                const isCurrent = nextMilestone?.id === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className={`flex-shrink-0 p-3 rounded-lg border transition-all ${isCompleted
                      ? 'bg-green-500/20 border-green-400/50'
                      : isCurrent
                        ? 'bg-yellow-500/20 border-yellow-400/50'
                        : 'bg-white/10 border-white/20'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm">
                        {milestone.progress_required}
                      </span>
                      {isCompleted && <Star className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <div className="text-white/80 text-xs mb-2">
                      {milestone.name[language] || milestone.name.es}
                    </div>
                    <div className="space-y-1">
                      {milestone.rewards.map((reward) => (
                        <div key={reward.id} className="flex items-center gap-1 text-xs text-white/70">
                          <span>{reward.icon}</span>
                          <span>{reward.amount || ''} {reward.type === 'points' ? t.points : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Área de juego */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {gameLoading ? (
              <div className="text-center text-white text-xl">{t.loading}</div>
            ) : currentYokai ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                {/* Imagen del Yo-kai */}
                <div className="text-center mb-6">
                  <div className="w-48 h-48 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                    {currentYokai.imageurl ? (
                      <img
                        src={currentYokai.imageurl}
                        alt="Yo-kai"
                        className="w-40 h-40 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-6xl">👻</div>
                    )}
                  </div>

                  {/* Info del Yo-kai (solo después de responder) */}
                  {showResult && (
                    <div className="text-white/80 text-sm space-y-1">
                      <p><strong>Tribu:</strong> {currentYokai.tribe}</p>
                      <p><strong>Rango:</strong> {currentYokai.rank}</p>
                      <p><strong>Elemento:</strong> {currentYokai.element}</p>
                    </div>
                  )}
                </div>

                {/* Formulario de adivinanza */}
                {!showResult ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        {t.guess}
                      </label>
                      <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder={t.placeholder}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!guess.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
                    >
                      {t.submit}
                    </button>
                  </form>
                ) : (
                  /* Resultado */
                  <div className="text-center space-y-4">
                    <div className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? t.correct : t.incorrect}
                    </div>

                    <div className="text-white">
                      <p className="text-xl font-semibold">{currentYokai.name}</p>
                      <p className="text-white/70">{t.attempts}: {attempts}</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      {!isCorrect && (
                        <button
                          onClick={() => {
                            setShowResult(false);
                            setGuess('');
                          }}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-6 rounded-lg font-bold transition-all duration-200"
                        >
                          {t.tryAgain}
                        </button>
                      )}

                      <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-6 rounded-lg font-bold transition-all duration-200 flex items-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        {t.nextYokai}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white text-xl">Error cargando Yo-kai</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
