'use client';

import React from 'react';
import { elementColors, elementIcons } from '@/types/yokai';

type CellStatus = 'correct' | 'partial' | 'incorrect' | 'default' | 'higher' | 'lower';

interface YokaiCellProps {
  value: string | number;
  status: CellStatus;
  hint?: string;
  iconUrl?: string;
  isTribe?: boolean;
  isGame?: boolean;
  elementColor?: string;
  isRank?: boolean;
  isFood?: boolean;
  isYokai?: boolean;
  guessIndex?: number;
}

const YokaiCell: React.FC<YokaiCellProps> = ({ 
  value, 
  status, 
  hint, 
  iconUrl, 
  isTribe = false,
  isGame = false,
  isRank = false,
  isFood = false,
  isYokai = false,
  elementColor,
  guessIndex
}) => {
  // Imprimir en consola para depuración
  // Imprimir información relevante para depuración
  console.log(`Rendering YokaiCell: value=${value}, showImage=${Boolean(iconUrl)}, isTribe=${isTribe}, isGame=${isGame}, isRank=${isRank}, isFood=${isFood}, isYokai=${isYokai}`);
  const cellClasses = {
    default: 'yokai-cell',
    correct: 'yokai-cell yokai-cell-correct',
    partial: 'yokai-cell yokai-cell-partial',
    incorrect: 'yokai-cell yokai-cell-incorrect',
    higher: 'yokai-cell yokai-cell-partial',
    lower: 'yokai-cell yokai-cell-partial',
  };

  // Determinar si debemos mostrar imagen o texto
  const showImage = iconUrl && iconUrl.length > 0;
  
  // Obtener elemento basado en el valor (si es aplicable)
  const renderElementIcon = () => {
    if (!elementColor || !value) return null;
    
    // Detectar si value es un elemento y obtener su icono
    const elementName = String(value);
    const elementIcon = elementIcons[elementName as keyof typeof elementIcons];
    
    if (!elementIcon) return null;
    
    return (
      <div className="absolute -top-1 -right-1 z-10 w-6 h-6 bg-white rounded-full border-2 border-white shadow-md flex items-center justify-center">
        <img 
          src={elementIcon}
          alt={elementName}
          className="w-5 h-5 object-contain"
        />
      </div>
    );
  };

  return (
    <div 
      className={`${cellClasses[status]} flex items-center justify-center relative`} 
      title={hint || String(value)}
    >
      {renderElementIcon()}
      {showImage ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {isRank && hint && ['higher', 'lower'].includes(hint) && (
            <div className="absolute top-0 right-0 z-10">
              <span className="text-xs font-bold bg-black text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-white">
                {hint === 'higher' ? '↑' : '↓'}
              </span>
            </div>
          )}
          {isTribe ? (
            <img 
              src={iconUrl} 
              alt={`${value} icon`}
              width={32}
              height={32} 
              className="object-contain"
              style={{ width: '32px', height: '32px' }}
            />
          ) : isGame ? (
            <img 
              src={iconUrl} 
              alt={`${value} icon`}
              width={48}
              height={48} 
              className="object-contain"
              style={{ width: '48px', height: '48px' }}
            />
          ) : isRank ? (
            value === 'E' ? (
              <img 
                src="/images/ranks/rank-e.png"
                alt="Rango E"
                width={32}
                height={32} 
                className="object-contain"
                style={{ width: '32px', height: '32px' }}
              />
            ) : (
              <img 
                src={iconUrl} 
                alt={`${value} icon`}
                width={32}
                height={32} 
                className="object-contain"
                style={{ width: '32px', height: '32px' }}
              />
            )
          ) : isFood ? (
            // Para iconos de comida, forzar recarga siempre con timestamp y key única
            <img 
              src={iconUrl ? `${iconUrl}?t=${Date.now()}` : ''}
              alt={`${value} icon`}
              width={32}
              height={32} 
              className="object-contain"
              style={{ width: '32px', height: '32px' }}
              key={`food-${value}-${Date.now()}`}
            />
          ) : isYokai ? (
            // Para mostrar imágenes de Yokai directamente desde Supabase
            <img 
              src={iconUrl} 
              alt={`${value}`}
              width={40}
              height={40} 
              className="object-contain"
              style={{ width: '40px', height: '40px' }}
            />
          ) : (
            // Fallback para otros tipos de iconos
            <img 
              src={iconUrl} 
              alt={`${value}`}
              width={32}
              height={32} 
              className="object-contain"
              style={{ width: '32px', height: '32px' }}
            />
          )}
        </div>
      ) : (
        <div className="flex items-center">
          <div className="truncate max-w-full">
            {value}
          </div>
          {hint && ['higher', 'lower'].includes(hint) && (
            <span className="ml-1 flex-shrink-0 font-bold text-black bg-yellow-300 px-1 rounded">
              {hint === 'higher' ? '↑' : '↓'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default YokaiCell;
