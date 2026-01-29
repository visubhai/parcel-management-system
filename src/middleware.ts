import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
    // Content Security Policy (Basic starter - can be tightened)
    // We allow inline scripts/styles for now to prevent breaking Next.js / Tailwind, 
    // but in a strict audit this should be nonce-based.
    res.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    )

    // 2. SUPABASE SESSION CHECK
    const supabase = createMiddlewareClient({ req, res })
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // 3. PROTECTED ROUTES
    // If not logged in and trying to access protected routes, redirect to login
    if (!session && !req.nextUrl.pathname.startsWith('/login')) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return NextResponse.redirect(redirectUrl)
    }

    // 4. AUTHENTICATED REDIRECT
    // If logged in and trying to access login, redirect to dashboard or home
    if (session && req.nextUrl.pathname.startsWith('/login')) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/' // or /dashboard/super-admin depending on role
        return NextResponse.redirect(redirectUrl)
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
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
