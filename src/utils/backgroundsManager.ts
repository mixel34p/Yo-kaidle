// Sistema de gestion de fondos para Yo-kaidle
export type BackgroundId = 'default' | 'yokai_pattern' | 'night_sky' | 'cherry_blossoms' | 'digital_grid' | 'mystical_forest' | 'yo-kaipad' | 'enma' | 'jibanyanbg';

export type UnlockMethod = 'default' | 'achievement' | 'purchase' | 'event' | 'special' | 'circle';

export interface Background {
  id: BackgroundId;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  icon: string;
  preview: string;
  unlockMethod: UnlockMethod;
  unlockRequirement?: string;
  style: {
    backgroundImage?: string;
    backgroundColor?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    backgroundPosition?: string;
    backgroundAttachment?: string;
  };
}

export const AVAILABLE_BACKGROUNDS: Background[] = [
  {
    id: 'default',
    name_es: 'Floridablanca',
    name_en: 'Springdale',
    name_it: 'Springdale',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '🎮',
    preview: '/backgrounds/default.jpg',
    unlockMethod: 'default',
    style: {
      backgroundImage: 'url("/backgrounds/default.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'jibanyanbg',
    name_es: 'Jibanyan',
    name_en: 'Jibanyan',
    name_it: 'Jibanyan',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '🎮',
    preview: '/backgrounds/jibanyan.png',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/jibanyan.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'komasanbg',
    name_es: 'Komasan',
    name_en: 'Komasan',
    name_it: 'Komasan',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '🎮',
    preview: '/backgrounds/komasan.png',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/komasan.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'enma',
    name_es: 'Enma',
    name_en: 'Enma',
    name_it: 'Enma',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '👑',
    preview: '/backgrounds/enma.jpg',
    unlockMethod: 'circle',
    unlockRequirement: 'enma',
    style: {
      backgroundImage: 'url("/backgrounds/enma.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'yo-kaipad',
    name_es: 'Yo-kai Pad Azul',
    name_en: 'Blue Yo-kai Pad',
    name_it: 'Yo-kai Pad Blu',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/ykpblue.jpg',
    unlockMethod: 'achievement',
    unlockRequirement: 'first_yokai',
    style: {
      backgroundImage: 'url("/backgrounds/ykpblue.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'yo-kaipad2',
    name_es: 'Yo-kai Pad Flores',
    name_en: 'Flowers Yo-kai Pad',
    name_it: 'Yo-kai Pad Fiori',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/ykpflowers.jpg',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/ykpflowers.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'yo-kaipad3',
    name_es: 'Yo-kai Pad Hojas',
    name_en: 'Leafs Yo-kai Pad',
    name_it: 'Yo-kai Pad Foglie',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/ykpleaf.jpg',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/ykpleaf.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'yo-kaipad4',
    name_es: 'Yo-kai Pad Dorado',
    name_en: 'Golden Yo-kai Pad',
    name_it: 'Yo-kai Pad Doro',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/ykpgolden.jpg',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/ykpgolden.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'nightbg',
    name_es: 'Fondo de noche',
    name_en: 'Night Background',
    name_it: 'Sfondo notturno',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/night.jpg',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/night.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'dark',
    name_es: 'Darknyan',
    name_en: 'Darknyan',
    name_it: 'Darknyan',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/darknyan.png',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/darknyan.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'nyc',
    name_es: 'New Yo-kai city',
    name_en: 'New Yo-kai city',
    name_it: 'New Yo-kai city',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/nyc.png',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/nyc.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'school',
    name_es: 'Colegio',
    name_en: 'School',
    name_it: 'Collegio',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/school.png',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/school.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'yokai',
    name_es: 'Yo-kais',
    name_en: 'Yo-kais',
    name_it: 'Yo-kais',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/yokais.png',
    unlockMethod: 'achievement',
    style: {
      backgroundImage: 'url("/backgrounds/yokais.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  },
  {
    id: 'blasters2',
    name_es: 'Yo-kai Watch Blasters 2',
    name_en: 'Yo-kai Watch Blasters 2',
    name_it: 'Yo-kai Watch Blasters 2',
    description_es: '',
    description_en: '',
    description_it: '',
    icon: '📱',
    preview: '/backgrounds/blasters2.jpg',
    unlockMethod: 'purchase',
    style: {
      backgroundImage: 'url("/backgrounds/blasters2.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  }
];

export interface BackgroundsState {
  unlockedBackgrounds: BackgroundId[];
  currentBackground: BackgroundId;
  lastUpdated: string;
}

const BACKGROUNDS_KEY = 'yokaidle_backgrounds_state';

export function loadBackgroundsState(): BackgroundsState {
  try {
    const saved = localStorage.getItem(BACKGROUNDS_KEY);
    if (saved) {
      const state: BackgroundsState = JSON.parse(saved);
      return {
        ...state,
        unlockedBackgrounds: state.unlockedBackgrounds || ['default'],
        currentBackground: state.currentBackground || 'default'
      };
    }
  } catch (error) {
    console.error('Error loading backgrounds state:', error);
  }
  
  return {
    unlockedBackgrounds: ['default'],
    currentBackground: 'default',
    lastUpdated: new Date().toISOString()
  };
}

export function saveBackgroundsState(state: BackgroundsState): void {
  try {
    const stateToSave = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(BACKGROUNDS_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving backgrounds state:', error);
  }
}

export function getCurrentBackground(): Background {
  const state = loadBackgroundsState();
  return AVAILABLE_BACKGROUNDS.find(bg => bg.id === state.currentBackground) || AVAILABLE_BACKGROUNDS[0];
}

export function getUnlockedBackgrounds(): Background[] {
  const state = loadBackgroundsState();
  return AVAILABLE_BACKGROUNDS.filter(bg => state.unlockedBackgrounds.includes(bg.id));
}

export function isBackgroundUnlocked(backgroundId: BackgroundId): boolean {
  const state = loadBackgroundsState();
  return state.unlockedBackgrounds.includes(backgroundId);
}

export function unlockBackground(backgroundId: BackgroundId): boolean {
  const state = loadBackgroundsState();
  
  if (state.unlockedBackgrounds.includes(backgroundId)) {
    return false;
  }
  
  const newState: BackgroundsState = {
    ...state,
    unlockedBackgrounds: [...state.unlockedBackgrounds, backgroundId]
  };
  
  saveBackgroundsState(newState);
  return true;
}

export function applyBackground(backgroundId: BackgroundId): boolean {
  if (!isBackgroundUnlocked(backgroundId)) {
    return false;
  }
  
  const state = loadBackgroundsState();
  const newState: BackgroundsState = {
    ...state,
    currentBackground: backgroundId
  };
  
  saveBackgroundsState(newState);
  
  const background = AVAILABLE_BACKGROUNDS.find(bg => bg.id === backgroundId);
  if (background) {
    applyBackgroundToDOM(background);
  }
  
  return true;
}

export function applyBackgroundToDOM(background: Background): void {
  const body = document.body;
  
  body.style.backgroundImage = '';
  body.style.backgroundColor = '';
  body.style.backgroundSize = '';
  body.style.backgroundRepeat = '';
  body.style.backgroundPosition = '';
  body.style.backgroundAttachment = '';
  
  Object.entries(background.style).forEach(([property, value]) => {
    if (value) {
      (body.style as any)[property] = value;
    }
  });
  
  body.className = body.className.replace(/bg-\w+/g, '');
  body.classList.add(`bg-${background.id}`);
  
  body.offsetHeight;
  
  console.log(`Fondo aplicado: ${background.name_es}`, background.style);
}

export function initializeBackgrounds(): void {
  if (typeof window !== 'undefined') {
    const applyCurrentBackground = () => {
      const currentBackground = getCurrentBackground();
      applyBackgroundToDOM(currentBackground);
      console.log(`Sistema de fondos inicializado con: ${currentBackground.name_es}`);
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyCurrentBackground);
    } else {
      setTimeout(applyCurrentBackground, 100);
    }
  }
}

export function getBackgroundName(background: Background, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return background.name_en;
    case 'it': return background.name_it;
    case 'es':
    default: return background.name_es;
  }
}

export function getBackgroundDescription(background: Background, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return background.description_en;
    case 'it': return background.description_it;
    case 'es':
    default: return background.description_es;
  }
}

export function debugUnlockAllBackgrounds(): void {
  const allBackgroundIds: BackgroundId[] = AVAILABLE_BACKGROUNDS.map(bg => bg.id);
  const state: BackgroundsState = {
    unlockedBackgrounds: allBackgroundIds,
    currentBackground: 'default',
    lastUpdated: new Date().toISOString()
  };
  saveBackgroundsState(state);
  console.log('DEBUG: Todos los fondos desbloqueados:', allBackgroundIds);
}
