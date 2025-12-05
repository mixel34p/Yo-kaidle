'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { EventConfiguration } from '@/types/events';

interface EventGameModeProps {
  event: EventConfiguration;
  onClose: () => void;
}

export default function EventGameMode({ event, onClose }: EventGameModeProps) {
  const router = useRouter();
  const { language } = useLanguage();

  // Translations
  const texts = {
    es: {
      startGame: 'Comenzar Evento',
      backToMenu: 'Volver al Menú',
      description: 'Descripción del Evento'
    },
    en: {
      startGame: 'Start Event',
      backToMenu: 'Back to Menu',
      description: 'Event Description'
    },
    it: {
      startGame: 'Inizia Evento',
      backToMenu: 'Torna al Menu',
      description: 'Descrizione Evento'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.es;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${event.theme_color}40 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${event.theme_color}40 0%, transparent 50%)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            {t.backToMenu}
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">{event.icon}</span>
              {event.name[language] || event.name.es}
            </h1>
            <p className="text-white/70 mt-2">
              {event.description[language] || event.description.es}
            </p>
          </div>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Event Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Target className="text-yellow-400" />
              {t.description}
            </h2>
            <p className="text-white/80 mb-6">
              {event.description[language] || event.description.es}
            </p>
            <div className="text-white/60">
              <p>Objetivo: {event.total_progress_required} {(event as any).progress_unit?.[language] || 'Yo-kai descubiertos'}</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="text-center">
          <button
            onClick={() => {
              // Navigate to event-specific page (static route)
              if (event.id === 'blasters2') {
                router.push('/event-blasters2');
              } else {
                // Fallback for other events
                router.push(`/event/${event.id}`);
              }
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6" />
              {t.startGame}
            </div>
          </button>
        </div>

        {/* Milestones Info */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            🏆 Milestones del Evento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-4 rounded-xl border bg-white/10 border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">
                    {milestone.progress_required} {(event as any).progress_unit?.[language] || 'Yo-kai'}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-2">
                  {milestone.name[language] || milestone.name.es}
                </h4>
                <p className="text-white/70 text-sm mb-3">
                  {milestone.description[language] || milestone.description.es}
                </p>
                <div className="space-y-1">
                  {milestone.rewards.map((reward) => (
                    <div key={reward.id} className="text-xs text-white/80 flex items-center gap-1">
                      <span>{reward.icon}</span>
                      <span>{reward.name[language] || reward.name.es}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
