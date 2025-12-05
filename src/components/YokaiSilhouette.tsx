'use client';

import React, { useState } from 'react';
import { Yokai, tribeIcons, rankIcons } from '@/types/yokai';
import { useLanguage } from '@/contexts/LanguageContext';
import WikiaImage from './WikiaImage';

interface YokaiSilhouetteProps {
  yokai: Yokai | null;
  isUnlocked: boolean;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const YokaiSilhouette: React.FC<YokaiSilhouetteProps> = ({ 
  yokai, 
  isUnlocked, 
  showName = true,
  size = 'medium' 
}) => {
  const { getYokaiName, getTribeTranslation } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Obtener tamaños según el prop size
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-20 h-28',
          image: 'w-16 h-16',
          badge: 'w-6 h-6',
          badgeIcon: 'w-4 h-4',
          name: 'text-xs'
        };
      case 'large':
        return {
          container: 'w-40 h-52',
          image: 'w-32 h-32',
          badge: 'w-10 h-10',
          badgeIcon: 'w-6 h-6',
          name: 'text-base'
        };
      case 'medium':
      default:
        return {
          container: 'w-28 h-40',
          image: 'w-24 h-24',
          badge: 'w-8 h-8',
          badgeIcon: 'w-5 h-5',
          name: 'text-sm'
        };
    }
  };

  const sizes = getSizes();

  // Obtener icono de rango
  const getRankIcon = (rank: string) => {
    return rankIcons[rank as keyof typeof rankIcons] || rankIcons['E'];
  };

  // Obtener icono de tribu
  const getTribeIcon = (tribe: string) => {
    return tribeIcons[tribe as keyof typeof tribeIcons] || tribeIcons['Charming'];
  };

  if (!yokai) {
    return (
      <div className={`${sizes.container} flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300`}>
        <div className="text-gray-400 text-2xl">?</div>
        {showName && (
          <div className={`${sizes.name} text-gray-400 text-center mt-1 px-2 pb-2`}>
            ???
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${sizes.container} relative flex flex-col items-center bg-white rounded-lg border border-gray-200 overflow-hidden`}>
      {/* Badges de tribu y rango */}
      <div className="absolute top-1 left-1 right-1 flex justify-between z-10">
        {/* Badge de tribu */}
        <div className={`${sizes.badge} shadow-lg`}>
          <img
            src={getTribeIcon(yokai.tribe)}
            alt={yokai.tribe}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Badge de rango */}
        <div className={`${sizes.badge} shadow-lg`}>
          <img
            src={getRankIcon(yokai.rank)}
            alt={yokai.rank}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Imagen del Yo-kai */}
      <div className={`${sizes.image} ${size === 'small' ? 'mt-6' : size === 'medium' ? 'mt-8' : 'mt-10'} mb-2 relative flex items-center justify-center`}>
        {!imageError && yokai.imageurl ? (
          <WikiaImage
            src={yokai.imageurl}
            alt={yokai.name}
            className={`${sizes.image} object-contain ${!isUnlocked ? 'filter brightness-0' : ''}`}
            onError={() => setImageError(true)}
          />
        ) : (
          // Silueta por defecto si no hay imagen
          <div className={`${sizes.image} bg-gray-800 rounded-lg flex items-center justify-center ${!isUnlocked ? 'bg-black' : 'bg-gray-400'}`}>
            <span className="text-white text-lg font-bold">
              {yokai.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Nombre del Yo-kai */}
      {showName && (
        <div className={`${sizes.name} text-center px-2 pb-2 font-medium leading-tight ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
          {isUnlocked ? getYokaiName(yokai) : '???'}
        </div>
      )}

      {/* Overlay para Yo-kai no desbloqueados */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg" />
      )}
    </div>
  );
};

export default YokaiSilhouette;
