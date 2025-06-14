import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type User } from '@supabase/supabase-js';

export const supabase = createClientComponentClient();

export async function signInWithDiscord() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'identify email'
    }
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Forzar recarga de la página para limpiar el estado
    window.location.href = '/';
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

interface GameState {
  game_state: any | null;
  daily_state: any | null;
  infinite_state: any | null;
  medallium: any[] | null;
  medallium_favorites: string[];
  medallium_unlock_dates: Record<string, string>;
}

interface UserProgress extends GameState {
  id: string;
  updated_at: string;
}

export async function syncProgress(localState: GameState): Promise<UserProgress | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    // Preparar el estado para sincronización
    const newProgress: UserProgress = {
      id: user.id,
      game_state: localState.game_state,
      daily_state: localState.daily_state,
      infinite_state: localState.infinite_state,
      medallium: Array.from(new Set(localState.medallium || [])),
      medallium_favorites: Array.from(new Set(localState.medallium_favorites || [])),
      medallium_unlock_dates: localState.medallium_unlock_dates || {},
      updated_at: new Date().toISOString()
    };

    // Actualizar o insertar el nuevo estado
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(newProgress)
      .select()
      .single();

    if (error) {
      console.error('Error syncing progress:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from upsert operation');
    }    return data;
  } catch (error) {
    console.error('Error in syncProgress:', error);
    throw error;
  }
}
