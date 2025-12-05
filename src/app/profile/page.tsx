'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import UserProfileClient from '@/components/profile/UserProfileClient';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Obtener username de los parámetros de búsqueda
    const usernameParam = searchParams.get('u');
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t.userNotSpecified}
          </h1>
          <p className="text-white/60 mb-4">
            {t.pleaseSpecifyUser}
          </p>
          <p className="text-sm text-white/40">
            {t.exampleUrl}
          </p>
        </div>
      </div>
    );
  }

  return <UserProfileClient username={username} />;
}
