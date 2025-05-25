/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: ['supabase.co', 'yokaiwatch.fandom.com', 'static.wikia.nocookie.net'],
  },
}

module.exports = nextConfig
