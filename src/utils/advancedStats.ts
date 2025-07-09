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
  const unlockedYokaiIds = Object.keys(medallium).map(id => parseInt(id));
  const unlockedYokai = allYokai.filter(yokai => unlockedYokaiIds.includes(yokai.id));
  
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
    const lastUnlocked = unlockedTribeYokai
      .map(y => medallium[y.id]?.unlockedDate)
      .filter(date => date)
      .sort()
      .pop();
    
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
    const lastUnlocked = unlockedGameYokai
      .map(y => medallium[y.id]?.unlockedDate)
      .filter(date => date)
      .sort()
      .pop();
    
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
  
  // Actividad de colección (últimos 30 días)
  const recentActivity: CollectionActivity[] = [];
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  last30Days.forEach(date => {
    const dayUnlocks = unlockedYokai.filter(yokai => {
      const unlockDate = medallium[yokai.id]?.unlockedDate;
      return unlockDate && unlockDate.split('T')[0] === date;
    });
    
    if (dayUnlocks.length > 0) {
      recentActivity.push({
        date,
        count: dayUnlocks.length,
        yokaiNames: dayUnlocks.map(y => y.name)
      });
    }
  });
  
  // Calcular rachas
  const { currentStreak, bestStreak } = calculateCollectionStreaks(medallium, unlockedYokai);
  
  // Fechas importantes
  const unlockDates = Object.values(medallium)
    .map(entry => entry.unlockedDate)
    .filter(date => date)
    .sort();
  
  const firstYokaiDate = unlockDates[0];
  const lastYokaiDate = unlockDates[unlockDates.length - 1];
  
  // Promedio por día
  let averagePerDay = 0;
  if (firstYokaiDate && lastYokaiDate) {
    const daysDiff = Math.max(1, Math.ceil(
      (new Date(lastYokaiDate).getTime() - new Date(firstYokaiDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
    averagePerDay = Math.round((unlockedCount / daysDiff) * 100) / 100;
  }
  
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

function calculateCollectionStreaks(medallium: MedalliumData, unlockedYokai: Yokai[]): {
  currentStreak: number;
  bestStreak: number;
} {
  const unlockDates = Object.values(medallium)
    .map(entry => entry.unlockedDate)
    .filter(date => date)
    .map(date => date.split('T')[0]) // Solo la fecha, sin hora
    .sort();
  
  if (unlockDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }
  
  // Agrupar por fecha
  const dateGroups = unlockDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueDates = Object.keys(dateGroups).sort();
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Verificar si hay actividad hoy o ayer para la racha actual
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Calcular racha actual (desde el final hacia atrás)
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const currentDate = uniqueDates[i];
    const expectedDate = i === uniqueDates.length - 1 ? 
      (currentDate === today || currentDate === yesterday ? currentDate : null) :
      getDateBefore(uniqueDates[i + 1]);
    
    if (currentDate === expectedDate || (i === uniqueDates.length - 1 && (currentDate === today || currentDate === yesterday))) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calcular mejor racha
  tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1];
    const currentDate = uniqueDates[i];
    const expectedDate = getDateAfter(prevDate);
    
    if (currentDate === expectedDate) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);
  
  return { currentStreak, bestStreak };
}

function getDateBefore(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getDateAfter(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

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
