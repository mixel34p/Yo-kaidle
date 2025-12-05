'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentPoints } from '@/utils/economyManager';
import { 
  AVAILABLE_HINTS, 
  GameHintsState, 
  HintType, 
  canUseHint, 
  getHintName, 
  getHintDescription,
  getHintById
} from '@/utils/hintsManager';
import { X, HelpCircle } from 'lucide-react';

interface HintsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentHintsState: GameHintsState;
  onUseHint: (hintType: HintType) => void;
  gameFinished: boolean;
}

const HintsPanel: React.FC<HintsPanelProps> = ({
  isOpen,
  onClose,
  currentHintsState,
  onUseHint,
  gameFinished
}) => {
  const { t, language } = useLanguage();
  const [currentPoints, setCurrentPoints] = useState<number>(0);

  // Funciones de traducción (copiadas de ActiveHints)
  const getTribeTranslation = (tribe: string) => {
    const tribeTranslations: Record<string, Record<string, string>> = {
      'Charming': { es: 'Guapo', en: 'Charming', it: 'Affascinante' },
      'Brave': { es: 'Valiente', en: 'Brave', it: 'Coraggioso' },
      'Mysterious': { es: 'Misterioso', en: 'Mysterious', it: 'Misterioso' },
      'Tough': { es: 'Robusto', en: 'Tough', it: 'Robusto' },
      'Heartful': { es: 'Amable', en: 'Heartful', it: 'Cordiale' },
      'Shady': { es: 'Oscuro', en: 'Shady', it: 'Ombroso' },
      'Eerie': { es: 'Siniestro', en: 'Eerie', it: 'Inquietante' },
      'Slippery': { es: 'Escurridizo', en: 'Slippery', it: 'Scivoloso' },
      'Wicked': { es: 'Maléfico', en: 'Wicked', it: 'Malvagio' }
    };
    return tribeTranslations[tribe]?.[language] || tribe;
  };

  const getElementTranslation = (element: string) => {
    const elementTranslations: Record<string, Record<string, string>> = {
      'Fire': { es: 'Fuego', en: 'Fire', it: 'Fuoco' },
      'Water': { es: 'Agua', en: 'Water', it: 'Acqua' },
      'Earth': { es: 'Tierra', en: 'Earth', it: 'Terra' },
      'Lightning': { es: 'Rayo', en: 'Lightning', it: 'Fulmine' },
      'Ice': { es: 'Hielo', en: 'Ice', it: 'Ghiaccio' },
      'Wind': { es: 'Viento', en: 'Wind', it: 'Vento' },
      'Restoration': { es: 'Restauración', en: 'Restoration', it: 'Restauro' },
      'Absorption': { es: 'Absorción', en: 'Absorption', it: 'Assorbimento' },
      'Drain': { es: 'Drenaje', en: 'Drain', it: 'Drenaggio' }
    };
    return elementTranslations[element]?.[language] || element;
  };

  // Cargar puntos actuales
  useEffect(() => {
    setCurrentPoints(getCurrentPoints());
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <img
                    src="/icons/menu/help.png"
                    alt="Help"
                    className="w-6 h-6"
                  />
                  {t.hints}
                </h2>
                <p className="text-sm text-gray-600">{t.usePointsToGetHints}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>



          {/* Lista de ayudas */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {AVAILABLE_HINTS.map((hint) => {
                const canUse = canUseHint(hint.id, currentHintsState);
                const isUsed = hint.maxUses && currentHintsState.usedHints[hint.id] >= hint.maxUses;
                const isRevealed = (
                  (hint.id === 'tribe' && currentHintsState.revealedInfo.tribe) ||
                  (hint.id === 'rank' && currentHintsState.revealedInfo.rank) ||
                  (hint.id === 'element' && currentHintsState.revealedInfo.element)
                );

                return (
                  <motion.div
                    key={hint.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 transition-all ${
                      canUse.canUse && !gameFinished
                        ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-center mb-3">
                          <div className="text-3xl mb-2">{hint.icon}</div>
                          <h3 className="font-semibold text-gray-800">
                            {getHintName(hint, language)}
                          </h3>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            {getHintDescription(hint, language)}
                          </p>
                          {hint.maxUses && (
                            <p className="text-xs text-gray-500">
                              {t.used}: {currentHintsState.usedHints[hint.id]}/{hint.maxUses}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3 ml-4">
                        {/* Costo */}
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          <img
                            src="/icons/points-icon.png"
                            alt="Puntos"
                            className="w-4 h-4"
                          />
                          {hint.cost}
                        </div>

                        {/* Botón o estado */}
                        {gameFinished ? (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                            {language === 'es' ? 'Juego terminado' : language === 'en' ? 'Game finished' : 'Gioco finito'}
                          </span>
                        ) : isRevealed ? (
                          <span className="px-3 py-1 bg-green-200 text-green-700 text-xs rounded-full">
                            ✅ {language === 'es' ? 'Revelado' : language === 'en' ? 'Revealed' : 'Rivelato'}
                          </span>
                        ) : isUsed ? (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                            {language === 'es' ? 'Agotado' : language === 'en' ? 'Exhausted' : 'Esaurito'}
                          </span>
                        ) : canUse.canUse ? (
                          <button
                            onClick={() => onUseHint(hint.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
                          >
                            {language === 'es' ? 'Usar' : language === 'en' ? 'Use' : 'Usa'}
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-red-200 text-red-700 text-xs rounded-full">
                            {canUse.reason === 'Puntos insuficientes' ? t.insufficientPoints : canUse.reason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información revelada */}
                    {isRevealed && (
                      <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-700 font-medium">
                            {language === 'es' ? 'Revelado:' : language === 'en' ? 'Revealed:' : 'Rivelato:'}
                          </span>
                          <span className="text-green-800 font-bold">
                            {hint.id === 'tribe' && currentHintsState.revealedInfo.tribe &&
                              getTribeTranslation(currentHintsState.revealedInfo.tribe)}
                            {hint.id === 'rank' && currentHintsState.revealedInfo.rank}
                            {hint.id === 'element' && currentHintsState.revealedInfo.element &&
                              getElementTranslation(currentHintsState.revealedInfo.element)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Intentos extra añadidos */}
                    {hint.id === 'extra_attempt' && currentHintsState.extraAttempts > 0 && (
                      <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-700 font-medium">
                            {language === 'es' ? 'Intentos extra:' : language === 'en' ? 'Extra attempts:' : 'Tentativi extra:'}
                          </span>
                          <span className="text-yellow-800 font-bold">
                            +{currentHintsState.extraAttempts}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <img
                  src="/icons/menu/help.png"
                  alt="Help"
                  className="w-4 h-4"
                />
                {language === 'es'
                  ? 'Las ayudas se reinician cada día con un nuevo Yo-kai'
                  : language === 'en'
                  ? 'Hints reset every day with a new Yo-kai'
                  : 'I suggerimenti si resettano ogni giorno con un nuevo Yo-kai'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HintsPanel;
