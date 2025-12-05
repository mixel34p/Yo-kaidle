'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

interface PublicStats {
  total_played: number;
  best_streak: number;
  current_streak: number;
  yokai_unlocked: number;
  achievements_count: number;
}

interface SocialAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePublicStats: (stats: Partial<PublicStats>) => Promise<void>;
}

const SocialAuthContext = createContext<SocialAuthContextType | undefined>(undefined);

export function useSocialAuth() {
  const context = useContext(SocialAuthContext);
  if (context === undefined) {
    throw new Error('useSocialAuth must be used within a SocialAuthProvider');
  }
  return context;
}

export function SocialAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil de usuario
  const loadUserProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      // Sincronizar avatar si ha cambiado en Discord
      const newAvatarUrl = currentUser.user_metadata?.avatar_url;
      if (newAvatarUrl && data.avatar_url !== newAvatarUrl) {
        console.log('🔄 Syncing Discord avatar...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', currentUser.id);

        if (!updateError) {
          console.log('✅ Avatar synced successfully');
          data.avatar_url = newAvatarUrl; // Actualizar estado local
        } else {
          console.error('❌ Error syncing avatar:', updateError);
        }
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  // Inicializar auth
  useEffect(() => {
    let mounted = true;

    // Timeout de seguridad para evitar carga infinita
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth loading timed out - forcing loading to false');
        setLoading(false);
      }
    }, 5000); // 5 segundos de timeout

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadUserProfile(session.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Login con Discord
  const signInWithDiscord = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'
        }
      });

      if (error) {
        console.error('Error signing in with Discord:', error);
        throw error;
      }
    } catch (error) {
      console.error('Discord sign in error:', error);
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Actualizar estadísticas públicas (SOLO estadísticas, NO datos completos)
  const updatePublicStats = async (stats: Partial<PublicStats>) => {
    if (!user) {
      console.log('❌ No user authenticated, skipping stats update');
      return;
    }

    try {
      const dataToUpdate = {
        id: user.id,
        ...stats,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Updating public stats:', dataToUpdate);

      // Verificar que la tabla existe antes de hacer upsert
      const { data, error } = await supabase
        .from('user_stats')
        .upsert(dataToUpdate);

      if (error) {
        console.error('❌ Supabase error updating public stats:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Public stats updated successfully:', data);
    } catch (error) {
      console.error('❌ Error in updatePublicStats:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signInWithDiscord,
    signOut,
    updatePublicStats
  };

  return (
    <SocialAuthContext.Provider value={value}>
      {children}
    </SocialAuthContext.Provider>
  );
}
