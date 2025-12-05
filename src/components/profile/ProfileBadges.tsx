'use client';

import React from 'react';
import { AVAILABLE_BADGES, getBadgeName } from '@/utils/badgesManager';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileBadgesProps {
  selectedBadges: string[];
  className?: string;
}

const ProfileBadges: React.FC<ProfileBadgesProps> = ({ selectedBadges, className = '' }) => {
  const { language } = useLanguage();

  if (!selectedBadges || selectedBadges.length === 0) {
    return null;
  }

  // Obtener detalles de las insignias seleccionadas
  const badgeDetails = selectedBadges
    .map(badgeId => AVAILABLE_BADGES.find(badge => badge.id === badgeId))
    .filter(Boolean);

  if (badgeDetails.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {badgeDetails.map((badge) => (
        <div
          key={badge!.id}
          className="relative group"
          title={getBadgeName(badge!, language)}
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/60 flex items-center justify-center border border-blue-400/40 hover:border-blue-300/60 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg">
            <img
              src={badge!.image}
              alt={getBadgeName(badge!, language)}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                // Fallback a icono si la imagen no carga
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-6 h-6 flex items-center justify-center text-yellow-400';
                fallback.innerHTML = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                e.currentTarget.parentElement!.appendChild(fallback);
              }}
            />
          </div>
          
          {/* Tooltip mejorado sutilmente */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 backdrop-blur-sm border border-white/20">
            {getBadgeName(badge!, language)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileBadges;
