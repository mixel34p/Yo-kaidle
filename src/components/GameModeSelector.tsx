'use client';

import React from 'react';
import { GameMode } from '@/types/yokai';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="game-mode-selector my-3">
      <div className="flex p-1 rounded-lg shadow-inner" style={{ background: 'rgba(15, 82, 152, 0.3)', backdropFilter: 'blur(4px)' }}>
        <button
          onClick={() => onModeChange('daily')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 font-medium ${
            currentMode === 'daily' 
              ? 'text-white shadow-md transform scale-105' 
              : 'text-white text-opacity-70 hover:bg-opacity-30 hover:bg-white'
          }`}
          style={currentMode === 'daily' ? { background: 'linear-gradient(135deg, var(--primary-color), #FF6384)' } : {}}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Diario</span>
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('infinite')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 font-medium ${
            currentMode === 'infinite' 
              ? 'text-white shadow-md transform scale-105' 
              : 'text-white text-opacity-70 hover:bg-opacity-30 hover:bg-white'
          }`}
          style={currentMode === 'infinite' ? { background: 'linear-gradient(135deg, var(--secondary-color), #1E75D3)' } : {}}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Infinito</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default GameModeSelector;
