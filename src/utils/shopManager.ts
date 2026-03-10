// Sistema de gestión de tienda para Yo-kaidle
// Maneja compras con puntos y códigos promocionales

import { supabase } from '@/lib/supabase';
import { addPoints, getCurrentPoints, spendPoints } from './economyManager';
import { unlockBackground, BackgroundId } from './backgroundsManager';
import { unlockTrack } from './jukeboxManager';
import { unlockFrame } from './framesManager';
import { unlockTitle } from './titlesManager';
import { unlockBadge } from './badgesManager';

export interface ShopItem {
  id: number;
  item_type: 'frame' | 'background' | 'track';
  item_id: string;
  price: number;
  is_featured: boolean;
  is_active: boolean;
  discount_percentage: number;
  final_price: number; // Precio con descuento aplicado
}

export interface PromoCode {
  id: number;
  code: string;
  name: string;
  description: string;
  max_uses: number | null;
  current_uses: number;
  status: 'active' | 'paused' | 'expired';
  valid_from: string;
  valid_until: string | null;
  rewards: PromoCodeRewards;
  created_by: string;
  notes: string;
}

export interface PromoCodeRewards {
  points?: number;
  frames?: string[];
  backgrounds?: string[];
  tracks?: string[];
  badges?: string[];
  titles?: string[];
  yokai?: string[];
}

export interface CodeValidationResult {
  is_valid: boolean;
  code_id: number | null;
  error_message: string | null;
  rewards: PromoCodeRewards | null;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  item_unlocked?: boolean;
}

export interface RedemptionResult {
  success: boolean;
  error?: string;
  rewards_applied?: PromoCodeRewards;
}

// Obtener artículos de la tienda
export async function getShopItems(): Promise<ShopItem[]> {
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('price', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      final_price: Math.round(item.price * (1 - item.discount_percentage / 100))
    }));
  } catch (error) {
    console.error('Error loading shop items:', error);
    return [];
  }
}

// Obtener artículos destacados
export async function getFeaturedItems(): Promise<ShopItem[]> {
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('price', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      final_price: Math.round(item.price * (1 - item.discount_percentage / 100))
    }));
  } catch (error) {
    console.error('Error loading featured items:', error);
    return [];
  }
}

