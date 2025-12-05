'use client';

import { useEffect, useRef } from 'react';
import { getTodayDateString } from '@/utils/gameLogic';

export default function NotificationManager() {
  const lastNotificationDate = useRef<string | null>(null);

  useEffect(() => {
    // Registrar el service worker y configurar notificaciones
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Si las notificaciones están permitidas, programar notificaciones diarias
        if (Notification.permission === 'granted') {
          scheduleNotifications(registration);
          checkForNewDayNotification();
        }
      });
    }

    // Verificar cada minuto si hay un nuevo día
    const interval = setInterval(checkForNewDayNotification, 60000);

    return () => clearInterval(interval);
  }, []);

  const scheduleNotifications = (registration: ServiceWorkerRegistration) => {
    // Enviar mensaje al service worker para programar notificaciones
    if (registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_DAILY_NOTIFICATION'
      });
    }
  };

  const checkForNewDayNotification = async () => {
    const today = getTodayDateString();

    // Solo enviar notificación si las notificaciones están permitidas y es un nuevo día
    if (Notification.permission === 'granted' && lastNotificationDate.current !== today) {
      const now = new Date();

      // Enviar notificación a las 9:00 AM (con margen de 30 minutos)
      if (now.getHours() === 9 && now.getMinutes() < 30) {
        await showNewDayNotification();
        lastNotificationDate.current = today;
      }
    }
  };

  const showNewDayNotification = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('¡Nuevo Yo-kai disponible!', {
          body: '¡Un nuevo desafío diario te espera! ¿Podrás adivinar el Yo-kai de hoy?',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'daily-yokai',
          requireInteraction: false,
          data: {
            url: '/',
            timestamp: Date.now(),
            type: 'daily-yokai'
          }
        });
      }
    } catch (error) {
      console.error('Error showing new day notification:', error);
    }
  };

  // Este componente no renderiza nada, solo maneja la lógica
  return null;
}

// Función utilitaria para solicitar permisos de notificación
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Este navegador no soporta notificaciones');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted' && 'serviceWorker' in navigator) {
    // Programar notificaciones cuando se conceden los permisos
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_DAILY_NOTIFICATION'
        });
      }
    });
  }

  return permission;
};

// Función para cancelar notificaciones
export const cancelNotifications = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({
        type: 'CANCEL_DAILY_NOTIFICATION'
      });
    }
  }
};

// Función para mostrar una notificación de prueba
export const showTestNotification = async (): Promise<void> => {
  if (Notification.permission !== 'granted') {
    throw new Error('Los permisos de notificación no están concedidos');
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('¡Notificación de prueba!', {
      body: 'Las notificaciones están funcionando correctamente 🎮',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        url: '/',
        timestamp: Date.now()
      }
    });
  }
};
