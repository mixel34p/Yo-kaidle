import { MedalliumData } from './medalliumManager';
import { Yokai, Tribe, Game, GameState } from '@/types/yokai';
import { Language } from '@/contexts/LanguageContext';
import { addPoints, EconomyData, loadEconomy } from './economyManager';
import { unlockBackground, BackgroundId } from './backgroundsManager';
import { unlockTrack } from './jukeboxManager';
import { unlockBadge } from './badgesManager';
import { unlockFrame } from './framesManager';
import { unlockTitle } from './titlesManager';

// Contexto adicional para logros avanzados
export interface AchievementContext {
  medallium: MedalliumData;
  allYokai: Yokai[];
  gameStats?: GameState;
  economy?: EconomyData;
}

export interface Achievement {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  icon: string; // Puede ser emoji o ruta de imagen
  category: 'collection' | 'tribe' | 'game' | 'rank' | 'special' | 'performance' | 'economy';
  condition: (context: AchievementContext) => boolean;
  reward?: {
    points?: number;
    background?: string; // ID del fondo a desbloquear
    track?: string; // ID del track a desbloquear
    frame?: string; // ID del marco a desbloquear
    title?: string; // ID del título a desbloquear
    badge?: string; // ID de la insignia a desbloquear
  };
  hidden?: boolean; // Logros secretos
  // Nuevas propiedades para logros progresivos
  progressType?: 'boolean' | 'incremental';
  maxProgress?: number;
  currentProgress?: (context: AchievementContext) => number;
}

// Función auxiliar para obtener yokais desbloqueados del medallium
function getUnlockedYokaiFromMedallium(medallium: MedalliumData): Yokai[] {
  return Object.values(medallium.unlockedYokai);
}

// Función para cargar estadísticas del juego
function loadGameStats(): GameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem('yokaidle_game_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading game stats:', error);
  }
  return null;
}

// Función para crear contexto completo de logros
function createAchievementContext(medallium: MedalliumData, allYokai: Yokai[]): AchievementContext {
  return {
    medallium,
    allYokai,
    gameStats: loadGameStats(),
    economy: loadEconomy()
  };
}

// Obtener el nombre del logro según el idioma
export function getAchievementName(achievement: Achievement, language: Language): string {
  switch (language) {
    case 'en': return achievement.name_en;
    case 'it': return achievement.name_it;
    case 'es':
    default: return achievement.name_es;
  }
}

// Obtener la descripción del logro según el idioma
export function getAchievementDescription(achievement: Achievement, language: Language): string {
  switch (language) {
    case 'en': return achievement.description_en;
    case 'it': return achievement.description_it;
    case 'es':
    default: return achievement.description_es;
  }
}

