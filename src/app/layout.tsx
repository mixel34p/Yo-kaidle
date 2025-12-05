import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import '@/styles/profile-themes.css'
import Footer from '@/components/Footer'
import ClientUpdatesWrapper from '../components/ClientUpdatesWrapper'
import ClientLanguageProvider from '@/components/ClientLanguageProvider'
import { SocialAuthProvider } from '@/contexts/SocialAuthContext'
import type { Metadata, Viewport } from 'next'

// PWAPrompt y NotificationManager se importarán solo en el cliente
import dynamic from 'next/dynamic'
const PWAPrompt = dynamic(() => import('@/components/PWAPrompt'), {
  ssr: false,
  loading: () => null
})
const NotificationManager = dynamic(() => import('@/components/NotificationManager'), {
  ssr: false,
  loading: () => null
})


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yo-kaidle - Wordle de Yo-kai Watch',
  description: 'Wordle inspirado en la franquicia de Yo-kai Watch. ¡Demuestra tus conocimientos sobre los Yo-kai y completa tu Medallium!',
  keywords: 'Yo-kai Watch, juego, adivinanza, Yo-kai, diario, wordle, puzzle',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Yo-kaidle - Wordle de Yo-kai Watch',
    description: 'Wordle inspirado en la franquicia de Yo-kai Watch.',
    url: 'https://yokaidle.vercel.app',
    siteName: 'Yo-kaidle',
    images: [
      {
        url: 'https://yokaidle.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yo-kaidle Preview'
      }
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yo-kaidle - Wordle de Yo-kai Watch',
    description: 'Wordle inspirado en la franquicia de Yo-kai Watch.',
    images: ['https://yokaidle.vercel.app/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://yokaidle.vercel.app'
  }, verification: {
    google: '4ZhECbls7bJiq7jnLXlWJhtTlFLGoWa8s69XTEKrmi8'
  },
  applicationName: 'Yo-kaidle',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yo-kaidle'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-192.png' }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffcc00' },
    { media: '(prefers-color-scheme: dark)', color: '#ffcc00' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>

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
        <ClientLanguageProvider>
          <SocialAuthProvider>
            {/* Componente cliente para el popup de actualizaciones */}            <ClientUpdatesWrapper />            <NotificationManager />
            <main className="container mx-auto px-4 py-4 pb-32 sm:py-8 sm:pb-24 max-w-2xl">
              {children}
            </main>
            <PWAPrompt />
            <Footer />
          </SocialAuthProvider>
        </ClientLanguageProvider>
      </body>
    </html>
  )
}
