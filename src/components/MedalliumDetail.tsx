'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Yokai, tribeIcons, elementIcons, rankIcons, foodIcons, tribeTranslations, elementTranslations, foodTranslations } from '@/types/yokai';
import { X, Heart, Star, Zap, Apple, User, Map, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MedalliumDetailProps {
  yokai: Yokai;
  onClose: () => void;
  unlockedDate?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (yokaiId: number) => void;
}

const MedalliumDetail: React.FC<MedalliumDetailProps> = ({
  yokai,
  onClose,
  unlockedDate,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { t, getYokaiName, getTribeTranslation, getElementTranslation, getFoodTranslation } = useLanguage();

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite(yokai.id);
    }
  };

  // Asegurar que tenemos una URL de imagen
  const imageUrl = yokai.imageurl || yokai.image_url || yokai.img || yokai.image || '/images/yokai-placeholder.png';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        className="medallium-detail bg-white rounded-lg overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Cabecera con imagen de fondo y nombre */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 bg-white bg-opacity-20 p-1 rounded-full hover:bg-opacity-40 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          
          {/* Botón de favorito */}
          {onToggleFavorite && (
            <button 
              onClick={handleFavoriteClick}
              className="absolute top-2 left-2 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-40 transition-colors"
            >
              <Heart 
                size={18} 
                className={isFavorite ? "text-red-500" : "text-white"} 
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          )}
          
          <div className="yokai-image-container h-32 w-32 z-10 relative">
            <img 
              src={imageUrl} 
              alt={getYokaiName(yokai)}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/yokai-placeholder.png';
              }}
            />
          </div>
          
          {/* Información básica superpuesta */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-4">
            <div className="flex items-center">
              <img src={rankIcons[yokai.rank]} alt={yokai.rank} className="w-8 h-8 mr-2" />
              <h2 className="text-2xl font-bold">{getYokaiName(yokai)}</h2>
            </div>
            <div className="flex items-center mt-1">
              <p className="text-sm opacity-80">{t.medalNumber} {yokai.medalNumber}</p>
              {unlockedDate && (
                <p className="ml-auto text-xs opacity-70">
                  {t.unlocked}: {unlockedDate}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Cuerpo con detalles - Solo información básica */}
        <div className="p-4 overflow-y-auto flex-grow">
          {/* Atributos principales en grid de 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tribu */}
            <div className="attribute-card bg-gray-100 p-4 rounded-lg flex items-center">
              <img src={tribeIcons[yokai.tribe]} alt={yokai.tribe} className="w-12 h-12 mr-3" />
              <div>
                <span className="text-xs text-gray-500">{t.tribe}</span>
                <p className="text-sm font-medium">
                  {getTribeTranslation(yokai.tribe)}
                </p>
              </div>
            </div>
            
            {/* Rango */}
            <div className="attribute-card bg-gray-100 p-4 rounded-lg flex items-center">
              <div className="w-12 h-12 flex items-center justify-center mr-3">
                <img src={rankIcons[yokai.rank]} alt={yokai.rank} className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs text-gray-500">{t.rank}</span>
                <p className="text-sm font-medium">{yokai.rank}</p>
              </div>
            </div>
            
            {/* Comida */}
            <div className="attribute-card bg-gray-100 p-4 rounded-lg flex items-center">
              <img src={foodIcons[yokai.favoriteFood]} alt={yokai.favoriteFood} className="w-12 h-12 mr-3" />
              <div>
                <span className="text-xs text-gray-500">{t.food}</span>
                <p className="text-sm font-medium">
                  {getFoodTranslation(yokai.favoriteFood)}
                </p>
              </div>
            </div>
            
            {/* Juego */}
            <div className="attribute-card bg-gray-100 p-4 rounded-lg flex items-center">
              <div className="w-12 h-12 flex items-center justify-center mr-3">
                <Map className="text-blue-600" size={24} />
              </div>
              <div>
                <span className="text-xs text-gray-500">{t.game}</span>
                <p className="text-sm font-medium">{yokai.game}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pie con acciones - Solo botón de cerrar */}
        <div className="p-3 border-t border-gray-200 flex justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MedalliumDetail;