// Reclamar recompensa de un logro
export function claimAchievementReward(achievementId: string): boolean {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement || !achievement.reward || (!achievement.reward.points && !achievement.reward.background && !achievement.reward.track && !achievement.reward.frame && !achievement.reward.title && !achievement.reward.badge)) {
    return false;
  }

  const progress = loadAchievements();
  const achievementProgress = progress[achievementId];

  // Verificar que el logro esté desbloqueado y la recompensa no haya sido reclamada
  if (!achievementProgress?.unlocked || achievementProgress.rewardClaimed) {
    return false;
  }

  const achievementName = achievement.name_es; // Usar nombre en español por defecto

  // Añadir puntos al sistema de economía si los hay
  if (achievement.reward.points) {
    addPoints(
      achievement.reward.points,
      'achievement',
      `Logro completado: ${achievementName}`
    );
  }

  // Desbloquear fondo si lo hay
  if (achievement.reward.background) {
    const backgroundUnlocked = unlockBackground(achievement.reward.background as BackgroundId);
    if (backgroundUnlocked) {
      console.log(`🖼️ Fondo desbloqueado por logro: ${achievement.reward.background}`);
    }
  }

  // Desbloquear track si lo hay
  if (achievement.reward.track) {
    const trackUnlocked = unlockTrack(achievement.reward.track);
    if (trackUnlocked) {
      console.log(`🎵 Track desbloqueado por logro: ${achievement.reward.track}`);
    }
  }

  // Desbloquear insignia si la hay
  if (achievement.reward.badge) {
    const badgeUnlocked = unlockBadge(achievement.reward.badge);
    if (badgeUnlocked) {
      console.log(`🏆 Insignia desbloqueada por logro: ${achievement.reward.badge}`);
    }
  }

  // Desbloquear marco si lo hay
  if (achievement.reward.frame) {
    const frameUnlocked = unlockFrame(achievement.reward.frame);
    if (frameUnlocked) {
      console.log(`🔳 Marco desbloqueado por logro: ${achievement.reward.frame}`);
    }
  }

  // Desbloquear título si lo hay
  if (achievement.reward.title) {
    const titleUnlocked = unlockTitle(achievement.reward.title);
    if (titleUnlocked) {
      console.log(`👑 Título desbloqueado por logro: ${achievement.reward.title}`);
    }
  }

  // Marcar la recompensa como reclamada
  achievementProgress.rewardClaimed = true;
  achievementProgress.rewardClaimedAt = new Date().toISOString();

  saveAchievements(progress);

  return true;
}

// Verificar si un logro tiene recompensa disponible para reclamar
export function hasClaimableReward(achievementId: string): boolean {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement || !achievement.reward || (!achievement.reward.points && !achievement.reward.background && !achievement.reward.track && !achievement.reward.frame && !achievement.reward.title && !achievement.reward.badge)) {
    return false;
  }

  const progress = loadAchievements();
  const achievementProgress = progress[achievementId];

  return achievementProgress?.unlocked === true && !achievementProgress.rewardClaimed;
}

// Obtener logros con recompensas disponibles para reclamar
export function getClaimableAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => hasClaimableReward(achievement.id));
}

// Verificar si un logro ya tiene la recompensa reclamada
export function isRewardClaimed(achievementId: string): boolean {
  const progress = loadAchievements();
  return progress[achievementId]?.rewardClaimed === true;
}

export interface AchievementProgress {
  [achievementId: string]: {
    unlocked: boolean;
    unlockedDate?: string;
    progress?: number;
    maxProgress?: number;
    rewardClaimed: boolean; // Nueva propiedad para saber si se reclamó la recompensa
    rewardClaimedAt?: string; // Fecha cuando se reclamó la recompensa
  };
}

