import { signIn, signOut, getSession } from 'next-auth/react';
import { parseError } from './base';
export const authService = {
    async login(email, password) {
        try {
            // "email" field in signIn can accept username if configured in backend/auth.ts
            const result = await signIn('credentials', {
                email, // We pass username here as 'email' because our backend/auth.ts handles it in "email" field or checks both
                password,
                redirect: false
            });
            if (result === null || result === void 0 ? void 0 : result.error) {
                // result.error is a string from NextAuth, but we can try to parse it if it's JSON from our authorize()
                return { data: null, error: new Error(result.error) };
            }
            return { data: { success: true }, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(parseError(error)) };
        }
    },
    async logout() {
        await signOut({ redirect: false });
        return { data: null, error: null };
    },
    async getSession() {
        const session = await getSession();
        return {
            data: { session },
            error: null
        };
    },
    async getCurrentUser() {
        const session = await getSession();
        if (session === null || session === void 0 ? void 0 : session.user) {
            return session.user;
        }
        return null;
    }
};
