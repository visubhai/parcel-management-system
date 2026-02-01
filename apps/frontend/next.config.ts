import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'railway.app', 'render.com'], // Allow images from backend domains
  },
  // Ensure we don't rewrite API routes here, we use environment variable NEXT_PUBLIC_API_URL
};

export default nextConfig;
