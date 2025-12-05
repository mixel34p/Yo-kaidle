import {
  YokaiCircle,
  CircleProgress,
  CirclesData,
  CircleStats,
  CircleCheckResult,
  CircleCategory,
  CircleDifficulty
} from '@/types/circles';
import { MedalliumData } from './medalliumManager';
import { Yokai } from '@/types/yokai';
import { Language } from '@/contexts/LanguageContext';
import circlesData from '@/data/circles.json';
import { addPoints } from './economyManager';
import { unlockBackground, BackgroundId } from './backgroundsManager';
import { unlockTrack } from './jukeboxManager';
import { unlockBadge } from './badgesManager';
import { unlockFrame } from './framesManager';
import { unlockTitle } from './titlesManager';

const CIRCLES_KEY = 'yokaidle_circles';

// Cargar todos los círculos disponibles
export function getAllCircles(): YokaiCircle[] {
  try {
    return circlesData.circles as YokaiCircle[];
  } catch (error) {
    console.error('Error loading circles data:', error);
    return [];
  }
}

// Obtener el nombre del círculo según el idioma
export function getCircleName(circle: YokaiCircle, language: Language): string {
  if (!circle) return '';
  
  switch (language) {
    case 'en': return circle.name_en || circle.name_es || '';
    case 'it': return circle.name_it || circle.name_es || '';
    case 'es':
    default: return circle.name_es || '';
  }
}

// Obtener la descripción del círculo según el idioma
export function getCircleDescription(circle: YokaiCircle, language: Language): string {
  if (!circle) return '';
  
  switch (language) {
    case 'en': return circle.description_en || circle.description_es || '';
    case 'it': return circle.description_it || circle.description_es || '';
    case 'es':
    default: return circle.description_es || '';
  }
}

// Verificar si una recompensa es válida
function hasValidReward(reward: any): boolean {
  if (!reward) return false;
  
  return !!(
    (reward.points && reward.points > 0) ||
    reward.background ||
    reward.track ||
    reward.frame ||
    reward.title ||
    reward.badge
  );
}

// Verificar si una recompensa específica existe en el sistema
export function validateRewardExists(reward: any): {
  isValid: boolean;
  missingItems: string[];
  errors: string[];
} {
  if (!reward) {
    return {
      isValid: false,
      missingItems: [],
      errors: ['Recompensa no definida']
    };
  }
  
  const missingItems: string[] = [];
  const errors: string[] = [];
  let hasValidItem = false;
  
  // Validar puntos
  if (reward.points !== undefined) {
    if (typeof reward.points === 'number' && reward.points > 0) {
      hasValidItem = true;
    } else {
      errors.push(`Puntos inválidos: ${reward.points}`);
    }
  }
  
  // Validar fondo
  if (reward.background) {
    // Aquí podrías validar si el fondo existe en el sistema
    hasValidItem = true;
  }
  
  // Validar track
  if (reward.track) {
    // Aquí podrías validar si el track existe en el sistema
    hasValidItem = true;
  }
  
  // Validar insignia
  if (reward.badge) {
    // Aquí podrías validar si la insignia existe en el sistema
    hasValidItem = true;
  }
  
  // Validar marco
  if (reward.frame) {
    // Aquí podrías validar si el marco existe en el sistema
    hasValidItem = true;
  }
  
  // Validar título
  if (reward.title) {
    // Aquí podrías validar si el título existe en el sistema
    hasValidItem = true;
  }
  
  return {
    isValid: hasValidItem && errors.length === 0,
    missingItems,
    errors
  };
}

// Inicializar datos de círculos vacíos
export function initCirclesData(): CirclesData {
  const allCircles = getAllCircles();
  const circles: Record<string, CircleProgress> = {};
  
  // Inicializar progreso para cada círculo
  allCircles.forEach(circle => {
    circles[circle.id] = {
      circleId: circle.id,
      unlockedYokai: [],
      isCompleted: false,
      progress: 0,
      rewardClaimed: false,
      rewardClaimedAt: undefined,
      completedAt: undefined
    };
  });

  return {
    circles,
    totalCircles: allCircles.length,
    completedCircles: 0,
    lastUpdated: new Date().toISOString()
  };
}

