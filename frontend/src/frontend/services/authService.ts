import { signIn, signOut, getSession } from 'next-auth/react';
import { ServiceResponse, parseError } from './base';
import { User } from '@/shared/types';

export const authService = {
    async login(email: string, password: string): Promise<ServiceResponse<any>> {
        try {
            // "email" field in signIn can accept username if configured in backend/auth.ts
            const result = await signIn('credentials', {
                email, // We pass username here as 'email' because our backend/auth.ts handles it in "email" field or checks both
                password,
                redirect: false
            });

            if (result?.error) {
                // result.error is a string from NextAuth, but we can try to parse it if it's JSON from our authorize()
                return { data: null, error: new Error(result.error) };
            }

            return { data: { success: true }, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(parseError(error)) };
        }
    },

    async logout(): Promise<ServiceResponse<any>> {
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

    async getCurrentUser(): Promise<User | null> {
        const session = await getSession();
        if (session?.user) {
            return session.user as User;
        }
        return null;
    }
};
