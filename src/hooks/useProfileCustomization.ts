'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadMedallium } from '@/utils/medalliumManager';
import { supabase } from '@/lib/supabase';
import { loadGameFromLocalStorage } from '@/utils/gameLogic';
import { getAllBadgesWithStatus, updateBadgesFromStats } from '@/utils/badgesManager';
import { getAllFramesWithStatus, getFrameName, getFrameDescription } from '@/utils/framesManager';
import { getAllTitlesWithStatus, getTitleName as getTitleNameFromManager, getTitleDescription as getTitleDescriptionFromManager } from '@/utils/titlesManager';
import { getUnlockedBackgrounds, Background, BackgroundId, AVAILABLE_BACKGROUNDS } from '@/utils/backgroundsManager';

// Función para obtener el nombre traducido de un título (wrapper para compatibilidad)
export function getTitleName(title: UnlockedTitle, language: 'es' | 'en' | 'it'): string {
  return getTitleNameFromManager(title, language);
}

// Función para obtener la descripción traducida de un título (wrapper para compatibilidad)
export function getTitleDescription(title: UnlockedTitle, language: 'es' | 'en' | 'it'): string {
  return getTitleDescriptionFromManager(title, language);
}

export interface ProfileCustomization {
  favoriteYokai: string | null;
  profileTitle: string | null;
  avatarFrame: string;
  profileBanner: string;
  selectedBadges: string[]; // Array de IDs de insignias (máximo 3)
}

export interface UnlockedYokai {
  id: string;
  name: string;
  image: string;
  tribe: string;
  rank: string;
}

export interface UnlockedTitle {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  unlocked: boolean;
}



export interface UnlockedFrame {
  id: string;
  name: string;
  image: string;
  unlocked: boolean;
}

export interface UnlockedBadge {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  image: string;
  unlocked: boolean;
}

const STORAGE_KEY = 'profileCustomization';

// Los títulos y marcos ahora se gestionan a través de sus respectivos managers



