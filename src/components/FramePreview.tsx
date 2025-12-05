'use client';

import React from 'react';
import { User } from 'lucide-react';
import { getFrameById } from '@/utils/framesManager';

interface FramePreviewProps {
  frameId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

// Rarity colors for visual effects
const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600'
};

// Frame rarity mapping
const frameRarities: Record<string, keyof typeof rarityColors> = {
  default: 'common',
  bronze: 'common',
  silver: 'uncommon',
  gold: 'rare',
  legendary: 'legendary',
  rainbow: 'epic'
};

export default function FramePreview({
  frameId,
  size = 'md',
  className = '',
  showLabel = false
}: FramePreviewProps) {
  const frameData = getFrameById(frameId);
  const rarity = frameRarities[frameId] || 'common';

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      avatar: 'w-6 h-6',
      text: 'text-xs',
      frame: 'w-12 h-12'
    },
    md: {
      container: 'w-16 h-16',
      avatar: 'w-8 h-8',
      text: 'text-sm',
      frame: 'w-16 h-16'
    },
    lg: {
      container: 'w-24 h-24',
      avatar: 'w-12 h-12',
      text: 'text-base',
      frame: 'w-24 h-24'
    }
  };

  const sizeConf = sizeConfig[size];

  if (!frameData) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className={`${sizeConf.container} relative group cursor-pointer transition-all duration-200 hover:scale-105`}>
        {/* Avatar background */}
        <div className="absolute inset-0 rounded-full bg-blue-600/50 flex items-center justify-center">
          <User className={`${sizeConf.avatar} text-white/70`} />
        </div>

        {/* Frame image overlay */}
        {frameData.id !== 'default' && (
          <img
            src={frameData.image}
            alt={`${frameData.name_es} frame`}
            className={`${sizeConf.frame} absolute inset-0 object-cover pointer-events-none z-10`}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))'
            }}
          />
        )}

        {/* Rarity glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${rarityColors[rarity]} opacity-20 pointer-events-none`} />

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full pointer-events-none z-20" />
      </div>

      {showLabel && (
        <p className={`${sizeConf.text} text-white/80 text-center mt-1 font-medium`}>
          {frameData.name_es}
        </p>
      )}
    </div>
  );
}