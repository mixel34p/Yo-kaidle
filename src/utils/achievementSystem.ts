import { MedalliumData } from './medalliumManager';
import { Yokai, Tribe, Game } from '@/types/yokai';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'collection' | 'tribe' | 'game' | 'rank' | 'special';
  condition: (medallium: MedalliumData, allYokai: Yokai[]) => boolean;
  reward?: {
    title?: string;
    badge?: string;
    points?: number;
  };
  hidden?: boolean; // Logros secretos
}

export interface AchievementProgress {
  [achievementId: string]: {
    unlocked: boolean;
    unlockedDate?: string;
    progress?: number;
    maxProgress?: number;
  };
}

// Definición de todos los logros disponibles
export const ACHIEVEMENTS: Achievement[] = [
  // === LOGROS DE COLECCIÓN ===
  {
    id: 'first_yokai',
    name: 'Primer Paso',
    description: 'Desbloquea tu primer Yo-kai',
    icon: '🥇',
    category: 'collection',
    condition: (medallium) => Object.keys(medallium).length >= 1,
    reward: { title: 'Novato', points: 10 }
  },
  {
    id: 'collector_10',
    name: 'Coleccionista Novato',
    description: 'Desbloquea 10 Yo-kai',
    icon: '📚',
    category: 'collection',
    condition: (medallium) => Object.keys(medallium).length >= 10,
    reward: { title: 'Coleccionista', points: 50 }
  },
  {
    id: 'collector_25',
    name: 'Coleccionista Experimentado',
    description: 'Desbloquea 25 Yo-kai',
    icon: '📖',
    category: 'collection',
    condition: (medallium) => Object.keys(medallium).length >= 25,
    reward: { title: 'Experimentado', points: 100 }
  },
  {
    id: 'collector_50',
    name: 'Coleccionista Experto',
    description: 'Desbloquea 50 Yo-kai',
    icon: '🔥',
    category: 'collection',
    condition: (medallium) => Object.keys(medallium).length >= 50,
    reward: { title: 'Experto', points: 200 }
  },
  {
    id: 'collector_100',
    name: 'Maestro Coleccionista',
    description: 'Desbloquea 100 Yo-kai',
    icon: '👑',
    category: 'collection',
    condition: (medallium) => Object.keys(medallium).length >= 100,
    reward: { title: 'Maestro Yokai', points: 500 }
  },

  // === LOGROS POR TRIBU ===
  {
    id: 'tribe_charming_complete',
    name: 'Encantador',
    description: 'Desbloquea todos los Yo-kai de la tribu Guapo',
    icon: '😊',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const charmingYokai = allYokai.filter(y => y.tribe === 'Charming');
      const unlockedCharming = charmingYokai.filter(y => medallium[y.id]);
      return charmingYokai.length > 0 && unlockedCharming.length === charmingYokai.length;
    },
    reward: { title: 'Encantador', points: 300 }
  },
  {
    id: 'tribe_mysterious_complete',
    name: 'Misterioso',
    description: 'Desbloquea todos los Yo-kai de la tribu Misterioso',
    icon: '🔮',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const mysteriousYokai = allYokai.filter(y => y.tribe === 'Mysterious');
      const unlockedMysterious = mysteriousYokai.filter(y => medallium[y.id]);
      return mysteriousYokai.length > 0 && unlockedMysterious.length === mysteriousYokai.length;
    },
    reward: { title: 'Misterioso', points: 300 }
  },
  {
    id: 'tribe_tough_complete',
    name: 'Resistente',
    description: 'Desbloquea todos los Yo-kai de la tribu Resistente',
    icon: '💪',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const toughYokai = allYokai.filter(y => y.tribe === 'Tough');
      const unlockedTough = toughYokai.filter(y => medallium[y.id]);
      return toughYokai.length > 0 && unlockedTough.length === toughYokai.length;
    },
    reward: { title: 'Resistente', points: 300 }
  },
  {
    id: 'tribe_heartful_complete',
    name: 'Bondadoso',
    description: 'Desbloquea todos los Yo-kai de la tribu Bondadoso',
    icon: '❤️',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const heartfulYokai = allYokai.filter(y => y.tribe === 'Heartful');
      const unlockedHeartful = heartfulYokai.filter(y => medallium[y.id]);
      return heartfulYokai.length > 0 && unlockedHeartful.length === heartfulYokai.length;
    },
    reward: { title: 'Bondadoso', points: 300 }
  },

  // === LOGROS POR JUEGO ===
  {
    id: 'game_yw1_complete',
    name: 'Nostálgico',
    description: 'Desbloquea todos los Yo-kai de Yo-kai Watch 1',
    icon: '🎮',
    category: 'game',
    condition: (medallium, allYokai) => {
      const yw1Yokai = allYokai.filter(y => y.game === 'Yo-kai Watch 1');
      const unlockedYw1 = yw1Yokai.filter(y => medallium[y.id]);
      return yw1Yokai.length > 0 && unlockedYw1.length === yw1Yokai.length;
    },
    reward: { title: 'Nostálgico', points: 400 }
  },
  {
    id: 'game_yw2_complete',
    name: 'Veterano',
    description: 'Desbloquea todos los Yo-kai de Yo-kai Watch 2',
    icon: '🎯',
    category: 'game',
    condition: (medallium, allYokai) => {
      const yw2Yokai = allYokai.filter(y => y.game === 'Yo-kai Watch 2');
      const unlockedYw2 = yw2Yokai.filter(y => medallium[y.id]);
      return yw2Yokai.length > 0 && unlockedYw2.length === yw2Yokai.length;
    },
    reward: { title: 'Veterano', points: 400 }
  },

  // === LOGROS POR RANGO ===
  {
    id: 'rank_s_collector',
    name: 'Cazador de Leyendas',
    description: 'Desbloquea 10 Yo-kai de rango S',
    icon: '⭐',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const sRankYokai = allYokai.filter(y => y.rank === 'S' && medallium[y.id]);
      return sRankYokai.length >= 10;
    },
    reward: { title: 'Cazador de Leyendas', points: 250 }
  },
  {
    id: 'rank_a_collector',
    name: 'Coleccionista Elite',
    description: 'Desbloquea 15 Yo-kai de rango A',
    icon: '🌟',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const aRankYokai = allYokai.filter(y => y.rank === 'A' && medallium[y.id]);
      return aRankYokai.length >= 15;
    },
    reward: { title: 'Elite', points: 200 }
  },

  // === LOGROS ESPECIALES ===
  {
    id: 'speed_demon',
    name: 'Demonio de la Velocidad',
    description: 'Desbloquea 5 Yo-kai en un solo día',
    icon: '⚡',
    category: 'special',
    condition: (medallium) => {
      const today = new Date().toDateString();
      const todayUnlocks = Object.values(medallium).filter(entry => 
        entry.unlockedDate && new Date(entry.unlockedDate).toDateString() === today
      );
      return todayUnlocks.length >= 5;
    },
    reward: { title: 'Velocista', points: 150 },
    hidden: true
  },
  {
    id: 'completionist',
    name: 'Completista Total',
    description: 'Desbloquea todos los Yo-kai disponibles',
    icon: '🏆',
    category: 'special',
    condition: (medallium, allYokai) => {
      return Object.keys(medallium).length === allYokai.length;
    },
    reward: { title: 'Completista Total', points: 1000 },
    hidden: true
  }
];

