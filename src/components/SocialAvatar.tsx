'use client';

import React, { useState, useEffect } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import AvatarWithFrame from '@/components/AvatarWithFrame';
import CloudSyncPrompt from '@/components/CloudSyncPrompt';
import { useUserCustomization } from '@/hooks/useUserCustomization';
import { getSyncStatus, clearSyncStatus } from '@/utils/cloudSyncManager';

export default function SocialAvatar() {
  const { user, profile, signOut } = useSocialAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const { getCurrentFrameDetails } = useUserCustomization(user?.id);

  // Check if user needs initial sync on first login
  useEffect(() => {
    if (user && profile) {
      const syncStatus = getSyncStatus();
      // Show sync prompt if user is not synced yet
      if (!syncStatus.isSynced) {
        // Small delay to ensure page is rendered
        const timer = setTimeout(() => {
          setShowSyncPrompt(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, profile]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.social-avatar-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

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

  const handleResync = () => {
    clearSyncStatus();
    setShowSyncPrompt(true);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="social-avatar-container relative z-[70]">
        {/* Avatar button */}
        <button
          onClick={toggleMenu}
          className="flex items-center gap-2 p-2 rounded-lg bg-blue-900/90 hover:bg-blue-800/90 border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 shadow-lg backdrop-blur-sm relative z-[70]"
        >
          <AvatarWithFrame
            avatarUrl={profile.avatar_url || undefined}
            frameId={getCurrentFrameDetails()?.id}
            size="xs"
            alt={profile.username}
          />
          <span className="text-white text-sm font-medium hidden sm:block">
            {profile.username}
          </span>
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 max-w-[calc(100vw-1rem)] bg-blue-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg shadow-xl z-[80]">
            {/* User info */}
            <div className="p-4 border-b border-blue-500/30">
              <div className="flex items-center gap-3">
                <AvatarWithFrame
                  avatarUrl={profile.avatar_url || undefined}
                  frameId={getCurrentFrameDetails()?.id}
                  size="sm"
                  alt={profile.username}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold truncate">{profile.username}</p>
                  <p className="text-blue-200 text-xs truncate">
                    {t.connectedWithDiscord}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu options */}
            <div className="p-2">
              {/* Ver mi perfil */}
              <Link
                href={`/profile?u=${profile.username}`}
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors"
              >
                <img
                  src="/icons/social/profile.png"
                  alt="Profile"
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm truncate">
                  {t.viewMyProfile}
                </span>
              </Link>

              {/* Leaderboards */}
              <Link
                href="/leaderboards"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors"
              >
                <img
                  src="/icons/social/leaderboards.png"
                  alt="Leaderboards"
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm truncate">
                  {t.leaderboards}
                </span>
              </Link>

              {/* Personalizar Perfil */}
              <Link
                href="/customize-profile"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors"
              >
                <img
                  src="/icons/social/personalization.png"
                  alt="Personalization"
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm truncate">
                  {t.customizeProfile}
                </span>
              </Link>

              {/* Friends */}
              <Link
                href="/friends"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors"
              >
                <img
                  src="/icons/social/friends.png"
                  alt="Friends"
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm truncate">
                  {t.friends}
                </span>
              </Link>

              {/* Cloud Sync / Resync */}
              <button
                onClick={handleResync}
                className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-blue-800/50 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className="text-blue-300 flex-shrink-0" />
                <span className="text-sm truncate">
                  {t.resync}
                </span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-blue-500/30"></div>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 text-left text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <LogOut size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-sm truncate">
                  {t.signOut}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Sync Prompt Modal */}
      <CloudSyncPrompt
        isOpen={showSyncPrompt}
        onClose={() => setShowSyncPrompt(false)}
      />
    </>
  );
}

