'use client';

import React from 'react';
import { User } from 'lucide-react';
import { getFrameById } from '@/utils/framesManager';

interface AvatarWithFrameProps {
  avatarUrl?: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

// Size configurations
const sizeConfig = {
  xs: {
    container: 'w-8 h-8',
    avatar: 'w-6 h-6',
    frame: 'w-8 h-8',
    userIcon: 12
  },
  sm: {
    container: 'w-12 h-12',
    avatar: 'w-8 h-8',
    frame: 'w-12 h-12',
    userIcon: 16
  },
  md: {
    container: 'w-16 h-16',
    avatar: 'w-12 h-12',
    frame: 'w-16 h-16',
    userIcon: 20
  },
  lg: {
    container: 'w-24 h-24',
    avatar: 'w-18 h-18',
    frame: 'w-24 h-24',
    userIcon: 28
  },
  xl: {
    container: 'w-32 h-32 md:w-40 md:h-40',
    avatar: 'w-24 h-24 md:w-32 md:h-32',
    frame: 'w-32 h-32 md:w-40 md:h-40',
    userIcon: 48
  }
};

export default function AvatarWithFrame({ 
  avatarUrl, 
  frameId = 'default', 
  size = 'md', 
  className = '',
  alt = 'User avatar'
}: AvatarWithFrameProps) {
  const frameData = getFrameById(frameId);
  const sizeConf = sizeConfig[size];

  return (
    <div className={`${sizeConf.container} relative ${className}`}>
      {/* Avatar background circle */}
      <div className={`${sizeConf.container} absolute inset-0 rounded-full bg-blue-600/50 flex items-center justify-center overflow-hidden`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={sizeConf.userIcon} className="text-white/70" />
        )}
      </div>

      {/* Frame overlay (only if not default) */}
      {frameData && frameData.id !== 'default' && (
        <img
          src={frameData.image}
          alt={`${frameData.name_es} frame`}
          className={`${sizeConf.frame} absolute inset-0 object-cover pointer-events-none z-10`}
          style={{ 
            filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))'
          }}
        />
      )}
    </div>
  );
}
