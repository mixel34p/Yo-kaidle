'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, cleanWikiImageUrl } from '@/lib/supabase';
import { getAllFramesWithStatus, getFrameName, getFrameDescription } from '@/utils/framesManager';
import { getAllTitlesWithStatus, getTitleName as getTitleNameFromManager, getTitleDescription as getTitleDescriptionFromManager } from '@/utils/titlesManager';
import { AVAILABLE_BACKGROUNDS, BackgroundId } from '@/utils/backgroundsManager';

// Función para obtener el nombre traducido de un título (wrapper para compatibilidad)
export function getTitleName(title: TitleDetails, language: 'es' | 'en' | 'it'): string {
  return getTitleNameFromManager(title, language);
}

// Función para obtener la descripción traducida de un título (wrapper para compatibilidad)
export function getTitleDescription(title: TitleDetails, language: 'es' | 'en' | 'it'): string {
  return getTitleDescriptionFromManager(title, language);
}

export interface UserCustomization {
  favoriteYokai: string | null;
  profileTitle: string | null;
  avatarFrame: string;
  profileBanner: string;
  selectedBadges: string[];
}

export interface YokaiDetails {
  id: string;
  name: string;
  image: string;
  tribe: string;
  rank: string;
}

export interface TitleDetails {
  id: string;
  name_es: string;
  name_en: string;
  name_it: string;
  description_es: string;
  description_en: string;
  description_it: string;
  unlockMethod: 'default' | 'achievement' | 'circle' | 'purchase' | 'special';
}



export interface FrameDetails {
  id: string;
  name: string;
  image: string;
}

// Los títulos y marcos ahora se gestionan a través de sus respectivos managers

export function useUserCustomization(userId?: string) {
  const [customization, setCustomization] = useState<UserCustomization>({
    favoriteYokai: null,
    profileTitle: null,
    avatarFrame: 'default',
    profileBanner: 'default',
    selectedBadges: []
  });

  const [favoriteYokaiDetails, setFavoriteYokaiDetails] = useState<YokaiDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar personalización del usuario
  const loadUserCustomization = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('user_profiles')
        .select('favorite_yokai, profile_title, profile_theme, avatar_frame, profile_banner, selected_badges')
        .eq('id', userId)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError;
      }

      if (data) {
        console.log('Loaded customization for user:', userId, data); // Debug

        const customizationData = {
          favoriteYokai: data.favorite_yokai,
          profileTitle: data.profile_title,
          avatarFrame: data.avatar_frame || 'default',
          profileBanner: data.profile_banner || 'default',
          selectedBadges: data.selected_badges ? JSON.parse(data.selected_badges) : []
        };

        setCustomization(customizationData);

        // Cargar detalles del Yo-kai favorito si existe
        if (customizationData.favoriteYokai) {
          await loadFavoriteYokaiDetails(customizationData.favoriteYokai);
        }
      }
    } catch (error) {
      console.error('Error loading user customization:', error);
      setError('Error loading customization');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Función para cargar detalles del Yo-kai favorito
  const loadFavoriteYokaiDetails = useCallback(async (yokaiId: string) => {
    try {
      console.log('Loading yokai details for ID:', yokaiId);

      const { data, error } = await supabase
        .from('yokai')
        .select('*')
        .eq('id', parseInt(yokaiId))
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setFavoriteYokaiDetails(null);
        return;
      }

      if (!data) {
        console.error('No data returned for yokai ID:', yokaiId);
        setFavoriteYokaiDetails(null);
        return;
      }

      console.log('Yokai data loaded:', data);

      // Usar la misma lógica que en el juego para obtener la imagen
      let imageUrl = data.imageurl || data.image_url || data.img || data.image || `/images/yokai/${yokaiId}.png`;

      // Limpiar URL si viene de wikia
      if (imageUrl) {
        imageUrl = cleanWikiImageUrl(imageUrl);
      }

      setFavoriteYokaiDetails({
        id: yokaiId,
        name: data.name,
        image: imageUrl,
        tribe: data.tribe || 'Unknown',
        rank: data.rank || 'E'
      });
    } catch (error) {
      console.error('Error loading favorite yokai details:', error);
      setFavoriteYokaiDetails(null);
    }
  }, []);

  // Obtener detalles del Yo-kai favorito (ahora devuelve el estado)
  const getFavoriteYokaiDetails = useCallback((): YokaiDetails | null => {
    return favoriteYokaiDetails;
  }, [favoriteYokaiDetails]);

  // Obtener detalles del título
  const getCurrentTitleDetails = useCallback((): TitleDetails | null => {
    if (!customization.profileTitle) return null;
    const titlesWithStatus = getAllTitlesWithStatus();
    const title = titlesWithStatus.find(t => t.id === customization.profileTitle);
    return title ? {
      id: title.id,
      name_es: title.name_es,
      name_en: title.name_en,
      name_it: title.name_it,
      description_es: title.description_es,
      description_en: title.description_en,
      description_it: title.description_it,
      unlockMethod: title.unlockMethod
    } : null;
  }, [customization.profileTitle]);

  // Obtener detalles del marco
  const getCurrentFrameDetails = useCallback((): FrameDetails => {
    const framesWithStatus = getAllFramesWithStatus();
    const frame = framesWithStatus.find(f => f.id === customization.avatarFrame);
    return frame ? {
      id: frame.id,
      name: getFrameName(frame, 'es'),
      image: frame.image
    } : { id: 'default', name: 'Marco Básico', image: '/frames/default.png' };
  }, [customization.avatarFrame]);

  // Obtener detalles del banner
  const getCurrentBannerDetails = useCallback(() => {
    return AVAILABLE_BACKGROUNDS.find(bg => bg.id === customization.profileBanner as BackgroundId) || AVAILABLE_BACKGROUNDS[0];
  }, [customization.profileBanner]);

  // Verificar si tiene personalización activa
  const hasCustomization = useCallback((): boolean => {
    return !!(
      customization.favoriteYokai ||
      (customization.profileTitle && customization.profileTitle !== 'default') ||
      customization.avatarFrame !== 'default' ||
      customization.profileBanner !== 'default' ||
      customization.selectedBadges.length > 0
    );
  }, [customization]);

  // Cargar datos al cambiar userId
  useEffect(() => {
    const loadData = async () => {
      await loadUserCustomization();
    };
    loadData();
  }, [loadUserCustomization]);

  return {
    customization,
    loading,
    error,
    getFavoriteYokaiDetails,
    getCurrentTitleDetails,
    getCurrentFrameDetails,
    getCurrentBannerDetails,
    hasCustomization,
    refreshCustomization: loadUserCustomization
  };
}
