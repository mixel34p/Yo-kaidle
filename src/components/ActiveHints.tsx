'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHintsState } from '@/utils/hintsManager';
import { useLanguage } from '@/contexts/LanguageContext';
import { tribeIcons, elementIcons, rankIcons } from '@/types/yokai';

interface ActiveHintsProps {
  hintsState: GameHintsState;
}

const ActiveHints: React.FC<ActiveHintsProps> = ({ hintsState }) => {
  const { t, language } = useLanguage();

  // Obtener traducciones para las características reveladas
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



  const revealedHints = [];

  // Añadir pistas reveladas
  if (hintsState.revealedInfo.tribe) {
    revealedHints.push({
      type: 'tribe',
      icon: '👥',
      label: language === 'es' ? 'Tribu' : language === 'en' ? 'Tribe' : 'Tribù',
      value: getTribeTranslation(hintsState.revealedInfo.tribe)
    });
  }

  if (hintsState.revealedInfo.rank) {
    revealedHints.push({
      type: 'rank',
      icon: '⭐',
      label: language === 'es' ? 'Rango' : language === 'en' ? 'Rank' : 'Rango',
      value: hintsState.revealedInfo.rank
    });
  }

  if (hintsState.revealedInfo.element) {
    revealedHints.push({
      type: 'element',
      icon: '🔥',
      label: language === 'es' ? 'Elemento' : language === 'en' ? 'Element' : 'Elemento',
      value: getElementTranslation(hintsState.revealedInfo.element)
    });
  }

  if (hintsState.extraAttempts > 0) {
    revealedHints.push({
      type: 'extra_attempts',
      icon: '➕',
      label: language === 'es' ? 'Intentos Extra' : language === 'en' ? 'Extra Attempts' : 'Tentativi Extra',
      value: `+${hintsState.extraAttempts}`
    });
  }

  if (revealedHints.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold text-gray-800">
            {language === 'es' ? 'Pistas Activas' : language === 'en' ? 'Active Hints' : 'Suggerimenti Attivi'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {revealedHints.map((hint, index) => (
              <motion.div
                key={hint.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-yellow-300 rounded-lg p-3 text-center shadow-sm"
              >
                <div className="text-2xl mb-2">{hint.icon}</div>
                <div className="text-xs text-gray-600 mb-1">{hint.label}</div>

                {/* Icono específico del valor revelado */}
                {hint.type === 'tribe' && hintsState.revealedInfo.tribe && (
                  <div className="mb-1">
                    <img
                      src={tribeIcons[hintsState.revealedInfo.tribe as keyof typeof tribeIcons]}
                      alt={hintsState.revealedInfo.tribe}
                      className="w-8 h-8 mx-auto"
                    />
                  </div>
                )}

                {hint.type === 'element' && hintsState.revealedInfo.element && (
                  <div className="mb-1">
                    <img
                      src={elementIcons[hintsState.revealedInfo.element as keyof typeof elementIcons]}
                      alt={hintsState.revealedInfo.element}
                      className="w-8 h-8 mx-auto"
                    />
                  </div>
                )}

                {hint.type === 'rank' && hintsState.revealedInfo.rank && (
                  <div className="mb-1">
                    <img
                      src={rankIcons[hintsState.revealedInfo.rank as keyof typeof rankIcons]}
                      alt={hintsState.revealedInfo.rank}
                      className="w-8 h-8 mx-auto"
                    />
                  </div>
                )}

                {/* Solo mostrar texto para tribu, elemento e intentos extra */}
                {hint.type !== 'rank' && (
                  <div className="font-bold text-gray-800">{hint.value}</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            <img
              src="/icons/menu/help.png"
              alt="Help"
              className="w-3 h-3"
            />
            {language === 'es'
              ? 'Usa estas pistas para encontrar el Yo-kai del día'
              : language === 'en'
              ? 'Use these hints to find the daily Yo-kai'
              : 'Usa questi suggerimenti per trovare lo Yo-kai del giorno'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActiveHints;
