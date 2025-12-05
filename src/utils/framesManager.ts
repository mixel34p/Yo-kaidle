// Sistema de gestión de marcos para Yo-kaidle
// Permite desbloquear y gestionar marcos de avatar

export interface FrameData {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  image: string;
  unlockMethod: 'default' | 'achievement' | 'circle' | 'purchase' | 'special';
  unlockRequirement?: string;
}

export interface UnlockedFrame extends FrameData {
  unlockedAt: string;
}

export interface FramesState {
  unlockedFrames: Record<string, UnlockedFrame>;
  currentFrame: string;
}

// Marcos disponibles en el juego
export const AVAILABLE_FRAMES: FrameData[] = [
  {
    id: 'default',
    name_es: 'Marco Básico',
    name_en: 'Basic Frame',
    name_it: 'Cornice Base',
    description_es: 'Marco por defecto para todos los jugadores',
    description_en: 'Default frame for all players',
    description_it: 'Cornice predefinita per tutti i giocatori',
    image: '/frames/default.svg',
    unlockMethod: 'default'
  },
  {
    id: 'jiba',
    name_es: 'Marco Jibanyan',
    name_en: 'Jibanyan Frame',
    name_it: 'Cornice Jibanyan',
    description_es: 'Marco de Jibanyan',
    description_en: 'Frame of Jibanyan',
    description_it: 'Frame of Jibanyan',
    image: '/frames/jibanyan.svg',
    unlockMethod: 'achievement',
    unlockRequirement: 'rainbow_master'
  },
  {
    id: 'komasan',
    name_es: 'Marco Komasan',
    name_en: 'Komasan Frame',
    name_it: 'Cornice Komasan',
    description_es: 'Marco de Komasan',
    description_en: 'Frame of Komasan',
    description_it: 'Frame of Komasan',
    image: '/frames/komasan.svg',
    unlockMethod: 'achievement',
    unlockRequirement: 'rainbow_master'
  },
  {
    id: 'jibanyant',
    name_es: 'Marco Jibanyan-T',
    name_en: 'Jibanyan-T Frame',
    name_it: 'Cornice Jibanyan-T',
    description_es: 'Marco de Komasan',
    description_en: 'Frame of Komasan',
    description_it: 'Frame of Komasan',
    image: '/frames/jibanyant.svg',
    unlockMethod: 'achievement',
    unlockRequirement: 'rainbow_master'
  },
  {
    id: 'komasant',
    name_es: 'Marco Komasan-T',
    name_en: 'Komasan-T Frame',
    name_it: 'Cornice Komasan-T',
    description_es: 'Marco de Komasan',
    description_en: 'Frame of Komasan',
    description_it: 'Frame of Komasan',
    image: '/frames/komasant.svg',
    unlockMethod: 'achievement',
    unlockRequirement: 'rainbow_master'
  },
  {
    id: 'enma',
    name_es: 'Marco Enma',
    name_en: 'Enma Frame',
    name_it: 'Cornice Enma',
    description_es: 'Marco de Komasan',
    description_en: 'Frame of Komasan',
    description_it: 'Frame of Komasan',
    image: '/frames/enma.svg',
    unlockMethod: 'achievement',
    unlockRequirement: 'rainbow_master'
  },
  {
	id: 'aprilfools',
    name_es: 'Ralsei Fumando',
    name_en: 'Smoking Ralsei',
    name_it: 'Fumare Ralsei',
    description_es: 'Marco de Komasan',
    description_en: 'Frame of Komasan',
    description_it: 'Frame of Komasan',
    image: '/frames/wtf.svg',
    unlockMethod: 'achievement',
    unlockRequirement: 'rainbow_master'
  }
];

const FRAMES_STORAGE_KEY = 'yokaidle-frames';

// Función para obtener el nombre traducido de un marco
export function getFrameName(frame: FrameData, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return frame.name_en;
    case 'it': return frame.name_it;
    case 'es':
    default: return frame.name_es;
  }
}

// Función para obtener la descripción traducida de un marco
export function getFrameDescription(frame: FrameData, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return frame.description_en;
    case 'it': return frame.description_it;
    case 'es':
    default: return frame.description_es;
  }
}

// Cargar estado de marcos desde localStorage
export function loadFrames(): FramesState {
  try {
    const saved = localStorage.getItem(FRAMES_STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      return {
        unlockedFrames: state.unlockedFrames || {},
        currentFrame: state.currentFrame || 'default'
      };
    }
  } catch (error) {
    console.error('Error loading frames state:', error);
  }

  // Estado por defecto: solo el marco básico desbloqueado
  const defaultFrame = AVAILABLE_FRAMES.find(f => f.id === 'default')!;
  return {
    unlockedFrames: {
      'default': {
        ...defaultFrame,
        unlockedAt: new Date().toISOString()
      }
    },
    currentFrame: 'default'
  };
}

// Guardar estado de marcos en localStorage
export function saveFrames(state: FramesState): void {
  try {
    localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving frames state:', error);
  }
}

// Desbloquear un marco
export function unlockFrame(frameId: string): boolean {
  const frame = AVAILABLE_FRAMES.find(f => f.id === frameId);
  if (!frame) return false;

  const framesState = loadFrames();
  
  // Si ya está desbloqueado, no hacer nada
  if (framesState.unlockedFrames[frameId]) {
    return false;
  }

  // Desbloquear el marco
  framesState.unlockedFrames[frameId] = {
    ...frame,
    unlockedAt: new Date().toISOString()
  };

  saveFrames(framesState);
  return true;
}

// Verificar si un marco está desbloqueado
export function isFrameUnlocked(frameId: string): boolean {
  const framesState = loadFrames();
  return !!framesState.unlockedFrames[frameId];
}

// Obtener todos los marcos con su estado de desbloqueo
export function getAllFramesWithStatus(): (FrameData & { unlocked: boolean; unlockedAt?: string })[] {
  const framesState = loadFrames();
  
  return AVAILABLE_FRAMES.map(frame => ({
    ...frame,
    unlocked: !!framesState.unlockedFrames[frame.id],
    unlockedAt: framesState.unlockedFrames[frame.id]?.unlockedAt
  }));
}

// Obtener marcos desbloqueados
export function getUnlockedFrames(): UnlockedFrame[] {
  const framesState = loadFrames();
  return Object.values(framesState.unlockedFrames);
}

// Obtener marco actual
export function getCurrentFrame(): FrameData {
  const framesState = loadFrames();
  const currentFrame = AVAILABLE_FRAMES.find(f => f.id === framesState.currentFrame);
  return currentFrame || AVAILABLE_FRAMES[0]; // Fallback al primer marco
}

// Cambiar marco actual
export function setCurrentFrame(frameId: string): boolean {
  if (!isFrameUnlocked(frameId)) {
    return false;
  }

  const framesState = loadFrames();
  framesState.currentFrame = frameId;
  saveFrames(framesState);
  return true;
}

// Obtener marco por ID
export function getFrameById(frameId: string): FrameData | null {
  return AVAILABLE_FRAMES.find(frame => frame.id === frameId) || null;
}

// FUNCIÓN DE DEBUG: Desbloquear todos los marcos
export function debugUnlockAllFrames(): void {
  const framesState = loadFrames();
  
  AVAILABLE_FRAMES.forEach(frame => {
    if (!framesState.unlockedFrames[frame.id]) {
      framesState.unlockedFrames[frame.id] = {
        ...frame,
        unlockedAt: new Date().toISOString()
      };
    }
  });

  saveFrames(framesState);
  console.log('🔳 DEBUG: Todos los marcos desbloqueados');
}
