import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
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
        img-src 'self' blob: data: https://*.koyeb.app https://res.cloudinary.com;
        font-src 'self' data:;
        connect-src 'self' http://localhost:3001 http://127.0.0.1:3001 https://*.koyeb.app https://*.vercel.app;
    `.replace(/\s{2,}/g, ' ').trim();

    res.headers.set('Content-Security-Policy', cspHeader);

    // 2. AUTHENTICATION CHECK
    // Use AUTH_SECRET or NEXTAUTH_SECRET for token verification
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    const token = await getToken({
        req,
        secret,
        // In some environments, getToken needs explicit salt or secureCookie flag
        secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://')
    });

    const isLoginPage = req.nextUrl.pathname.startsWith('/login');

    console.log(`🛡️ Middleware: ${req.nextUrl.pathname} | Token: ${!!token} | Secret: ${!!secret}`);

    // If NOT logged in and trying to access protected route (Home), redirect to Login
    if (!token && !isLoginPage) {
        console.log("🛡️ Redirecting to login (No token)");
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // If Logged in and trying to access Login, redirect to key (Dashboard)
    if (token && isLoginPage) {
        console.log("🛡️ Redirecting to dashboard (Logged in)");
        return NextResponse.redirect(new URL('/', req.url));
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
         * - images (public images folder) - ADDED THIS
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
    ],
}
