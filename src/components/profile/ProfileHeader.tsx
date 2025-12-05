'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserCustomization, getTitleName } from '@/hooks/useUserCustomization';
import { User, Crown, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
import FavoriteYokaiDisplay from './FavoriteYokaiDisplay';
import ProfileBadges from './ProfileBadges';
import AvatarWithFrame from '@/components/AvatarWithFrame';
import ProfileBanner from '@/components/ProfileBanner';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  discord_id: string;
  created_at: string;
}

interface ProfileTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: 'default' | 'gradient' | 'pattern';
  layout: 'default' | 'compact' | 'detailed';
}

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  theme: ProfileTheme;
  friendButton?: React.ReactNode;
}

export default function ProfileHeader({ profile, isOwnProfile, theme, friendButton }: ProfileHeaderProps) {
  const { t, language } = useLanguage();
  const {
    customization,
    getFavoriteYokaiDetails,
    getCurrentTitleDetails,
    getCurrentFrameDetails,
    getCurrentBannerDetails
  } = useUserCustomization(profile.id);

  // Formatear fecha de registro
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    // Usar una función simple para determinar el locale
    const getLocale = () => {
      if (t.appTitle === 'Yo-kaidle' && t.play === 'Jugar') return 'es-ES';
      if (t.appTitle === 'Yo-kaidle' && t.play === 'Gioca') return 'it-IT';
      return 'en-US';
    };
    return date.toLocaleDateString(getLocale(), options);
  };

  // Obtener personalización del perfil
  const favoriteYokai = getFavoriteYokaiDetails();
  const currentTitle = getCurrentTitleDetails();
  const currentFrame = getCurrentFrameDetails();
  const currentBanner = getCurrentBannerDetails();

  const userTitle = currentTitle ? getTitleName(currentTitle, language) : null;
  const defaultTitle = t.defaultTitle;

  return (
    <div className={`profile-header theme-${theme.primaryColor} layout-${theme.layout}`}>
      {/* Banner del perfil con mejor integración */}
      <div className="relative">
        <ProfileBanner
          backgroundId={currentBanner?.id}
          height="md"
          className="rounded-t-2xl"
        >
          {/* Badge de "Tu perfil" o botón de amistad */}
          <div className="absolute top-4 right-4 flex justify-end z-20">
            {isOwnProfile ? (
              <div className="bg-green-500/25 border border-green-400/60 rounded-full px-4 py-2 text-green-200 text-sm font-medium backdrop-blur-md shadow-lg">
                {t.yourProfile}
              </div>
            ) : (
              <div className="backdrop-blur-md bg-black/20 rounded-lg p-1 border border-white/20">
                {friendButton}
              </div>
            )}
          </div>

          {/* Overlay sutil para mejor transición */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
        </ProfileBanner>
      </div>

      {/* Contenedor principal del header - conectado visualmente con el banner */}
      <div className="relative bg-gradient-to-br from-blue-900/85 to-purple-900/85 backdrop-blur-sm rounded-b-2xl rounded-t-none p-8 border-x border-b border-blue-500/30 shadow-2xl -mt-1">

        {/* Layout principal */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Avatar con marco personalizado - mejorado sutilmente */}
          <div className="relative">
            <AvatarWithFrame
              avatarUrl={profile.avatar_url || undefined}
              frameId={currentFrame?.id}
              size="xl"
              alt={profile.username}
              className="shadow-2xl ring-2 ring-white/10"
            />
            {/* Efecto de brillo sutil */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
          </div>

          {/* Información del usuario */}
          <div className="flex-1 text-center md:text-left">

            {/* Username con mejor tipografía */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 break-words tracking-tight">
              {profile.username}
            </h1>

            {/* Título (solo si existe) - mejorado sutilmente */}
            {userTitle && (
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Crown size={14} className="text-yellow-400" />
                </div>
                <span className="text-yellow-300 font-semibold text-lg">
                  {userTitle}
                </span>
              </div>
            )}

            {/* Yo-kai favorito */}
            {favoriteYokai && (
              <div className="mb-5">
                <FavoriteYokaiDisplay yokai={favoriteYokai} compact={true} />
              </div>
            )}

            {/* Insignias */}
            {customization.selectedBadges && customization.selectedBadges.length > 0 && (
              <div className="mb-5 flex justify-center md:justify-start">
                <ProfileBadges selectedBadges={customization.selectedBadges} />
              </div>
            )}

            {/* Información adicional - mejorada sutilmente */}
            <div className="space-y-3 text-white/80">

              {/* Fecha de registro */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar size={12} className="text-blue-300" />
                </div>
                <span className="text-sm font-medium">
                  {t.memberSince} {formatJoinDate(profile.created_at)}
                </span>
              </div>

              {/* Botón de personalización para perfil propio */}
              {isOwnProfile && (
                <div className="flex justify-center md:justify-start mt-5">
                  <Link
                    href="/customize-profile"
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600/90 hover:bg-purple-600 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 border border-purple-500/30"
                  >
                    <Settings size={16} />
                    {t.customizeProfile}
                  </Link>
                </div>
              )}

            </div>


          </div>
        </div>

        {/* Decoración de fondo personalizable */}
        <div className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none">
          {theme.backgroundStyle === 'gradient' && (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl" />
          )}
          {theme.backgroundStyle === 'pattern' && (
            <div className="w-full h-full bg-blue-500/20 rounded-2xl" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
