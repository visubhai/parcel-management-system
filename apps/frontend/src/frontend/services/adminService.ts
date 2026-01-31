import { ServiceResponse, fetchApi, API_URL } from './base';
import { User } from '@/shared/types';

export const adminService = {
    async getUsers(): Promise<ServiceResponse<User[]>> {
        try {
            const res = await fetchApi('/users');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async toggleUserStatus(userId: string, isActive: boolean): Promise<ServiceResponse<null>> {
        try {
            const res = await fetchApi(`/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getAllBranches(): Promise<ServiceResponse<any[]>> {
        try {
            console.log("Fetching branches from:", `${API_URL}/branches`);
            const res = await fetchApi('/branches');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP Error ${res.status}`);
            }
            const data = await res.json();
            console.log("Branches fetched:", data);
            return { data, error: null };
        } catch (error: any) {
            console.error("Failed to fetch branches, using fallback:", error);
            // Fallback mock if API fails during migration
            return {
                data: [
                    { _id: 'mock1', name: 'MOCK: Main Branch', branchCode: 'MOCK_01' },
                    { _id: 'mock2', name: 'MOCK: Surat Hub', branchCode: 'MOCK_02' }
                ],
                error: null // Return null error so UI shows the mock data instead of breaking
            };
        }
    },
    async getAuditLogs(limit: number): Promise<ServiceResponse<any[]>> {
        return {
            data: [],
            error: null
        };
    },
};
