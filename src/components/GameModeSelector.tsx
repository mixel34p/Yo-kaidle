'use client';

import React from 'react';
import Link from 'next/link';
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
            <img 
              src="/icons/game-modes/daily-mode.png" 
              alt="Modo diario" 
              className="w-6 h-6 mr-2 object-contain" 
              onError={(e) => {
                // Fallback al icono SVG si la imagen no se encuentra
                e.currentTarget.style.display = 'none';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'w-5 h-5 mr-2');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('viewBox', '0 0 24 24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('strokeLinecap', 'round');
                path.setAttribute('strokeLinejoin', 'round');
                path.setAttribute('strokeWidth', '2');
                path.setAttribute('d', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z');
                svg.appendChild(path);
                e.currentTarget.parentElement!.insertBefore(svg, e.currentTarget.parentElement!.firstChild);
              }}
            />
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
            <img 
              src="/icons/game-modes/infinite-mode.png" 
              alt="Modo infinito" 
              className="w-6 h-6 mr-2 object-contain" 
              onError={(e) => {
                // Fallback al icono SVG si la imagen no se encuentra
                e.currentTarget.style.display = 'none';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'w-5 h-5 mr-2');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('viewBox', '0 0 24 24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('strokeLinecap', 'round');
                path.setAttribute('strokeLinejoin', 'round');
                path.setAttribute('strokeWidth', '2');
                path.setAttribute('d', 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4');
                svg.appendChild(path);
                e.currentTarget.parentElement!.insertBefore(svg, e.currentTarget.parentElement!.firstChild);
              }}
            />
            <span>Infinito</span>
          </div>
        </button>
      </div>
      
      {/* Botón de modo duelo */}
      <Link href="/duelo" className="block mt-3">
        <button
          className="w-full py-2 px-4 rounded-lg transition-all duration-300 font-medium bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Modo Duelo
        </button>
      </Link>
    </div>
  );
};

export default GameModeSelector;