// Definición de todos los logros disponibles
export const ACHIEVEMENTS: Achievement[] = [
  // === LOGROS DE COLECCIÓN GENERAL ===
  {
    id: 'first_yokai',
    name_es: 'Primer Paso',
    name_en: 'First Step',
    name_it: 'Primo Passo',
    description_es: 'Desbloquea tu primer Yo-kai',
    description_en: 'Unlock your first Yo-kai',
    description_it: 'Sblocca il tuo primo Yo-kai',
    icon: '🥇',
    category: 'collection',
    condition: (context) => context.medallium.totalUnlocked >= 1,
    reward: {
      background: 'yo-kaipad'
    }
  },
  {
    id: 'collector_5',
    name_es: 'Iniciado',
    name_en: 'Beginner',
    name_it: 'Principiante',
    description_es: 'Desbloquea 5 Yo-kai',
    description_en: 'Unlock 5 Yo-kai',
    description_it: 'Sblocca 5 Yo-kai',
    icon: '📝',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 5,
    reward: { points: 25 }
  },
  {
    id: 'collector_10',
    name_es: 'Coleccionista Novato',
    name_en: 'Novice Collector',
    name_it: 'Collezionista Novizio',
    description_es: 'Desbloquea 10 Yo-kai',
    description_en: 'Unlock 10 Yo-kai',
    description_it: 'Sblocca 10 Yo-kai',
    icon: '📚',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 10,
    reward: {
      points: 50
    }
  },
  {
    id: 'collector_25',
    name_es: 'Coleccionista Experimentado',
    name_en: 'Experienced Collector',
    name_it: 'Collezionista Esperto',
    description_es: 'Desbloquea 25 Yo-kai',
    description_en: 'Unlock 25 Yo-kai',
    description_it: 'Sblocca 25 Yo-kai',
    icon: '📖',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 25,
    reward: { points: 100 }
  },
  {
    id: 'collector_50',
    name_es: 'Coleccionista Experto',
    name_en: 'Expert Collector',
    name_it: 'Collezionista Esperto',
    description_es: 'Desbloquea 50 Yo-kai',
    description_en: 'Unlock 50 Yo-kai',
    description_it: 'Sblocca 50 Yo-kai',
    icon: '🔥',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 50,
    reward: {
      points: 300
    }
  },
  {
    id: 'collector_75',
    name_es: 'Coleccionista Veterano',
    name_en: 'Veteran Collector',
    name_it: 'Collezionista Veterano',
    description_es: 'Desbloquea 75 Yo-kai',
    description_en: 'Unlock 75 Yo-kai',
    description_it: 'Sblocca 75 Yo-kai',
    icon: '⭐',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 75,
    reward: { points: 500 }
  },
  {
    id: 'collector_100',
    name_es: 'Maestro Coleccionista',
    name_en: 'Master Collector',
    name_it: 'Maestro Collezionista',
    description_es: 'Desbloquea 100 Yo-kai',
    description_en: 'Unlock 100 Yo-kai',
    description_it: 'Sblocca 100 Yo-kai',
    icon: '👑',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 100,
    reward: {
      points: 700
    }
  },
  {
    id: 'collector_150',
    name_es: 'Leyenda Viviente',
    name_en: 'Living Legend',
    name_it: 'Leggenda Vivente',
    description_es: 'Desbloquea 150 Yo-kai',
    description_en: 'Unlock 150 Yo-kai',
    description_it: 'Sblocca 150 Yo-kai',
    icon: '🏆',
    category: 'collection',
    condition: (medallium) => medallium.totalUnlocked >= 150,
    reward: { points: 1000 }
  },

  // === LOGROS POR TRIBU ===
  {
    id: 'tribe_brave_complete',
    name_es: 'Maestro de los Valientes',
    name_en: 'Brave Master',
    name_it: 'Maestro Coraggioso',
    description_es: 'Completa la tribu Valiente',
    description_en: 'Complete the Brave tribe',
    description_it: 'Completa la tribù Coraggiosa',
    icon: '/images/tribes/Brave.PNG',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const braveYokai = allYokai.filter(y => y.tribe === 'Brave');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedBrave = unlockedYokai.filter(y => y.tribe === 'Brave');
      return braveYokai.length > 0 && unlockedBrave.length === braveYokai.length;
    },
    reward: { badge: 'brave' }
  },
  {
    id: 'tribe_mysterious_complete',
    name_es: 'Maestro de los Misteriosos',
    name_en: 'Mysterious Master',
    name_it: 'Maestro Misterioso',
    description_es: 'Completa la tribu Misterioso',
    description_en: 'Complete the Mysterious tribe',
    description_it: 'Completa la tribù Misteriosa',
    icon: '/images/tribes/mysterious.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const mysteriousYokai = allYokai.filter(y => y.tribe === 'Mysterious');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedMysterious = unlockedYokai.filter(y => y.tribe === 'Mysterious');
      return mysteriousYokai.length > 0 && unlockedMysterious.length === mysteriousYokai.length;
    },
    reward: { badge: 'mysterious' }
  },
  {
    id: 'tribe_tough_complete',
    name_es: 'Maestro de los Robustos',
    name_en: 'Tough Master',
    name_it: 'Maestro Robusto',
    description_es: 'Completa la tribu Robusto',
    description_en: 'Complete the Tough tribe',
    description_it: 'Completa la tribù Robusta',
    icon: '/images/tribes/tough.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const toughYokai = allYokai.filter(y => y.tribe === 'Tough');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedTough = unlockedYokai.filter(y => y.tribe === 'Tough');
      return toughYokai.length > 0 && unlockedTough.length === toughYokai.length;
    },
    reward: { badge: 'tough' }
  },
  {
    id: 'tribe_charming_complete',
    name_es: 'Maestro de los Guapos',
    name_en: 'Charming Master',
    name_it: 'Maestro Affascinante',
    description_es: 'Completa la tribu Guapo',
    description_en: 'Complete the Charming tribe',
    description_it: 'Completa la tribù Affascinante',
    icon: '/images/tribes/charming.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const charmingYokai = allYokai.filter(y => y.tribe === 'Charming');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedCharming = unlockedYokai.filter(y => y.tribe === 'Charming');
      return charmingYokai.length > 0 && unlockedCharming.length === charmingYokai.length;
    },
    reward: { badge: 'charming' }
  },
  {
    id: 'tribe_heartful_complete',
    name_es: 'Maestro de los Amables',
    name_en: 'Heartful Master',
    name_it: 'Maestro Cordiale',
    description_es: 'Completa la tribu Amable',
    description_en: 'Complete the Heartful tribe',
    description_it: 'Completa la tribù Cordiale',
    icon: '/images/tribes/heartful.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const heartfulYokai = allYokai.filter(y => y.tribe === 'Heartful');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedHeartful = unlockedYokai.filter(y => y.tribe === 'Heartful');
      return heartfulYokai.length > 0 && unlockedHeartful.length === heartfulYokai.length;
    },
    reward: { badge: 'heartful' }
  },
  {
    id: 'tribe_shady_complete',
    name_es: 'Maestro de los Oscuros',
    name_en: 'Shady Master',
    name_it: 'Maestro Ombroso',
    description_es: 'Completa la tribu Oscuro',
    description_en: 'Complete the Shady tribe',
    description_it: 'Completa la tribù Ombrosa',
    icon: '/images/tribes/shady.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const shadyYokai = allYokai.filter(y => y.tribe === 'Shady');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedShady = unlockedYokai.filter(y => y.tribe === 'Shady');
      return shadyYokai.length > 0 && unlockedShady.length === shadyYokai.length;
    },
    reward: { badge: 'shady' }
  },
  {
    id: 'tribe_eerie_complete',
    name_es: 'Maestro de los Siniestros',
    name_en: 'Eerie Master',
    name_it: 'Maestro Inquietante',
    description_es: 'Completa la tribu Siniestro',
    description_en: 'Complete the Eerie tribe',
    description_it: 'Completa la tribù Inquietante',
    icon: '/images/tribes/eerie.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const eerieYokai = allYokai.filter(y => y.tribe === 'Eerie');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedEerie = unlockedYokai.filter(y => y.tribe === 'Eerie');
      return eerieYokai.length > 0 && unlockedEerie.length === eerieYokai.length;
    },
    reward: { badge: 'eerie' }
  },
  {
    id: 'tribe_slippery_complete',
    name_es: 'Maestro de los Escurridizos',
    name_en: 'Slippery Master',
    name_it: 'Maestro Scivoloso',
    description_es: 'Completa la tribu Escurridizo',
    description_en: 'Complete the Slippery tribe',
    description_it: 'Completa la tribù Scivolosa',
    icon: '/images/tribes/slippery.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const slipperyYokai = allYokai.filter(y => y.tribe === 'Slippery');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedSlippery = unlockedYokai.filter(y => y.tribe === 'Slippery');
      return slipperyYokai.length > 0 && unlockedSlippery.length === slipperyYokai.length;
    },
    reward: { badge: 'slippery'}
  },
  {
    id: 'tribe_wicked_complete',
    name_es: 'Maestro de los Maleficos',
    name_en: 'Wicked Master',
    name_it: 'Maestro Malvagio',
    description_es: 'Completa la tribu Maléfico',
    description_en: 'Complete the Wicked tribe',
    description_it: 'Completa la tribù Malvagia',
    icon: '/images/tribes/wicked.png',
    category: 'tribe',
    condition: (medallium, allYokai) => {
      const wickedYokai = allYokai.filter(y => y.tribe === 'Wicked');
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const unlockedWicked = unlockedYokai.filter(y => y.tribe === 'Wicked');
      return wickedYokai.length > 0 && unlockedWicked.length === wickedYokai.length;
    },
    reward: { badge: 'wicked' }
  },

  // === LOGROS POR JUEGO ===
  {
    id: 'game_yw1_complete',
    name_es: 'Coleccionista del Primer Medallium',
    name_en: 'First Medallium Collector',
    name_it: 'Collezionista del Primo Medallium',
    description_es: 'Completa Yo-kai Watch 1',
    description_en: 'Complete Yo-kai Watch 1',
    description_it: 'Completa Yo-kai Watch 1',
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
    name_es: 'Coleccionista del Pasado',
    name_en: 'Past Collector',
    name_it: 'Collezionista del Passato',
    description_es: 'Completa Yo-kai Watch 2',
    description_en: 'Complete Yo-kai Watch 2',
    description_it: 'Completa Yo-kai Watch 2',
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
    name_es: 'Coleccionista de América',
    name_en: 'America Collector',
    name_it: 'Collezionista d\'America',
    description_es: 'Completa Yo-kai Watch 3',
    description_en: 'Complete Yo-kai Watch 3',
    description_it: 'Completa Yo-kai Watch 3',
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
    name_es: 'Comandante Blaster',
    name_en: 'Blaster Commander',
    name_it: 'Comandante Blaster',
    description_es: 'Completa Yo-kai Watch Blasters',
    description_en: 'Complete Yo-kai Watch Blasters',
    description_it: 'Completa Yo-kai Watch Blasters',
    icon: '/images/games/ywb.png',
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
    name_es: 'Estratega de los Tres Reinos',
    name_en: 'Three Kingdoms Strategist',
    name_it: 'Stratega dei Tre Regni',
    description_es: 'Completa Yo-kai Watch Sangokushi',
    description_en: 'Complete Yo-kai Watch Sangokushi',
    description_it: 'Completa Yo-kai Watch Sangokushi',
    icon: '/images/games/ykws.png',
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
    name_es: 'Coleccionista Principiante',
    name_en: 'Beginner Collector',
    name_it: 'Collezionista Principiante',
    description_es: 'Desbloquea 10 Yo-kai de rango E',
    description_en: 'Unlock 10 E-rank Yo-kai',
    description_it: 'Sblocca 10 Yo-kai di rango E',
    icon: '/images/ranks/rank-e.png',
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
    name_es: 'Coleccionista Básico',
    name_en: 'Basic Collector',
    name_it: 'Collezionista Base',
    description_es: 'Desbloquea 15 Yo-kai de rango D',
    description_en: 'Unlock 15 D-rank Yo-kai',
    description_it: 'Sblocca 15 Yo-kai di rango D',
    icon: '/images/ranks/rank-d.png',
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
    name_es: 'Coleccionista Intermedio',
    name_en: 'Intermediate Collector',
    name_it: 'Collezionista Intermedio',
    description_es: 'Desbloquea 20 Yo-kai de rango C',
    description_en: 'Unlock 20 C-rank Yo-kai',
    description_it: 'Sblocca 20 Yo-kai di rango C',
    icon: '/images/ranks/rank-c.png',
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
    name_es: 'Coleccionista Avanzado',
    name_en: 'Advanced Collector',
    name_it: 'Collezionista Avanzato',
    description_es: 'Desbloquea 15 Yo-kai de rango B',
    description_en: 'Unlock 15 B-rank Yo-kai',
    description_it: 'Sblocca 15 Yo-kai di rango B',
    icon: '/images/ranks/rank-b.png',
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
    name_es: 'Coleccionista Elite',
    name_en: 'Elite Collector',
    name_it: 'Collezionista Elite',
    description_es: 'Desbloquea 10 Yo-kai de rango A',
    description_en: 'Unlock 10 A-rank Yo-kai',
    description_it: 'Sblocca 10 Yo-kai di rango A',
    icon: '/images/ranks/rank-a.png',
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
    name_es: 'Cazador de Leyendas',
    name_en: 'Legend Hunter',
    name_it: 'Cacciatore di Leggende',
    description_es: 'Desbloquea 5 Yo-kai de rango S',
    description_en: 'Unlock 5 S-rank Yo-kai',
    description_it: 'Sblocca 5 Yo-kai di rango S',
    icon: '/images/ranks/rank-s.png',
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
    id: 'rank_perfectionist',
    name_es: 'Variedad de Poder',
    name_en: 'Power Variety',
    name_it: 'Varietà di Potere',
    description_es: 'Desbloquea al menos 5 Yo-kai de cada rango',
    description_en: 'Unlock at least 5 Yo-kai of each rank',
    description_it: 'Sblocca almeno 5 Yo-kai di ogni rango',
    icon: '⭐',
    category: 'rank',
    condition: (medallium, allYokai) => {
      const unlockedYokai = getUnlockedYokaiFromMedallium(medallium);
      const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];

      return ranks.every(rank => {
        const rankYokai = unlockedYokai.filter(y => y.rank === rank);
        return rankYokai.length >= 5;
      });
    },
    reward: { 
		points: 500,
		background: 'yokai' 
	},
    hidden: false
  },
  {
    id: 'completionist',
    name_es: 'Maestro Yo-kai',
    name_en: 'Yo-kai Master',
    name_it: 'Maestro Yo-kai',
    description_es: 'Desbloquea todos los Yo-kai disponibles',
    description_en: 'Unlock all available Yo-kai',
    description_it: 'Sblocca tutti gli Yo-kai disponibili',
    icon: '🏆',
    category: 'special',
    condition: (context) => {
      return context.medallium.totalUnlocked === context.allYokai.length;
    },
    reward: { 
	 points: 2000,
	 title: 'clockmaster'
	},
  },

  // === LOGROS DE RENDIMIENTO ===
  {
    id: 'streak_5',
    name_es: 'Racha Inicial',
    name_en: 'Starting Streak',
    name_it: 'Striscia Iniziale',
    description_es: 'Consigue una racha de 5 victorias consecutivas',
    description_en: 'Get a streak of 5 consecutive wins',
    description_it: 'Ottieni una striscia di 5 vittorie consecutive',
    icon: '🔥',
    category: 'performance',
    condition: (context) => (context.gameStats?.maxStreak || 0) >= 5,
    reward: { 
		points: 100
	}
  },
  {
    id: 'streak_10',
    name_es: 'Racha Impresionante',
    name_en: 'Impressive Streak',
    name_it: 'Striscia Impressionante',
    description_es: 'Consigue una racha de 10 victorias consecutivas',
    description_en: 'Get a streak of 10 consecutive wins',
    description_it: 'Ottieni una striscia di 10 vittorie consecutive',
    icon: '🔥',
    category: 'performance',
    condition: (context) => (context.gameStats?.maxStreak || 0) >= 10,
    reward: { 
	 points: 250
	}
  },
  {
    id: 'streak_25',
    name_es: 'Racha Legendaria',
    name_en: 'Legendary Streak',
    name_it: 'Striscia Leggendaria',
    description_es: 'Consigue una racha de 25 victorias consecutivas',
    description_en: 'Get a streak of 25 consecutive wins',
    description_it: 'Ottieni una striscia di 25 vittorie consecutive',
    icon: '🔥',
    category: 'performance',
    condition: (context) => (context.gameStats?.maxStreak || 0) >= 25,
    reward: { 
	  points: 500,
	  badge: "streak"
	}
  },
  {
    id: 'daily_dedication',
    name_es: 'Dedicación Diaria',
    name_en: 'Daily Dedication',
    name_it: 'Dedizione Quotidiana',
    description_es: 'Juega 30 partidas en modo diario',
    description_en: 'Play 30 games in daily mode',
    description_it: 'Gioca 30 partite in modalità giornaliera',
    icon: '📅',
    category: 'performance',
    condition: (context) => (context.gameStats?.dailyStats.totalPlayed || 0) >= 30,
    reward: { 
		points: 200
	}
  },
  {
    id: 'infinite_explorer',
    name_es: 'Explorador Infinito',
    name_en: 'Infinite Explorer',
    name_it: 'Esploratore Infinito',
    description_es: 'Juega 100 partidas en modo infinito',
    description_en: 'Play 100 games in infinite mode',
    description_it: 'Gioca 100 partite in modalità infinita',
    icon: '♾️',
    category: 'performance',
    condition: (context) => (context.gameStats?.infiniteStats.totalPlayed || 0) >= 100,
    reward: { 
	  points: 300
	}
  },
  {
    id: 'victory_hunter',
    name_es: 'Cazador de Victorias',
    name_en: 'Victory Hunter',
    name_it: 'Cacciatore di Vittorie',
    description_es: 'Consigue 50 victorias totales',
    description_en: 'Get 50 total victories',
    description_it: 'Ottieni 50 vittorie totali',
    icon: '🏆',
    category: 'performance',
    condition: (context) => (context.gameStats?.totalWins || 0) >= 50,
    reward: { 
		points: 250
	}
  },
  {
    id: 'daily_perfectionist',
    name_es: 'Perfeccionista Diario',
    name_en: 'Daily Perfectionist',
    name_it: 'Perfezionista Quotidiano',
    description_es: 'Consigue 25 victorias en modo diario',
    description_en: 'Get 25 victories in daily mode',
    description_it: 'Ottieni 25 vittorie in modalità giornaliera',
    icon: '⭐',
    category: 'performance',
    condition: (context) => (context.gameStats?.dailyStats.totalWins || 0) >= 25,
    reward: { 
		points: 200
	}
  },

  // === LOGROS ECONÓMICOS ===
  {
    id: 'first_purchase',
    name_es: 'Primera Compra',
    name_en: 'First Purchase',
    name_it: 'Primo Acquisto',
    description_es: 'Realiza tu primera compra en la tienda',
    description_en: 'Make your first purchase in the shop',
    description_it: 'Fai il tuo primo acquisto nel negozio',
    icon: '🛒',
    category: 'economy',
    condition: (context) => (context.economy?.totalSpent || 0) > 0,
    reward: { points: 50, background: 'cherry_blossoms' }
  },
  {
    id: 'point_collector',
    name_es: 'Coleccionista de Puntos',
    name_en: 'Point Collector',
    name_it: 'Collezionista di Punti',
    description_es: 'Acumula 1000 puntos totales',
    description_en: 'Accumulate 1000 total points',
    description_it: 'Accumula 1000 punti totali',
    icon: '💰',
    category: 'economy',
    condition: (context) => (context.economy?.totalEarned || 0) >= 1000,
    reward: { points: 100, badge: 'point_collector' }
  },
  {
    id: 'big_spender',
    name_es: 'Gran Gastador',
    name_en: 'Big Spender',
    name_it: 'Grande Spendaccione',
    description_es: 'Gasta 500 puntos en la tienda',
    description_en: 'Spend 500 points in the shop',
    description_it: 'Spendi 500 punti nel negozio',
    icon: '💸',
    category: 'economy',
    condition: (context) => (context.economy?.totalSpent || 0) >= 500,
    reward: { points: 150, title: 'big_spender' }
  },
  {
    id: 'point_millionaire',
    name_es: 'Millonario de Puntos',
    name_en: 'Point Millionaire',
    name_it: 'Milionario di Punti',
    description_es: 'Acumula 10000 puntos totales',
    description_en: 'Accumulate 10000 total points',
    description_it: 'Accumula 10000 punti totali',
    icon: '💎',
    category: 'economy',
    condition: (context) => (context.economy?.totalEarned || 0) >= 10000,
    reward: { points: 500, frame: 'gold', badge: 'millionaire' }
  },
  {
    id: 'shopaholic',
    name_es: 'Adicto a las Compras',
    name_en: 'Shopaholic',
    name_it: 'Dipendente dallo Shopping',
    description_es: 'Gasta 2000 puntos en la tienda',
    description_en: 'Spend 2000 points in the shop',
    description_it: 'Spendi 2000 punti nel negozio',
    icon: '🛍️',
    category: 'economy',
    condition: (context) => (context.economy?.totalSpent || 0) >= 2000,
    reward: { points: 300, track: 'yww_medal_moments', title: 'shopaholic' }
  },
  {
    id: 'wealthy_collector',
    name_es: 'Coleccionista Adinerado',
    name_en: 'Wealthy Collector',
    name_it: 'Collezionista Benestante',
    description_es: 'Mantén 1000 puntos sin gastar',
    description_en: 'Keep 1000 points without spending',
    description_it: 'Mantieni 1000 punti senza spendere',
    icon: '🏦',
    category: 'economy',
    condition: (context) => (context.economy?.points || 0) >= 1000,
    reward: { points: 200, badge: 'wealthy' }
  }
];

