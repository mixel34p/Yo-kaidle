'use client';

import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthNavigation from '@/components/auth/Navigation';
import { AuthSyncWrapper } from '@/components/auth/AuthSyncWrapper';
import ClientUpdatesWrapper from '@/components/ClientUpdatesWrapper';
import PWAPrompt from '@/components/PWAPrompt';
import Footer from '@/components/Footer';

export default function RootClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthSyncWrapper>
        <AuthNavigation />
        <ClientUpdatesWrapper>
          {children}
        </ClientUpdatesWrapper>
        <PWAPrompt />
        <Footer />
      </AuthSyncWrapper>
    </AuthProvider>
  );
}
