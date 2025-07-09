'use client';

import React from 'react';
import { Yokai } from '@/types/yokai';

interface DifficultyIndicatorProps {
  yokai: Yokai;
  show: boolean;
}

// Determinar dificultad de un yokai (misma lógica que en supabase.ts)
function determineYokaiDifficulty(yokai: Yokai): 'easy' | 'medium' | 'hard' {
  let difficultyScore = 0;
  
  // Factores que aumentan dificultad
  if (yokai.rank === 'S' || yokai.rank === 'SS' || yokai.rank === 'SSS') difficultyScore += 2;
  if (yokai.tribe === 'Boss' || yokai.tribe === 'Enma') difficultyScore += 3;
  if (yokai.game === 'Yo-kai Watch 3' || yokai.game === 'Yo-kai Watch 4') difficultyScore += 1;
  if (yokai.weight > 50) difficultyScore += 1; // Yokais pesados pueden ser más difíciles
  
  if (difficultyScore >= 4) return 'hard';
  if (difficultyScore >= 2) return 'medium';
  return 'easy';
}

const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({ yokai, show }) => {
  if (!show) return null;

  const difficulty = determineYokaiDifficulty(yokai);
  
  const difficultyConfig = {
    easy: {
      label: 'Fácil',
      icon: '🟢',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    },
    medium: {
      label: 'Medio',
      icon: '🟡',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    hard: {
      label: 'Difícil',
      icon: '🔴',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    }
  };

  const config = difficultyConfig[difficulty];

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
      <span className="mr-1">{config.icon}</span>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export default DifficultyIndicator;