// Cargar datos de círculos desde localStorage
export function loadCirclesData(): CirclesData {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CIRCLES_KEY);
      if (saved) {
        const data = JSON.parse(saved) as CirclesData;
        const allCircles = getAllCircles();
        
        // Verificar si hay nuevos círculos que no están en los datos guardados
        const hasNewCircles = allCircles.some(circle => !data.circles[circle.id]);
        
        if (hasNewCircles) {
          // Añadir nuevos círculos manteniendo el progreso existente
          allCircles.forEach(circle => {
            if (!data.circles[circle.id]) {
              data.circles[circle.id] = {
                circleId: circle.id,
                unlockedYokai: [],
                isCompleted: false,
                progress: 0,
                rewardClaimed: false,
                rewardClaimedAt: undefined,
                completedAt: undefined
              };
            }
          });
          data.totalCircles = allCircles.length;
        }

        // Migración completa: asegurar que todos los círculos tengan todas las propiedades
        let needsSave = hasNewCircles;
        Object.keys(data.circles).forEach(circleId => {
          const circle = data.circles[circleId];
          
          if (circle.rewardClaimed === undefined) {
            circle.rewardClaimed = false;
            needsSave = true;
          }
          
          if (!circle.rewardClaimedAt) {
            circle.rewardClaimedAt = undefined;
            needsSave = true;
          }
          
          if (!circle.completedAt) {
            circle.completedAt = undefined;
            needsSave = true;
          }
        });
        
        if (needsSave) {
          saveCirclesData(data);
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error parsing circles data:', error);
    }
  }
  return initCirclesData();
}

// Guardar datos de círculos en localStorage
export function saveCirclesData(data: CirclesData): void {
  if (typeof window !== 'undefined') {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(CIRCLES_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving circles data:', error);
    }
  }
}

// Calcular el progreso de un círculo específico
export function calculateCircleProgress(
  circle: YokaiCircle, 
  medallium: MedalliumData,
  existingProgress?: CircleProgress
): CircleProgress {
  if (!circle || !medallium) {
    return {
      circleId: circle?.id || '',
      unlockedYokai: [],
      isCompleted: false,
      progress: 0,
      rewardClaimed: false,
      rewardClaimedAt: undefined,
      completedAt: undefined
    };
  }

  const unlockedYokaiNames = Object.values(medallium.unlockedYokai).map(yokai => yokai.name);
  const unlockedInCircle = circle.yokaiNames.filter(name => 
    unlockedYokaiNames.includes(name)
  );
  
  const progress = Math.round((unlockedInCircle.length / circle.yokaiNames.length) * 100);
  const isCompleted = unlockedInCircle.length === circle.yokaiNames.length;
  
  // Preservar datos existentes importantes
  const wasCompleted = existingProgress?.isCompleted || false;
  const completedAt = isCompleted 
    ? (existingProgress?.completedAt || (wasCompleted ? existingProgress?.completedAt : new Date().toISOString()))
    : undefined;
  
  return {
    circleId: circle.id,
    unlockedYokai: unlockedInCircle,
    isCompleted,
    progress,
    rewardClaimed: existingProgress?.rewardClaimed || false,
    rewardClaimedAt: existingProgress?.rewardClaimedAt,
    completedAt
  };
}

// Verificar y actualizar el progreso de todos los círculos
export function updateCirclesProgress(medallium: MedalliumData): CircleCheckResult[] {
  if (!medallium) return [];
  
  const circlesData = loadCirclesData();
  const allCircles = getAllCircles();
  const results: CircleCheckResult[] = [];
  
  let completedCount = 0;
  
  allCircles.forEach(circle => {
    const oldProgress = circlesData.circles[circle.id];
    const newProgress = calculateCircleProgress(circle, medallium, oldProgress);
    
    // Determinar qué Yo-kai son nuevos en este círculo
    const newlyUnlocked = newProgress.unlockedYokai.filter(name => 
      !oldProgress.unlockedYokai.includes(name)
    );
    
    // Actualizar el progreso
    circlesData.circles[circle.id] = newProgress;
    
    // Contar círculos completados (consistente: solo isCompleted)
    if (newProgress.isCompleted) {
      completedCount++;
    }
    
    results.push({
      circleId: circle.id,
      wasCompleted: oldProgress.isCompleted,
      isNowCompleted: newProgress.isCompleted,
      newlyUnlocked,
      progress: newProgress
    });
  });
  
  // Actualizar contadores globales
  circlesData.completedCircles = completedCount;
  
  // Guardar los cambios
  saveCirclesData(circlesData);
  
  return results;
}

