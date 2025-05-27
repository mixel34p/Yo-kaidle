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
      className="medallium-card bg-white rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-xl"
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative">
        <div className="relative h-32 overflow-hidden bg-gradient-to-b from-blue-100 to-white">
          <img 
            src={imageUrl} 
            alt={yokai.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback a imagen por defecto si hay error
              e.currentTarget.src = '/images/yokai-placeholder.png';
            }}
          />
        </div>
        
        <div className="absolute top-1 left-1 bg-white bg-opacity-80 rounded-full p-1 shadow">
          <img 
            src={tribeIcons[yokai.tribe]} 
            alt={yokai.tribe} 
            className="w-6 h-6"
            title={yokai.tribe}
          />
        </div>
        
        <div className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow">
          <img 
            src={gameLogos[yokai.game]} 
            alt={yokai.game} 
            className="w-6 h-6"
            title={yokai.game}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full p-2 pt-6">
          <div className="flex items-center">
            <span className="text-xs font-bold text-white bg-gray-800 rounded px-1 mr-1">
              #{yokai.medalNumber}
            </span>
            <h3 className="text-sm font-bold text-white truncate">
              {yokai.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedalliumCard;
