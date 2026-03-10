// Sistema de ayudas para Yo-kaidle
// Permite a los jugadores gastar puntos para obtener pistas sobre el Yo-kai del día

import { spendPoints, getCurrentPoints } from './economyManager';
import { Yokai } from '@/types/yokai';

// Tipos de ayudas disponibles
export type HintType = 'tribe' | 'rank' | 'element' | 'extra_attempt';

// Interfaz para una ayuda
export interface Hint {
  id: HintType;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  cost: number; // Costo en puntos
  icon: string; // Emoji o icono
  maxUses?: number; // Máximo de usos por partida (undefined = ilimitado)
}

// Configuración de ayudas disponibles
export const AVAILABLE_HINTS: Hint[] = [
  {
    id: 'tribe',
    name_es: 'Pista de Tribu',
    name_en: 'Tribe Hint',
    name_it: 'Suggerimento Tribù',
    description_es: 'Revela la tribu del Yo-kai del día',
    description_en: 'Reveals the tribe of the daily Yo-kai',
    description_it: 'Rivela la tribù dello Yo-kai del giorno',
    cost: 30,
    icon: '👥',
    maxUses: 1
  },
  {
    id: 'rank',
    name_es: 'Pista de Rango',
    name_en: 'Rank Hint',
    name_it: 'Suggerimento Rango',
    description_es: 'Revela el rango del Yo-kai del día',
    description_en: 'Reveals the rank of the daily Yo-kai',
    description_it: 'Rivela il rango dello Yo-kai del giorno',
    cost: 40,
    icon: '⭐',
    maxUses: 1
  },
  {
    id: 'element',
    name_es: 'Pista de Elemento',
    name_en: 'Element Hint',
    name_it: 'Suggerimento Elemento',
    description_es: 'Revela el elemento del Yo-kai del día',
    description_en: 'Reveals the element of the daily Yo-kai',
    description_it: 'Rivela l\'elemento dello Yo-kai del giorno',
    cost: 35,
    icon: '🔥',
    maxUses: 1
  },
  {
    id: 'extra_attempt',
    name_es: 'Intento Extra',
    name_en: 'Extra Attempt',
    name_it: 'Tentativo Extra',
    description_es: 'Añade una fila más para adivinar',
    description_en: 'Adds one more row to guess',
    description_it: 'Aggiunge una riga in più per indovinare',
    cost: 100,
    icon: '➕',
    maxUses: 2
  }
];

// Estado de ayudas usadas en la partida actual
export interface GameHintsState {
  date: string; // Fecha de la partida (YYYY-MM-DD)
  usedHints: Record<HintType, number>; // Cantidad de veces que se usó cada ayuda
  revealedInfo: {
    tribe?: string;
    rank?: string;
    element?: string;
  };
  extraAttempts: number; // Intentos extra añadidos
}

const HINTS_KEY = 'yokaidle_hints_state';

// Cargar estado de ayudas para la fecha actual
export function loadHintsState(date: string): GameHintsState {
  try {
    const saved = localStorage.getItem(HINTS_KEY);
    if (saved) {
      const state: GameHintsState = JSON.parse(saved);
      if (state.date === date) {
        return state;
      }
    }
  } catch (error) {
    console.error('Error loading hints state:', error);
  }
  
  // Estado por defecto para nueva partida
  return {
    date,
    usedHints: {
      tribe: 0,
      rank: 0,
      element: 0,
      extra_attempt: 0
    },
    revealedInfo: {},
    extraAttempts: 0
  };
}

