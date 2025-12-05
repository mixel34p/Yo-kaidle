// Sistema de jukebox para Yo-kaidle
// Permite reproducir música de Yo-kai Watch con sistema de desbloqueo

export type MusicCategory = 'battle' | 'overworld' | 'boss' | 'menu' | 'special';
export type MusicGame = 'yw1' | 'yw2' | 'yw3' | 'ywb' | 'ywp' | 'yw4';
export type UnlockMethod = 'default' | 'achievement' | 'circle' | 'purchase' | 'special';
export type RepeatMode = 'none' | 'one' | 'all';

export interface Track {
  id: string;
  title_es: string;
  title_en: string;
  title_it: string;
  game: MusicGame;
  category: MusicCategory;
  duration: number; // en segundos
  file: string; // ruta del archivo de audio
  preview: string; // ruta del preview (30 segundos)
  unlockMethod: UnlockMethod;
  unlockRequirement?: string;
  icon: string;
  description_es: string;
  description_en: string;
  description_it: string;
}

export interface Playlist {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  tracks: string[]; // IDs de tracks
  icon: string;
  isCustom: boolean; // true para listas creadas por usuario
  createdAt: string;
}

export interface JukeboxState {
  unlockedTracks: string[];
  favoriteTracks: string[];
  customPlaylists: Playlist[];
  currentTrack: string | null;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: string[];
  currentQueueIndex: number;
  lastUpdated: string;
}