// Verificar si un círculo específico se completó con un nuevo Yo-kai
export function checkCircleCompletion(
  yokai: Yokai, 
  medallium: MedalliumData
): CircleCheckResult[] {
  if (!yokai || !medallium) return [];
  
  const allCircles = getAllCircles();
  const results: CircleCheckResult[] = [];
  
  // Solo verificar círculos que contienen este Yo-kai
  const relevantCircles = allCircles.filter(circle => 
    circle.yokaiNames.includes(yokai.name)
  );
  
  if (relevantCircles.length === 0) {
    return results;
  }
  
  const circlesData = loadCirclesData();
  
  relevantCircles.forEach(circle => {
    const oldProgress = circlesData.circles[circle.id];
    const newProgress = calculateCircleProgress(circle, medallium, oldProgress);
    
    results.push({
      circleId: circle.id,
      wasCompleted: oldProgress.isCompleted,
      isNowCompleted: newProgress.isCompleted,
      newlyUnlocked: [yokai.name],
      progress: newProgress
    });
    
    // Actualizar el progreso
    circlesData.circles[circle.id] = newProgress;
  });
  
  // Recalcular el total de círculos completados (consistente)
  const completedCount = Object.values(circlesData.circles).filter(p => p.isCompleted).length;
  circlesData.completedCircles = completedCount;
  
  // Guardar los cambios
  saveCirclesData(circlesData);
  
  return results;
}

// Obtener estadísticas detalladas de círculos
export function getCircleStats(): CircleStats {
  const circlesData = loadCirclesData();
  const allCircles = getAllCircles();
  
  // Estadísticas por categoría
  const circlesByCategory: Record<CircleCategory, { total: number; completed: number; percentage: number }> = {
    story: { total: 0, completed: 0, percentage: 0 },
    tribe: { total: 0, completed: 0, percentage: 0 },
    element: { total: 0, completed: 0, percentage: 0 },
    special: { total: 0, completed: 0, percentage: 0 },
    legendary: { total: 0, completed: 0, percentage: 0 },
    friendship: { total: 0, completed: 0, percentage: 0 }
  };
  
  // Estadísticas por dificultad
  const circlesByDifficulty: Record<CircleDifficulty, { total: number; completed: number; percentage: number }> = {
    easy: { total: 0, completed: 0, percentage: 0 },
    medium: { total: 0, completed: 0, percentage: 0 },
    hard: { total: 0, completed: 0, percentage: 0 },
    legendary: { total: 0, completed: 0, percentage: 0 }
  };
  
  // Contar círculos por categoría y dificultad
  allCircles.forEach(circle => {
    const progress = circlesData.circles[circle.id];
    
    // Por categoría (completado = isCompleted para consistencia)
    circlesByCategory[circle.category].total++;
    if (progress.isCompleted) {
      circlesByCategory[circle.category].completed++;
    }

    // Por dificultad (completado = isCompleted para consistencia)
    circlesByDifficulty[circle.difficulty].total++;
    if (progress.isCompleted) {
      circlesByDifficulty[circle.difficulty].completed++;
    }
  });
  
  // Calcular porcentajes
  Object.keys(circlesByCategory).forEach(category => {
    const cat = category as CircleCategory;
    const stats = circlesByCategory[cat];
    stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  });
  
  Object.keys(circlesByDifficulty).forEach(difficulty => {
    const diff = difficulty as CircleDifficulty;
    const stats = circlesByDifficulty[diff];
    stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  });
  
  // Círculos completados recientemente (últimos 5)
  const recentlyCompleted = Object.values(circlesData.circles)
    .filter(p => p.isCompleted && p.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);
  
  // Próximos a completar (con mayor progreso pero no completados)
  const nextToComplete = allCircles
    .map(circle => ({
      circle,
      progress: circlesData.circles[circle.id],
      missingYokai: circle.yokaiNames.filter(name => 
        !circlesData.circles[circle.id].unlockedYokai.includes(name)
      )
    }))
    .filter(item => !item.progress.isCompleted && item.progress.progress > 0)
    .sort((a, b) => b.progress.progress - a.progress.progress)
    .slice(0, 3);
  
  const completedCircles = circlesData.completedCircles;
  const completionPercentage = circlesData.totalCircles > 0
    ? Math.round((completedCircles / circlesData.totalCircles) * 100)
    : 0;

  return {
    totalCircles: circlesData.totalCircles,
    completedCircles,
    completionPercentage,
    circlesByCategory,
    circlesByDifficulty,
    recentlyCompleted,
    nextToComplete
  };
}

