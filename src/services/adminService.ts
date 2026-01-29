import { supabase } from '@/lib/supabase';
import { handleSupabaseRequest, ServiceResponse } from './base';
import { User, Branch } from '@/lib/types';

export const adminService = {
    async getUsers(): Promise<ServiceResponse<User[]>> {
        const { data, error } = await supabase
            .from('app_users')
            .select(`
                *,
                branches (name)
            `);

        if (error) return { data: null, error };

        const users: User[] = data.map((u: any) => ({
            id: u.id,
            name: u.full_name,
            username: u.username || u.email,
            role: u.role,
            branch: u.branches?.name,
            allowedBranches: u.allowed_branches || [], // Backward compat, real permissions via policies
            allowedReports: [],
            isActive: u.is_active
        }));

        return { data: users, error: null };
    },

    async toggleUserStatus(userId: string, isActive: boolean): Promise<ServiceResponse<void>> {
        const response = await supabase.from('app_users').update({ is_active: isActive }).eq('id', userId);
        return { data: null, error: response.error };
    },

    async getAuditLogs(limit = 100): Promise<ServiceResponse<any[]>> {
        return handleSupabaseRequest(
            supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)
                .then()
        );
    }
};