// Comprar artículo con puntos
export async function purchaseItem(userId: string, itemId: number): Promise<PurchaseResult> {
  try {
    // Obtener información del artículo
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      return { success: false, error: 'Artículo no encontrado' };
    }

    const finalPrice = Math.round(item.price * (1 - item.discount_percentage / 100));
    const currentPoints = getCurrentPoints();

    // Verificar si tiene suficientes puntos
    if (currentPoints < finalPrice) {
      return { success: false, error: 'Puntos insuficientes' };
    }

    // Verificar si ya tiene el artículo desbloqueado
    const alreadyUnlocked = await checkIfItemUnlocked(item.item_type, item.item_id);
    if (alreadyUnlocked) {
      return { success: false, error: 'Ya tienes este artículo' };
    }

    // Descontar puntos
    const spendResult = spendPoints(finalPrice, 'shop_purchase', `Compra: ${item.item_type} ${item.item_id}`);
    if (!spendResult) {
      return { success: false, error: 'Error al procesar el pago' };
    }

    // Desbloquear el artículo
    const unlocked = await unlockItem(item.item_type, item.item_id);
    if (!unlocked) {
      // Revertir puntos si falla el desbloqueo
      addPoints(finalPrice, 'refund', `Reembolso: Error al desbloquear ${item.item_type} ${item.item_id}`);
      return { success: false, error: 'Error al desbloquear el artículo' };
    }

    // Registrar la compra en la base de datos
    const { error: purchaseError } = await supabase
      .from('shop_purchases')
      .insert({
        user_id: userId,
        item_id: item.id,
        price_paid: finalPrice,
        discount_applied: item.price - finalPrice
      });

    if (purchaseError) {
      console.error('Error registering purchase:', purchaseError);
      // No revertir la compra, solo loggear el error
    }

    return { success: true, item_unlocked: true };
  } catch (error) {
    console.error('Error purchasing item:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Verificar si un artículo ya está desbloqueado
async function checkIfItemUnlocked(itemType: string, itemId: string): Promise<boolean> {
  try {
    switch (itemType) {
      case 'frame':
        const { isFrameUnlocked } = await import('./framesManager');
        return isFrameUnlocked(itemId);
      case 'background':
        const { isBackgroundUnlocked } = await import('./backgroundsManager');
        return isBackgroundUnlocked(itemId as BackgroundId);
      case 'track':
        const { isTrackUnlocked } = await import('./jukeboxManager');
        return isTrackUnlocked(itemId);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking if item is unlocked:', error);
    return false;
  }
}

// Desbloquear artículo según su tipo
async function unlockItem(itemType: string, itemId: string): Promise<boolean> {
  try {
    switch (itemType) {
      case 'frame':
        return unlockFrame(itemId);
      case 'background':
        return unlockBackground(itemId as BackgroundId);
      case 'track':
        return unlockTrack(itemId);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error unlocking item:', error);
    return false;
  }
}

// Validar código promocional
export async function validatePromoCode(code: string): Promise<CodeValidationResult> {
  try {
    const { data, error } = await supabase
      .rpc('validate_promo_code', { code_text: code });

    if (error) throw error;

    const result = data[0];
    return {
      is_valid: result.is_valid,
      code_id: result.code_id,
      error_message: result.error_message,
      rewards: result.rewards
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return {
      is_valid: false,
      code_id: null,
      error_message: 'Error al validar el código',
      rewards: null
    };
  }
}

// Canjear código promocional
export async function redeemPromoCode(userId: string, code: string): Promise<RedemptionResult> {
  try {
    // Primero validar el código
    const validation = await validatePromoCode(code);
    if (!validation.is_valid || !validation.code_id || !validation.rewards) {
      return { success: false, error: validation.error_message || 'Código no válido' };
    }

    // Verificar si el usuario ya canjeó este código
    const { data: existingRedemption, error: redemptionCheckError } = await supabase
      .from('code_redemptions')
      .select('id')
      .eq('code_id', validation.code_id)
      .eq('user_id', userId)
      .single();

    if (existingRedemption) {
      return { success: false, error: 'Ya has canjeado este código' };
    }

    if (redemptionCheckError && redemptionCheckError.code !== 'PGRST116') {
      throw redemptionCheckError;
    }

    // Aplicar recompensas
    const rewardsApplied = await applyPromoRewards(validation.rewards);
    if (!rewardsApplied) {
      return { success: false, error: 'Error al aplicar las recompensas' };
    }

    // Registrar el canje
    const { error: redemptionError } = await supabase
      .from('code_redemptions')
      .insert({
        code_id: validation.code_id,
        user_id: userId,
        ip_address: null, // Se puede agregar después
        user_agent: navigator.userAgent
      });

    if (redemptionError) {
      console.error('Error registering redemption:', redemptionError);
      // No revertir las recompensas, solo loggear
    }

    // Incrementar contador de usos del código
    const { error: updateError } = await supabase
      .rpc('increment_code_usage', { code_id: validation.code_id });

    if (updateError) {
      console.error('Error updating code usage:', updateError);
    }

    return { success: true, rewards_applied: validation.rewards };
  } catch (error) {
    console.error('Error redeeming promo code:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Aplicar recompensas de código promocional
async function applyPromoRewards(rewards: PromoCodeRewards): Promise<boolean> {
  try {
    // Aplicar puntos
    if (rewards.points) {
      addPoints(rewards.points, 'promo_code', `Código promocional: ${rewards.points} puntos`);
    }

    // Desbloquear marcos
    if (rewards.frames) {
      for (const frameId of rewards.frames) {
        unlockFrame(frameId);
      }
    }

    // Desbloquear fondos
    if (rewards.backgrounds) {
      for (const backgroundId of rewards.backgrounds) {
        unlockBackground(backgroundId as BackgroundId);
      }
    }

    // Desbloquear música
    if (rewards.tracks) {
      for (const trackId of rewards.tracks) {
        unlockTrack(trackId);
      }
    }

    // Desbloquear insignias
    if (rewards.badges) {
      for (const badgeId of rewards.badges) {
        unlockBadge(badgeId);
      }
    }

    // Desbloquear títulos
    if (rewards.titles) {
      for (const titleId of rewards.titles) {
        unlockTitle(titleId);
      }
    }

    // Desbloquear Yo-kai (implementar después)
    if (rewards.yokai) {
      await unlockYokaiFromCode(rewards.yokai);
    }

    return true;
  } catch (error) {
    console.error('Error applying promo rewards:', error);
    return false;
  }
}

// Función para desbloquear Yo-kai desde códigos (implementar después)
// Función para desbloquear Yo-kai desde códigos
async function unlockYokaiFromCode(yokaiNames: string[]): Promise<void> {
  try {
    // Importar dinámicamente para evitar ciclos de dependencia si los hubiera
    const { loadMedallium, unlockYokai } = await import('./medalliumManager');
    const { getYokaiByName } = await import('@/lib/supabase');

    let medallium = loadMedallium();
    let updated = false;

    console.log('🎁 Procesando desbloqueo de Yo-kai por código:', yokaiNames);

    for (const name of yokaiNames) {
      try {
        // Buscar el Yo-kai en la base de datos
        const yokai = await getYokaiByName(name);

        if (yokai) {
          console.log(`✅ Yo-kai encontrado: ${yokai.name}, desbloqueando...`);
          // Desbloquear en el medallium local
          medallium = unlockYokai(medallium, yokai);
          updated = true;
        } else {
          console.warn(`⚠️ No se encontró el Yo-kai con nombre: ${name}`);
        }
      } catch (err) {
        console.error(`Error al procesar Yo-kai ${name}:`, err);
      }
    }

    if (updated) {
      console.log('💾 Medallium actualizado con nuevos Yo-kai');
      // No necesitamos guardar explícitamente porque unlockYokai ya lo hace,
      // pero si hiciéramos cambios en lote podríamos optimizarlo en el futuro.
    }
  } catch (error) {
    console.error('Error in unlockYokaiFromCode:', error);
  }
}

// Obtener historial de compras del usuario
export async function getUserPurchases(userId: string) {
  try {
    const { data, error } = await supabase
      .from('shop_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading user purchases:', error);
    return [];
  }
}

// Obtener códigos canjeados por el usuario
export async function getUserRedemptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('code_redemptions')
      .select(`
        *,
        promo_codes (
          code,
          name,
          description,
          rewards
        )
      `)
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading user redemptions:', error);
    return [];
  }
}
