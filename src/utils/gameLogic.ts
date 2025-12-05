import { Yokai, GuessResult, GameState, GameMode } from '@/types/yokai';
import { triggerSocialStatsSync } from '@/hooks/useSocialStats';

export function compareYokai(dailyYokai: Yokai, guessedYokai: Yokai): GuessResult {
  const isCorrect = dailyYokai.id === guessedYokai.id;
  
  // SOLUCIÓN PARA LA COMIDA FAVORITA: Obtener los valores directamente de los objetos
  // y asegurar que ambos Yokai tengan valores válidos para la comida favorita
  let foodResult: 'correct' | 'incorrect' = 'incorrect';
  
  // Debug logs removed for cleaner console output
  
  // Asegurar que ambos valores estén definidos antes de compararlos
  if (dailyYokai.favoriteFood && guessedYokai.favoriteFood) {
    foodResult = (dailyYokai.favoriteFood === guessedYokai.favoriteFood) ? 'correct' : 'incorrect';
  }

  return {
    isCorrect,
    tribe: dailyYokai.tribe === guessedYokai.tribe ? 'correct' : 'incorrect',
    rank: dailyYokai.rank === guessedYokai.rank 
      ? 'correct' 
      : getRankComparison(dailyYokai.rank, guessedYokai.rank),
    element: dailyYokai.element === guessedYokai.element ? 'correct' : 'incorrect',
    game: dailyYokai.game === guessedYokai.game ? 'correct' : 'incorrect',
    weight: dailyYokai.weight === guessedYokai.weight 
      ? 'correct' 
      : dailyYokai.weight > guessedYokai.weight ? 'higher' : 'lower',
    medalNumber: dailyYokai.medalNumber === guessedYokai.medalNumber 
      ? 'correct' 
      : dailyYokai.medalNumber > guessedYokai.medalNumber ? 'higher' : 'lower',
    favoriteFood: foodResult,
  };
}

function getRankComparison(dailyRank: string, guessRank: string): 'higher' | 'lower' | 'incorrect' {
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const dailyRankIndex = ranks.indexOf(dailyRank);
  const guessRankIndex = ranks.indexOf(guessRank);
  
  if (dailyRankIndex === -1 || guessRankIndex === -1) {
    return 'incorrect';
  }
  
  if (dailyRankIndex > guessRankIndex) {
    return 'higher';
  } else {
    return 'lower';
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Normaliza el objeto Yokai para asegurar que tenga la propiedad favoriteFood
export function normalizeYokai(yokai: any): Yokai {
  return {
    ...yokai,
    favoriteFood: yokai.favoriteFood || yokai.favorite_food || '',
  };
}

// Guardar el estado del juego actual
export function saveGameToLocalStorage(gameState: GameState): void {
  if (typeof window !== 'undefined') {
    // Guardamos el estado general actual
    localStorage.setItem('yokaidleGameState', JSON.stringify(gameState));

    // También guardamos el último estado para cada modo por separado
    const modeKey = `yokaidle_${gameState.gameMode}_state`;
    localStorage.setItem(modeKey, JSON.stringify(gameState));
  }
}

// Cargar el estado del juego según el modo seleccionado
export function loadGameFromLocalStorage(mode: GameMode = 'daily'): GameState | null {
  if (typeof window !== 'undefined') {
    // Intentamos cargar primero el estado específico del modo seleccionado
    const modeKey = `yokaidle_${mode}_state`;
    const savedMode = localStorage.getItem(modeKey);
    
    if (savedMode) {
      return JSON.parse(savedMode);
    }
    
    // Si no hay estado específico para el modo, intentamos cargar el estado general
    // (para compatibilidad con versiones anteriores)
    const saved = localStorage.getItem('yokaidleGameState');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return null;
}

// Funcion para inicializar un nuevo estado de juego para modo infinito
export function createNewInfiniteGame(currentDate: string, randomYokai: any, savedState: GameState | null): GameState {
  // Si hay un estado guardado, mantenemos las estadísticas pero reiniciamos el juego actual
  if (savedState) {
    return {
      currentDate,
      dailyYokai: savedState.dailyYokai, // Mantener el Yo-kai diario separado
      infiniteYokai: randomYokai, // Asignar el nuevo Yo-kai aleatorio al campo infiniteYokai
      duelYokai: null, // Inicializar como null para el modo infinito
      guesses: [],
      maxGuesses: 6,
      gameStatus: 'playing',
      lastPlayedDate: null,
      gameMode: 'infinite',
      streak: 0, // No hay racha en modo infinito
      maxStreak: savedState.maxStreak,
      totalPlayed: savedState.totalPlayed,
      totalWins: savedState.totalWins,
      dailyStats: savedState.dailyStats || {
        streak: 0,
        maxStreak: 0,
        totalPlayed: 0,
        totalWins: 0
      },
      infiniteStats: savedState.infiniteStats || {
        totalPlayed: savedState.gameMode === 'infinite' ? savedState.totalPlayed : 0,
        totalWins: savedState.gameMode === 'infinite' ? savedState.totalWins : 0
      },
      duelStats: savedState.duelStats || {
        totalPlayed: 0,
        totalWins: 0,
        totalLosses: 0
      }
    };
  }
  
  // Estado completamente nuevo
  return {
    currentDate,
    dailyYokai: null, // No tocar el dailyYokai en modo infinito
    infiniteYokai: randomYokai, // Usar el campo dedicado para el infinito
    duelYokai: null, // Inicializar como null para el modo infinito
    guesses: [],
    maxGuesses: 6,
    gameStatus: 'playing',
    lastPlayedDate: null,
    gameMode: 'infinite',
    streak: 0,
    maxStreak: 0,
    totalPlayed: 0,
    totalWins: 0,
    dailyStats: {
      streak: 0,
      maxStreak: 0,
      totalPlayed: 0,
      totalWins: 0
    },
    infiniteStats: {
      totalPlayed: 0,
      totalWins: 0
    },
    duelStats: {
      totalPlayed: 0,
      totalWins: 0,
      totalLosses: 0
    }
  };
}
