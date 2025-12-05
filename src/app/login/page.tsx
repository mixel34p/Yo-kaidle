'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const { signInWithDiscord, user, loading } = useSocialAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'auth_failed':
          setError(language === 'es' ? 'Error de autenticación' : 'Authentication failed');
          break;
        case 'callback_failed':
          setError(language === 'es' ? 'Error en el callback' : 'Callback failed');
          break;
        default:
          setError(language === 'es' ? 'Error desconocido' : 'Unknown error');
      }
    }
  }, [searchParams, language]);

  const handleDiscordLogin = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setError(null);

    try {
      await signInWithDiscord();
    } catch (error) {
      console.error('Login error:', error);
      setError(language === 'es' ? 'Error al iniciar sesión' : 'Login error');
      setIsSigningIn(false);
    }
  };

  const handleContinueWithoutAuth = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">
            {language === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="app-container max-w-md w-full">
        <div className="text-center mb-8">
          {/* Logo/Title */}
          <div className="mb-6">
            <h1 className="game-title text-3xl sm:text-4xl mb-2">
              🎮 Yo-kaidle
            </h1>
            <p className="text-blue-200 text-sm sm:text-base">
              {language === 'es'
                ? 'Adivina el Yo-kai cada día'
                : 'Guess the Yo-kai every day'
              }
            </p>
          </div>

          {/* Welcome message */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">
              {language === 'es' ? '¡Bienvenido!' : 'Welcome!'}
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              {language === 'es'
                ? 'Inicia sesión con Discord para sincronizar tu progreso en todos tus dispositivos, o continúa jugando sin cuenta.'
                : 'Sign in with Discord to sync your progress across all devices, or continue playing without an account.'
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login buttons */}
          <div className="space-y-4">
            {/* Discord login button */}
            <button
              onClick={handleDiscordLogin}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>
                    {language === 'es' ? 'Iniciando sesión...' : 'Signing in...'}
                  </span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>
                    {language === 'es' ? 'Iniciar sesión con Discord' : 'Sign in with Discord'}
                  </span>
                </>
              )}
            </button>

            {/* Continue without auth button */}
            <button
              onClick={handleContinueWithoutAuth}
              className="w-full text-blue-200 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-blue-300/30 hover:border-blue-300/60"
            >
              {language === 'es' ? 'Continuar sin cuenta' : 'Continue without account'}
            </button>
          </div>

          {/* Benefits info */}
          <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">
              {language === 'es' ? 'Beneficios de iniciar sesión:' : 'Benefits of signing in:'}
            </h3>
            <ul className="text-xs text-blue-100 space-y-1 text-left">
              <li>• {language === 'es' ? 'Progreso sincronizado en todos tus dispositivos' : 'Progress synced across all devices'}</li>
              <li>• {language === 'es' ? 'Respaldo automático de tu Medallium' : 'Automatic backup of your Medallium'}</li>
              <li>• {language === 'es' ? 'Estadísticas y logros guardados' : 'Saved statistics and achievements'}</li>
              <li>• {language === 'es' ? 'Configuraciones personalizadas' : 'Personalized settings'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
