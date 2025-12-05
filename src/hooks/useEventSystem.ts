// =====================================================
// EVENT SYSTEM HOOK
// React hook for managing events and player progress
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import type {
  EventConfiguration,
  EventStatus
} from '@/types/events';
import {
  getActiveEvents,
  getAllEvents,
  getEventById,
  activateEvent,
  deactivateEvent
} from '@/utils/eventManager';

// Simplified hook interface
interface UseEventSystemReturn {
  events: EventConfiguration[];
  activeEvents: EventConfiguration[];
  loading: boolean;
  error: string | null;
  activateEvent: (id: string) => Promise<void>;
  deactivateEvent: (id: string) => Promise<void>;
}

export function useEventSystem(): UseEventSystemReturn {
  // State management
  const [events, setEvents] = useState<EventConfiguration[]>([]);
  const [activeEvents, setActiveEvents] = useState<EventConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all events
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allEvents, activeEventsData] = await Promise.all([
        getAllEvents(),
        getActiveEvents()
      ]);

      setEvents(allEvents);
      setActiveEvents(activeEventsData);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const activateEventHandler = useCallback(async (id: string): Promise<void> => {
    try {
      await activateEvent(id);
      await loadEvents(); // Refresh events
    } catch (err) {
      console.error('Error activating event:', err);
      throw err;
    }
  }, [loadEvents]);

  const deactivateEventHandler = useCallback(async (id: string): Promise<void> => {
    try {
      await deactivateEvent(id);
      await loadEvents(); // Refresh events
    } catch (err) {
      console.error('Error deactivating event:', err);
      throw err;
    }
  }, [loadEvents]);

  return {
    events,
    activeEvents,
    loading,
    error,
    activateEvent: activateEventHandler,
    deactivateEvent: deactivateEventHandler
  };
}

// Simplified hook for just checking active events
export function useActiveEvents() {
  const [activeEvents, setActiveEvents] = useState<EventConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActiveEvents = async () => {
      try {
        const events = await getActiveEvents();
        setActiveEvents(events);
      } catch (error) {
        console.error('Error loading active events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveEvents();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadActiveEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { activeEvents, loading };
}

// Hook for a specific event (simplified)
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<EventConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  return {
    event,
    loading
  };
}
