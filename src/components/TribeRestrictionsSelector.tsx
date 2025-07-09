'use client';

import React from 'react';
import { TribeRestrictions } from '@/utils/gameSourcePreferences';

interface TribeRestrictionsSelectorProps {
  restrictions: TribeRestrictions;
  onRestrictionsChange: (restrictions: TribeRestrictions) => void;
}

const TribeRestrictionsSelector: React.FC<TribeRestrictionsSelectorProps> = ({
  restrictions,
  onRestrictionsChange
}) => {
  const handleToggleExcludeBoss = () => {
    const newRestrictions = {
      ...restrictions,
      excludeBossTribes: !restrictions.excludeBossTribes
    };
    onRestrictionsChange(newRestrictions);
  };

  return (
    <div className="tribe-restrictions-selector p-3 rounded-lg shadow-lg mt-3" 
         style={{ background: 'rgba(15, 82, 152, 0.1)', backdropFilter: 'blur(4px)' }}>
      <h3 className="text-lg font-bold text-primary-600 mb-3">Restricciones de Tribus</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <img 
                src="/images/tribes/boss.png" 
                alt="Boss Tribe" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/tribes/placeholder.png';
                }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-800">Excluir Yokais Boss</p>
              <p className="text-sm text-gray-600">
                No incluir yokais de la tribu Boss en modo infinito
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={restrictions.excludeBossTribes}
              onChange={handleToggleExcludeBoss}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
          <strong>Nota:</strong> En el modo diario, los yokais Boss están siempre excluidos para mantener un nivel de dificultad equilibrado.
        </div>
      </div>
    </div>
  );
};

export default TribeRestrictionsSelector;
