import { MedalliumData } from './medalliumManager';
import { Yokai, Tribe, Game, Rank, Element } from '@/types/yokai';

export interface TribeStats {
  tribe: Tribe;
  total: number;
  unlocked: number;
  percentage: number;
  lastUnlocked?: string;
}

export interface GameStats {
  game: Game;
  total: number;
  unlocked: number;
  percentage: number;
  lastUnlocked?: string;
}

export interface RankStats {
  rank: Rank;
  total: number;
  unlocked: number;
  percentage: number;
}

export interface ElementStats {
  element: Element;
  total: number;
  unlocked: number;
  percentage: number;
}

export interface CollectionActivity {
  date: string;
  count: number;
  yokaiNames: string[];
}

export interface AdvancedMedalliumStats {
  // Estadísticas generales
  totalYokai: number;
  unlockedYokai: number;
  percentage: number;
  
  // Estadísticas por categoría
  tribeStats: TribeStats[];
  gameStats: GameStats[];
  rankStats: RankStats[];
  elementStats: ElementStats[];
  
  // Actividad de colección
  recentActivity: CollectionActivity[];
  collectionStreak: number;
  bestStreak: number;
  
  // Datos de tiempo
  firstYokaiDate?: string;
  lastYokaiDate?: string;
  averagePerDay: number;
  
  // Próximos objetivos
  nextMilestones: {
    type: 'total' | 'tribe' | 'game';
    description: string;
    current: number;
    target: number;
    remaining: number;
  }[];
}

export function calculateAdvancedStats(
  medallium: MedalliumData,
  allYokai: Yokai[]
): AdvancedMedalliumStats {
  const unlockedYokai = Object.values(medallium.unlockedYokai);
  
  // Estadísticas generales
  const totalYokai = allYokai.length;
  const unlockedCount = unlockedYokai.length;
  const percentage = totalYokai > 0 ? Math.round((unlockedCount / totalYokai) * 100) : 0;
  
  // Estadísticas por tribu
  const tribeStats: TribeStats[] = [];
  const uniqueTribes = Array.from(new Set(allYokai.map(y => y.tribe))) as Tribe[];
  
  uniqueTribes.forEach(tribe => {
    const tribeYokai = allYokai.filter(y => y.tribe === tribe);
    const unlockedTribeYokai = unlockedYokai.filter(y => y.tribe === tribe);
    // Las fechas se manejan por separado en el componente
    const lastUnlocked = undefined;
    
    tribeStats.push({
      tribe,
      total: tribeYokai.length,
      unlocked: unlockedTribeYokai.length,
      percentage: tribeYokai.length > 0 ? Math.round((unlockedTribeYokai.length / tribeYokai.length) * 100) : 0,
      lastUnlocked
    });
  });
  
  // Estadísticas por juego
  const gameStats: GameStats[] = [];
  const uniqueGames = Array.from(new Set(allYokai.map(y => y.game))) as Game[];
  
  uniqueGames.forEach(game => {
    const gameYokai = allYokai.filter(y => y.game === game);
    const unlockedGameYokai = unlockedYokai.filter(y => y.game === game);
    // Las fechas se manejan por separado en el componente
    const lastUnlocked = undefined;
    
    gameStats.push({
      game,
      total: gameYokai.length,
      unlocked: unlockedGameYokai.length,
      percentage: gameYokai.length > 0 ? Math.round((unlockedGameYokai.length / gameYokai.length) * 100) : 0,
      lastUnlocked
    });
  });
  
  // Estadísticas por rango
  const rankStats: RankStats[] = [];
  const uniqueRanks = Array.from(new Set(allYokai.map(y => y.rank))) as Rank[];
  
  uniqueRanks.forEach(rank => {
    const rankYokai = allYokai.filter(y => y.rank === rank);
    const unlockedRankYokai = unlockedYokai.filter(y => y.rank === rank);
    
    rankStats.push({
      rank,
      total: rankYokai.length,
      unlocked: unlockedRankYokai.length,
      percentage: rankYokai.length > 0 ? Math.round((unlockedRankYokai.length / rankYokai.length) * 100) : 0
    });
  });
  
  // Estadísticas por elemento
  const elementStats: ElementStats[] = [];
  const uniqueElements = Array.from(new Set(allYokai.map(y => y.element))) as Element[];
  
  uniqueElements.forEach(element => {
    const elementYokai = allYokai.filter(y => y.element === element);
    const unlockedElementYokai = unlockedYokai.filter(y => y.element === element);
    
    elementStats.push({
      element,
      total: elementYokai.length,
      unlocked: unlockedElementYokai.length,
      percentage: elementYokai.length > 0 ? Math.round((unlockedElementYokai.length / elementYokai.length) * 100) : 0
    });
  });
  
  // Actividad de colección (simplificada)
  const recentActivity: CollectionActivity[] = [];
  // Las fechas se manejan por separado en el componente del medallium
  
  // Rachas simplificadas (sin fechas)
  const currentStreak = 0;
  const bestStreak = 0;

  // Fechas importantes (no disponibles en estructura base)
  const firstYokaiDate = undefined;
  const lastYokaiDate = undefined;

  // Promedio por día (simplificado)
  const averagePerDay = 0;
  
  // Próximos hitos
  const nextMilestones = calculateNextMilestones(unlockedCount, tribeStats, gameStats);
  
  return {
    totalYokai,
    unlockedYokai: unlockedCount,
    percentage,
    tribeStats: tribeStats.sort((a, b) => b.percentage - a.percentage),
    gameStats: gameStats.sort((a, b) => b.percentage - a.percentage),
    rankStats: rankStats.sort((a, b) => b.unlocked - a.unlocked),
    elementStats: elementStats.sort((a, b) => b.percentage - a.percentage),
    recentActivity,
    collectionStreak: currentStreak,
    bestStreak,
    firstYokaiDate,
    lastYokaiDate,
    averagePerDay,
    nextMilestones
  };
}

