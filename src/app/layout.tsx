import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import RootClientWrapper from '@/components/ClientWrapper'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffcc00',
}

export const metadata: Metadata = {
  title: 'Yo-kaidle - ¡Adivina el Yo-kai diario!',
  description: '🎮 Juego diario de adivinanzas de Yo-kai Watch. ¡Demuestra tus conocimientos sobre los Yo-kai y completa tu Medallium!',
  keywords: 'Yo-kai Watch, juego, adivinanza, Yo-kai, diario, wordle, puzzle',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Yo-kaidle - ¡Adivina el Yo-kai diario!',
    description: '🎮 Juego diario de adivinanzas de Yo-kai Watch',
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
    title: 'Yo-kaidle - ¡Adivina el Yo-kai diario!',
    description: '🎮 Juego diario de adivinanzas de Yo-kai Watch',
    images: ['https://yokaidle.vercel.app/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://yokaidle.vercel.app'
  },
  verification: {
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <RootClientWrapper>
          {children}
        </RootClientWrapper>
      </body>
    </html>
  )
}