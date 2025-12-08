'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { requestNotificationPermission, showTestNotification } from './NotificationManager';
import { isSubscribedToPush } from '@/utils/pushManager';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAPrompt() {
  console.log('[PWAPrompt] Component mounted!');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true); // FORZADO A TRUE PARA DEBUG
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false);
  const [notificationPromptDismissed, setNotificationPromptDismissed] = useState(false);
  useEffect(() => {
    console.log('[PWAPrompt] useEffect running!');
    // Versión del sistema de notificaciones - incrementar para resetear el prompt
    const NOTIFICATION_SYSTEM_VERSION = '2'; // v2 = nuevo sistema de Web Push
    const storedVersion = localStorage.getItem('notification-system-version');

    // Si la versión cambió, resetear el estado de dismissed para mostrar el prompt de nuevo
    if (storedVersion !== NOTIFICATION_SYSTEM_VERSION) {
      localStorage.removeItem('pwa-notification-dismissed');
      localStorage.setItem('notification-system-version', NOTIFICATION_SYSTEM_VERSION);
    }

    // Verificar si los prompts fueron previamente cerrados
    const installDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    const notificationDismissed = localStorage.getItem('pwa-notification-dismissed') === 'true';

    setInstallPromptDismissed(installDismissed);
    setNotificationPromptDismissed(notificationDismissed);

    // Check if notifications are supported
    const checkAndShowNotificationPrompt = async () => {
      if (!('Notification' in window) || notificationDismissed) {
        return;
      }

      // Si el permiso fue denegado, no mostrar
      if (Notification.permission === 'denied') {
        setShowNotificationPrompt(false);
        return;
      }

      // Si el permiso es 'default' (nunca preguntado), mostrar
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true);
        return;
      }

      // Si el permiso es 'granted', verificar si están suscritos al nuevo push
      if (Notification.permission === 'granted') {
        try {
          const isSubscribed = await isSubscribedToPush();
          // Mostrar si NO están suscritos al nuevo sistema
          setShowNotificationPrompt(!isSubscribed);
        } catch (error) {
          console.log('[PWAPrompt] Error checking subscription, showing prompt:', error);
          // En caso de error (ej: dev mode sin SW), mostrar el prompt
          setShowNotificationPrompt(true);
        }
      }
    };

    checkAndShowNotificationPrompt();

    // Handle PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      if (!installDismissed) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast.success('¡Gracias por instalar Yo-kaidle! 🎮');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (err) {
      console.error('Error al instalar la PWA:', err);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setInstallPromptDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDeferredPrompt(null);
  };
  const handleNotificationPermission = async () => {
    console.log('[PWAPrompt] handleNotificationPermission called!');
    alert('Botón pulsado! Solicitando permisos...');

    try {
      const permission = await requestNotificationPermission();
      console.log('[PWAPrompt] Permission result:', permission);

      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas! Te avisaremos cuando haya un nuevo Yo-kai diario 🔔');
        setShowNotificationPrompt(false);

        // Mostrar notificación de prueba
        setTimeout(() => {
          showTestNotification().catch(console.error);
        }, 2000);
      } else if (permission === 'denied') {
        toast.error('Las notificaciones fueron denegadas 🔕');
        setShowNotificationPrompt(false);
      }
    } catch (err) {
      console.error('Error al solicitar permisos:', err);
      alert('Error: ' + (err as Error).message);
      toast.error('Error al configurar las notificaciones');
    }
  };

  const handleDismissNotification = () => {
    setShowNotificationPrompt(false);
    setNotificationPromptDismissed(true);
    localStorage.setItem('pwa-notification-dismissed', 'true');
  };

  if (!showInstallPrompt && !showNotificationPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] flex flex-col gap-2 sm:bottom-4 md:w-auto md:left-4 pointer-events-auto">
      {showInstallPrompt && deferredPrompt && (
        <div className="relative flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-black rounded-lg shadow-lg font-medium">
          <span className="text-xl">📱</span>
          <button
            onClick={handleInstallClick}
            className="flex-1 text-left hover:underline"
          >
            Instalar como app
          </button>
          <button
            onClick={handleDismissInstall}
            className="ml-2 p-1 hover:bg-yellow-500 rounded-full transition-colors"
            title="Cerrar"
          >
            <X size={16} className="text-red-600" />
          </button>
        </div>
      )}

      {showNotificationPrompt && (
        <div className="relative flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg font-medium">
          <span className="text-xl">🔔</span>
          <button
            onClick={handleNotificationPermission}
            className="flex-1 text-left hover:underline"
          >
            Avisar cuando hay nuevo Yo-kai
          </button>
          <button
            onClick={handleDismissNotification}
            className="ml-2 p-1 hover:bg-blue-600 rounded-full transition-colors"
            title="Cerrar"
          >
            <X size={16} className="text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}
