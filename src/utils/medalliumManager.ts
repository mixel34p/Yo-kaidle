import { Yokai } from '@/types/yokai';

const MEDALLIUM_KEY = 'yokaidle_medallium';

// Tipo para los datos del medallium
export interface MedalliumData {
  unlockedYokai: Record<number, Yokai>;
  totalUnlocked: number;
}

// Inicializar medallium vacío
export function initMedallium(): MedalliumData {
  return {
    unlockedYokai: {},
    totalUnlocked: 0
  };
}

// Cargar datos del medallium desde localStorage
export function loadMedallium(): MedalliumData {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(MEDALLIUM_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return initMedallium();
}

// Guardar datos del medallium en localStorage
export function saveMedallium(data: MedalliumData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEDALLIUM_KEY, JSON.stringify(data));
  }
}

// Comprobar si un Yo-kai está desbloqueado
export function isYokaiUnlocked(medallium: MedalliumData, yokaiId: number): boolean {
  return !!medallium.unlockedYokai[yokaiId];
}

// Añadir un Yo-kai al medallium (si aún no está)
export function unlockYokai(medallium: MedalliumData, yokai: Yokai): MedalliumData {
  // Si ya está desbloqueado, no hacer nada
  if (isYokaiUnlocked(medallium, yokai.id)) {
    return medallium;
  }

  // Crear una copia del medallium actual para no modificar el original
  const updatedMedallium: MedalliumData = {
    unlockedYokai: { ...medallium.unlockedYokai },
    totalUnlocked: medallium.totalUnlocked + 1
  };

  // Añadir el nuevo Yo-kai
  updatedMedallium.unlockedYokai[yokai.id] = yokai;

  // Guardar los cambios
  saveMedallium(updatedMedallium);

  return updatedMedallium;
}

// Obtener todos los Yo-kai desbloqueados como array
export function getUnlockedYokaiArray(medallium: MedalliumData): Yokai[] {
  return Object.values(medallium.unlockedYokai);
}

// Filtrar los Yo-kai por tribu
export function filterByTribe(yokai: Yokai[], tribe: string | null): Yokai[] {
  if (!tribe) return yokai;
  return yokai.filter(y => y.tribe === tribe);
}

// Filtrar los Yo-kai por juego
export function filterByGame(yokai: Yokai[], game: string | null): Yokai[] {
  if (!game) return yokai;
  return yokai.filter(y => y.game === game);
}

// Ordenar los Yo-kai por número de medalla
export function sortByMedalNumber(yokai: Yokai[]): Yokai[] {
  return [...yokai].sort((a, b) => a.medalNumber - b.medalNumber);
}

// Ordenar los Yo-kai por nombre
export function sortByName(yokai: Yokai[]): Yokai[] {
  return [...yokai].sort((a, b) => a.name.localeCompare(b.name));
}

// Ordenar los Yo-kai por tribu
export function sortByTribe(yokai: Yokai[]): Yokai[] {
  return [...yokai].sort((a, b) => a.tribe.localeCompare(b.tribe));
}

// Calcular estadísticas para el medallium
export function calculateMedalliumStats(medallium: MedalliumData, totalYokai: number): {
  totalUnlocked: number;
  totalYokai: number;
  percentage: number;
} {
  const totalUnlocked = medallium.totalUnlocked;
  const percentage = totalYokai > 0 ? Math.round((totalUnlocked / totalYokai) * 100) : 0;

  return {
    totalUnlocked,
    totalYokai,
    percentage
  };
}

// Desbloquear TODOS los Yo-kai (función de debug/test)
export function unlockAllYokais(medallium: MedalliumData, allYokai: Yokai[]): MedalliumData {
  const updatedMedallium: MedalliumData = {
    unlockedYokai: { ...medallium.unlockedYokai },
    totalUnlocked: medallium.totalUnlocked
  };

  let newUnlockedCount = 0;

  allYokai.forEach(yokai => {
    if (!updatedMedallium.unlockedYokai[yokai.id]) {
      updatedMedallium.unlockedYokai[yokai.id] = yokai;
      newUnlockedCount++;
    }
  });

  updatedMedallium.totalUnlocked += newUnlockedCount;

  saveMedallium(updatedMedallium);

  return updatedMedallium;
}
