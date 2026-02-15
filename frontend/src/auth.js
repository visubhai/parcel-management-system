import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                branchId: { label: "Branch", type: "text" }
            },
            async authorize(credentials) {
                try {
                    // Resolve absolute API URL for server-side fetch in NextAuth
                    let API_URL = process.env.BACKEND_URL ||
                        process.env.INTERNAL_API_URL;
                    if (!API_URL) {
                        const nextPublicApi = process.env.NEXT_PUBLIC_API_URL;
                        if (nextPublicApi && !nextPublicApi.startsWith('/')) {
                            API_URL = nextPublicApi;
                        }
                        else if (process.env.VERCEL_URL) {
                            API_URL = `https://${process.env.VERCEL_URL}/api`;
                        }
                        else {
                            API_URL = 'http://localhost:3001/api';
                        }
                    }
                    if (!API_URL.endsWith('/api'))
                        API_URL = `${API_URL}/api`;
                    console.log("🚀 AUTH SERVICE: Attempting login at:", `${API_URL}/auth/login`);
                    console.log("📦 AUTH DATA:", { username: credentials.email, branchId: credentials.branchId });
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
                    const res = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            username: credentials.email,
                            password: credentials.password,
                            branchId: credentials.branchId,
                        }),
                        headers: { "Content-Type": "application/json" },
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    const data = await res.json();
                    if (!res.ok) {
                        console.error("🚀 AUTH SERVICE: Login failed with status:", res.status);
                        return null; // Returning null informs NextAuth that credentials are invalid
                    }
                    // Backend returns { token, user: { ... } }
                    // NextAuth expects us to return an object that will be passed to the jwt callback
                    return Object.assign(Object.assign({}, data.user), { accessToken: data.token });
                }
                catch (error) {
                    console.error("Auth Authorize Error:", error.message);
                    return null; // Return null on network or system errors during auth
                }
            }
        })
    ],
    debug: process.env.NODE_ENV === 'development' || true, // Keep enabled for now to debug production bounce
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.branchId = user.branchId;
                token.branchName = user.branchName;
                token.accessToken = user.accessToken;
                if (user.email) {
                    token.email = user.email;
                }
                else if (user.branchName) {
                    // Fallback to constructed email if missing from DB for some reason
                    token.email = `${user.branchName.toLowerCase().replace(/\s+/g, '')}@savan.com`;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.branchId = token.branchId;
                // @ts-ignore
                session.user.branchName = token.branchName;
                // @ts-ignore
                session.user.branch = token.branchName; // FIX: Map branchName to 'branch' for frontend types
                // @ts-ignore
                session.user.name = token.name; // Explicitly ensure name is passed
                // @ts-ignore
                session.user.accessToken = token.accessToken;
                // @ts-ignore
                session.accessToken = token.accessToken; // FIX: Ensure token is at root for base.ts
                if (token.email)
                    session.user.email = token.email;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt'
    }
});
