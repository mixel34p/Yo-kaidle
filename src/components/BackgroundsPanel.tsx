'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Image, Check, Lock } from 'lucide-react';
import {
  getUnlockedBackgrounds,
  getCurrentBackground,
  applyBackground,
  getBackgroundName,
  getBackgroundDescription,

  Background,
  BackgroundId
} from '@/utils/backgroundsManager';

interface BackgroundsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackgroundsPanel: React.FC<BackgroundsPanelProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [unlockedBackgrounds, setUnlockedBackgrounds] = useState<Background[]>([]);
  const [currentBackground, setCurrentBackground] = useState<Background | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundId | null>(null);

  // Cargar fondos desbloqueados y fondo actual
  useEffect(() => {
    if (isOpen) {
      const unlocked = getUnlockedBackgrounds();
      const current = getCurrentBackground();
      setUnlockedBackgrounds(unlocked);
      setCurrentBackground(current);
      setSelectedBackground(current.id);
    }
  }, [isOpen]);

  // Aplicar fondo seleccionado
  const handleApplyBackground = (backgroundId: BackgroundId) => {
    const success = applyBackground(backgroundId);
    if (success) {
      const newCurrentBackground = getCurrentBackground();
      setCurrentBackground(newCurrentBackground);
      setSelectedBackground(backgroundId);

      // Mostrar feedback en consola
      console.log(`🖼️ Fondo cambiado a: ${backgroundId}`);
    } else {
      console.error(`❌ Error al cambiar fondo a: ${backgroundId}`);
    }
  };

  // Refrescar fondos desbloqueados
  const refreshUnlockedBackgrounds = () => {
    const unlocked = getUnlockedBackgrounds();
    setUnlockedBackgrounds(unlocked);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <img
                    src="/icons/menu/backgrounds.png"
                    alt="Backgrounds"
                    className="w-6 h-6"
                  />
                  {language === 'es' ? 'Fondos' : language === 'en' ? 'Backgrounds' : 'Sfondi'}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Personaliza el fondo del juego'
                    : language === 'en'
                    ? 'Customize the game background'
                    : 'Personalizza lo sfondo del gioco'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Fondo Actual */}
          {currentBackground && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {language === 'es' ? 'Fondo Actual' : language === 'en' ? 'Current Background' : 'Sfondo Attuale'}
              </h3>
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <div
                    className="w-full h-full flex items-center justify-center text-lg relative"
                    style={{
                      backgroundImage: currentBackground.style.backgroundImage,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {!currentBackground.style.backgroundImage && (
                      <span className="text-lg">{currentBackground.icon}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {getBackgroundName(currentBackground, language)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getBackgroundDescription(currentBackground, language)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Check size={20} />
                  <span className="text-sm font-medium">
                    {language === 'es' ? 'Activo' : language === 'en' ? 'Active' : 'Attivo'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Fondos Desbloqueados */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {language === 'es' ? 'Fondos Disponibles' : language === 'en' ? 'Available Backgrounds' : 'Sfondi Disponibili'} 
              ({unlockedBackgrounds.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedBackgrounds.map((background) => {
                const isSelected = selectedBackground === background.id;
                const isCurrent = currentBackground?.id === background.id;
                
                return (
                  <motion.div
                    key={background.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedBackground(background.id)}
                  >
                    {/* Preview del fondo */}
                    <div className="mb-3">
                      <div
                        className="w-full h-24 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center text-2xl relative"
                        style={{
                          backgroundImage: background.style.backgroundImage,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        {!background.style.backgroundImage && (
                          <span className="text-2xl">{background.icon}</span>
                        )}
                      </div>
                    </div>

                    {/* Información del fondo */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {getBackgroundName(background, language)}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {getBackgroundDescription(background, language)}
                      </p>
                    </div>

                    {/* Estado y botón */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {background.unlockMethod === 'default' && (
                          <span>{language === 'es' ? 'Por defecto' : language === 'en' ? 'Default' : 'Predefinito'}</span>
                        )}
                        {background.unlockMethod === 'achievement' && (
                          <span>{language === 'es' ? 'Por logro' : language === 'en' ? 'From achievement' : 'Da obiettivo'}</span>
                        )}
                        {background.unlockMethod === 'circle' && (
                          <span>{language === 'es' ? 'Por círculo' : language === 'en' ? 'From circle' : 'Da cerchio'}</span>
                        )}
                        {background.unlockMethod === 'event' && (
                          <span>{language === 'es' ? 'Por evento' : language === 'en' ? 'From event' : 'Da evento'}</span>
                        )}
                        {background.unlockMethod === 'purchase' && (
                          <span>{language === 'es' ? 'Por compra' : language === 'en' ? 'Purchase' : 'Acquisto'}</span>
                        )}
                      </div>
                      
                      {isCurrent ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {language === 'es' ? 'Activo' : language === 'en' ? 'Active' : 'Attivo'}
                        </span>
                      ) : isSelected ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyBackground(background.id);
                          }}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full font-medium transition-colors"
                        >
                          {language === 'es' ? 'Aplicar' : language === 'en' ? 'Apply' : 'Applica'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {language === 'es' ? 'Seleccionar' : language === 'en' ? 'Select' : 'Seleziona'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mensaje si no hay fondos */}
            {unlockedBackgrounds.length === 0 && (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {language === 'es' 
                    ? 'No tienes fondos desbloqueados'
                    : language === 'en'
                    ? 'You have no unlocked backgrounds'
                    : 'Non hai sfondi sbloccati'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <img
                  src="/icons/menu/backgrounds.png"
                  alt="Backgrounds"
                  className="w-4 h-4"
                />
                {language === 'es'
                  ? 'Desbloquea más fondos completando logros y participando en eventos'
                  : language === 'en'
                  ? 'Unlock more backgrounds by completing achievements and participating in events'
                  : 'Sblocca più sfondi completando obiettivi e partecipando agli eventi'
                }
              </p>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BackgroundsPanel;