// Funciones para manejar logros
const ACHIEVEMENTS_KEY = 'yokaidle_achievements';

export function loadAchievements(): AchievementProgress {
  if (typeof window === 'undefined') return {};
  
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }
  return {};
}

export function saveAchievements(achievements: AchievementProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
}

export function checkAchievements(medallium: MedalliumData, allYokai: Yokai[]): Achievement[] {
  const currentProgress = loadAchievements();
  const newlyUnlocked: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    const isCurrentlyUnlocked = currentProgress[achievement.id]?.unlocked || false;
    
    if (!isCurrentlyUnlocked && achievement.condition(medallium, allYokai)) {
      // Logro desbloqueado!
      currentProgress[achievement.id] = {
        unlocked: true,
        unlockedDate: new Date().toISOString()
      };
      newlyUnlocked.push(achievement);
    }
  });
  
  if (newlyUnlocked.length > 0) {
    saveAchievements(currentProgress);
  }
  
  return newlyUnlocked;
}

export function getAchievementStats(): {
  total: number;
  unlocked: number;
  percentage: number;
  totalPoints: number;
  earnedPoints: number;
} {
  const progress = loadAchievements();
  const total = ACHIEVEMENTS.length;
  const unlocked = Object.values(progress).filter(p => p.unlocked).length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  
  const totalPoints = ACHIEVEMENTS.reduce((sum, achievement) => 
    sum + (achievement.reward?.points || 0), 0
  );
  
  const earnedPoints = ACHIEVEMENTS
    .filter(achievement => progress[achievement.id]?.unlocked)
    .reduce((sum, achievement) => sum + (achievement.reward?.points || 0), 0);
  
  return {
    total,
    unlocked,
    percentage,
    totalPoints,
    earnedPoints
  };
}

export function getUnlockedAchievements(): Achievement[] {
  const progress = loadAchievements();
  return ACHIEVEMENTS.filter(achievement => progress[achievement.id]?.unlocked);
}

export function getLockedAchievements(): Achievement[] {
  const progress = loadAchievements();
  return ACHIEVEMENTS.filter(achievement => !progress[achievement.id]?.unlocked && !achievement.hidden);
}