// Funciones auxiliares eliminadas - las fechas se manejan en el componente

function calculateNextMilestones(
  unlockedCount: number,
  tribeStats: TribeStats[],
  gameStats: GameStats[]
): AdvancedMedalliumStats['nextMilestones'] {
  const milestones = [];
  
  // Hitos de colección total
  const totalMilestones = [25, 50, 75, 100, 150, 200, 250, 300];
  const nextTotalMilestone = totalMilestones.find(m => m > unlockedCount);
  
  if (nextTotalMilestone) {
    milestones.push({
      type: 'total' as const,
      description: `Desbloquear ${nextTotalMilestone} Yo-kai`,
      current: unlockedCount,
      target: nextTotalMilestone,
      remaining: nextTotalMilestone - unlockedCount
    });
  }
  
  // Hitos de tribus (completar tribus)
  const incompleteTribe = tribeStats.find(tribe => 
    tribe.unlocked > 0 && tribe.unlocked < tribe.total
  );
  
  if (incompleteTribe) {
    milestones.push({
      type: 'tribe' as const,
      description: `Completar tribu ${incompleteTribe.tribe}`,
      current: incompleteTribe.unlocked,
      target: incompleteTribe.total,
      remaining: incompleteTribe.total - incompleteTribe.unlocked
    });
  }
  
  // Hitos de juegos (completar juegos)
  const incompleteGame = gameStats.find(game => 
    game.unlocked > 0 && game.unlocked < game.total
  );
  
  if (incompleteGame) {
    milestones.push({
      type: 'game' as const,
      description: `Completar ${incompleteGame.game}`,
      current: incompleteGame.unlocked,
      target: incompleteGame.total,
      remaining: incompleteGame.total - incompleteGame.unlocked
    });
  }
  
  return milestones.slice(0, 3); // Solo los 3 más próximos
}
