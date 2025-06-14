'use client';

import { useProgressSync } from './useProgressSync';
import { useAuth } from './AuthProvider';

export function AuthSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useProgressSync();  // This will automatically sync when user logs in

  return <>{children}</>;
}
