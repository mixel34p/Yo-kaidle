// Sistema de economía global para Yo-kaidle
// Gestiona los puntos del usuario que se pueden ganar de logros y usar en la tienda

import { triggerSync } from '@/utils/cloudSyncManager';

const ECONOMY_KEY = 'yokaidle_economy';

export interface EconomyData {
  points: number; // Puntos totales del usuario
  totalEarned: number; // Total de puntos ganados históricamente
  totalSpent: number; // Total de puntos gastados históricamente
  lastUpdated: string; // Fecha de última actualización
}

export interface PointsTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string; // 'achievement', 'daily_bonus', 'shop_purchase', etc.
  description: string;
  timestamp: string;
}

// Cargar datos de economía del localStorage
export function loadEconomy(): EconomyData {
  try {
    const saved = localStorage.getItem(ECONOMY_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Migración: añadir totalSpent si no existe
      if (data.totalSpent === undefined) {
        data.totalSpent = 0;
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading economy data:', error);
  }

  // Datos por defecto
  return {
    points: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastUpdated: new Date().toISOString()
  };
}

// Guardar datos de economía en localStorage
export function saveEconomy(data: EconomyData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(ECONOMY_KEY, JSON.stringify(data));
    // Trigger cloud sync
    triggerSync();
  } catch (error) {
    console.error('Error saving economy data:', error);
  }
}

// Añadir puntos al usuario
export function addPoints(amount: number, source: string, description: string): EconomyData {
  const economy = loadEconomy();

  economy.points += amount;
  economy.totalEarned += amount;

  saveEconomy(economy);

  // Registrar la transacción (opcional, para historial futuro)
  logTransaction({
    id: generateTransactionId(),
    type: 'earn',
    amount,
    source,
    description,
    timestamp: new Date().toISOString()
  });

  return economy;
}

// Gastar puntos del usuario
export function spendPoints(amount: number, source: string, description: string): EconomyData | null {
  const economy = loadEconomy();

  if (economy.points < amount) {
    return null; // No hay suficientes puntos
  }

  economy.points -= amount;
  economy.totalSpent = (economy.totalSpent || 0) + amount;

  saveEconomy(economy);

  // Registrar la transacción
  logTransaction({
    id: generateTransactionId(),
    type: 'spend',
    amount,
    source,
    description,
    timestamp: new Date().toISOString()
  });

  return economy;
}

// Obtener puntos actuales del usuario
export function getCurrentPoints(): number {
  return loadEconomy().points;
}

// Verificar si el usuario tiene suficientes puntos
export function hasEnoughPoints(amount: number): boolean {
  return getCurrentPoints() >= amount;
}

// Generar ID único para transacciones
function generateTransactionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Registrar transacción (para historial futuro)
function logTransaction(transaction: PointsTransaction): void {
  try {
    const historyKey = 'yokaidle_transactions';
    const saved = localStorage.getItem(historyKey);
    const history: PointsTransaction[] = saved ? JSON.parse(saved) : [];

    history.push(transaction);

    // Mantener solo las últimas 100 transacciones
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (error) {
    console.error('Error logging transaction:', error);
  }
}

// Función para añadir puntos por adivinar Yo-kai
export function addPointsForGuess(gameMode: 'daily' | 'infinite', yokaiName: string): number {
  const pointsEarned = gameMode === 'daily' ? 25 : 5;

  const economy = loadEconomy();
  economy.points += pointsEarned;
  economy.totalEarned += pointsEarned;
  saveEconomy(economy);

  logTransaction({
    id: generateTransactionId(),
    type: 'earn',
    amount: pointsEarned,
    source: gameMode === 'daily' ? 'daily_guess' : 'infinite_guess',
    description: `Yo-kai adivinado (${gameMode}): ${yokaiName}`,
    timestamp: new Date().toISOString()
  });

  return pointsEarned;
}

// Obtener historial de transacciones (para futuras funcionalidades)
export function getTransactionHistory(): PointsTransaction[] {
  try {
    const historyKey = 'yokaidle_transactions';
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading transaction history:', error);
    return [];
  }
}

// Resetear economía (para desarrollo/testing)
export function resetEconomy(): void {
  localStorage.removeItem(ECONOMY_KEY);
  localStorage.removeItem('yokaidle_transactions');
}

// Obtener estadísticas de economía
export function getEconomyStats(): {
  currentPoints: number;
  totalEarned: number;
  totalSpent: number;
  transactionCount: number;
} {
  const economy = loadEconomy();
  const history = getTransactionHistory();

  const totalSpent = history
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    currentPoints: economy.points,
    totalEarned: economy.totalEarned,
    totalSpent,
    transactionCount: history.length
  };
}