export function useProfileCustomization(userId?: string) {
  const [customization, setCustomization] = useState<ProfileCustomization>({
    favoriteYokai: null,
    profileTitle: null,
    avatarFrame: 'default',
    profileBanner: 'default',
    selectedBadges: []
  });

  const [unlockedYokai, setUnlockedYokai] = useState<UnlockedYokai[]>([]);
  const [availableTitles, setAvailableTitles] = useState<UnlockedTitle[]>([]);
  const [availableBadges, setAvailableBadges] = useState<UnlockedBadge[]>([]);
  const [availableFrames, setAvailableFrames] = useState<UnlockedFrame[]>([]);
  const [availableBackgrounds, setAvailableBackgrounds] = useState<Background[]>([]);

  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Cargar personalización desde Supabase
  const loadCustomization = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('favorite_yokai, profile_title, profile_theme, avatar_frame, profile_banner, selected_badges')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCustomization({
          favoriteYokai: data.favorite_yokai,
          profileTitle: data.profile_title,
          avatarFrame: data.avatar_frame || 'default',
          profileBanner: data.profile_banner || 'default',
          selectedBadges: data.selected_badges ? JSON.parse(data.selected_badges) : []
        });
      }
    } catch (error) {
      console.error('Error loading profile customization:', error);
      // Fallback a localStorage si falla Supabase
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCustomization(parsed);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    }
  }, [userId]);

  // Cargar Yo-kais desbloqueados del medallium
  const loadUnlockedYokai = useCallback(async () => {
    try {
      // Usar la función del medalliumManager
      const medallium = loadMedallium();
      console.log('Medallium loaded:', medallium); // Debug
      const unlocked: UnlockedYokai[] = [];

      if (medallium.unlockedYokai) {
        Object.entries(medallium.unlockedYokai).forEach(([yokaiId, yokai]: [string, any]) => {
          unlocked.push({
            id: yokaiId,
            name: yokai.name,
            image: yokai.imageurl || yokai.image_url || yokai.img || `/images/yokai/${yokaiId}.png`,
            tribe: yokai.tribe || 'Unknown',
            rank: yokai.rank || 'E'
          });
        });
      }

      console.log('Unlocked yokai:', unlocked); // Debug
      setUnlockedYokai(unlocked);
    } catch (error) {
      console.error('Error loading unlocked yokai:', error);
      setUnlockedYokai([]);
    }
  }, []);

  // Verificar qué elementos están desbloqueados basado en progreso
  const updateUnlockedItems = useCallback(() => {
    try {
      // Cargar datos del juego
      const gameState = loadGameFromLocalStorage();
      
      const medallium = loadMedallium();
      const yokaiUnlockedCount = Object.values(medallium.unlockedYokai).length;

      // Obtener títulos y marcos desde los managers
      const updatedTitles = getAllTitlesWithStatus();
      const updatedFrames = getAllFramesWithStatus();

      // Actualizar insignias desbloqueadas usando el manager
      updateBadgesFromStats(gameState, { unlockedCount: yokaiUnlockedCount });

      // Obtener todas las insignias con su estado actual
      const updatedBadges = getAllBadgesWithStatus();

      // Obtener fondos desbloqueados
      const unlockedBackgrounds = getUnlockedBackgrounds();

      setAvailableTitles(updatedTitles);
      setAvailableBadges(updatedBadges);
      setAvailableFrames(updatedFrames);
      setAvailableBackgrounds(unlockedBackgrounds);

    } catch (error) {
      console.error('Error updating unlocked items:', error);
    }
  }, []);

  // Guardar personalización
  const saveCustomization = useCallback(async (newCustomization: ProfileCustomization) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          favorite_yokai: newCustomization.favoriteYokai,
          profile_title: newCustomization.profileTitle,
          avatar_frame: newCustomization.avatarFrame,
          profile_banner: newCustomization.profileBanner,
          selected_badges: JSON.stringify(newCustomization.selectedBadges)
        })
        .eq('id', userId);

      if (error) throw error;

      // También guardar en localStorage como backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomization));

      setCustomization(newCustomization);
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving profile customization:', error);

      // Fallback a localStorage si falla Supabase
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomization));
        setCustomization(newCustomization);
        setHasUnsavedChanges(false);
        return true;
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        return false;
      }
    }
  }, [userId]);

  // Actualizar personalización temporal (sin guardar)
  const updateCustomization = useCallback((updates: Partial<ProfileCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Obtener Yo-kai favorito con detalles
  const getFavoriteYokaiDetails = useCallback(() => {
    if (!customization.favoriteYokai) return null;
    return unlockedYokai.find(yokai => yokai.id === customization.favoriteYokai) || null;
  }, [customization.favoriteYokai, unlockedYokai]);

  // Obtener título actual con detalles
  const getCurrentTitleDetails = useCallback(() => {
    if (!customization.profileTitle) return null;
    return availableTitles.find(title => title.id === customization.profileTitle) || null;
  }, [customization.profileTitle, availableTitles]);



  // Obtener marco actual con detalles
  const getCurrentFrameDetails = useCallback(() => {
    return availableFrames.find(frame => frame.id === customization.avatarFrame) || availableFrames[0];
  }, [customization.avatarFrame, availableFrames]);

  // Obtener banner actual con detalles
  const getCurrentBannerDetails = useCallback(() => {
    return AVAILABLE_BACKGROUNDS.find(bg => bg.id === customization.profileBanner as BackgroundId) || AVAILABLE_BACKGROUNDS[0];
  }, [customization.profileBanner]);

  // Inicializar datos
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadCustomization();
      await loadUnlockedYokai();
      updateUnlockedItems();

      // Cargar insignias desde localStorage
      const badgesWithStatus = getAllBadgesWithStatus();
      setAvailableBadges(badgesWithStatus);

      setLoading(false);
    };

    initializeData();
  }, [loadCustomization, loadUnlockedYokai, updateUnlockedItems]);

  return {
    customization,
    unlockedYokai,
    availableTitles: availableTitles.filter(title => title.unlocked),
    availableBadges: availableBadges.filter(badge => badge.unlocked),
    availableFrames: availableFrames.filter(frame => frame.unlocked),
    availableBackgrounds,
    allTitles: availableTitles,
    allBadges: availableBadges,
    allFrames: availableFrames,
    loading,
    hasUnsavedChanges,
    updateCustomization,
    saveCustomization,
    getFavoriteYokaiDetails,
    getCurrentTitleDetails,
    getCurrentFrameDetails,
    getCurrentBannerDetails,
    refreshUnlockedItems: updateUnlockedItems
  };
}
