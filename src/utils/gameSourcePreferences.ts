import { Game, Tribe, Rank, Element } from '@/types/yokai';

const GAME_SOURCES_KEY = 'yokaidle_game_sources';
const TRIBE_RESTRICTIONS_KEY = 'yokaidle_tribe_restrictions';
const INFINITE_FILTERS_KEY = 'yokaidle_infinite_filters';
const INFINITE_CONFIG_KEY = 'yokaidle_infinite_config';

// Guardar las fuentes de juegos seleccionadas en localStorage
export function saveGameSources(selectedSources: Game[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GAME_SOURCES_KEY, JSON.stringify(selectedSources));
  }
}

// Cargar las fuentes de juegos desde localStorage
export function loadGameSources(): Game[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(GAME_SOURCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [];
}

// Verificar si hay fuentes guardadas
export function hasGameSourcesPreferences(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(GAME_SOURCES_KEY) !== null;
  }
  return false;
}

// Configuración de restricciones de tribus para modo infinito
export interface TribeRestrictions {
  excludeBossTribes: boolean; // Si excluir tribus Boss en modo infinito
}

// Filtros avanzados para modo infinito
export interface InfiniteFilters {
  // Filtros básicos existentes
  games: Game[];
  excludeBossTribes: boolean;

  // Nuevos filtros avanzados
  tribes: Tribe[];
  ranks: Rank[];
  elements: Element[];

  // Filtros de dificultad
  difficultyMode: 'mixed' | 'easy' | 'medium' | 'hard';

  // Filtros especiales
  excludeRecent: boolean; // Excluir yokais jugados recientemente
  recentCount: number; // Cuántos yokais recientes excluir
}

// Configuración avanzada para modo infinito
export interface InfiniteConfig {
  // Configuración de tiempo
  timeLimit: number; // 0 = sin límite, en segundos
  showTimer: boolean;

  // Configuración de intentos
  maxAttempts: number; // 4, 6, 8, 0 = ilimitados

  // Configuración de pistas
  hintsEnabled: boolean;
  hintsAfterAttempts: number; // Después de cuántos intentos mostrar pistas

  // Configuración de interfaz
  showDifficulty: boolean; // Mostrar dificultad del yokai

  // Configuración no implementada (mantener para compatibilidad)
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  soundEnabled: boolean;
  celebrationAnimations: boolean;
}

// Guardar las restricciones de tribus en localStorage
export function saveTribeRestrictions(restrictions: TribeRestrictions): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TRIBE_RESTRICTIONS_KEY, JSON.stringify(restrictions));
  }
}

// Cargar las restricciones de tribus desde localStorage
export function loadTribeRestrictions(): TribeRestrictions {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(TRIBE_RESTRICTIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  }
  // Por defecto, no excluir tribus Boss en modo infinito
  return { excludeBossTribes: false };
}

// Verificar si hay restricciones de tribus guardadas
export function hasTribeRestrictionsPreferences(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TRIBE_RESTRICTIONS_KEY) !== null;
  }
  return false;
}

// Valores por defecto para filtros infinitos
export const DEFAULT_INFINITE_FILTERS: InfiniteFilters = {
  games: [],
  excludeBossTribes: false,
  tribes: [],
  ranks: [],
  elements: [],
  difficultyMode: 'mixed',
  excludeRecent: false,
  recentCount: 10
};

// Valores por defecto para configuración infinita
export const DEFAULT_INFINITE_CONFIG: InfiniteConfig = {
  timeLimit: 0, // Sin límite
  showTimer: false,
  maxAttempts: 6,
  hintsEnabled: true,
  hintsAfterAttempts: 3,
  autoAdvance: false,
  autoAdvanceDelay: 3,
  showDifficulty: true,
  soundEnabled: true,
  celebrationAnimations: true
};

// Guardar filtros infinitos
export function saveInfiniteFilters(filters: InfiniteFilters): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INFINITE_FILTERS_KEY, JSON.stringify(filters));
  }
}

// Cargar filtros infinitos
export function loadInfiniteFilters(): InfiniteFilters {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(INFINITE_FILTERS_KEY);
    if (saved) {
      return { ...DEFAULT_INFINITE_FILTERS, ...JSON.parse(saved) };
    }
  }
  return DEFAULT_INFINITE_FILTERS;
}

// Guardar configuración infinita
export function saveInfiniteConfig(config: InfiniteConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INFINITE_CONFIG_KEY, JSON.stringify(config));
  }
}

// Cargar configuración infinita
export function loadInfiniteConfig(): InfiniteConfig {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(INFINITE_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_INFINITE_CONFIG, ...JSON.parse(saved) };
    }
  }
  return DEFAULT_INFINITE_CONFIG;
}