// Obtener un círculo por ID
export function getCircleById(id: string): YokaiCircle | undefined {
  if (!id) return undefined;
  return getAllCircles().find(circle => circle.id === id);
}

// Obtener círculos por categoría
export function getCirclesByCategory(category: CircleCategory): YokaiCircle[] {
  if (!category) return [];
  return getAllCircles().filter(circle => circle.category === category);
}

// Obtener círculos por dificultad
export function getCirclesByDifficulty(difficulty: CircleDifficulty): YokaiCircle[] {
  if (!difficulty) return [];
  return getAllCircles().filter(circle => circle.difficulty === difficulty);
}

// === SISTEMA DE RECOMPENSAS DE CÍRCULOS ===

// Obtener información detallada de una recompensa para preview
export function getRewardPreview(reward: any, language: Language = 'es'): {
  type: string;
  id: string;
  name: string;
  description: string;
  icon: string;
}[] {
  if (!reward) return [];
  
  const rewards: any[] = [];
  
  // Puntos
  if (reward.points && reward.points > 0) {
    rewards.push({
      type: 'points',
      id: 'points',
      name: language === 'en' ? 'Points' : language === 'it' ? 'Punti' : 'Puntos',
      description: `+${reward.points} ${language === 'en' ? 'points' : language === 'it' ? 'punti' : 'puntos'}`,
      icon: '💰'
    });
  }
  
  // Fondo
  if (reward.background) {
    rewards.push({
      type: 'background',
      id: reward.background,
      name: language === 'en' ? 'Background' : language === 'it' ? 'Sfondo' : 'Fondo',
      description: reward.background,
      icon: '🖼️'
    });
  }
  
  // Música
  if (reward.track) {
    rewards.push({
      type: 'track',
      id: reward.track,
      name: language === 'en' ? 'Music Track' : language === 'it' ? 'Traccia Musicale' : 'Pista Musical',
      description: reward.track,
      icon: '🎵'
    });
  }
  
  // Insignia
  if (reward.badge) {
    rewards.push({
      type: 'badge',
      id: reward.badge,
      name: language === 'en' ? 'Badge' : language === 'it' ? 'Distintivo' : 'Insignia',
      description: reward.badge,
      icon: '🏆'
    });
  }
  
  // Marco
  if (reward.frame) {
    rewards.push({
      type: 'frame',
      id: reward.frame,
      name: language === 'en' ? 'Frame' : language === 'it' ? 'Cornice' : 'Marco',
      description: reward.frame,
      icon: '🔳'
    });
  }
  
  // Título
  if (reward.title) {
    rewards.push({
      type: 'title',
      id: reward.title,
      name: language === 'en' ? 'Title' : language === 'it' ? 'Titolo' : 'Título',
      description: reward.title,
      icon: '👑'
    });
  }
  
  return rewards;
}

