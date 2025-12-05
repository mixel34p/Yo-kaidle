'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getShopItems, 
  getFeaturedItems, 
  purchaseItem, 
  validatePromoCode, 
  redeemPromoCode,
  getUserPurchases,
  getUserRedemptions,
  type ShopItem, 
  type CodeValidationResult, 
  type PurchaseResult, 
  type RedemptionResult,
  type PromoCodeRewards
} from '@/utils/shopManager';
import { getCurrentPoints } from '@/utils/economyManager';
import { getFrameName } from '@/utils/framesManager';
import { getBackgroundName } from '@/utils/backgroundsManager';
import { getTrackName } from '@/utils/jukeboxManager';

export interface UseShopReturn {
  // Estado
  shopItems: ShopItem[];
  featuredItems: ShopItem[];
  userPoints: number;
  loading: boolean;
  error: string | null;
  
  // Funciones de compra
  buyItem: (itemId: number) => Promise<PurchaseResult>;
  canAfford: (price: number) => boolean;
  
  // Funciones de códigos
  validateCode: (code: string) => Promise<CodeValidationResult>;
  redeemCode: (code: string) => Promise<RedemptionResult>;
  
  // Historial
  userPurchases: any[];
  userRedemptions: any[];
  
  // Utilidades
  refreshShop: () => Promise<void>;
  refreshPoints: () => void;
}

export function useShop(userId?: string): UseShopReturn {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<ShopItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [userRedemptions, setUserRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de la tienda
  const loadShopData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar artículos de la tienda
      const [items, featured] = await Promise.all([
        getShopItems(),
        getFeaturedItems()
      ]);

      setShopItems(items);
      setFeaturedItems(featured);

      // Cargar historial del usuario si está autenticado
      if (userId) {
        const [purchases, redemptions] = await Promise.all([
          getUserPurchases(userId),
          getUserRedemptions(userId)
        ]);
        setUserPurchases(purchases);
        setUserRedemptions(redemptions);
      }

    } catch (err) {
      console.error('Error loading shop data:', err);
      setError('Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Actualizar puntos del usuario
  const refreshPoints = useCallback(() => {
    setUserPoints(getCurrentPoints());
  }, []);

  // Verificar si puede permitirse un artículo
  const canAfford = useCallback((price: number) => {
    return userPoints >= price;
  }, [userPoints]);

  // Comprar artículo
  const buyItem = useCallback(async (itemId: number): Promise<PurchaseResult> => {
    if (!userId) {
      return { success: false, error: 'Debes iniciar sesión para comprar' };
    }

    try {
      const result = await purchaseItem(userId, itemId);
      
      if (result.success) {
        // Actualizar puntos y recargar datos
        refreshPoints();
        await loadShopData();
      }
      
      return result;
    } catch (error) {
      console.error('Error buying item:', error);
      return { success: false, error: 'Error al comprar el artículo' };
    }
  }, [userId, refreshPoints, loadShopData]);

  // Validar código promocional
  const validateCode = useCallback(async (code: string): Promise<CodeValidationResult> => {
    try {
      return await validatePromoCode(code);
    } catch (error) {
      console.error('Error validating code:', error);
      return {
        is_valid: false,
        code_id: null,
        error_message: 'Error al validar el código',
        rewards: null
      };
    }
  }, []);

  // Canjear código promocional
  const redeemCode = useCallback(async (code: string): Promise<RedemptionResult> => {
    if (!userId) {
      return { success: false, error: 'Debes iniciar sesión para canjear códigos' };
    }

    try {
      const result = await redeemPromoCode(userId, code);
      
      if (result.success) {
        // Actualizar puntos y recargar datos
        refreshPoints();
        await loadShopData();
      }
      
      return result;
    } catch (error) {
      console.error('Error redeeming code:', error);
      return { success: false, error: 'Error al canjear el código' };
    }
  }, [userId, refreshPoints, loadShopData]);

  // Refrescar tienda
  const refreshShop = useCallback(async () => {
    await loadShopData();
    refreshPoints();
  }, [loadShopData, refreshPoints]);

  // Cargar datos iniciales
  useEffect(() => {
    loadShopData();
    refreshPoints();
  }, [loadShopData, refreshPoints]);

  // Actualizar puntos cuando cambie el localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      refreshPoints();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar cambios internos
    const interval = setInterval(refreshPoints, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refreshPoints]);

  return {
    // Estado
    shopItems,
    featuredItems,
    userPoints,
    loading,
    error,
    
    // Funciones de compra
    buyItem,
    canAfford,
    
    // Funciones de códigos
    validateCode,
    redeemCode,
    
    // Historial
    userPurchases,
    userRedemptions,
    
    // Utilidades
    refreshShop,
    refreshPoints
  };
}

// Hook específico para códigos promocionales
export function usePromoCodes(userId?: string) {
  const [validationResult, setValidationResult] = useState<CodeValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const validateCodeWithState = useCallback(async (code: string) => {
    if (!code.trim()) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validatePromoCode(code);
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating code:', error);
      setValidationResult({
        is_valid: false,
        code_id: null,
        error_message: 'Error al validar el código',
        rewards: null
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const redeemCodeWithState = useCallback(async (code: string): Promise<RedemptionResult> => {
    if (!userId) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    setIsRedeeming(true);
    try {
      const result = await redeemPromoCode(userId, code);
      
      if (result.success) {
        // Limpiar validación después del canje exitoso
        setValidationResult(null);
      }
      
      return result;
    } catch (error) {
      console.error('Error redeeming code:', error);
      return { success: false, error: 'Error al canjear el código' };
    } finally {
      setIsRedeeming(false);
    }
  }, [userId]);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    isValidating,
    isRedeeming,
    validateCode: validateCodeWithState,
    redeemCode: redeemCodeWithState,
    clearValidation
  };
}

// Utilidades para mostrar recompensas
export function formatRewards(rewards: PromoCodeRewards, language: 'es' | 'en' | 'it' = 'es'): string[] {
  const formatted: string[] = [];

  const pointsText = language === 'en' ? 'points' : language === 'it' ? 'punti' : 'puntos';

  if (rewards.points) {
    formatted.push(`💰 ${rewards.points} ${pointsText}`);
  }

  if (rewards.frames && rewards.frames.length > 0) {
    rewards.frames.forEach(frameId => {
      const name = getFrameName(frameId, language);
      formatted.push(`🔳 ${name}`);
    });
  }

  if (rewards.backgrounds && rewards.backgrounds.length > 0) {
    rewards.backgrounds.forEach(bgId => {
      const name = getBackgroundName(bgId, language);
      formatted.push(`🖼️ ${name}`);
    });
  }

  if (rewards.tracks && rewards.tracks.length > 0) {
    rewards.tracks.forEach(trackId => {
      const name = getTrackName(trackId, language);
      formatted.push(`🎵 ${name}`);
    });
  }

  if (rewards.badges && rewards.badges.length > 0) {
    rewards.badges.forEach(badgeId => {
      formatted.push(`🏆 ${badgeId}`); // Las insignias mantienen su ID por ahora
    });
  }

  if (rewards.titles && rewards.titles.length > 0) {
    rewards.titles.forEach(titleId => {
      formatted.push(`👑 ${titleId}`); // Los títulos mantienen su ID por ahora
    });
  }

  if (rewards.yokai && rewards.yokai.length > 0) {
    rewards.yokai.forEach(yokaiName => {
      formatted.push(`👻 ${yokaiName}`);
    });
  }

  return formatted;
}