// Catálogo de música disponible
export const AVAILABLE_TRACKS: Track[] = [
  // Yo-kai Watch 1
  {
    id: 'yw1_battle_normal',
    title_es: 'Batalla Yo-kai',
    title_en: 'Yo-kai Battle',
    title_it: 'Battaglia Yo-kai',
    game: 'yw1',
    category: 'battle',
    duration: 225, // 3:45
    file: '/music/yw1battle.mp3',
    preview: '/music/yw1battle.mp3',
    unlockMethod: 'default',
    icon: '⚔️',
    description_es: 'Tema de batalla clásico de Yo-kai Watch',
    description_en: 'Classic Yo-kai Watch battle theme',
    description_it: 'Tema di battaglia classico di Yo-kai Watch'
  },
  {
    id: 'yw1_springdale',
    title_es: 'Floridablanca',
    title_en: 'Springdale',
    title_it: 'Springdale',
    game: 'yw1',
    category: 'overworld',
    duration: 252, // 4:12
    file: '/music/yw1_springdale.mp3',
    preview: '/music/previews/yw1_springdale.mp3',
    unlockMethod: 'default',
    icon: '🏘️',
    description_es: 'Música relajante de la ciudad de Floridablanca',
    description_en: 'Relaxing music from Springdale city',
    description_it: 'Musica rilassante della città di Springdale'
  },
  {
    id: 'yw1_menu',
    title_es: 'Menú Principal',
    title_en: 'Main Menu',
    title_it: 'Menu Principale',
    game: 'yw1',
    category: 'menu',
    duration: 180, // 3:00
    file: '/music/yw1_menu.mp3',
    preview: '/music/previews/yw1_menu.mp3',
    unlockMethod: 'default',
    icon: '📱',
    description_es: 'Tema nostálgico del menú principal',
    description_en: 'Nostalgic main menu theme',
    description_it: 'Tema nostalgico del menu principale'
  },
  {
    id: 'yw1_boss_mckraken',
    title_es: 'Batalla contra McKraken',
    title_en: 'McKraken Battle',
    title_it: 'Battaglia contro McKraken',
    game: 'yw1',
    category: 'boss',
    duration: 195, // 3:15
    file: '/music/yw1_boss_mckraken.mp3',
    preview: '/music/previews/yw1_boss_mckraken.mp3',
    unlockMethod: 'achievement',
    unlockRequirement: 'defeat_mckraken',
    icon: '🐙',
    description_es: 'Tema épico de la batalla contra McKraken',
    description_en: 'Epic theme for the McKraken battle',
    description_it: 'Tema epico per la battaglia contro McKraken'
  },
  {
    id: 'yw1_yokai_watch',
    title_es: 'Tema Yo-kai Watch',
    title_en: 'Yo-kai Watch Theme',
    title_it: 'Tema Yo-kai Watch',
    game: 'yw1',
    category: 'special',
    duration: 210, // 3:30
    file: '/music/yw1_yokai_watch.mp3',
    preview: '/music/previews/yw1_yokai_watch.mp3',
    unlockMethod: 'achievement',
    unlockRequirement: 'first_yokai',
    icon: '⌚',
    description_es: 'El icónico tema principal de Yo-kai Watch',
    description_en: 'The iconic main theme of Yo-kai Watch',
    description_it: 'Il tema principale iconico di Yo-kai Watch'
  },
  
  // Yo-kai Watch 2
  {
    id: 'yw2_battle_enhanced',
    title_es: 'Batalla Yo-kai 2',
    title_en: 'Yo-kai Battle 2',
    title_it: 'Battaglia Yo-kai 2',
    game: 'yw2',
    category: 'battle',
    duration: 240, // 4:00
    file: '/music/yw2_battle_enhanced.mp3',
    preview: '/music/previews/yw2_battle_enhanced.mp3',
    unlockMethod: 'achievement',
    unlockRequirement: 'unlock_50_yokai',
    icon: '⚔️',
    description_es: 'Versión mejorada del tema de batalla',
    description_en: 'Enhanced version of the battle theme',
    description_it: 'Versione migliorata del tema di battaglia'
  },
  {
    id: 'yw2_enma_theme',
    title_es: 'Tema de Enma',
    title_en: 'Enma Theme',
    title_it: 'Tema di Enma',
    game: 'yw2',
    category: 'boss',
    duration: 285, // 4:45
    file: '/music/yw2_enma_theme.mp3',
    preview: '/music/previews/yw2_enma_theme.mp3',
    unlockMethod: 'circle',
    unlockRequirement: 'enma',
    icon: '👑',
    description_es: 'Majestuoso tema del Rey Enma',
    description_en: 'Majestic theme of King Enma',
    description_it: 'Tema maestoso del Re Enma'
  },
  {
    id: 'yw2_harrisville',
    title_es: 'Harrisville',
    title_en: 'Harrisville',
    title_it: 'Harrisville',
    game: 'yw2',
    category: 'overworld',
    duration: 198, // 3:18
    file: '/music/yw2_harrisville.mp3',
    preview: '/music/previews/yw2_harrisville.mp3',
    unlockMethod: 'purchase',
    unlockRequirement: '100',
    icon: '🏙️',
    description_es: 'Música urbana de Harrisville',
    description_en: 'Urban music from Harrisville',
    description_it: 'Musica urbana di Harrisville'
  },
  
  // Yo-kai Watch 3
  {
    id: 'yw3_usa_theme',
    title_es: 'Tema de Estados Unidos',
    title_en: 'USA Theme',
    title_it: 'Tema USA',
    game: 'yw3',
    category: 'overworld',
    duration: 220, // 3:40
    file: '/music/yw3_usa_theme.mp3',
    preview: '/music/previews/yw3_usa_theme.mp3',
    unlockMethod: 'achievement',
    unlockRequirement: 'world_traveler',
    icon: '🇺🇸',
    description_es: 'Tema aventurero de la expansión americana',
    description_en: 'Adventurous theme from the American expansion',
    description_it: 'Tema avventuroso dell\'espansione americana'
  },
  {
    id: 'yw3_legendary_battle',
    title_es: 'Batalla Legendaria',
    title_en: 'Legendary Battle',
    title_it: 'Battaglia Leggendaria',
    game: 'yw3',
    category: 'boss',
    duration: 270, // 4:30
    file: '/music/yw3_legendary_battle.mp3',
    preview: '/music/previews/yw3_legendary_battle.mp3',
    unlockMethod: 'special',
    unlockRequirement: 'complete_all_circles',
    icon: '🌟',
    description_es: 'Tema épico para batallas legendarias',
    description_en: 'Epic theme for legendary battles',
    description_it: 'Tema epico per battaglie leggendarie'
  }
];

