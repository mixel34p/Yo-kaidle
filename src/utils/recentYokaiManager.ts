const RECENT_YOKAI_KEY = 'yokaidle_recent_yokai';
const MAX_RECENT_YOKAI = 50; // Máximo número de yokais recientes a recordar

export interface RecentYokaiEntry {
  id: number;
  name: string;
  timestamp: number;
  attempts: number;
  won: boolean;
}

// Obtener lista de yokais recientes
export function getRecentYokaiIds(count: number = 10): number[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(RECENT_YOKAI_KEY);
  if (!saved) return [];
  
  try {
    const recentYokais: RecentYokaiEntry[] = JSON.parse(saved);
    return recentYokais
      .sort((a, b) => b.timestamp - a.timestamp) // Más recientes primero
      .slice(0, count)
      .map(entry => entry.id);
  } catch (error) {
    console.error('Error loading recent yokais:', error);
    return [];
  }
}

// Obtener historial completo de yokais recientes
export function getRecentYokaiHistory(): RecentYokaiEntry[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(RECENT_YOKAI_KEY);
  if (!saved) return [];
  
  try {
    const recentYokais: RecentYokaiEntry[] = JSON.parse(saved);
    return recentYokais.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error loading recent yokai history:', error);
    return [];
  }
}

// Añadir un yokai al historial de recientes
export function addRecentYokai(yokai: { id: number; name: string }, attempts: number, won: boolean): void {
  if (typeof window === 'undefined') return;
  
  const newEntry: RecentYokaiEntry = {
    id: yokai.id,
    name: yokai.name,
    timestamp: Date.now(),
    attempts,
    won
  };
  
  try {
    const saved = localStorage.getItem(RECENT_YOKAI_KEY);
    let recentYokais: RecentYokaiEntry[] = saved ? JSON.parse(saved) : [];
    
    // Remover entrada anterior del mismo yokai si existe
    recentYokais = recentYokais.filter(entry => entry.id !== yokai.id);
    
    // Añadir nueva entrada al principio
    recentYokais.unshift(newEntry);
    
    // Mantener solo los más recientes
    if (recentYokais.length > MAX_RECENT_YOKAI) {
      recentYokais = recentYokais.slice(0, MAX_RECENT_YOKAI);
    }
    
    localStorage.setItem(RECENT_YOKAI_KEY, JSON.stringify(recentYokais));
  } catch (error) {
    console.error('Error saving recent yokai:', error);
  }
}

// Limpiar historial de yokais recientes
export function clearRecentYokaiHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_YOKAI_KEY);
}

// Obtener estadísticas de yokais recientes
export function getRecentYokaiStats(): {
  totalPlayed: number;
  totalWon: number;
  winRate: number;
  averageAttempts: number;
  bestStreak: number;
  currentStreak: number;
} {
  const history = getRecentYokaiHistory();
  
  if (history.length === 0) {
    return {
      totalPlayed: 0,
      totalWon: 0,
      winRate: 0,
      averageAttempts: 0,
      bestStreak: 0,
      currentStreak: 0
    };
  }
  
  const totalPlayed = history.length;
  const totalWon = history.filter(entry => entry.won).length;
  const winRate = totalPlayed > 0 ? (totalWon / totalPlayed) * 100 : 0;
  
  const wonEntries = history.filter(entry => entry.won);
  const averageAttempts = wonEntries.length > 0 
    ? wonEntries.reduce((sum, entry) => sum + entry.attempts, 0) / wonEntries.length 
    : 0;
  
  // Calcular rachas
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Recorrer desde el más reciente
  for (const entry of history) {
    if (entry.won) {
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak; // Solo contar la racha actual
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
      if (currentStreak > 0) currentStreak = 0; // Romper racha actual
    }
  }
  
  bestStreak = Math.max(bestStreak, tempStreak);
  if (currentStreak === 0 && tempStreak > 0) currentStreak = tempStreak;
  
  return {
    totalPlayed,
    totalWon,
    winRate: Math.round(winRate * 100) / 100,
    averageAttempts: Math.round(averageAttempts * 100) / 100,
    bestStreak,
    currentStreak
  };
}

// Verificar si un yokai fue jugado recientemente
export function wasPlayedRecently(yokaiId: number, withinCount: number = 10): boolean {
  const recentIds = getRecentYokaiIds(withinCount);
  return recentIds.includes(yokaiId);
}
