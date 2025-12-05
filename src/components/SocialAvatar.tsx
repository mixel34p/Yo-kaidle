'use client';

import React, { useState, useEffect } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut } from 'lucide-react';
import Link from 'next/link';
import AvatarWithFrame from '@/components/AvatarWithFrame';
import { useUserCustomization } from '@/hooks/useUserCustomization';

export default function SocialAvatar() {
  const { user, profile, signOut } = useSocialAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCurrentFrameDetails } = useUserCustomization(user?.id);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
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
        <div className="absolute top-full right-0 mt-2 w-64 bg-blue-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg shadow-xl z-[80]">
          {/* User info */}
          <div className="p-4 border-b border-blue-500/30">
            <div className="flex items-center gap-3">
              <AvatarWithFrame
                avatarUrl={profile.avatar_url || undefined}
                frameId={getCurrentFrameDetails()?.id}
                size="sm"
                alt={profile.username}
              />
              <div>
                <p className="text-white font-semibold">{profile.username}</p>
                <p className="text-blue-200 text-xs">
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
                className="w-4 h-4"
              />
              <span className="text-sm">
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
                className="w-4 h-4"
              />
              <span className="text-sm">
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
                className="w-4 h-4"
              />
              <span className="text-sm">
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
                className="w-4 h-4"
              />
              <span className="text-sm">
                {t.friends}
              </span>
            </Link>

            {/* Divider */}
            <div className="my-2 border-t border-blue-500/30"></div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 text-left text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <LogOut size={16} className="text-red-400" />
              <span className="text-sm">
                {t.signOut}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
