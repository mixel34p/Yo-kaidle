import { MedalliumData } from './medalliumManager';
import { Yokai, Tribe, Game } from '@/types/yokai';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Puede ser emoji o ruta de imagen
  category: 'collection' | 'tribe' | 'game' | 'rank' | 'special';
  condition: (medallium: MedalliumData, allYokai: Yokai[]) => boolean;
  reward?: {
    points?: number;
  };
  hidden?: boolean; // Logros secretos
}

// Función auxiliar para obtener yokais desbloqueados del medallium
function getUnlockedYokaiFromMedallium(medallium: MedalliumData): Yokai[] {
  return Object.values(medallium.unlockedYokai);
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
  // === LOGROS DE COLECCIÓN GENERAL ===
  {
    id: 'first_yokai',
    name: 'Primer Paso',
    description: 'Desbloquea tu primer Yo-kai',
    icon: '🥇',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 1,
    reward: { points: 10 }
  },
  {
    id: 'collector_5',
    name: 'Iniciado',
    description: 'Desbloquea 5 Yo-kai',
    icon: '📝',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 5,
    reward: { points: 25 }
  },
  {
    id: 'collector_10',
    name: 'Coleccionista Novato',
    description: 'Desbloquea 10 Yo-kai',
    icon: '📚',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 10,
    reward: { points: 50 }
  },
  {
    id: 'collector_25',
    name: 'Coleccionista Experimentado',
    description: 'Desbloquea 25 Yo-kai',
    icon: '📖',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 25,
    reward: { points: 100 }
  },
  {
    id: 'collector_50',
    name: 'Coleccionista Experto',
    description: 'Desbloquea 50 Yo-kai',
    icon: '🔥',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 50,
    reward: { points: 200 }
  },
  {
    id: 'collector_75',
    name: 'Coleccionista Veterano',
    description: 'Desbloquea 75 Yo-kai',
    icon: '⭐',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 75,
    reward: { points: 300 }
  },
  {
    id: 'collector_100',
    name: 'Maestro Coleccionista',
    description: 'Desbloquea 100 Yo-kai',
    icon: '👑',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 100,
    reward: { points: 500 }
  },
  {
    id: 'collector_150',
    name: 'Leyenda Viviente',
    description: 'Desbloquea 150 Yo-kai',
    icon: '🏆',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 150,
    reward: { points: 750 }
  },

  // === LOGROS POR TRIBU ===
  {
    id: 'tribe_charming_complete',
    name: 'Maestro de los Guapos',
    description: 'Completa la tribu Guapo',
    icon: '/images/tribes/charming.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const charmingYokai = allYokai.filter(y => y.tribe === 'Charming');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedCharming = unlockedYokai.filter(y => y.tribe === 'Charming');
      return charmingYokai.length > 0 && unlockedCharming.length === charmingYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_brave_complete',
    name: 'Maestro de los Valientes',
    description: 'Completa la tribu Valiente',
    icon: '/images/tribes/brave.PNG',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const braveYokai = allYokai.filter(y => y.tribe === 'Brave');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedBrave = unlockedYokai.filter(y => y.tribe === 'Brave');
      return braveYokai.length > 0 && unlockedBrave.length === braveYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_mysterious_complete',
    name: 'Maestro de los Misteriosos',
    description: 'Completa la tribu Misterioso',
    icon: '/images/tribes/mysterious.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const mysteriousYokai = allYokai.filter(y => y.tribe === 'Mysterious');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedMysterious = unlockedYokai.filter(y => y.tribe === 'Mysterious');
      return mysteriousYokai.length > 0 && unlockedMysterious.length === mysteriousYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_tough_complete',
    name: 'Maestro de los Robustos',
    description: 'Completa la tribu Robusta',
    icon: '/images/tribes/tough.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const toughYokai = allYokai.filter(y => y.tribe === 'Tough');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedTough = unlockedYokai.filter(y => y.tribe === 'Tough');
      return toughYokai.length > 0 && unlockedTough.length === toughYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_heartful_complete',
    name: 'Maestro de los Amables',
    description: 'Completa la tribu Amable',
    icon: '/images/tribes/heartful.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const heartfulYokai = allYokai.filter(y => y.tribe === 'Heartful');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedHeartful = unlockedYokai.filter(y => y.tribe === 'Heartful');
      return heartfulYokai.length > 0 && unlockedHeartful.length === heartfulYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_shady_complete',
    name: 'Maestro de los Oscuros',
    description: 'Completa la tribu Oscura',
    icon: '/images/tribes/shady.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const shadyYokai = allYokai.filter(y => y.tribe === 'Shady');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedShady = unlockedYokai.filter(y => y.tribe === 'Shady');
      return shadyYokai.length > 0 && unlockedShady.length === shadyYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_eerie_complete',
    name: 'Maestro de los Siniestros',
    description: 'Completa la tribu Siniestra',
    icon: '/images/tribes/eerie.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const eerieYokai = allYokai.filter(y => y.tribe === 'Eerie');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedEerie = unlockedYokai.filter(y => y.tribe === 'Eerie');
      return eerieYokai.length > 0 && unlockedEerie.length === eerieYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_slippery_complete',
    name: 'Maestro de los Escurridizos',
    description: 'Completa la tribu Escurridiza',
    icon: '/images/tribes/slippery.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const slipperyYokai = allYokai.filter(y => y.tribe === 'Slippery');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedSlippery = unlockedYokai.filter(y => y.tribe === 'Slippery');
      return slipperyYokai.length > 0 && unlockedSlippery.length === slipperyYokai.length;
    },
    reward: { points: 300 }
  },
  {
    id: 'tribe_wicked_complete',
    name: 'Maestro de los Maleficos',
    description: 'Completa la tribu Malefica',
    icon: '/images/tribes/wicked.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const wickedYokai = allYokai.filter(y => y.tribe === 'Wicked');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedWicked = unlockedYokai.filter(y => y.tribe === 'Wicked');
      return wickedYokai.length > 0 && unlockedWicked.length === wickedYokai.length;
    },
    reward: { points: 300 }
  },

  // === LOGROS POR JUEGO ===
  {
    id: 'game_yw1_complete',
    name: 'Maestro Yo-kai',
    description: 'Completa Yo-kai Watch 1',
    icon: '/images/games/yw1.png',
    category: 'game',
    condition: (medallium, allYokai) => {
      const yw1Yokai = allYokai.filter(y => y.game === 'Yo-kai Watch 1');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedYw1 = unlockedYokai.filter(y => y.game === 'Yo-kai Watch 1');
      return yw1Yokai.length > 0 && unlockedYw1.length === yw1Yokai.length;
    },
    reward: { points: 400 }
  },
  {
    id: 'game_yw2_complete',
    name: 'Coleccionista del pasado',
    description: 'Completa Yo-kai Watch 2',
    icon: '/images/games/yw2.png',
    category: 'game',
    condition: (medallium, allYokai) => {
      const yw2Yokai = allYokai.filter(y => y.game === 'Yo-kai Watch 2');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedYw2 = unlockedYokai.filter(y => y.game === 'Yo-kai Watch 2');
      return yw2Yokai.length > 0 && unlockedYw2.length === yw2Yokai.length;
    },
    reward: { points: 400 }
  },
  {
    id: 'game_yw3_complete',
    name: 'Coleccionista de America',
    description: 'Completa Yo-kai Watch 3',
    icon: '/images/games/yw3.png',
    category: 'game',
    condition: (medallium, allYokai) => {
      const yw3Yokai = allYokai.filter(y => y.game === 'Yo-kai Watch 3');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedYw3 = unlockedYokai.filter(y => y.game === 'Yo-kai Watch 3');
      return yw3Yokai.length > 0 && unlockedYw3.length === yw3Yokai.length;
    },
    reward: { points: 400 }
  },
  {
    id: 'game_blasters_complete',
    name: 'Comandante Blaster',
    description: 'Completa Yo-kai Watch Blasters',
    icon: '/images/games/ykwb.png',
    category: 'game',
    condition: (medallium, allYokai) => {
      const blastersYokai = allYokai.filter(y => y.game === 'Yo-kai Watch Blasters');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedBlasters = unlockedYokai.filter(y => y.game === 'Yo-kai Watch Blasters');
      return blastersYokai.length > 0 && unlockedBlasters.length === blastersYokai.length;
    },
    reward: { points: 400 }
  },
  {
    id: 'game_sangokushi_complete',
    name: 'Estratega de los Tres Reinos',
    description: 'Completa Yo-kai Watch Sangokushi',
    icon: '/images/games/sangokushi.png',
    category: 'game',
    condition: (medallium, allYokai) => {
      const sangokushiYokai = allYokai.filter(y => y.game === 'Yo-kai Watch Sangokushi');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedSangokushi = unlockedYokai.filter(y => y.game === 'Yo-kai Watch Sangokushi');
      return sangokushiYokai.length > 0 && unlockedSangokushi.length === sangokushiYokai.length;
    },
    reward: { points: 400 }
  },

  // === LOGROS POR RANGO ===
  {
    id: 'rank_e_collector',
    name: 'Coleccionista Principiante',
    description: 'Desbloquea 10 Yo-kai de rango E',
    icon: '/images/ranks/e.png',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const eRankYokai = unlockedYokai.filter(y => y.rank === 'E');
      return eRankYokai.length >= 10;
    },
    reward: { points: 100 }
  },
  {
    id: 'rank_d_collector',
    name: 'Coleccionista Básico',
    description: 'Desbloquea 15 Yo-kai de rango D',
    icon: '/images/ranks/d.png',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const dRankYokai = unlockedYokai.filter(y => y.rank === 'D');
      return dRankYokai.length >= 15;
    },
    reward: { points: 125 }
  },
  {
    id: 'rank_c_collector',
    name: 'Coleccionista Intermedio',
    description: 'Desbloquea 20 Yo-kai de rango C',
    icon: '/images/ranks/c.png',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const cRankYokai = unlockedYokai.filter(y => y.rank === 'C');
      return cRankYokai.length >= 20;
    },
    reward: { points: 150 }
  },
  {
    id: 'rank_b_collector',
    name: 'Coleccionista Avanzado',
    description: 'Desbloquea 15 Yo-kai de rango B',
    icon: '/images/ranks/b.png',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const bRankYokai = unlockedYokai.filter(y => y.rank === 'B');
      return bRankYokai.length >= 15;
    },
    reward: { points: 175 }
  },
  {
    id: 'rank_a_collector',
    name: 'Coleccionista Elite',
    description: 'Desbloquea 10 Yo-kai de rango A',
    icon: '/images/ranks/a.png',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const aRankYokai = unlockedYokai.filter(y => y.rank === 'A');
      return aRankYokai.length >= 10;
    },
    reward: { points: 200 }
  },
  {
    id: 'rank_s_collector',
    name: 'Cazador de Leyendas',
    description: 'Desbloquea 5 Yo-kai de rango S',
    icon: '/images/ranks/s.png',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const sRankYokai = unlockedYokai.filter(y => y.rank === 'S');
      return sRankYokai.length >= 5;
    },
    reward: { points: 250 }
  },

  // === LOGROS ESPECIALES ===
  {
    id: 'all_tribes_master',
    name: 'Maestro de Todas las Tribus',
    description: 'Completa todas las tribus disponibles',
    icon: '👑',
    category: 'special',
    condition: (medallium, allYokai) => {
      const allTribes = Array.from(new Set(allYokai.map(y => y.tribe)));
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);

      return allTribes.every(tribe => {
        const tribeYokai = allYokai.filter(y => y.tribe === tribe);
        const unlockedTribeYokai = unlockedYokai.filter(y => y.tribe === tribe);
        return tribeYokai.length > 0 && unlockedTribeYokai.length === tribeYokai.length;
      });
    },
    reward: { points: 1000 },
    hidden: true
  },
  {
    id: 'all_games_master',
    name: 'Maestro de Todos los Juegos',
    description: 'Completa todos los juegos disponibles',
    icon: '🎮',
    category: 'special',
    condition: (medallium, allYokai) => {
      const allGames = Array.from(new Set(allYokai.map(y => y.game)));
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);

      return allGames.every(game => {
        const gameYokai = allYokai.filter(y => y.game === game);
        const unlockedGameYokai = unlockedYokai.filter(y => y.game === game);
        return gameYokai.length > 0 && unlockedGameYokai.length === gameYokai.length;
      });
    },
    reward: { points: 1500 },
    hidden: true
  },
  {
    id: 'rank_perfectionist',
    name: 'Variedad de poder',
    description: 'Desbloquea al menos 5 Yo-kai de cada rango',
    icon: '⭐',
    category: 'special',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];

      return ranks.every(rank => {
        const rankYokai = unlockedYokai.filter(y => y.rank === rank);
        return rankYokai.length >= 5;
      });
    },
    reward: { points: 750 },
    hidden: false
  },
  {
    id: 'completionist',
    name: 'Maestro Yo-kai',
    description: 'Desbloquea todos los Yo-kai disponibles',
    icon: '🏆',
    category: 'special',
    condition: (medallium, allYokai) => {
      return medallium.totalUnlocked === allYokai.length;
    },
    reward: { points: 2000 },
    hidden: false
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
