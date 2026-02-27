import type { NextConfig } from "next";

if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: BACKEND_URL environment variable is missing during build!');
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'railway.app' },
      { protocol: 'https', hostname: 'render.com' },
      { protocol: 'https', hostname: '**' } // Allow external images during dev
    ],
  },
  compress: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
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
