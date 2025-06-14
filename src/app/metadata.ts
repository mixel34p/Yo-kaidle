export const metadata = {
  title: 'Yo-kaidle - ¡Adivina el Yo-kai diario!',
  description: '🎮 Juego diario de adivinanzas de Yo-kai Watch. ¡Demuestra tus conocimientos sobre los Yo-kai y completa tu Medallium!',
  keywords: 'Yo-kai Watch, juego, adivinanza, Yo-kai, diario, wordle, puzzle',
  manifest: '/manifest.json',
  themeColor: '#ffcc00',
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
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  applicationName: 'Yo-kaidle',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yo-kaidle'
  },
  formatDetection: {
    telephone: false
  }
};
