'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';

export default function ClientLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
