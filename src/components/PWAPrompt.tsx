'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and not already granted
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true);
      }
    }

    // Handle PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
    } catch (err) {
      console.error('Error al instalar la PWA:', err);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas! 🔔');
        // Register push subscription here if using web push
        setShowNotificationPrompt(false);
      } else {
        toast.error('Las notificaciones fueron denegadas 🔕');
      }
    } catch (err) {
      console.error('Error al solicitar permisos:', err);
    }
  };

  if (!deferredPrompt && !showNotificationPrompt) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 sm:bottom-4 md:w-auto md:left-4">
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-black rounded-lg shadow-lg hover:bg-yellow-500 transition-colors font-medium"
        >
          <span className="text-xl">📱</span>
          <span className="flex-1">Instalar como app</span>
          <span className="text-sm opacity-75">↓</span>
        </button>
      )}
      
      {showNotificationPrompt && (
        <button
          onClick={handleNotificationPermission}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <span className="text-xl">🔔</span>
          <span className="flex-1">Activar notificaciones</span>
          <span className="text-sm opacity-75">↓</span>
        </button>
      )}
    </div>
  );
}
