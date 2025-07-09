import { Game, Tribe } from '@/types/yokai';

const GAME_SOURCES_KEY = 'yokaidle_game_sources';
const TRIBE_RESTRICTIONS_KEY = 'yokaidle_tribe_restrictions';

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
