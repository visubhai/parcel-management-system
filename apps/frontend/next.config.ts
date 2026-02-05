import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'railway.app' },
      { protocol: 'https', hostname: 'render.com' },
      { protocol: 'https', hostname: '**' } // Allow external images during dev
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path((?!auth).*)',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend, excluding /api/auth
      },
    ]
  },
};

export default nextConfig;
