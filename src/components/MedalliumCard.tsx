'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Yokai, tribeIcons, elementIcons, rankIcons, foodIcons, gameLogos } from '@/types/yokai';
import { Info, Maximize2, Heart, Clock, Medal } from 'lucide-react';
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

const MedalliumCard: React.FC<MedalliumCardProps> = ({
  yokai,
  onClick,
  view = 'grid',
  isLocked = false,
  unlockedDate = '',
  isFavorite = false,
  onToggleFavorite
}) => {
  const { t, getYokaiName, getTribeTranslation, getElementTranslation } = useLanguage();
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
  
  // Asegurar que tenemos una URL de imagen
  const imageUrl = yokai.imageurl || yokai.image || '/images/yokai-placeholder.png';

  // Animaciones para las tarjetas
  const cardVariants = {
    hover: { 
      y: -5,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    tap: { scale: 0.98 }
  };
  
  return (
    <motion.div
      className={`medallium-card relative ${
        view === 'grid' 
          ? 'w-full rounded-lg overflow-hidden min-w-[140px]' 
          : 'flex items-center p-2 rounded-md'
      } ${
        isLocked 
          ? 'bg-gray-200 grayscale opacity-60' 
          : 'bg-gradient-to-br from-white to-gray-100 shadow-md'
      } transition-all duration-300`}
      whileHover={!isLocked ? "hover" : undefined}
      whileTap={!isLocked ? "tap" : undefined}
      variants={cardVariants}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Eliminamos el indicador de fecha de desbloqueo */}
      
      {/* Icono de favorito */}
      {!isLocked && onToggleFavorite && (
        <button 
          onClick={handleFavoriteClick}
          className={`absolute top-1 left-1 p-1 rounded-full z-10 transition-colors ${
            isFavorite 
              ? 'bg-red-100 text-red-500' 
              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-300'
          }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
      
      {/* Imagen y contenido principal */}
      <div className={view === 'grid' ? 'p-3 flex flex-col items-center' : 'flex items-center'}>
        {/* Imagen del Yo-kai */}
        <div className={`relative ${view === 'grid' ? 'w-24 h-24' : 'w-16 h-16'} flex-shrink-0`}>
          {isLocked ? (
            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-xs">???</span>
            </div>
          ) : (
            <img 
              src={imageUrl} 
              alt={getYokaiName(yokai)}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/yokai-placeholder.png';
              }}
            />
          )}
          
          {/* Medalla numerada */}
          {!isLocked && (
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {yokai.medalNumber}
            </div>
          )}
        </div>
        
        {/* Información del Yo-kai */}
        <div className={view === 'grid' ? 'mt-3 text-center w-full' : 'ml-3 flex-grow'}>
          <h3 className={`font-bold ${view === 'grid' ? 'text-md' : 'text-lg'} truncate`}>
            {isLocked ? '???' : getYokaiName(yokai)}
          </h3>
          
          {/* Atributos visibles */}
          {!isLocked && (
            <div className={`flex ${view === 'grid' ? 'justify-center' : ''} items-center space-x-2 mt-1`}>
              <img src={tribeIcons[yokai.tribe]} alt={yokai.tribe} className="w-5 h-5" title={yokai.tribe} />
              <img src={elementIcons[yokai.element]} alt={yokai.element} className="w-5 h-5" title={yokai.element} />
              <img src={rankIcons[yokai.rank]} alt={yokai.rank} className="w-5 h-5" title={yokai.rank} />
              {view === 'list' && yokai.game && (
                <div className="ml-1 flex-shrink-0">
                  {/* Intentamos encontrar el logo por el nombre exacto del juego */}
                  <img 
                    src={gameLogos[yokai.game as keyof typeof gameLogos] || ''}
                    alt={yokai.game} 
                    title={yokai.game}
                    className="w-10 h-5 object-contain" 
                    onError={(e) => {
                      // Si falla la carga de la imagen, mostrar el texto abreviado
                      const target = e.currentTarget.parentElement;
                      if (target) {
                        // Convertir 'Yo-kai Watch X' a 'YWX'
                        const shortName = yokai.game
                          .replace(/Yo-kai Watch/i, 'YW')
                          .replace(/Blasters/i, 'B')
                          .replace(/Busters/i, 'B')
                          .replace(/Sangokushi/i, 'S');
                        target.innerHTML = `<span class="text-xs text-gray-500">${shortName}</span>`;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Indicador para expandir vista detallada */}
      {!isLocked && (
        <div className={`expand-indicator ${
          view === 'grid' ? 'mt-1 text-center' : 'ml-auto'
        } opacity-60 hover:opacity-100`}>
          <Maximize2 size={16} className="text-blue-500" />
        </div>
      )}
      
      {/* Overlay de información en hover (solo en vista grid) */}
      {view === 'grid' && !isLocked && isHovering && (
        <motion.div 
          className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="flex justify-center space-x-3 mb-2">
              <img src={tribeIcons[yokai.tribe]} alt={yokai.tribe} className="w-6 h-6" />
              <img src={elementIcons[yokai.element]} alt={yokai.element} className="w-6 h-6" />
              <img src={rankIcons[yokai.rank]} alt={yokai.rank} className="w-6 h-6" />
            </div>
            <p className="text-xs opacity-80">{t.game}: {yokai.game.replace('Yo-kai Watch', 'YW')}</p>
            <p className="mt-1 text-xs font-semibold">{t.clickForDetails}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MedalliumCard;
