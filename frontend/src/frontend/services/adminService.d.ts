import { ServiceResponse } from './base';
import { User } from '@/shared/types';
export declare const adminService: {
    getUsers(): Promise<ServiceResponse<User[]>>;
    toggleUserStatus(userId: string, isActive: boolean): Promise<ServiceResponse<null>>;
    getAllBranches(scope?: string): Promise<ServiceResponse<any[]>>;
    getBranchPermissions(branchId: string): Promise<ServiceResponse<any>>;
    updateBranchPermissions(branchId: string, allowedReports: string[]): Promise<ServiceResponse<any>>;
    getAuditLogs(page?: number, limit?: number, entityType?: string, action?: string): Promise<ServiceResponse<any>>;
    getCounters(): Promise<ServiceResponse<any[]>>;
    updateCounter(counterId: string, count: number): Promise<ServiceResponse<any>>;
    resetPassword(userId: string, password: string): Promise<ServiceResponse<any>>;
    createUser(userData: Partial<User>): Promise<ServiceResponse<User>>;
    updateUser(userId: string, userData: Partial<User>): Promise<ServiceResponse<User>>;
    createBranch(branchData: any): Promise<ServiceResponse<any>>;
    updateBranch(branchId: string, branchData: any): Promise<ServiceResponse<any>>;
};
