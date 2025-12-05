'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

function LoginContent() {
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
            <p className="text-white/70">
              {language === 'es'
                ? 'Inicia sesión para guardar tu progreso'
                : 'Sign in to save your progress'}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Discord Login Button */}
        <button
          onClick={handleDiscordLogin}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#5865F2]/50 text-white rounded-xl font-bold text-lg transition-all duration-200 mb-4"
        >
          {isSigningIn ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {language === 'es' ? 'Conectando...' : 'Connecting...'}
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.369a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              {language === 'es' ? 'Iniciar sesión con Discord' : 'Sign in with Discord'}
            </>
          )}
        </button>

        {/* Continue without auth */}
        <button
          onClick={handleContinueWithoutAuth}
          className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl font-medium transition-all duration-200"
        >
          {language === 'es' ? 'Continuar sin cuenta' : 'Continue without account'}
        </button>

        {/* Info */}
        <p className="mt-6 text-center text-white/50 text-sm">
          {language === 'es'
            ? 'Al iniciar sesión, tu progreso se sincronizará en la nube'
            : 'By signing in, your progress will be synced to the cloud'}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
