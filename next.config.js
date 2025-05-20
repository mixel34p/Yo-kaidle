/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['supabase.co', 'yokaiwatch.fandom.com', 'static.wikia.nocookie.net'],
  },
}

module.exports = nextConfig
