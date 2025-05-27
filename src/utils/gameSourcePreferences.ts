import { Game } from '@/types/yokai';

const GAME_SOURCES_KEY = 'yokaidle_game_sources';

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
