'use client';

import React, { useState } from 'react';
import { Calendar, Star, Trophy, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActiveEvents } from '@/hooks/useEventSystem';
import EventGameMode from './EventGameMode';
import type { EventConfiguration } from '@/types/events';

interface EventButtonProps {
  className?: string;
}

export default function EventButton({ className = '' }: EventButtonProps) {
  const { language } = useLanguage();
  const { activeEvents, loading } = useActiveEvents();
  const [selectedEvent, setSelectedEvent] = useState<EventConfiguration | null>(null);

  // Translations
  const texts = {
    es: {
      events: 'Eventos',
      specialEvent: 'Evento Especial',
      noActiveEvents: 'No hay eventos activos',
      loading: 'Cargando...',
      participate: 'Participar',
      inProgress: 'En Progreso',
      completed: 'Completado'
    },
    en: {
      events: 'Events',
      specialEvent: 'Special Event',
      noActiveEvents: 'No active events',
      loading: 'Loading...',
      participate: 'Participate',
      inProgress: 'In Progress',
      completed: 'Completed'
    },
    it: {
      events: 'Eventi',
      specialEvent: 'Evento Speciale',
      noActiveEvents: 'Nessun evento attivo',
      loading: 'Caricamento...',
      participate: 'Partecipa',
      inProgress: 'In Corso',
      completed: 'Completato'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.es;

  // Don't show button if no active events
  if (loading || activeEvents.length === 0) {
    return null;
  }

  // For now, show the first active event
  const primaryEvent = activeEvents[0];

  const handleEventClick = () => {
    // Ir directamente al evento sin modal
    if (primaryEvent.id === 'blasters2') {
      window.location.href = '/event-blasters2';
    } else {
      window.location.href = `/event/${primaryEvent.id}`;
    }
  };

  // Diseño especial para Blasters 2
  if (primaryEvent.id === 'blasters2') {
    return (
      <button
        onClick={handleEventClick}
        className={`
          relative group overflow-hidden
          bg-gradient-to-br from-amber-600 via-orange-600 to-red-700
          hover:from-amber-500 hover:via-orange-500 hover:to-red-600
          text-white px-4 py-3 rounded-xl shadow-2xl
          transition-all duration-300 transform hover:scale-105 hover:rotate-1
          border-2 border-amber-400/50 hover:border-amber-300
          font-bold
          ${className}
        `}
      >
        {/* Fondo de isla desierta */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-yellow-600/30" />

        {/* Ondas del mar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 animate-pulse" />

        {/* Tesoro */}
        <div className="absolute top-1 right-1 text-yellow-400 text-xs animate-bounce">💎</div>

        {/* Contenido principal */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Logo del juego */}
          <img
            src="/images/games/ywb2.png"
            alt="Yo-kai Watch Blasters 2"
            className="h-8 w-auto object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback si no se encuentra la imagen
              e.currentTarget.style.display = 'none';
            }}
          />

          <div className="text-left">
            <div className="text-sm font-bold text-yellow-200">
              {primaryEvent.name[language] || primaryEvent.name.es}
            </div>
          </div>
        </div>

        {/* Brillo de tesoro */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Indicador activo */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg border-2 border-white">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
        </div>
      </button>
    );
  }

  // Diseño genérico para otros eventos
  return (
    <button
      onClick={handleEventClick}
      className={`
        inline-flex items-center
        bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-700 hover:to-pink-700
        text-white px-4 py-2 rounded-lg shadow-lg
        transition-all duration-200 transform hover:scale-105
        font-medium relative overflow-hidden
        ${className}
      `}
    >
      <span className="text-lg mr-2 animate-bounce">
        {primaryEvent.icon}
      </span>
      <span>
        {primaryEvent.name[language] || primaryEvent.name.es}
      </span>
    </button>
  );
}

// Event List Component (for when there are multiple events)
export function EventList({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const { activeEvents, loading } = useActiveEvents();
  const [selectedEvent, setSelectedEvent] = useState<EventConfiguration | null>(null);

  const texts = {
    es: {
      activeEvents: 'Eventos Activos',
      noEvents: 'No hay eventos activos',
      participate: 'Participar'
    },
    en: {
      activeEvents: 'Active Events',
      noEvents: 'No active events',
      participate: 'Participate'
    },
    it: {
      activeEvents: 'Eventi Attivi',
      noEvents: 'Nessun evento attivo',
      participate: 'Partecipa'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.es;

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse bg-white/10 rounded-lg p-4">
          <div className="h-4 bg-white/20 rounded mb-2" />
          <div className="h-3 bg-white/20 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (activeEvents.length === 0) {
    return (
      <div className={`text-center text-white/60 ${className}`}>
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{t.noEvents}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="text-yellow-400" />
          {t.activeEvents}
        </h3>
        
        {activeEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: event.theme_color + '40' }}
                >
                  {event.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {event.name[language] || event.name.es}
                  </h4>
                  <p className="text-white/70 text-sm">
                    {event.description[language] || event.description.es}
                  </p>
                </div>
              </div>
              
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                }}
              >
                <Zap size={16} />
                {t.participate}
              </button>
            </div>
            
            {/* Progress indicator could go here */}
            <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <Trophy size={14} />
              <span>0 / {event.total_progress_required} {event.progress_unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Event Game Mode Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50">
          <EventGameMode 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)}
          />
        </div>
      )}
    </>
  );
}

// Hook for checking if events should be visible
export function useEventVisibility() {
  const { activeEvents, loading } = useActiveEvents();
  
  return {
    hasActiveEvents: activeEvents.length > 0,
    shouldShowEventButton: !loading && activeEvents.length > 0,
    activeEventsCount: activeEvents.length,
    loading
  };
}
