import { supabase } from '@/lib/supabase';
import { handleSupabaseRequest, ServiceResponse } from './base';
import { User } from '@/lib/types';

export const authService = {
    async login(email: string, password: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { data: null, error: error };
        return { data, error: null };
    },

    async logout(): Promise<ServiceResponse<any>> {
        const response = await supabase.auth.signOut();
        // supabase.auth.signOut() returns { error }, not { data, error }
        // We normalize it manually
        return { data: null, error: response.error };
    },

    async getSession() {
        return supabase.auth.getSession();
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch custom app_user profile
        const { data: profile } = await supabase
            .from('app_users')
            .select(`
                *,
                branches (
                    name,
                    branch_code
                )
            `)
            .eq('id', user.id)
            .single();

        if (!profile) return null;

        return {
            id: profile.id,
            name: profile.full_name,
            username: profile.email, // using email as username for now
            role: profile.role,
            branch: profile.branches?.name || 'Global', // Global for super admin
            branchId: profile.branch_id,
            isActive: profile.is_active,
            // Map new schema fields to old type for compatibility during migration
            allowedBranches: profile.branch_id ? [profile.branches?.name] : [],
            allowedReports: []
        };
    }
};
