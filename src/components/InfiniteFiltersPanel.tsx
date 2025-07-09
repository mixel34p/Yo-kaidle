'use client';

import React, { useState } from 'react';
import { InfiniteFilters } from '@/utils/gameSourcePreferences';
import { Tribe, Rank, Element, tribeTranslations, rankColors, elementTranslations } from '@/types/yokai';

interface InfiniteFiltersPanelProps {
  filters: InfiniteFilters;
  onFiltersChange: (filters: InfiniteFilters) => void;
}

const InfiniteFiltersPanel: React.FC<InfiniteFiltersPanelProps> = ({
  filters,
  onFiltersChange
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'difficulty'>('basic');

  const allTribes: Tribe[] = ['Charming', 'Mysterious', 'Tough', 'Heartful', 'Shady', 'Eerie', 'Slippery', 'Wicked', 'Boss', 'Enma', 'Brave', 'Wandroid'];
  const allRanks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const allElements: Element[] = ['Fire', 'Water', 'Lightning', 'Earth', 'Wind', 'Ice', 'Drain', 'Restoration', 'None'];

  const updateFilters = (updates: Partial<InfiniteFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="infinite-filters-panel bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Filtros Avanzados</h3>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'basic', label: 'Básico', icon: '⚙️' },
          { id: 'advanced', label: 'Avanzado', icon: '🔧' },
          { id: 'difficulty', label: 'Dificultad', icon: '🎚️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          {/* Excluir recientes */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Evitar repeticiones</p>
              <p className="text-sm text-gray-600">No repetir yokais jugados recientemente</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.excludeRecent}
                onChange={(e) => updateFilters({ excludeRecent: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Cantidad de recientes a excluir */}
          {filters.excludeRecent && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excluir últimos {filters.recentCount} yokais
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={filters.recentCount}
                onChange={(e) => updateFilters({ recentCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>30</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          {/* Filtro por tribus */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🏛️ Tribus</h4>
            <div className="grid grid-cols-3 gap-2">
              {allTribes.map(tribe => (
                <button
                  key={tribe}
                  onClick={() => updateFilters({ tribes: toggleArrayItem(filters.tribes, tribe) })}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    filters.tribes.includes(tribe)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tribeTranslations[tribe]}
                </button>
              ))}
            </div>
            {filters.tribes.length > 0 && (
              <button
                onClick={() => updateFilters({ tribes: [] })}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Limpiar selección
              </button>
            )}
          </div>

          {/* Filtro por rangos */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">⭐ Rangos</h4>
            <div className="grid grid-cols-4 gap-2">
              {allRanks.map(rank => (
                <button
                  key={rank}
                  onClick={() => updateFilters({ ranks: toggleArrayItem(filters.ranks, rank) })}
                  className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                    filters.ranks.includes(rank)
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filters.ranks.includes(rank) ? { backgroundColor: rankColors[rank] } : {}}
                >
                  {rank}
                </button>
              ))}
            </div>
            {filters.ranks.length > 0 && (
              <button
                onClick={() => updateFilters({ ranks: [] })}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Limpiar selección
              </button>
            )}
          </div>

          {/* Filtro por elementos */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🔥 Elementos</h4>
            <div className="grid grid-cols-3 gap-2">
              {allElements.map(element => (
                <button
                  key={element}
                  onClick={() => updateFilters({ elements: toggleArrayItem(filters.elements, element) })}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    filters.elements.includes(element)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {elementTranslations[element]}
                </button>
              ))}
            </div>
            {filters.elements.length > 0 && (
              <button
                onClick={() => updateFilters({ elements: [] })}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Limpiar selección
              </button>
            )}
          </div>
        </div>
      )}

      {/* Difficulty Tab */}
      {activeTab === 'difficulty' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">🎚️ Nivel de Dificultad</h4>
            <div className="space-y-2">
              {[
                { value: 'mixed', label: 'Mixto', desc: 'Todos los niveles', icon: '🎲' },
                { value: 'easy', label: 'Fácil', desc: 'Rangos bajos, sin Boss', icon: '🟢' },
                { value: 'medium', label: 'Medio', desc: 'Rangos medios', icon: '🟡' },
                { value: 'hard', label: 'Difícil', desc: 'Rangos altos, Boss', icon: '🔴' }
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    filters.difficultyMode === option.value
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={option.value}
                    checked={filters.difficultyMode === option.value}
                    onChange={(e) => updateFilters({ difficultyMode: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => onFiltersChange({
            games: filters.games, // Mantener selección de juegos
            excludeBossTribes: filters.excludeBossTribes, // Mantener configuración de Boss
            tribes: [],
            ranks: [],
            elements: [],
            difficultyMode: 'mixed',
            excludeRecent: false,
            recentCount: 10
          })}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          🔄 Resetear filtros avanzados
        </button>
      </div>
    </div>
  );
};

export default InfiniteFiltersPanel;
