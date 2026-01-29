import { signIn, signOut, getSession } from 'next-auth/react';
import { ServiceResponse } from './base';
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
                return { data: null, error: new Error(result.error) };
            }

            return { data: { success: true }, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async logout(): Promise<ServiceResponse<any>> {
        await signOut({ redirect: true, callbackUrl: '/login' });
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
