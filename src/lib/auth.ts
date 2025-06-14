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
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

interface UserProgress {
  id: string;
  medallium: string[];
  statistics: {
    gamesPlayed: number;
    victories: number;
    currentStreak: number;
    bestStreak: number;
    infiniteWins: number;
  };
  updated_at: string;
}

interface LocalProgress {
  medallium: string[];
  stats: {
    gamesPlayed: number;
    victories: number;
    currentStreak: number;
    bestStreak: number;
    infiniteWins: number;
  };
}

export async function syncProgress(localProgress: LocalProgress): Promise<UserProgress | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // First, get existing progress
  const { data: existingProgress, error: fetchError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('id', user.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching progress:', fetchError);
    return null;
  }

  // Merge progress
  const mergedProgress: UserProgress = {
    id: user.id,
    medallium: existingProgress
      ? Array.from(new Set([...existingProgress.medallium, ...localProgress.medallium]))
      : localProgress.medallium,
    statistics: {
      gamesPlayed: Math.max(
        existingProgress?.statistics?.gamesPlayed || 0,
        localProgress.stats.gamesPlayed || 0
      ),
      victories: Math.max(
        existingProgress?.statistics?.victories || 0,
        localProgress.stats.victories || 0
      ),
      currentStreak: Math.max(
        existingProgress?.statistics?.currentStreak || 0,
        localProgress.stats.currentStreak || 0
      ),
      bestStreak: Math.max(
        existingProgress?.statistics?.bestStreak || 0,
        localProgress.stats.bestStreak || 0
      ),
      infiniteWins: Math.max(
        existingProgress?.statistics?.infiniteWins || 0,
        localProgress.stats.infiniteWins || 0
      )
    },
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(mergedProgress)
    .select()
    .single();

  if (error) {
    console.error('Error syncing progress:', error);
    throw error;
  }

  return data as UserProgress;

  return data;
}
