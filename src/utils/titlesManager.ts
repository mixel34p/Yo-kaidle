// Sistema de gestión de títulos para Yo-kaidle
// Permite desbloquear y gestionar títulos de perfil

export interface TitleData {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  unlockMethod: 'default' | 'achievement' | 'circle' | 'purchase' | 'special';
  unlockRequirement?: string;
}

export interface UnlockedTitle extends TitleData {
  unlockedAt: string;
}

export interface TitlesState {
  unlockedTitles: Record<string, UnlockedTitle>;
  currentTitle: string;
}

// Títulos disponibles en el juego
export const AVAILABLE_TITLES: TitleData[] = [
  {
    id: 'clockmaster',
    name_es: 'Maestro del Reloj',
    name_en: 'Clock Master',
    name_it: 'Insegnante di orologio',
    unlockMethod: 'achievement',
    unlockRequirement: 'allyokai'
  },
  {
    id: 'unionsexual',
    name_es: 'Unionsexual',
    name_en: 'Unionsexual',
    name_it: 'Unionsexual',
    unlockMethod: 'special'
  },
  {
    id: 'discord',
    name_es: '@everyone',
    name_en: '@everyone',
    name_it: '@everyone',
    unlockMethod: 'special'
  },
  {
    id: 'nyan',
    name_es: 'Nyan',
    name_en: 'Nyan',
    name_it: 'Nyan',
    unlockMethod: 'special'
  },
  {
    id: 'koma',
    name_es: '¡Oh mis Remolinos!',
    name_en: 'Oh my swirls!',
    name_it: 'Oh miei turbini!',
    unlockMethod: 'special'
  },
];

const TITLES_STORAGE_KEY = 'yokaidle-titles';

// Función para obtener el nombre traducido de un título
export function getTitleName(title: TitleData, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return title.name_en;
    case 'it': return title.name_it;
    case 'es':
    default: return title.name_es;
  }
}

// Función para obtener la descripción traducida de un título
export function getTitleDescription(title: TitleData, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return title.description_en;
    case 'it': return title.description_it;
    case 'es':
    default: return title.description_es;
  }
}

// Cargar estado de títulos desde localStorage
export function loadTitles(): TitlesState {
  try {
    const saved = localStorage.getItem(TITLES_STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      return {
        unlockedTitles: state.unlockedTitles || {},
        currentTitle: state.currentTitle || ''
      };
    }
  } catch (error) {
    console.error('Error loading titles state:', error);
  }

  // Estado por defecto: sin títulos desbloqueados
  return {
    unlockedTitles: {},
    currentTitle: ''
  };
}

// Guardar estado de títulos en localStorage
export function saveTitles(state: TitlesState): void {
  try {
    localStorage.setItem(TITLES_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving titles state:', error);
  }
}

// Desbloquear un título
export function unlockTitle(titleId: string): boolean {
  const title = AVAILABLE_TITLES.find(t => t.id === titleId);
  if (!title) return false;

  const titlesState = loadTitles();
  
  // Si ya está desbloqueado, no hacer nada
  if (titlesState.unlockedTitles[titleId]) {
    return false;
  }

  // Desbloquear el título
  titlesState.unlockedTitles[titleId] = {
    ...title,
    unlockedAt: new Date().toISOString()
  };

  saveTitles(titlesState);
  return true;
}

// Verificar si un título está desbloqueado
export function isTitleUnlocked(titleId: string): boolean {
  const titlesState = loadTitles();
  return !!titlesState.unlockedTitles[titleId];
}

// Obtener todos los títulos con su estado de desbloqueo
export function getAllTitlesWithStatus(): (TitleData & { unlocked: boolean; unlockedAt?: string })[] {
  const titlesState = loadTitles();
  
  return AVAILABLE_TITLES.map(title => ({
    ...title,
    unlocked: !!titlesState.unlockedTitles[title.id],
    unlockedAt: titlesState.unlockedTitles[title.id]?.unlockedAt
  }));
}

// Obtener títulos desbloqueados
export function getUnlockedTitles(): UnlockedTitle[] {
  const titlesState = loadTitles();
  return Object.values(titlesState.unlockedTitles);
}

// Obtener título actual
export function getCurrentTitle(): TitleData | null {
  const titlesState = loadTitles();
  if (!titlesState.currentTitle) return null;
  const currentTitle = AVAILABLE_TITLES.find(t => t.id === titlesState.currentTitle);
  return currentTitle || null;
}

// Cambiar título actual
export function setCurrentTitle(titleId: string): boolean {
  if (!isTitleUnlocked(titleId)) {
    return false;
  }

  const titlesState = loadTitles();
  titlesState.currentTitle = titleId;
  saveTitles(titlesState);
  return true;
}

// Obtener título por ID
export function getTitleById(titleId: string): TitleData | null {
  return AVAILABLE_TITLES.find(title => title.id === titleId) || null;
}

// FUNCIÓN DE DEBUG: Desbloquear todos los títulos
export function debugUnlockAllTitles(): void {
  const titlesState = loadTitles();
  
  AVAILABLE_TITLES.forEach(title => {
    if (!titlesState.unlockedTitles[title.id]) {
      titlesState.unlockedTitles[title.id] = {
        ...title,
        unlockedAt: new Date().toISOString()
      };
    }
  });

  saveTitles(titlesState);
  console.log('👑 DEBUG: Todos los títulos desbloqueados');
}
