"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Footer from '@/components/Footer';
import ClientUpdatesWrapper from '../components/ClientUpdatesWrapper';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import PWAPrompt from '@/components/PWAPrompt';

const inter = Inter({ subsets: ['latin'] });

const UserAvatarOrLogin = () => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  if (!user) {
    return (
      <div className="absolute top-4 right-4">
        <a
          href="/auth/login"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2">
      <img
        src={user.user_metadata.avatar_url}
        alt={user.user_metadata.full_name}
        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
      />
      <span className="text-white font-medium">{user.user_metadata.full_name}</span>
    </div>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="application-name" content="Yo-kaidle" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Yo-kaidle" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffcc00" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffcc00" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script src="/register-sw.js" defer />        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Yo-kaidle",
              "description": "Juego diario de adivinanzas de Yo-kai Watch",
              "url": "https://yokaidle.vercel.app",
              "applicationCategory": "GameApplication",
              "genre": "Puzzle",
              "inLanguage": "es",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} overscroll-none`}>
        {/* Componente cliente para el popup de actualizaciones */}        <ClientUpdatesWrapper />        <main className="container mx-auto px-4 py-4 pb-32 sm:py-8 sm:pb-24 max-w-2xl">
          {children}
        </main>
        <PWAPrompt />
        <Footer />
      </body>
    </html>
  )
}