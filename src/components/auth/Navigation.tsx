'use client';

import { LoginButton } from './LoginButton';
import { ProfileButton } from './ProfileButton';
import { useAuth } from './AuthProvider';
import { getDiscordAvatarUrl, getDiscordUsername } from '@/utils/discord';

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <nav className="fixed top-0 right-0 m-4 z-50">
      {user ? (
        <ProfileButton
          username={getDiscordUsername(user)}
          avatarUrl={getDiscordAvatarUrl(user)}
        />
      ) : (
        <LoginButton />
      )}
    </nav>
  );
}
