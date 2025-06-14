import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Progress = {
  yokaisUnlocked: string[];
  stats: {
    gamesPlayed: number;
    victories: number;
    bestStreak: number;
  };
};

const syncProgress = async (localProgress: Progress) => {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('No user authenticated');
    return;
  }

  const { data, error } = await supabase
    .from('progress')
    .upsert({
      user_id: user.id,
      progress: localProgress,
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Error syncing progress:', error.message);
  } else {
    console.log('Progress synced successfully:', data);
  }
};

export default syncProgress;
