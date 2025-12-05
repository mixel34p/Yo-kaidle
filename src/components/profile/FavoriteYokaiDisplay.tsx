'use client';

import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { tribeIcons, rankIcons, type Tribe, type Rank } from '@/types/yokai';
import { useLanguage } from '@/contexts/LanguageContext';

interface YokaiDetails {
  id: string;
  name: string;
  image: string;
  tribe: string;
  rank: string;
}

interface FavoriteYokaiDisplayProps {
  yokai: YokaiDetails;
  compact?: boolean;
}

export default function FavoriteYokaiDisplay({ yokai, compact = false }: FavoriteYokaiDisplayProps) {
  const { getYokaiName } = useLanguage();

  // Crear un objeto Yokai temporal para la traducción
  const yokaiForTranslation = { name: yokai.name } as any;
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-3 border border-purple-500/40 shadow-lg backdrop-blur-sm">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-600/50 border-2 border-purple-400/60 shadow-md">
            <img
              src={yokai.image}
              alt={yokai.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Star size={10} className="text-yellow-900 fill-yellow-900" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-purple-200 text-sm font-semibold truncate">{getYokaiName(yokaiForTranslation)}</p>
          <p className="text-purple-300/70 text-xs">Yo-kai Favorito</p>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Icono de tribu */}
          <img
            src={tribeIcons[yokai.tribe as Tribe]}
            alt={yokai.tribe}
            className="w-3 h-3"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-2 h-2 rounded-full bg-purple-400';
              e.currentTarget.parentElement!.appendChild(fallback);
            }}
          />

          {/* Icono de rango */}
          <img
            src={rankIcons[yokai.rank as Rank]}
            alt={yokai.rank}
            className="w-3 h-3"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'text-yellow-300 text-xs font-bold';
              fallback.textContent = yokai.rank;
              e.currentTarget.parentElement!.appendChild(fallback);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-purple-900/30 rounded-xl p-4 border border-purple-500/30 overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5"></div>
      <div className="absolute top-2 right-2">
        <Sparkles size={16} className="text-purple-400 animate-pulse" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <h3 className="text-purple-300 font-semibold text-sm">Yo-kai Favorito</h3>
        </div>
        
        {/* Contenido principal */}
        <div className="flex items-center gap-4">
          {/* Imagen del Yo-kai */}
          <div className="relative">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-600/50 border-2 border-purple-400/50 shadow-lg">
              <img
                src={yokai.image}
                alt={yokai.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Brillo decorativo */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
            
            {/* Estrella decorativa */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Star size={12} className="text-yellow-900 fill-yellow-900" />
            </div>
          </div>
          
          {/* Información del Yo-kai */}
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg mb-1">{getYokaiName(yokaiForTranslation)}</h4>
            
            {/* Tribu y Rango */}
            <div className="flex items-center gap-3">
              {/* Tribu */}
              <div className="flex items-center gap-1 bg-purple-800/30 rounded-lg px-2 py-1">
                <img
                  src={tribeIcons[yokai.tribe as Tribe]}
                  alt={yokai.tribe}
                  className="w-4 h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-4 h-4 rounded-full bg-purple-500/50';
                    e.currentTarget.parentElement!.appendChild(fallback);
                  }}
                />
                <span className="text-purple-200 text-xs font-medium">{yokai.tribe}</span>
              </div>

              {/* Rango */}
              <div className="flex items-center gap-1 bg-yellow-800/30 rounded-lg px-2 py-1">
                <img
                  src={rankIcons[yokai.rank as Rank]}
                  alt={yokai.rank}
                  className="w-4 h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-4 h-4 text-yellow-200 text-xs font-bold flex items-center justify-center';
                    fallback.textContent = yokai.rank;
                    e.currentTarget.parentElement!.appendChild(fallback);
                  }}
                />
                <span className="text-yellow-200 text-xs font-medium">Rango {yokai.rank}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent animate-pulse pointer-events-none"></div>
    </div>
  );
}
