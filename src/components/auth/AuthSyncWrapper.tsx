'use client';

import { useProgressSync } from './useProgressSync';
import { useAuth } from './AuthProvider';
import SyncDialog from './SyncDialog';

export function AuthSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    showSyncDialog,
    setShowSyncDialog,
    cloudData,
    localData,
    handleSyncChoice
  } = useProgressSync();

  return (
    <>
      {children}
      {showSyncDialog && localData && (
        <SyncDialog
          localData={localData}
          cloudData={cloudData}
          onChoice={handleSyncChoice}
          onClose={() => setShowSyncDialog(false)}
        />
      )}
    </>
  );
}
