/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['supabase.co', 'yokaiwatch.fandom.com'],
    unoptimized: true, // Needed for static export
  },
  // Enable static export
  output: 'export',
}

module.exports = nextConfig
