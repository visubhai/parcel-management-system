import { ServiceResponse, fetchApi, API_URL, parseError } from '@/frontend/services/base';
import { User } from '@/shared/types';

export const adminService = {
    async getUsers(): Promise<ServiceResponse<User[]>> {
        try {
            const res = await fetchApi('/users');
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
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
            if (!res.ok) throw new Error(parseError(data));
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getAllBranches(scope?: string): Promise<ServiceResponse<any[]>> {
        try {
            const url = scope ? `/branches?scope=${scope}` : '/branches';
            console.log("Fetching branches from:", `${API_URL}${url}`);
            const res = await fetchApi(url);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(parseError(errorData) || `HTTP Error ${res.status}`);
            }
            const data = await res.json();
            console.log("Branches fetched:", data);
            return { data, error: null };
        } catch (error: any) {
            console.error("Failed to fetch branches:", error);
            return { data: [], error: new Error(error.message) };
        }
    },
    async getBranchPermissions(branchId: string): Promise<ServiceResponse<any>> {
        try {
            const res = await fetchApi(`/superadmin/permissions/${branchId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async updateBranchPermissions(branchId: string, allowedReports: string[]): Promise<ServiceResponse<any>> {
        try {
            const res = await fetchApi(`/superadmin/permissions/${branchId}`, {
                method: 'PUT',
                body: JSON.stringify({ allowedReports }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getAuditLogs(page: number = 1, limit: number = 50, entityType?: string, action?: string): Promise<ServiceResponse<any>> {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (entityType) params.append('entityType', entityType);
            if (action) params.append('action', action);

            const res = await fetchApi(`/superadmin/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: { data: [], total: 0 }, error: new Error(error.message) };
        }
    },

    async getCounters(): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetchApi('/superadmin/counters');
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },

    async updateCounter(counterId: string, count: number): Promise<ServiceResponse<any>> {
        try {
            const res = await fetchApi(`/superadmin/counters/${counterId}`, {
                method: 'PUT',
                body: JSON.stringify({ count }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async resetPassword(userId: string, password: string): Promise<ServiceResponse<any>> {
        try {
            const res = await fetchApi(`/users/${userId}/reset-password`, {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async createUser(userData: Partial<User>): Promise<ServiceResponse<User>> {
        try {
            const res = await fetchApi('/users', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async updateUser(userId: string, userData: Partial<User>): Promise<ServiceResponse<User>> {
        try {
            const res = await fetchApi(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async createBranch(branchData: any): Promise<ServiceResponse<any>> {
        try {
            const res = await fetchApi('/branches', {
                method: 'POST',
                body: JSON.stringify(branchData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async updateBranch(branchId: string, branchData: any): Promise<ServiceResponse<any>> {
        try {
            const res = await fetchApi(`/branches/${branchId}`, {
                method: 'PUT',
                body: JSON.stringify(branchData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async deleteBooking(id: string): Promise<ServiceResponse<null>> {
        try {
            const res = await fetchApi(`/superadmin/bookings/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    }
};
