import React from 'react';
import YokaiRow from './YokaiRow';
import { Yokai } from '@/types/yokai';
import { useLanguage } from '@/contexts/LanguageContext';

interface YokaiGridProps {
  guesses: any[]; // Array de objetos con el Yo-kai adivinado y su resultado
  maxGuesses: number;
  foodIconTimestamp?: number; // Timestamp para forzar recarga de iconos de comida
}

const YokaiGrid: React.FC<YokaiGridProps> = ({ guesses, maxGuesses, foodIconTimestamp = Date.now() }) => {
  const { t } = useLanguage();

  return (
    <div className="yokai-grid-container">
      <div className="yokai-grid">
        {/* Encabezados */}
        <div className="yokai-row header-row">
          <div className="yokai-cell header-cell">Yo-kai</div>
          <div className="yokai-cell header-cell">{t.tribe}</div>
          <div className="yokai-cell header-cell">{t.rank}</div>
          <div className="yokai-cell header-cell">{t.element}</div>
          <div className="yokai-cell header-cell">{t.food}</div>
          <div className="yokai-cell header-cell">{t.game}</div>
        </div>
        
        {/* Filas con adivinanzas */}
        {guesses.map((guess, index) => (
          <YokaiRow 
            key={index + '-' + guess.yokai.id + '-' + (guess.result?.favoriteFood || 'none') + '-' + foodIconTimestamp}
            yokai={guess.yokai} 
            result={guess.result} 
            guessIndex={index}
            foodIconTimestamp={foodIconTimestamp}
            isNewRow={index === guesses.length - 1} // Marcar la última fila como nueva para animación
          />
        ))}
        
        {/* Filas restantes vacías */}
        {Array.from({ length: maxGuesses - guesses.length }).map((_, index) => (
          <div key={`empty-${index}`} className="yokai-row empty-row">
            {Array.from({ length: 6 }).map((_, cellIndex) => (
              <div key={`empty-cell-${cellIndex}`} className="yokai-cell empty-cell"></div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Indicador de scroll solo en móvil */}
      <div className="scroll-hint sm:hidden">
        <div className="scroll-arrow">←</div>
        <span className="scroll-text">{t.swipeToSeeMore}</span>
        <div className="scroll-arrow">→</div>
      </div>
    </div>
  );
};

export default YokaiGrid;