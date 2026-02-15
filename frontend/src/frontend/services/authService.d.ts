import { ServiceResponse } from './base';
import { User } from '@/shared/types';
export declare const authService: {
    login(email: string, password: string): Promise<ServiceResponse<any>>;
    logout(): Promise<ServiceResponse<any>>;
    getSession(): Promise<{
        data: {
            session: import("next-auth").Session | null;
        };
        error: null;
    }>;
    getCurrentUser(): Promise<User | null>;
};