// Funciones para manejar logros
const ACHIEVEMENTS_KEY = 'yokaidle_achievements';

export function loadAchievements(): AchievementProgress {
  if (typeof window === 'undefined') return {};

  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (saved) {
    try {
      const progress = JSON.parse(saved);

      // Migración: asegurar que todos los logros tengan las nuevas propiedades
      Object.keys(progress).forEach(achievementId => {
        if (progress[achievementId].rewardClaimed === undefined) {
          progress[achievementId].rewardClaimed = false;
        }
      });

      return progress;
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
  const context = createAchievementContext(medallium, allYokai);

  ACHIEVEMENTS.forEach(achievement => {
    const isCurrentlyUnlocked = currentProgress[achievement.id]?.unlocked || false;

    if (!isCurrentlyUnlocked && achievement.condition(context)) {
      // Logro desbloqueado!
      currentProgress[achievement.id] = {
        unlocked: true,
        unlockedDate: new Date().toISOString(),
        rewardClaimed: false // Por defecto, la recompensa no está reclamada
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

// Función auxiliar para actualizar logros existentes al nuevo formato
function updateLegacyAchievements() {
  // Esta función se ejecuta automáticamente para migrar logros antiguos
  ACHIEVEMENTS.forEach(achievement => {
    if (typeof achievement.condition === 'function') {
      const originalCondition = achievement.condition;
      // Verificar si la función ya usa el nuevo formato
      if (originalCondition.length === 1) {
        // Ya está actualizada
        return;
      }

      // Actualizar al nuevo formato
      achievement.condition = (context: AchievementContext) => {
        return (originalCondition as any)(context.medallium, context.allYokai);
      };
    }
  });
}

// Ejecutar migración automáticamente
updateLegacyAchievements();

export function getUnlockedAchievements(): Achievement[] {
  const progress = loadAchievements();
  return ACHIEVEMENTS.filter(achievement => progress[achievement.id]?.unlocked);
}

export function getLockedAchievements(): Achievement[] {
  const progress = loadAchievements();
  return ACHIEVEMENTS.filter(achievement => !progress[achievement.id]?.unlocked && !achievement.hidden);
}
