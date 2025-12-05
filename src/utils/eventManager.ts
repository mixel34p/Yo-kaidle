// =====================================================
// EVENT SYSTEM MANAGER (SIMPLIFICADO)
// JSON para configuración + Supabase solo para estado
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
  EventConfiguration,
  EventStatus
} from '@/types/events';

// =====================================================
// CONFIGURACIÓN DE EVENTOS DESDE JSON
// =====================================================

const EVENT_CONFIGS: Record<string, EventConfiguration> = {};

// Cargar configuración del evento Blasters 2
async function loadEventConfig(eventId: string): Promise<EventConfiguration | null> {
  if (EVENT_CONFIGS[eventId]) {
    return EVENT_CONFIGS[eventId];
  }

  try {
    const response = await fetch(`/data/event-templates/${eventId}-event.json`);
    if (!response.ok) {
      console.warn(`Event config not found: ${eventId}`);
      return null;
    }

    const config = await response.json();
    EVENT_CONFIGS[eventId] = config;
    return config;
  } catch (error) {
    console.error(`Error loading event config for ${eventId}:`, error);
    return null;
  }
}

// =====================================================
// GESTIÓN DE ESTADOS EN SUPABASE
// =====================================================

async function getEventStates(): Promise<Record<string, EventStatus>> {
  try {
    const { data, error } = await supabase
      .from('event_states')
      .select('id, status');

    if (error) throw error;

    const states: Record<string, EventStatus> = {};
    data?.forEach(row => {
      states[row.id] = row.status;
    });

    return states;
  } catch (error) {
    console.error('Error fetching event states:', error);
    return {};
  }
}

async function getEventState(eventId: string): Promise<EventStatus> {
  try {
    const { data, error } = await supabase
      .from('event_states')
      .select('status')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data.status;
  } catch (error) {
    console.error(`Error fetching state for event ${eventId}:`, error);
    return 'inactive';
  }
}

// =====================================================
// FUNCIONES PRINCIPALES DEL SISTEMA
// =====================================================

export async function getActiveEvents(): Promise<EventConfiguration[]> {
  try {
    const states = await getEventStates();
    const activeEvents: EventConfiguration[] = [];

    for (const [eventId, status] of Object.entries(states)) {
      if (status === 'active') {
        const config = await loadEventConfig(eventId);
        if (config) {
          activeEvents.push({
            ...config,
            status
          });
        }
      }
    }

    return activeEvents;
  } catch (error) {
    console.error('Error fetching active events:', error);
    return [];
  }
}

export async function getAllEvents(): Promise<EventConfiguration[]> {
  try {
    const states = await getEventStates();
    const allEvents: EventConfiguration[] = [];

    // Lista de eventos conocidos (puedes expandir esto)
    const knownEvents = ['blasters2', 'halloween2024', 'christmas2024', 'anniversary'];

    for (const eventId of knownEvents) {
      const config = await loadEventConfig(eventId);
      if (config) {
        const status = states[eventId] || 'inactive';
        allEvents.push({
          ...config,
          status
        });
      }
    }

    return allEvents;
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
}

export async function getEventById(eventId: string): Promise<EventConfiguration | null> {
  try {
    const config = await loadEventConfig(eventId);
    if (!config) return null;

    const status = await getEventState(eventId);
    return {
      ...config,
      status
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }
}

// =====================================================
// FUNCIONES DE UTILIDAD PARA EVENTOS
// =====================================================

export function isEventActive(eventId: string): Promise<boolean> {
  return getEventState(eventId).then(status => status === 'active');
}

// =====================================================
// FUNCIONES DE FILTRO SIMPLIFICADAS
// =====================================================

// =====================================================
// FUNCIONES DE FILTRO SIMPLIFICADAS
// =====================================================

export function getEventGameFilter(event: EventConfiguration): string[] {
  // Usar game_filter del JSON, con fallback si no hay juegos de Blasters
  return (event as any).game_filter || [];
}

export function getEventFallbackGames(event: EventConfiguration): string[] {
  // Usar fallback_games del JSON
  return (event as any).fallback_games || [];
}

export async function getEventFilterForRandomYokai(event: EventConfiguration) {
  const gameFilter = getEventGameFilter(event);
  const fallbackGames = getEventFallbackGames(event);

  // Verificar si hay Yo-kai disponibles con el filtro principal
  let availableGames = gameFilter;

  if (gameFilter.length > 0) {
    try {
      const { data, error } = await supabase
        .from('yokai')
        .select('id')
        .in('game', gameFilter)
        .limit(1);

      // Si no hay Yo-kai con los juegos principales, usar fallback
      if (error || !data || data.length === 0) {
        console.warn(`No Yo-kai found for games: ${gameFilter.join(', ')}, using fallback: ${fallbackGames.join(', ')}`);
        availableGames = fallbackGames;
      }
    } catch (error) {
      console.error('Error checking game filter:', error);
      availableGames = fallbackGames;
    }
  }

  return {
    games: availableGames.length > 0 ? availableGames : undefined,
    mode: event.filter_mode || 'include'
  };
}

// =====================================================
// ADMINISTRACIÓN DE EVENTOS (SIMPLIFICADA)
// =====================================================

export async function activateEvent(eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_states')
      .update({
        status: 'active',
        activated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error activating event:', error);
    return false;
  }
}

export async function deactivateEvent(eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_states')
      .update({ status: 'inactive' })
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating event:', error);
    return false;
  }
}
