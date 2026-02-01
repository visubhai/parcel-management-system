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
    res.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://parcel-backend-died.onrender.com; font-src 'self' data:; connect-src 'self' http://localhost:3001 http://127.0.0.1:3001 https://parcel-backend-died.onrender.com;"
    )

    // 2. AUTHENTICATION CHECK
    const token = await getToken({ req: req, secret: process.env.AUTH_SECRET });
    const isLoginPage = req.nextUrl.pathname.startsWith('/login');

    // If NOT logged in and trying to access protected route (Home), redirect to Login
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // If Logged in and trying to access Login, redirect to key (Dashboard)
    if (token && isLoginPage) {
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
