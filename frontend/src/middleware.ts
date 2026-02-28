import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    console.log(`\n🔍 NEXT_MW: ${req.method} ${req.nextUrl.pathname}`);
    const res = NextResponse.next()

    // 1. ADD SECURITY HEADERS
    // HSTS (HTTP Strict Transport Security) - Force HTTPS
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    // Prevent MIME type sniffing
    res.headers.set('X-Content-Type-Options', 'nosniff')
    // Prevent formatting (Clickjacking protection frame-ancestors is better, but this is a fallback)
    res.headers.set('X-Frame-Options', 'DENY')
    // XSS Protection (Legacy but good depth)
    res.headers.set('X-XSS-Protection', '1; mode=block')
    // Referrer Policy
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    // Content Security Policy (Basic starter)
    // Content Security Policy (Updated to allow Koyeb and local development)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.koyeb.app https://res.cloudinary.com https://*.onrender.com;
        font-src 'self' data:;
        connect-src 'self' http://localhost:3001 http://127.0.0.1:3001 https://*.koyeb.app https://*.vercel.app https://*.onrender.com;
    `.replace(/\s{2,}/g, ' ').trim();

    res.headers.set('Content-Security-Policy', cspHeader);

    // 2. AUTHENTICATION CHECK
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

    const token = await getToken({
        req,
        secret
    });

    const isLoginPage = req.nextUrl.pathname.startsWith('/login');
    const gateCookie = req.cookies.get('login-gate-passed');
    const hasPassedGate = gateCookie?.value === 'true';
    const referer = req.headers.get('referer') || 'no-referer';

    console.log(`\n🛡️  LOGGING PATH: ${req.nextUrl.pathname}`);
    console.log(`🛡️  GATE: ${hasPassedGate} | TOKEN: ${!!token}`);

    // STRICT SESSION GATE
    // If not on login page and haven't passed the session gate -> Redirect to /login
    if (!isLoginPage && !hasPassedGate) {
        console.log("🛡️ BLOCKING: Missing Session Gate. Redirecting to /login.");
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Standard Auth check: If not login page and no token -> Redirect to /login
    if (!isLoginPage && !token) {
        console.log("🛡️ BLOCKING: No valid session token. Redirecting to /login.");
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - images (public images folder)
         * - favicon.ico (favicon file)
         */
        '/',
        '/dashboard/:path*',
        '/reports/:path*',
        '/inbound/:path*',
        '/admin/:path*',
        '/settings/:path*',
        '/login',
        '/print/:path*'
    ],
}
