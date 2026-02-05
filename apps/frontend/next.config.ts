import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`, // Dynamic proxy
      },
    ]
  },
};

export default nextConfig;
