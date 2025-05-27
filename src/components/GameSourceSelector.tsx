'use client';

import React, { useEffect, useState } from 'react';
import { Game, gameLogos } from '@/types/yokai';

interface GameSourceSelectorProps {
  onSourcesChange: (selectedSources: Game[]) => void;
  availableGames: Game[];
  initialSelectedGames?: Game[];
}

const GameSourceSelector: React.FC<GameSourceSelectorProps> = ({
  onSourcesChange,
  availableGames,
  initialSelectedGames = []
}) => {
  const [selectedGames, setSelectedGames] = useState<Game[]>(initialSelectedGames);

  useEffect(() => {
    // Si no hay juegos seleccionados inicialmente, seleccionar todos por defecto
    if (initialSelectedGames.length === 0 && availableGames.length > 0) {
      setSelectedGames([...availableGames]);
    }
  }, [availableGames, initialSelectedGames]);

  const handleToggleGame = (game: Game) => {
    // Si es el único juego seleccionado, no permitir deseleccionarlo
    if (selectedGames.length === 1 && selectedGames.includes(game)) {
      return;
    }

    const updatedGames = selectedGames.includes(game)
      ? selectedGames.filter(g => g !== game)
      : [...selectedGames, game];
    
    setSelectedGames(updatedGames);
    onSourcesChange(updatedGames);
  };

  const selectAll = () => {
    setSelectedGames([...availableGames]);
    onSourcesChange([...availableGames]);
  };

  const deselectAll = () => {
    // Mantener al menos un juego seleccionado
    if (availableGames.length > 0) {
      const firstGame = [availableGames[0]];
      setSelectedGames(firstGame);
      onSourcesChange(firstGame);
    }
  };

  return (
    <div className="game-source-selector p-3 rounded-lg shadow-lg" 
         style={{ background: 'rgba(15, 82, 152, 0.1)', backdropFilter: 'blur(4px)' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-primary-600">Seleccionar juegos</h3>
        <div className="flex space-x-2">
          <button 
            onClick={selectAll}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Todos
          </button>
          <button 
            onClick={deselectAll}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            disabled={selectedGames.length <= 1}
          >
            Ninguno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableGames.map((game) => (
          <button
            key={game}
            onClick={() => handleToggleGame(game)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ${
              selectedGames.includes(game)
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
            title={game}
          >
            {/* Icono del juego */}
            <div className="w-12 h-12 mb-2 rounded-full bg-white p-1 shadow-inner overflow-hidden flex items-center justify-center">
              <img 
                src={gameLogos[game]} 
                alt={game} 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/games/placeholder.png';
                }}
              />
            </div>
            
            {/* Indicador de selección */}
            {selectedGames.includes(game) && (
              <div className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {/* Nombre del juego (truncado y pequeño) */}
            <span className="text-xs font-medium text-center truncate w-full">
              {game.replace('Yo-kai Watch ', 'YW')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSourceSelector;
