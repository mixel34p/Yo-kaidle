'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Yokai, tribeIcons, elementIcons, rankIcons, gameLogos } from '@/types/yokai';
import { Maximize2, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MedalliumCardProps {
  yokai: Yokai;
  onClick: (yokai: Yokai) => void;
  view: 'grid' | 'list';
  isLocked?: boolean;
  unlockedDate?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (yokaiId: number) => void;
}

// Mapeo de colores por tribu para fondos
const tribeColors: Record<string, { bg: string, border: string, shadow: string }> = {
  'Charming': { bg: 'bg-pink-100/80', border: 'border-pink-400', shadow: 'shadow-pink-200' },
  'Mysterious': { bg: 'bg-yellow-100/80', border: 'border-yellow-400', shadow: 'shadow-yellow-200' },
  'Tough': { bg: 'bg-orange-100/80', border: 'border-orange-400', shadow: 'shadow-orange-200' },
  'Heartful': { bg: 'bg-green-100/80', border: 'border-green-400', shadow: 'shadow-green-200' },
  'Shady': { bg: 'bg-blue-900/80', border: 'border-blue-700', shadow: 'shadow-blue-800' },
  'Eerie': { bg: 'bg-purple-100/80', border: 'border-purple-400', shadow: 'shadow-purple-200' },
  'Slippery': { bg: 'bg-sky-100/80', border: 'border-sky-400', shadow: 'shadow-sky-200' },
  'Wicked': { bg: 'bg-gray-600/80', border: 'border-gray-700', shadow: 'shadow-gray-700' },
  'Boss': { bg: 'bg-purple-900/80', border: 'border-purple-700', shadow: 'shadow-purple-800' },
  'Enma': { bg: 'bg-red-900/80', border: 'border-red-700', shadow: 'shadow-red-800' },
  'Brave': { bg: 'bg-red-100/80', border: 'border-red-400', shadow: 'shadow-red-200' },
  'Wandroid': { bg: 'bg-indigo-900/80', border: 'border-indigo-700', shadow: 'shadow-indigo-800' },
};

// Mapeo de colores por rango para estilos premium (fallback)
const rankColors: Record<string, { bg: string, border: string, shadow: string, text: string }> = {
  'E': { bg: 'bg-gray-50', border: 'border-gray-400', shadow: 'shadow-gray-200', text: 'text-gray-600' },
  'D': { bg: 'bg-sky-50', border: 'border-sky-400', shadow: 'shadow-sky-200', text: 'text-sky-700' },
  'C': { bg: 'bg-green-50', border: 'border-green-500', shadow: 'shadow-green-200', text: 'text-green-700' },
  'B': { bg: 'bg-orange-50', border: 'border-orange-500', shadow: 'shadow-orange-200', text: 'text-orange-800' },
  'A': { bg: 'bg-yellow-50', border: 'border-yellow-400', shadow: 'shadow-yellow-200', text: 'text-yellow-800' },
  'S': { bg: 'bg-blue-50', border: 'border-blue-800', shadow: 'shadow-blue-300', text: 'text-blue-900' },
  'SS': { bg: 'bg-purple-100', border: 'border-purple-600', shadow: 'shadow-purple-400', text: 'text-purple-900' },
  'SSS': { bg: 'bg-rose-100', border: 'border-rose-500', shadow: 'shadow-rose-300', text: 'text-rose-800' },
  'Z': { bg: 'bg-neutral-900', border: 'border-neutral-700', shadow: 'shadow-neutral-500', text: 'text-neutral-200' },
  'ZZ': { bg: 'bg-fuchsia-100', border: 'border-fuchsia-600', shadow: 'shadow-fuchsia-400', text: 'text-fuchsia-900' },
  'ZZZ': { bg: 'bg-violet-100', border: 'border-violet-600', shadow: 'shadow-violet-400', text: 'text-violet-900' },
};

const MedalliumCard: React.FC<MedalliumCardProps> = ({
  yokai,
  onClick,
  view = 'grid',
  isLocked = false,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { t, getYokaiName } = useLanguage();
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = () => {
    if (!isLocked) {
      onClick(yokai);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite && !isLocked) {
      onToggleFavorite(yokai.id);
    }
  };

  const imageUrl = yokai.imageurl || yokai.image || '/images/yokai-placeholder.png';

  // Obtener estilos según la tribu (prioridad) o rango (fallback)
  const tribeStyle = !isLocked && yokai.tribe && tribeColors[yokai.tribe]
    ? tribeColors[yokai.tribe]
    : null;

  const rankStyle = !isLocked && yokai.rank && rankColors[yokai.rank]
    ? rankColors[yokai.rank]
    : { bg: 'bg-gray-50', border: 'border-gray-200', shadow: 'shadow-gray-200', text: 'text-gray-600' };

  // Usar tribu si existe, sino usar rango
  const cardStyle = tribeStyle || rankStyle;

  // Combinar: fondo de tribu, borde de rango
  const cardBg = tribeStyle?.bg || rankStyle.bg;
  const cardBorder = rankStyle.border;
  const cardShadow = rankStyle.shadow;

  // Efecto de brillo para rangos altos
  const isHighRank = ['S', 'SS', 'SSS', 'Z', 'ZZ', 'ZZZ'].includes(yokai.rank || '');

  // Abreviar nombre del juego
  const getGameAbbreviation = (gameName: string): string => {
    const abbreviations: Record<string, string> = {
      'Yo-kai Watch 1': 'YW1',
      'Yo-kai Watch 2': 'YW2',
      'Yo-kai Watch 3': 'YW3',
      'Yo-kai Watch 4': 'YW4',
      'Yo-kai Watch Blasters': 'YWB',
      'Yo-kai Watch Busters 2': 'YWB2',
      'Yo-kai Watch Sangokushi': 'YWS'
    };
    return abbreviations[gameName] || gameName.substring(0, 3).toUpperCase();
  };

  return (
    <motion.div
      className={`medallium-card relative group ${view === 'grid'
        ? 'w-full h-full flex flex-col'
        : 'flex items-center p-3 gap-4'
        } ${isLocked
          ? 'bg-gray-100 opacity-80 border-2 border-dashed border-gray-300'
          : `${cardBg} border-2 ${cardBorder} ${cardShadow}`
        } rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:z-10`}
      whileHover={!isLocked ? {
        y: -4,
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Fondo decorativo para rangos altos */}
      {!isLocked && isHighRank && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none animate-shimmer" />
      )}

      {/* Botón de favorito */}
      {!isLocked && onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full z-20 transition-all duration-200 ${isFavorite
            ? 'bg-white text-red-500 shadow-sm'
            : 'bg-black/5 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-400'
            }`}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Imagen del Yokai */}
      <div className={`relative ${view === 'grid' ? 'w-full aspect-square' : 'w-24 h-24 flex-shrink-0'} flex items-center justify-center overflow-hidden ${isLocked ? 'grayscale' : ''}`}>
        {isLocked ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-6xl text-gray-400">?</span>
          </div>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={getYokaiName(yokai)}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />

            {/* Icono de rango (superpuesto) */}
            {yokai.rank && rankIcons[yokai.rank] && (
              <div className="absolute bottom-1 left-1 w-7 h-7 bg-white/90 rounded-full shadow-md flex items-center justify-center border border-black/10">
                <img src={rankIcons[yokai.rank]} alt={yokai.rank} className="w-5 h-5" />
              </div>
            )}

            {/* Icono de tribu (superpuesto) */}
            {yokai.tribe && tribeIcons[yokai.tribe] && (
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-white/90 rounded-full shadow-md flex items-center justify-center border border-black/10">
                <img src={tribeIcons[yokai.tribe]} alt={yokai.tribe} className="w-5 h-5" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Información del Yokai */}
      <div className={`flex flex-col ${view === 'grid' ? 'p-3 text-center items-center justify-between flex-grow' : 'justify-center py-1 flex-grow'}`}>
        <div className="w-full">
          <h3 className={`font-bold leading-tight ${view === 'grid' ? 'text-sm line-clamp-2 min-h-[2.5em] flex items-center justify-center' : 'text-lg'
            } ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
            {isLocked ? '???' : getYokaiName(yokai)}
          </h3>

          {!isLocked && (
            <div className={`flex items-center gap-2 mt-2 ${view === 'grid' ? 'justify-center' : 'justify-start'}`}>
              {/* Elemento (si existe) */}
              {yokai.element && elementIcons[yokai.element] && (
                <div className="w-5 h-5 flex items-center justify-center bg-white/60 rounded-full shadow-sm" title={yokai.element}>
                  <img src={elementIcons[yokai.element]} alt={yokai.element} className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Juego */}
              {yokai.game && gameLogos[yokai.game] && (
                <div className="flex items-center justify-center bg-white/60 rounded-full px-2 py-0.5 shadow-sm border border-black/5" title={yokai.game}>
                  <img src={gameLogos[yokai.game]} alt={yokai.game} className="w-3.5 h-3.5 mr-1" />
                  <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{getGameAbbreviation(yokai.game)}</span>
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </motion.div>
  );
};

export default MedalliumCard;