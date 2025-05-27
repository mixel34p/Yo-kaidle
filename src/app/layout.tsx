import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Footer from '@/components/Footer'
import ClientUpdatesWrapper from '../components/ClientUpdatesWrapper'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yo-kaidle - El juego de adivinanzas de Yo-kai Watch',
  description: 'Adivina el Yo-kai del día en este juego tipo Wordle basado en el universo de Yo-kai Watch.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Componente cliente para el popup de actualizaciones */}
        <ClientUpdatesWrapper />
        <main className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
          {children}
        </main>
        <Navigation />
        <Footer />
      </body>
    </html>
  )
}