/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper handling of dynamic routes
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'placeholder.svg'],
    unoptimized: true,
  },
  // Disable static optimization for routes that use cookies
  experimental: {
    // This is no longer needed in Next.js 14+, but keeping it for compatibility
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
