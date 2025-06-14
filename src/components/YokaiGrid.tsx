import React from 'react';
import YokaiRow from './YokaiRow';
import { Yokai } from '@/types/yokai';

interface YokaiGridProps {
  guesses: any[]; // Array de objetos con el Yo-kai adivinado y su resultado
  maxGuesses: number;
  foodIconTimestamp?: number; // Timestamp para forzar recarga de iconos de comida
}

const YokaiGrid: React.FC<YokaiGridProps> = ({ guesses, maxGuesses, foodIconTimestamp = Date.now() }) => {  return (
    <div className="yokai-grid w-full overflow-x-auto">
      <div className="yokai-row font-bold mb-2 text-sm whitespace-nowrap">
        <div className="yokai-cell bg-secondary text-white p-2">Yo-kai</div>
        <div className="yokai-cell bg-secondary text-white p-2">Tribu</div>
        <div className="yokai-cell bg-secondary text-white p-2">Rango</div>
        <div className="yokai-cell bg-secondary text-white p-2">Elemento</div>
        <div className="yokai-cell bg-secondary text-white p-2">Comida</div>
        <div className="yokai-cell bg-secondary text-white p-2">Juego</div>
      </div>
      
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
        <div key={`empty-${index}`} className="yokai-row">
          {Array.from({ length: 6 }).map((_, cellIndex) => (
            <div key={`empty-cell-${cellIndex}`} className="yokai-cell"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default YokaiGrid;
