'use client';

export interface BadgeData {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  image: string;
  unlockedAt?: string; // Fecha de desbloqueo
}

export interface BadgesState {
  unlockedBadges: Record<string, BadgeData>;
  lastUpdated: string;
}

// Insignias disponibles
export const AVAILABLE_BADGES: BadgeData[] = [
  {
    id: 'streak',
    name_es: 'Racha de 25',
    name_en: '25 streak',
    name_it: 'Striscia di 25',
    image: '/badges/explorer.png'
  },
  {
    id: 'charming',
    name_es: 'Guapo',
    name_en: 'Charming',
    name_it: 'Bello',
    image: '/badges/charming.png'
  },
  {
    id: 'brave',
    name_es: 'Valiente',
    name_en: 'Brave',
    name_it: 'Coraggioso',
    image: '/badges/Brave.PNG'
  },
  {
    id: 'mysterious',
    name_es: 'Misterioso',
    name_en: 'Mysterious',
    name_it: 'Misterioso',
    image: '/badges/mysterious.png'
  },
  {
    id: 'tough',
    name_es: 'Robusto',
    name_en: 'Tough',
    name_it: 'Robusto',
    image: '/badges/tough.png'
  },
  {
    id: 'heartful',
    name_es: 'Amable',
    name_en: 'Heartful',
    name_it: 'Gentile',
    image: '/badges/heartful.png'
  },
  {
    id: 'shady',
    name_es: 'Oscuro',
    name_en: 'Shady',
    name_it: 'Buio',
    image: '/badges/shady.png'
  },
  {
    id: 'eerie',
    name_es: 'Siniestro',
    name_en: 'Eerie',
    name_it: 'Sinistro',
    image: '/badges/eerie.png'
  },
  {
    id: 'slippery',
    name_es: 'Escurridizo',
    name_en: 'Slippery',
    name_it: 'Sfuggente',
    image: '/badges/slippery.png'
  },
  {
    id: 'wicked',
    name_es: 'Malefico',
    name_en: 'Wicked',
    name_it: 'Malvagio',
    image: '/badges/wicked.png'
  },
  {
    id: 'Enma',
    name_es: 'Enma',
    name_en: 'Enma',
    name_it: 'Enma',
    image: '/badges/enma.png'
  },
  {
    id: 'dev',
    name_es: 'Desarrollador',
    name_en: 'Developer',
    name_it: 'Sviluppatore',
    image: '/badges/dev.png'
  },
  {
    id: 'earth',
    name_es: 'Seguidor de Earth',
    name_en: 'Earth Follower',
    name_it: 'Earth seguace',
    image: '/badges/earthbadge.png'
  },
];

const BADGES_STORAGE_KEY = 'yokaidle-badges';

// Función para obtener el nombre traducido de una insignia
export function getBadgeName(badge: BadgeData, language: 'es' | 'en' | 'it'): string {
  switch (language) {
    case 'en': return badge.name_en;
    case 'it': return badge.name_it;
    case 'es':
    default: return badge.name_es;
  }
}

// Cargar estado de insignias desde localStorage
export function loadBadges(): BadgesState {
  if (typeof window === 'undefined') {
    return {
      unlockedBadges: {},
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    const saved = localStorage.getItem(BADGES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading badges from localStorage:', error);
  }

  return {
    unlockedBadges: {},
    lastUpdated: new Date().toISOString()
  };
}

// Guardar estado de insignias en localStorage
export function saveBadges(badgesState: BadgesState): void {
  if (typeof window === 'undefined') return;

  try {
    badgesState.lastUpdated = new Date().toISOString();
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badgesState));
  } catch (error) {
    console.error('Error saving badges to localStorage:', error);
  }
}

// Desbloquear una insignia
export function unlockBadge(badgeId: string): boolean {
  const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
  if (!badge) return false;

  const badgesState = loadBadges();
  
  // Si ya está desbloqueada, no hacer nada
  if (badgesState.unlockedBadges[badgeId]) {
    return false;
  }

  // Desbloquear la insignia
  badgesState.unlockedBadges[badgeId] = {
    ...badge,
    unlockedAt: new Date().toISOString()
  };

  saveBadges(badgesState);
  return true;
}

// Verificar si una insignia está desbloqueada
export function isBadgeUnlocked(badgeId: string): boolean {
  const badgesState = loadBadges();
  return !!badgesState.unlockedBadges[badgeId];
}

// Obtener todas las insignias desbloqueadas
export function getUnlockedBadges(): BadgeData[] {
  const badgesState = loadBadges();
  return Object.values(badgesState.unlockedBadges);
}

// Obtener insignias disponibles con estado de desbloqueo
export function getAllBadgesWithStatus(): (BadgeData & { unlocked: boolean })[] {
  const badgesState = loadBadges();
  
  return AVAILABLE_BADGES.map(badge => ({
    ...badge,
    unlocked: !!badgesState.unlockedBadges[badge.id]
  }));
}

// Actualizar insignias basado en estadísticas del juego
export function updateBadgesFromStats(gameState: any, medalliumStats: any): string[] {
  const newlyUnlocked: string[] = [];
  
  // Obtener estadísticas
  const totalWins = gameState?.totalWins || 0;
  const maxStreak = gameState?.maxStreak || 0;
  const totalPlayed = gameState?.totalPlayed || 0;
  const yokaiUnlockedCount = medalliumStats?.unlockedCount || 0;

  // Verificar cada insignia
  const badgesToCheck = [
    { id: 'first_win', condition: totalWins >= 1 },
    { id: 'streak_5', condition: maxStreak >= 5 },
    { id: 'streak_10', condition: maxStreak >= 10 },
    { id: 'streak_15', condition: maxStreak >= 15 },
    { id: 'collector_10', condition: yokaiUnlockedCount >= 10 },
    { id: 'collector_50', condition: yokaiUnlockedCount >= 50 },
    { id: 'collector_100', condition: yokaiUnlockedCount >= 100 },
    { id: 'collector_200', condition: yokaiUnlockedCount >= 200 },
    { id: 'perfect_game', condition: totalWins >= 1 }, // Simplificado por ahora
    { id: 'veteran', condition: totalPlayed >= 30 },
    { id: 'dedicated', condition: totalPlayed >= 100 },
    { id: 'explorer', condition: yokaiUnlockedCount >= 5 }, // Simplificado por ahora
  ];

  badgesToCheck.forEach(({ id, condition }) => {
    if (condition && !isBadgeUnlocked(id)) {
      if (unlockBadge(id)) {
        newlyUnlocked.push(id);
      }
    }
  });

  return newlyUnlocked;
}

// Limpiar todas las insignias (para testing)
export function clearAllBadges(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BADGES_STORAGE_KEY);
}
