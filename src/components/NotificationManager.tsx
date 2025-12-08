'use client';

import { useEffect, useRef } from 'react';
import { getTodayDateString } from '@/utils/gameLogic';
import {
  subscribeToPush,
  isSubscribedToPush,
  updateSubscriptionActivity,
  isPushSupported
} from '@/utils/pushManager';

export default function NotificationManager() {
  const lastActivityUpdate = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializePush = async () => {
      // Check if push is supported
      if (!isPushSupported()) {
        console.log('[NotificationManager] Push not supported');
        return;
      }

      // If permission is granted, ensure we're subscribed
      if (Notification.permission === 'granted') {
        const isSubscribed = await isSubscribedToPush();

        if (!isSubscribed) {
          // Try to subscribe (will save to Supabase)
          console.log('[NotificationManager] Re-subscribing to push...');
          await subscribeToPush();
        } else {
          // Update activity timestamp
          const today = getTodayDateString();
          if (lastActivityUpdate.current !== today) {
            await updateSubscriptionActivity();
            lastActivityUpdate.current = today;
          }
        }
      }
    };

    initializePush();
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Request notification permission and subscribe to push
 * This is the main function to call when user clicks "Enable notifications"
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    throw new Error('Este navegador no soporta notificaciones push');
  }

  // If already granted, just return
  if (Notification.permission === 'granted') {
    // Ensure we're subscribed
    await subscribeToPush();
    return 'granted';
  }

  // If denied, return without asking again
  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission
  const permission = await Notification.requestPermission();

  // If granted, subscribe to push
  if (permission === 'granted') {
    const subscription = await subscribeToPush();
    if (subscription) {
      console.log('[NotificationManager] Successfully subscribed to push notifications');
    } else {
      console.warn('[NotificationManager] Permission granted but failed to subscribe');
    }
  }

  return permission;
};

/**
 * Show a test notification to verify push is working
 */
export const showTestNotification = async (): Promise<void> => {
  if (Notification.permission !== 'granted') {
    throw new Error('Los permisos de notificación no están concedidos');
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('¡Notificación de prueba!', {
      body: 'Las notificaciones push están funcionando correctamente 🎮',
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

/**
 * Cancel/unsubscribe from push notifications
 */
export const cancelNotifications = async (): Promise<void> => {
  const { unsubscribeFromPush } = await import('@/utils/pushManager');
  await unsubscribeFromPush();
};
