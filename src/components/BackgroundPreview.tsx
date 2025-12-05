'use client';

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { AVAILABLE_BACKGROUNDS, type BackgroundId } from '@/utils/backgroundsManager';

interface BackgroundPreviewProps {
  backgroundId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

// Mapeo de emojis fallback para cada fondo
const backgroundEmojis: Record<string, string> = {
  default: '🎮',
  yokai_pattern: '👻',
  night_sky: '🌙',
  cherry_blossoms: '🌸',
  digital_grid: '💻',
  mystical_forest: '🌲',
  'yo-kaipad': '📱',
  enma: '👑',
  sunset_city: '🌆',
  space_station: '🚀'
};

export default function BackgroundPreview({
  backgroundId,
  size = 'md',
  className = '',
  showLabel = false
}: BackgroundPreviewProps) {
  const [imageError, setImageError] = useState(false);

  // Buscar el fondo en la configuración real
  const background = AVAILABLE_BACKGROUNDS.find(bg => bg.id === backgroundId as BackgroundId);
  const fallbackEmoji = backgroundEmojis[backgroundId] || '🖼️';

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-8',
      text: 'text-xs',
      icon: 'w-3 h-3',
      emoji: 'text-lg'
    },
    md: {
      container: 'w-16 h-12',
      text: 'text-sm',
      icon: 'w-4 h-4',
      emoji: 'text-2xl'
    },
    lg: {
      container: 'w-24 h-16',
      text: 'text-base',
      icon: 'w-5 h-5',
      emoji: 'text-3xl'
    }
  };

  const sizeConf = sizeConfig[size];

  return (
    <div className={`${className}`}>
      <div className={`
        ${sizeConf.container}
        relative
        rounded-lg
        overflow-hidden
        border-2 border-white/20
        shadow-lg
        group
        cursor-pointer
        transition-all duration-200
        hover:scale-105
        hover:border-white/40
        flex items-center justify-center
      `}>
        {/* Imagen real del fondo o fallback */}
        {background && !imageError ? (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: background.style.backgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Imagen invisible para detectar errores de carga */}
            <img
              src={background.style.backgroundImage?.replace('url("', '').replace('")', '') || ''}
              alt={background.name_es}
              className="hidden"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          </div>
        ) : (
          /* Fallback con emoji */
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <span className={`${sizeConf.emoji}`}>{fallbackEmoji}</span>
          </div>
        )}

        {/* Preview indicator */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="bg-black/50 rounded-full p-0.5">
            <Eye className={`${sizeConf.icon} text-white`} />
          </div>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      {showLabel && (
        <p className={`${sizeConf.text} text-white/80 text-center mt-1 font-medium`}>
          {background?.name_es || backgroundId}
        </p>
      )}
    </div>
  );
}

// Component for showing background preview in a larger modal/popup
export function BackgroundPreviewModal({
  backgroundId,
  isOpen,
  onClose
}: {
  backgroundId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const background = AVAILABLE_BACKGROUNDS.find(bg => bg.id === backgroundId as BackgroundId);
  const fallbackEmoji = backgroundEmojis[backgroundId] || '🖼️';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          {background?.name_es || backgroundId} Preview
        </h3>

        {/* Large preview */}
        <div className="w-full h-48 relative rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl flex items-center justify-center">
          {/* Imagen real del fondo o fallback */}
          {background && !imageError ? (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: background.style.backgroundImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Imagen invisible para detectar errores de carga */}
              <img
                src={background.style.backgroundImage?.replace('url("', '').replace('")', '') || ''}
                alt={background.name_es}
                className="hidden"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </div>
          ) : (
            /* Fallback con emoji grande */
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <span className="text-6xl">{fallbackEmoji}</span>
            </div>
          )}

          {/* Sample content overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-white/90 text-center bg-black/40 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">🎮</div>
              <p className="text-sm">Vista previa de tu fondo</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Vista Previa
        </button>
      </div>
    </div>
  );
}
