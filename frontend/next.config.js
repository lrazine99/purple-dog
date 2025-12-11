/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  // Optimisations pour le développement
  reactStrictMode: true,
  swcMinify: true,
  // Réduire les logs en dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;

