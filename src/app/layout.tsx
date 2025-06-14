import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Footer from '@/components/Footer'
import ClientUpdatesWrapper from '../components/ClientUpdatesWrapper'
import type { Metadata } from 'next'

// PWAPrompt se importará solo en el cliente
import dynamic from 'next/dynamic'
const PWAPrompt = dynamic(() => import('@/components/PWAPrompt'), {
  ssr: false,
  loading: () => null
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yo-kaidle - El juego de adivinanzas de Yo-kai Watch',
  description: 'Adivina el Yo-kai del día en este juego tipo Wordle basado en el universo de Yo-kai Watch.',
  manifest: '/manifest.json',
  themeColor: '#ffcc00',
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
        <meta name="application-name" content="Yo-kaidle" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yo-kaidle" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffcc00" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script src="/register-sw.js" defer />
      </head>
      <body className={inter.className}>
        {/* Componente cliente para el popup de actualizaciones */}        <ClientUpdatesWrapper />
        <main className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
          {children}
        </main>
        <PWAPrompt />
        <Footer />
      </body>
    </html>
  )
}