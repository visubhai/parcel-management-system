import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
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
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });

                    const user = await res.json();

                    if (!res.ok) {
                        throw new Error(user.error || 'Authentication failed');
                    }

                    // If login succeeds, return user
                    return user;

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
