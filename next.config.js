const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/~offline',
  },
  buildExcludes: [
    // Excluir archivos que no existen en exportación estática
    /middleware-manifest\.json$/,
    /_next\/app-build-manifest\.json$/,
    /_next\/build-manifest\.json$/
  ],
  publicExcludes: ['!icons/**/*'],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200
        }
      }
    }
  ],
  cacheOnFrontEndNav: true,
  reloadOnOnline: false
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['supabase.co', 'yokaiwatch.fandom.com', 'static.wikia.nocookie.net'],
  }
}

module.exports = withPWA(nextConfig);