// Reclamar recompensa de un círculo
export function claimCircleReward(circleId: string): boolean {
  if (!circleId) {
    console.error('❌ ID de círculo no válido');
    return false;
  }

  const circle = getCircleById(circleId);
  if (!circle) {
    console.error(`❌ Círculo ${circleId} no encontrado`);
    return false;
  }

  // Verificar que existe la propiedad reward
  if (!circle.reward) {
    console.error(`❌ Círculo ${circleId} no tiene definida ninguna recompensa`);
    return false;
  }

  if (!hasValidReward(circle.reward)) {
    console.error(`❌ Círculo ${circleId} no tiene recompensa válida`);
    return false;
  }

  const circlesData = loadCirclesData();
  const circleProgress = circlesData.circles[circleId];

  // VERIFICACIÓN ESTRICTA: Círculo completado Y recompensa NO reclamada
  if (!circleProgress?.isCompleted) {
    console.error(`❌ Círculo ${circleId} no está completado`);
    return false;
  }
  
  if (circleProgress.rewardClaimed) {
    console.error(`❌ Recompensa del círculo ${circleId} ya fue reclamada`);
    return false;
  }

  const circleName = getCircleName(circle, 'es');
  const reward = circle.reward; // Guardar referencia después de validación

  try {
    // Añadir puntos al sistema de economía si los hay
    if (reward.points && reward.points > 0) {
      addPoints(
        reward.points,
        'circle',
        `Círculo completado: ${circleName}`
      );
      console.log(`💰 +${reward.points} puntos por círculo: ${circleName}`);
    }

    // Desbloquear fondo si lo hay
    if (reward.background) {
      const backgroundUnlocked = unlockBackground(reward.background as BackgroundId);
      if (backgroundUnlocked) {
        console.log(`🖼️ Fondo desbloqueado por círculo: ${reward.background}`);
      }
    }

    // Desbloquear track si lo hay
    if (reward.track) {
      const trackUnlocked = unlockTrack(reward.track);
      if (trackUnlocked) {
        console.log(`🎵 Track desbloqueado por círculo: ${reward.track}`);
      }
    }

    // Desbloquear insignia si la hay
    if (reward.badge) {
      try {
        const badgeUnlocked = unlockBadge(reward.badge);
        if (badgeUnlocked) {
          console.log(`🏆 Insignia desbloqueada por círculo: ${reward.badge}`);
        } else {
          console.warn(`⚠️ No se pudo desbloquear la insignia: ${reward.badge}`);
        }
      } catch (error) {
        console.error(`❌ Error desbloqueando insignia ${reward.badge}:`, error);
      }
    }

    // Desbloquear marco si lo hay
    if (reward.frame) {
      try {
        const frameUnlocked = unlockFrame(reward.frame);
        if (frameUnlocked) {
          console.log(`🔳 Marco desbloqueado por círculo: ${reward.frame}`);
        } else {
          console.warn(`⚠️ No se pudo desbloquear el marco: ${reward.frame}`);
        }
      } catch (error) {
        console.error(`❌ Error desbloqueando marco ${reward.frame}:`, error);
      }
    }

    // Desbloquear título si lo hay
    if (reward.title) {
      try {
        const titleUnlocked = unlockTitle(reward.title);
        if (titleUnlocked) {
          console.log(`👑 Título desbloqueado por círculo: ${reward.title}`);
        } else {
          console.warn(`⚠️ No se pudo desbloquear el título: ${reward.title}`);
        }
      } catch (error) {
        console.error(`❌ Error desbloqueando título ${reward.title}:`, error);
      }
    }

    // MARCAR RECOMPENSA COMO RECLAMADA DE FORMA PERMANENTE
    circleProgress.rewardClaimed = true;
    circleProgress.rewardClaimedAt = new Date().toISOString();

    // Guardar inmediatamente
    saveCirclesData(circlesData);

    console.log(`✅ Recompensa del círculo "${circleName}" reclamada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error reclamando recompensa del círculo ${circleId}:`, error);
    return false;
  }
}

// Verificar si un círculo tiene recompensa disponible para reclamar
export function hasClaimableCircleReward(circleId: string): boolean {
  if (!circleId) return false;

  const circle = getCircleById(circleId);
  if (!circle || !circle.reward || !hasValidReward(circle.reward)) {
    return false;
  }

  const circlesData = loadCirclesData();
  const circleProgress = circlesData.circles[circleId];

  // Debe estar completado Y la recompensa NO debe haber sido reclamada
  return circleProgress?.isCompleted === true && circleProgress.rewardClaimed !== true;
}

// Verificar si un círculo ya tiene la recompensa reclamada
export function isCircleRewardClaimed(circleId: string): boolean {
  if (!circleId) return false;
  
  const circlesData = loadCirclesData();
  return circlesData.circles[circleId]?.rewardClaimed === true;
}

// Obtener círculos con recompensas disponibles para reclamar
export function getClaimableCircles(): YokaiCircle[] {
  return getAllCircles().filter(circle => hasClaimableCircleReward(circle.id));
}