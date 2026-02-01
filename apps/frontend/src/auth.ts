import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
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
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                    const res = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            username: credentials.email,
                            password: credentials.password,
                            branchId: credentials.branchId,
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        // Extract message from new format
                        let errorMsg = 'Authentication failed';
                        if (data.message) {
                            errorMsg = Array.isArray(data.message)
                                ? data.message.map((m: any) => m.message).join(', ')
                                : data.message;
                        }
                        throw new Error(errorMsg);
                    }

                    // Backend returns { token, user: { ... } }
                    // NextAuth expects us to return an object that will be passed to the jwt callback
                    return {
                        ...data.user,
                        accessToken: data.token
                    };

                } catch (error: any) {
                    console.error("Auth Error:", error.message);
                    throw new Error(error.message);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.branchId = (user as any).branchId;
                token.branchName = (user as any).branchName;
                token.accessToken = (user as any).accessToken;
                if (user.email) {
                    token.email = user.email;
                } else if ((user as any).branchName) {
                    // Fallback to constructed email if missing from DB for some reason
                    token.email = `${(user as any).branchName.toLowerCase().replace(/\s+/g, '')}@savan.com`;
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
                if (token.email) session.user.email = token.email as string;
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
