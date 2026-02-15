if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ WARNING: BACKEND_URL environment variable is missing during build!');
}
const nextConfig = {
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
        ];
    },
};
export default nextConfig;
