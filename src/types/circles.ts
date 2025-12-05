import { Yokai } from './yokai';

// Tipo para un círculo de Yo-kai
export interface YokaiCircle {
  id: string;
  name_es: string; // Nombre en español
  name_en: string; // Nombre en inglés
  name_it: string; // Nombre en italiano
  description_es: string; // Descripción en español
  description_en: string; // Descripción en inglés
  description_it: string; // Descripción en italiano
  yokaiNames: string[]; // Nombres de Yo-kai en español (máximo 6)
  category: CircleCategory;
  difficulty: CircleDifficulty;
  icon?: string; // Emoji o ruta de imagen opcional
  reward?: CircleReward; // Recompensa por completar el círculo
}

// Categorías de círculos
export type CircleCategory = 
  | 'story' // Círculos relacionados con la historia principal
  | 'tribe' // Círculos por tribu
  | 'element' // Círculos por elemento
  | 'special' // Círculos especiales/temáticos
  | 'legendary' // Círculos de Yo-kai legendarios
  | 'friendship'; // Círculos de amistad/relaciones

// Dificultad de los círculos
export type CircleDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

// Recompensa por completar un círculo
export interface CircleReward {
  points?: number; // Puntos otorgados por completar el círculo
  background?: string; // ID del fondo a desbloquear
  track?: string; // ID del track a desbloquear
  frame?: string; // ID del marco a desbloquear
  title?: string; // ID del título a desbloquear
  badge?: string; // ID de la insignia a desbloquear
}

// Progreso de un círculo específico
export interface CircleProgress {
  circleId: string;
  unlockedYokai: string[]; // Nombres de Yo-kai desbloqueados en este círculo
  completedAt?: string; // Fecha de completado (ISO string)
  isCompleted: boolean;
  progress: number; // Porcentaje de 0 a 100
  rewardClaimed: boolean; // Si la recompensa ha sido reclamada
  rewardClaimedAt?: string; // Fecha cuando se reclamó la recompensa
}

// Datos completos del progreso de círculos
export interface CirclesData {
  circles: Record<string, CircleProgress>; // Mapeo de ID de círculo a progreso
  totalCircles: number;
  completedCircles: number;
  lastUpdated: string;
}

// Estadísticas de círculos
export interface CircleStats {
  totalCircles: number;
  completedCircles: number;
  completionPercentage: number;
  circlesByCategory: Record<CircleCategory, {
    total: number;
    completed: number;
    percentage: number;
  }>;
  circlesByDifficulty: Record<CircleDifficulty, {
    total: number;
    completed: number;
    percentage: number;
  }>;
  recentlyCompleted: CircleProgress[];
  nextToComplete: {
    circle: YokaiCircle;
    progress: CircleProgress;
    missingYokai: string[];
  }[];
}

// Resultado de verificación de círculo
export interface CircleCheckResult {
  circleId: string;
  wasCompleted: boolean; // Si ya estaba completado antes
  isNowCompleted: boolean; // Si se completó con esta verificación
  newlyUnlocked: string[]; // Yo-kai recién desbloqueados en este círculo
  progress: CircleProgress;
}

// Traducciones de círculos para el sistema multiidioma
export interface CircleTranslations {
  names: Record<string, string>; // nameKey -> nombre traducido
  descriptions: Record<string, string>; // descriptionKey -> descripción traducida
  categories: Record<CircleCategory, string>; // categoría -> nombre traducido
  difficulties: Record<CircleDifficulty, string>; // dificultad -> nombre traducido
}
