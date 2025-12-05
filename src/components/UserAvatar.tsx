'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut, Settings, RefreshCw } from 'lucide-react';
import AvatarWithFrame from '@/components/AvatarWithFrame';

export default function UserAvatar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Verificar si los contextos están disponibles
  let user, profile, signOut, syncLocalDataToCloud, language;

  try {
    const authContext = useAuth();
    const langContext = useLanguage();

    user = authContext?.user;
    profile = authContext?.profile;
    signOut = authContext?.signOut;
    syncLocalDataToCloud = authContext?.syncLocalDataToCloud;
    language = langContext?.language;
  } catch (error) {
    console.error('Error accessing contexts:', error);
    return <div className="text-red-500 text-xs">Auth Error</div>;
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-avatar-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Early return DESPUÉS de todos los hooks
  if (!user || !profile) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncLocalDataToCloud();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="user-avatar-container relative z-50">
      {/* Avatar button */}
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 p-2 rounded-lg bg-blue-900/90 hover:bg-blue-800/90 border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 shadow-lg backdrop-blur-sm relative z-50"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-8 h-8 rounded-full border-2 border-blue-400/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400/50">
            <User size={16} className="text-white" />
          </div>
        )}
        <span className="text-white text-sm font-medium hidden sm:block">
          {profile.username}
        </span>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-blue-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg shadow-xl z-50">
          {/* User info */}
          <div className="p-4 border-b border-blue-500/30">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-12 h-12 rounded-full border-2 border-blue-400/50"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400/50">
                  <User size={20} className="text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{profile.username}</p>
                <p className="text-blue-200 text-xs">
                  {language === 'es' ? 'Conectado con Discord' : 'Connected with Discord'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu options */}
          <div className="p-2">
            {/* Sync data button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={`text-blue-300 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isSyncing 
                  ? (language === 'es' ? 'Sincronizando...' : 'Syncing...')
                  : (language === 'es' ? 'Sincronizar datos' : 'Sync data')
                }
              </span>
            </button>

            {/* Settings button (placeholder for future) */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors"
            >
              <Settings size={16} className="text-blue-300" />
              <span className="text-sm">
                {language === 'es' ? 'Configuración' : 'Settings'}
              </span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-blue-500/30"></div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 text-left text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <LogOut size={16} className="text-red-400" />
              <span className="text-sm">
                {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
