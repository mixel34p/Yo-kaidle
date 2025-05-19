import React from 'react';
import YokaiRow from './YokaiRow';
import { Yokai } from '@/types/yokai';

interface YokaiGridProps {
  guesses: any[]; // Array de objetos con el Yo-kai adivinado y su resultado
  maxGuesses: number;
  foodIconTimestamp?: number; // Timestamp para forzar recarga de iconos de comida
}

const YokaiGrid: React.FC<YokaiGridProps> = ({ guesses, maxGuesses, foodIconTimestamp = Date.now() }) => {
  return (
    <div className="yokai-grid">
      <div className="yokai-row font-bold mb-2 text-sm">
        <div className="yokai-cell bg-secondary text-white shadow-lg transform hover:scale-105 transition-transform">Yo-kai</div>
        <div className="yokai-cell bg-secondary text-white shadow-lg transform hover:scale-105 transition-transform">Tribu</div>
        <div className="yokai-cell bg-secondary text-white shadow-lg transform hover:scale-105 transition-transform">Rango</div>
        <div className="yokai-cell bg-secondary text-white shadow-lg transform hover:scale-105 transition-transform">Elemento</div>
        <div className="yokai-cell bg-secondary text-white shadow-lg transform hover:scale-105 transition-transform">Comida</div>
        <div className="yokai-cell bg-secondary text-white shadow-lg transform hover:scale-105 transition-transform">Juego</div>
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
