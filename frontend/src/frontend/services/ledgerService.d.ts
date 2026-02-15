import { ServiceResponse } from './base';
export declare const ledgerService: {
    getDailyStats(branchId: string, date: string): Promise<ServiceResponse<any>>;
    getBranchPerformance(startDate: string, endDate: string): Promise<ServiceResponse<any>>;
    addTransaction(transaction: any): Promise<ServiceResponse<any>>;
};
