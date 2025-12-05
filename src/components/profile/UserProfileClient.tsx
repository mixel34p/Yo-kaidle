'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import FriendButton from '@/components/profile/FriendButton';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  discord_id: string;
  created_at: string;
}

interface UserStats {
  total_played: number;
  best_streak: number;
  current_streak: number;
  yokai_unlocked: number;
  achievements_count: number;
  updated_at: string;
}

interface ProfileTheme {
  // Preparado para personalización futura
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: 'default' | 'gradient' | 'pattern';
  layout: 'default' | 'compact' | 'detailed';
}

interface UserProfileClientProps {
  username: string;
}

export default function UserProfileClient({ username }: UserProfileClientProps) {
  const router = useRouter();
  const { user: currentUser } = useSocialAuth();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileTheme: ProfileTheme = {
    primaryColor: 'blue',
    secondaryColor: 'purple',
    backgroundStyle: 'default',
    layout: 'default'
  };

  const isOwnProfile = currentUser?.id === profile?.id;

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener perfil por username
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError(t.userNotFound);
          } else {
            setError(t.errorLoadingProfile);
          }
          return;
        }

        setProfile(profileData);

        // Obtener estadísticas del usuario
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('id', profileData.id)
          .single();

        if (statsError) {
          console.warn('No stats found for user:', statsError);
          // Crear stats por defecto si no existen
          setStats({
            total_played: 0,
            best_streak: 0,
            current_streak: 0,
            yokai_unlocked: 0,
            achievements_count: 0,
            updated_at: new Date().toISOString()
          });
        } else {
          setStats(statsData);
        }

      } catch (error) {
        console.error('Error loading profile:', error);
        setError(t.unexpectedError);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">
            {t.loadingProfile}
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {error || t.profileNotFound}
          </h1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen">
      {/* Botón para volver */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          ← {t.profileBackToGame}
        </button>
      </div>

      {/* Contenedor principal con tema personalizable */}
      <div
        className={`profile-container ${profileTheme.layout} theme-${profileTheme.primaryColor}`}
        data-background={profileTheme.backgroundStyle}
      >
        {/* Header del perfil */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          theme={profileTheme}
          friendButton={!isOwnProfile ? (
            <FriendButton
              targetUserId={profile.id}
              targetUsername={profile.username}
              theme={profileTheme}
              compact={true}
            />
          ) : undefined}
        />

        {/* Estadísticas principales */}
        <ProfileStats
          stats={stats}
          theme={profileTheme}
        />

      </div>
    </div>
  );
}