// Guardar estado de ayudas
export function saveHintsState(state: GameHintsState): void {
  try {
    localStorage.setItem(HINTS_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving hints state:', error);
  }
}

// Verificar si una ayuda puede ser usada
export function canUseHint(hintType: HintType, currentState: GameHintsState): {
  canUse: boolean;
  reason?: string;
} {
  const hint = AVAILABLE_HINTS.find(h => h.id === hintType);
  if (!hint) {
    return { canUse: false, reason: 'Ayuda no encontrada' };
  }

  // Verificar puntos suficientes
  if (getCurrentPoints() < hint.cost) {
    return { canUse: false, reason: 'Puntos insuficientes' };
  }

  // Verificar límite de usos
  if (hint.maxUses && currentState.usedHints[hintType] >= hint.maxUses) {
    return { canUse: false, reason: 'Límite de usos alcanzado' };
  }

  // Verificar si ya se reveló esta información
  if (hintType === 'tribe' && currentState.revealedInfo.tribe) {
    return { canUse: false, reason: 'Ya revelado' };
  }
  if (hintType === 'rank' && currentState.revealedInfo.rank) {
    return { canUse: false, reason: 'Ya revelado' };
  }
  if (hintType === 'element' && currentState.revealedInfo.element) {
    return { canUse: false, reason: 'Ya revelado' };
  }

  return { canUse: true };
}

// Usar una ayuda
export function applyHint(
  hintType: HintType, 
  targetYokai: Yokai, 
  currentState: GameHintsState
): {
  success: boolean;
  newState?: GameHintsState;
  revealedInfo?: string;
  error?: string;
} {
  const hint = AVAILABLE_HINTS.find(h => h.id === hintType);
  if (!hint) {
    return { success: false, error: 'Ayuda no encontrada' };
  }

  const canUse = canUseHint(hintType, currentState);
  if (!canUse.canUse) {
    return { success: false, error: canUse.reason };
  }

  // Intentar gastar puntos
  const economyResult = spendPoints(
    hint.cost,
    'hint',
    `Ayuda usada: ${hint.name_es}`
  );

  if (!economyResult) {
    return { success: false, error: 'No se pudieron gastar los puntos' };
  }

  // Crear nuevo estado
  const newState: GameHintsState = {
    ...currentState,
    usedHints: {
      ...currentState.usedHints,
      [hintType]: currentState.usedHints[hintType] + 1
    }
  };

  let revealedInfo = '';

  // Aplicar la ayuda específica
  switch (hintType) {
    case 'tribe':
      newState.revealedInfo.tribe = targetYokai.tribe;
      revealedInfo = targetYokai.tribe;
      break;
    case 'rank':
      newState.revealedInfo.rank = targetYokai.rank;
      revealedInfo = targetYokai.rank;
      break;
    case 'element':
      newState.revealedInfo.element = targetYokai.element;
      revealedInfo = targetYokai.element;
      break;
    case 'extra_attempt':
      newState.extraAttempts += 1;
      revealedInfo = '+1 intento';
      break;
  }

  saveHintsState(newState);

  return {
    success: true,
    newState,
    revealedInfo
  };
}

// Obtener ayuda por ID
export function getHintById(hintType: HintType): Hint | undefined {
  return AVAILABLE_HINTS.find(h => h.id === hintType);
}

// Obtener nombre de ayuda según idioma
export function getHintName(hint: Hint, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return hint.name_en;
    case 'it': return hint.name_it;
    case 'es':
    default: return hint.name_es;
  }
}

// Obtener descripción de ayuda según idioma
export function getHintDescription(hint: Hint, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return hint.description_en;
    case 'it': return hint.description_it;
    case 'es':
    default: return hint.description_es;
  }
}

// Resetear estado de ayudas (para nueva partida)
export function resetHintsForNewGame(): void {
  localStorage.removeItem(HINTS_KEY);
}

// Obtener estadísticas de uso de ayudas
export function getHintsStats(): {
  totalHintsUsed: number;
  totalPointsSpent: number;
  hintUsageByType: Record<HintType, number>;
} {
  // Esta función podría expandirse para leer del historial de transacciones
  // Por ahora retorna datos básicos
  return {
    totalHintsUsed: 0,
    totalPointsSpent: 0,
    hintUsageByType: {
      tribe: 0,
      rank: 0,
      element: 0,
      extra_attempt: 0
    }
  };
}
