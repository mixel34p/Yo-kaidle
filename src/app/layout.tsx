import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Footer from '@/components/Footer'
import ClientUpdatesWrapper from '../components/ClientUpdatesWrapper'
import ClientLanguageProvider from '@/components/ClientLanguageProvider'
import type { Metadata } from 'next'

// PWAPrompt se importará solo en el cliente
import dynamic from 'next/dynamic'
const PWAPrompt = dynamic(() => import('@/components/PWAPrompt'), {
  ssr: false,
  loading: () => null
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yo-kaidle - Wordle de Yo-kai Watch',
  description: 'Wordle inspirado en la franquicia de Yo-kai Watch. ¡Demuestra tus conocimientos sobre los Yo-kai y completa tu Medallium!',
  keywords: 'Yo-kai Watch, juego, adivinanza, Yo-kai, diario, wordle, puzzle',
  manifest: '/manifest.json',
  themeColor: '#ffcc00',
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
  },  verification: {
    google: '4ZhECbls7bJiq7jnLXlWJhtTlFLGoWa8s69XTEKrmi8'
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
        <ClientLanguageProvider>
          {/* Componente cliente para el popup de actualizaciones */}          <ClientUpdatesWrapper />          <main className="container mx-auto px-4 py-4 pb-32 sm:py-8 sm:pb-24 max-w-2xl">
            {children}
          </main>
          <PWAPrompt />
          <Footer />
        </ClientLanguageProvider>
      </body>
    </html>
  )
}
