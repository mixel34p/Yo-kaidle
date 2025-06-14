'use client';

import { LoginButton } from './LoginButton';
import { ProfileButton } from './ProfileButton';
import { useAuth } from './AuthProvider';

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <nav className="fixed top-0 right-0 m-4 z-50">
      {user ? (
        <ProfileButton
          username={user.user_metadata.full_name || 'Usuario'}
          avatarUrl={user.user_metadata.avatar_url || '/default-avatar.png'}
        />
      ) : (
        <LoginButton />
      )}
    </nav>
  );
}