// Listas de reproducción predefinidas (solo favoritos)
export const DEFAULT_PLAYLISTS: Playlist[] = [];

const JUKEBOX_KEY = 'yokaidle_jukebox_state';

// Cargar estado del jukebox
export function loadJukeboxState(): JukeboxState {
  try {
    const saved = localStorage.getItem(JUKEBOX_KEY);
    if (saved) {
      const state: JukeboxState = JSON.parse(saved);
      return {
        ...state,
        unlockedTracks: state.unlockedTracks || ['yw1_battle_normal', 'yw1_springdale', 'yw1_menu'],
        favoriteTracks: state.favoriteTracks || [],
        customPlaylists: state.customPlaylists || [],
        currentTrack: state.currentTrack || null,
        isPlaying: false, // Siempre empezar pausado
        volume: state.volume || 0.7,
        shuffle: state.shuffle || false,
        repeat: state.repeat || 'none',
        queue: state.queue || [],
        currentQueueIndex: state.currentQueueIndex || 0
      };
    }
  } catch (error) {
    console.error('Error loading jukebox state:', error);
  }
  
  // Estado por defecto
  return {
    unlockedTracks: ['yw1_battle_normal', 'yw1_springdale', 'yw1_menu'],
    favoriteTracks: [],
    customPlaylists: [],
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    shuffle: false,
    repeat: 'none',
    queue: [],
    currentQueueIndex: 0,
    lastUpdated: new Date().toISOString()
  };
}

// Guardar estado del jukebox
export function saveJukeboxState(state: JukeboxState): void {
  try {
    const stateToSave = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(JUKEBOX_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving jukebox state:', error);
  }
}

// Obtener track por ID
export function getTrackById(trackId: string): Track | null {
  return AVAILABLE_TRACKS.find(track => track.id === trackId) || null;
}

// Obtener tracks desbloqueados
export function getUnlockedTracks(): Track[] {
  const state = loadJukeboxState();
  return AVAILABLE_TRACKS.filter(track => state.unlockedTracks.includes(track.id));
}

// Verificar si un track está desbloqueado
export function isTrackUnlocked(trackId: string): boolean {
  const state = loadJukeboxState();
  return state.unlockedTracks.includes(trackId);
}

// Desbloquear un track
export function unlockTrack(trackId: string): boolean {
  const state = loadJukeboxState();
  
  if (state.unlockedTracks.includes(trackId)) {
    return false; // Ya estaba desbloqueado
  }
  
  const newState: JukeboxState = {
    ...state,
    unlockedTracks: [...state.unlockedTracks, trackId]
  };
  
  saveJukeboxState(newState);
  return true; // Desbloqueado exitosamente
}

// Obtener nombre del track según idioma
export function getTrackName(track: Track, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return track.title_en;
    case 'it': return track.title_it;
    case 'es':
    default: return track.title_es;
  }
}

// Obtener descripción del track según idioma
export function getTrackDescription(track: Track, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return track.description_en;
    case 'it': return track.description_it;
    case 'es':
    default: return track.description_es;
  }
}

// Obtener nombre de la playlist según idioma
export function getPlaylistName(playlist: Playlist, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return playlist.name_en;
    case 'it': return playlist.name_it;
    case 'es':
    default: return playlist.name_es;
  }
}

// FUNCIÓN DE DEBUG: Desbloquear todos los tracks
export function debugUnlockAllTracks(): void {
  const allTrackIds: string[] = AVAILABLE_TRACKS.map(track => track.id);
  const state: JukeboxState = {
    ...loadJukeboxState(),
    unlockedTracks: allTrackIds
  };
  saveJukeboxState(state);
  console.log('🎵 DEBUG: Todos los tracks desbloqueados:', allTrackIds);
}
