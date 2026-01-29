import { ServiceResponse } from './base';
import { User } from '@/shared/types';

export const adminService = {
    async getUsers(): Promise<ServiceResponse<User[]>> {
        // Mock Data
        return {
            data: [
                {
                    id: 'mock-admin-id',
                    name: 'Test Admin',
                    username: 'admin',
                    role: 'SUPER_ADMIN',
                    branch: 'Main Branch',
                    allowedBranches: [],
                    allowedReports: [],
                    isActive: true
                },
                {
                    id: 'mock-staff-id',
                    name: 'Hirabagh User',
                    username: 'hirabagh',
                    role: 'STAFF',
                    branch: 'Main Branch',
                    allowedBranches: [],
                    allowedReports: [],
                    isActive: true
                }
            ],
            error: null
        };
    },

    async toggleUserStatus(userId: string, isActive: boolean): Promise<ServiceResponse<null>> {
        console.log(`Toggled user ${userId} to ${isActive}`);
        return { data: null, error: null };
    },

    async getAllBranches(): Promise<ServiceResponse<any[]>> {
        return {
            data: [
                { id: '1', name: 'Main Branch', code: 'B001' },
                { id: '2', name: 'Surat Hub', code: 'B002' }
            ],
            error: null
        };
    }
};
