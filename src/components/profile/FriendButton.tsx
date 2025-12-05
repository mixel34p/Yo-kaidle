'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useFriends, type FriendshipStatus as HookFriendshipStatus } from '@/hooks/useFriends';
import { UserPlus, Clock, Users } from 'lucide-react';

interface ProfileTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: 'default' | 'gradient' | 'pattern';
  layout: 'default' | 'compact' | 'detailed';
}

interface FriendButtonProps {
  targetUserId: string;
  targetUsername: string;
  theme: ProfileTheme;
  compact?: boolean;
}

export default function FriendButton({ targetUserId, targetUsername, theme, compact = false }: FriendButtonProps) {
  const { t } = useLanguage();
  const { user } = useSocialAuth();
  const { sendFriendRequest, getFriendshipStatus } = useFriends(user?.id);

  const [friendshipStatus, setFriendshipStatus] = useState<HookFriendshipStatus>('none');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar estado de amistad al montar el componente
  useEffect(() => {
    const loadFriendshipStatus = async () => {
      if (user && targetUserId) {
        try {
          const status = await getFriendshipStatus(targetUserId);
          setFriendshipStatus(status);
        } catch (error) {
          console.error('Error loading friendship status:', error);
        }
      }
    };

    loadFriendshipStatus();
  }, [user, targetUserId, getFriendshipStatus]);

  // Función para manejar acciones de amistad
  const handleFriendAction = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      switch (friendshipStatus) {
        case 'none':
          await sendFriendRequest(targetUserId);
          setFriendshipStatus('pending_sent');
          break;
        case 'pending_sent':
          // No se puede cancelar por ahora
          break;
        case 'pending_received':
          // Redirigir a página de amigos para aceptar/rechazar
          window.location.href = '/friends';
          break;
        case 'friends':
          // Redirigir a página de amigos para gestionar
          window.location.href = '/friends';
          break;
      }
    } catch (error) {
      console.error('Error en acción de amistad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración del botón según el estado
  const getButtonConfig = () => {
    switch (friendshipStatus) {
      case 'none':
        return {
          text: t.addFriend,
          icon: <UserPlus size={20} />,
          className: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
          textColor: 'text-white'
        };
      case 'pending_sent':
        return {
          text: t.requestSent,
          icon: <Clock size={20} />,
          className: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
          textColor: 'text-white'
        };
      case 'pending_received':
        return {
          text: t.acceptRequest,
          icon: <Clock size={20} />,
          className: 'bg-orange-600 hover:bg-orange-700 border-orange-500',
          textColor: 'text-white'
        };
      case 'friends':
        return {
          text: t.friends,
          icon: <Users size={20} />,
          className: 'bg-green-600 hover:bg-green-700 border-green-500',
          textColor: 'text-white'
        };
      case 'blocked':
        return {
          text: 'Blocked',
          icon: <Users size={20} />,
          className: 'bg-red-600 hover:bg-red-700 border-red-500',
          textColor: 'text-white'
        };
      default:
        return {
          text: t.addFriend,
          icon: <UserPlus size={20} />,
          className: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
          textColor: 'text-white'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className={`friend-button-container theme-${theme.primaryColor}`}>
      
      {/* Botón principal de amistad */}
      <button
        onClick={handleFriendAction}
        disabled={isLoading}
        className={`
          ${buttonConfig.className} ${buttonConfig.textColor}
          flex items-center gap-2 rounded-lg border-2
          transition-all duration-200 font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl transform hover:scale-105
          ${compact
            ? 'px-3 py-1 text-xs'
            : 'px-6 py-3 text-lg min-w-[200px] justify-center gap-3'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className={`animate-spin rounded-full border-b-2 border-white ${compact ? 'h-3 w-3' : 'h-5 w-5'}`} />
            {!compact && <span>{t.processing}</span>}
          </>
        ) : (
          <>
            {buttonConfig.icon}
            {!compact && <span>{buttonConfig.text}</span>}
          </>
        )}
      </button>




    </div>
  );
}
