'use client';

import React from 'react';
import { useUserCustomization } from '@/hooks/useUserCustomization';
import { Star, Crown, Palette, Frame } from 'lucide-react';

interface CustomizationDisplayProps {
  userId: string;
  compact?: boolean;
}

export default function CustomizationDisplay({ userId, compact = false }: CustomizationDisplayProps) {
  const {
    customization,
    loading,
    getFavoriteYokaiDetails,
    getCurrentTitleDetails,
    getCurrentFrameDetails,
    hasCustomization
  } = useUserCustomization(userId);

  if (loading || !hasCustomization()) {
    return null;
  }

  const favoriteYokai = getFavoriteYokaiDetails();
  const currentTitle = getCurrentTitleDetails();
  const currentFrame = getCurrentFrameDetails();

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {favoriteYokai && (
          <div className="flex items-center gap-1 text-purple-300">
            <Star size={12} />
            <span className="truncate max-w-20">{favoriteYokai.name}</span>
          </div>
        )}
        {currentTitle && currentTitle.id !== 'default' && (
          <div className="flex items-center gap-1 text-yellow-300">
            <Crown size={12} />
            <span className="truncate max-w-24">{currentTitle.name_es}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Palette size={16} className="text-purple-400" />
        Personalización
      </h3>

      <div className="space-y-3">
        {/* Yo-kai Favorito */}
        {favoriteYokai && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-blue-600/50 flex-shrink-0">
              <img
                src={favoriteYokai.image}
                alt={favoriteYokai.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center text-white text-xs';
                  fallback.textContent = favoriteYokai.name.slice(0, 2);
                  e.currentTarget.parentElement!.appendChild(fallback);
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-purple-300 text-sm">
                <Star size={14} />
                <span className="font-medium">Yo-kai Favorito</span>
              </div>
              <p className="text-white text-sm truncate">{favoriteYokai.name}</p>
              <p className="text-white/60 text-xs">{favoriteYokai.rank} • {favoriteYokai.tribe}</p>
            </div>
          </div>
        )}

        {/* Título Personalizado */}
        {currentTitle && currentTitle.id !== 'default' && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-600/50 flex items-center justify-center flex-shrink-0">
              <Crown size={16} className="text-yellow-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-yellow-300 text-sm">
                <Crown size={14} />
                <span className="font-medium">Título</span>
              </div>
              <p className="text-white text-sm truncate">{currentTitle.name_es}</p>
              <p className="text-white/60 text-xs">{currentTitle.description_es}</p>
            </div>
          </div>
        )}


        {/* Marco Personalizado */}
        {currentFrame && currentFrame.id !== 'default' && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/50 flex items-center justify-center flex-shrink-0">
              <Frame size={16} className="text-orange-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-orange-300 text-sm">
                <Frame size={14} />
                <span className="font-medium">Marco</span>
              </div>
              <p className="text-white text-sm truncate">{currentFrame.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
