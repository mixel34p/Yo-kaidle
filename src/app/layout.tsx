import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import FloatingDiscordButton from '@/components/FloatingDiscordButton'
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
        <main className="container mx-auto px-4 py-8 max-w-md">
          {children}
        </main>
        <FloatingDiscordButton />
      </body>
    </html>
  )
}
