import { fetchApi, API_URL, parseError } from '../../services/base';
export const adminService = {
    async getUsers() {
        try {
            const res = await fetchApi('/users');
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async toggleUserStatus(userId, isActive) {
        try {
            const res = await fetchApi(`/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data: null, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async getAllBranches(scope) {
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
        }
        catch (error) {
            console.error("Failed to fetch branches:", error);
            return { data: [], error: new Error(error.message) };
        }
    },
    async getBranchPermissions(branchId) {
        try {
            const res = await fetchApi(`/superadmin/permissions/${branchId}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async updateBranchPermissions(branchId, allowedReports) {
        try {
            const res = await fetchApi(`/superadmin/permissions/${branchId}`, {
                method: 'PUT',
                body: JSON.stringify({ allowedReports }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async getAuditLogs(page = 1, limit = 50, entityType, action) {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (entityType)
                params.append('entityType', entityType);
            if (action)
                params.append('action', action);
            const res = await fetchApi(`/superadmin/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: { data: [], total: 0 }, error: new Error(error.message) };
        }
    },
    async getCounters() {
        try {
            const res = await fetchApi('/superadmin/counters');
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: [], error: new Error(error.message) };
        }
    },
    async updateCounter(counterId, count) {
        try {
            const res = await fetchApi(`/superadmin/counters/${counterId}`, {
                method: 'PUT',
                body: JSON.stringify({ count }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async resetPassword(userId, password) {
        try {
            const res = await fetchApi(`/users/${userId}/reset-password`, {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async createUser(userData) {
        try {
            const res = await fetchApi('/users', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async updateUser(userId, userData) {
        try {
            const res = await fetchApi(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async createBranch(branchData) {
        try {
            const res = await fetchApi('/branches', {
                method: 'POST',
                body: JSON.stringify(branchData),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async updateBranch(branchId, branchData) {
        try {
            const res = await fetchApi(`/branches/${branchId}`, {
                method: 'PUT',
                body: JSON.stringify(branchData),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async deleteBooking(id) {
        try {
            const res = await fetchApi(`/superadmin/bookings/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data: null, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    }
};
