'use client';

import React from 'react';
import { Yokai, tribeIcons, gameLogos } from '@/types/yokai';

interface MedalliumCardProps {
  yokai: Yokai;
  onClick?: (yokai: Yokai) => void;
}

const MedalliumCard: React.FC<MedalliumCardProps> = ({ yokai, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(yokai);
    }
  };

  // Asegurar que tenemos una URL de imagen
  const imageUrl = yokai.imageurl || yokai.image_url || yokai.img || yokai.image || '/images/yokai-placeholder.png';
  
  return (
    <div 
      className="medallium-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:rotate-1"
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative">
        {/* Fondo para la imagen con un patrón sutil */}
        <div className="relative h-32 overflow-hidden" 
          style={{ 
            background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(240,249,255,1) 100%)`,
            backgroundSize: '8px 8px'
          }}>
          <img 
            src={imageUrl} 
            alt={yokai.name}
            className="w-full h-full object-contain p-1 drop-shadow-md"
            onError={(e) => {
              // Fallback a imagen por defecto si hay error
              e.currentTarget.src = '/images/yokai-placeholder.png';
            }}
          />
        </div>
        
        {/* Icono de tribu con efecto visual mejorado */}
        <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-md transform hover:scale-110 transition-transform">
          <img 
            src={tribeIcons[yokai.tribe]} 
            alt={yokai.tribe} 
            className="w-6 h-6"
            title={yokai.tribe}
          />
        </div>
        
        {/* Icono de juego con efecto visual mejorado */}
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md transform hover:scale-110 transition-transform">
          <img 
            src={gameLogos[yokai.game]} 
            alt={yokai.game} 
            className="w-6 h-6"
            title={yokai.game}
          />
        </div>
        
        {/* Gradiente más suave y etiqueta más bonita */}
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-blue-900 via-blue-900/80 to-transparent w-full p-2 pt-8">
          <div className="flex items-center">
            <span className="text-xs font-bold text-white bg-blue-600 rounded-md px-1.5 py-0.5 mr-1.5 shadow-inner">
              #{yokai.medalNumber}
            </span>
            <h3 className="text-sm font-bold text-white truncate drop-shadow-sm">
              {yokai.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedalliumCard;
