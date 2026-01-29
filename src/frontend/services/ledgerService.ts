import { ServiceResponse } from './base';

export const ledgerService = {
    async getDailyStats(branchId: string, date: string): Promise<ServiceResponse<any>> {
        return {
            data: {
                total_bookings: 12,
                total_revenue: 4500,
                pending_payment: 500
            },
            error: null
        };
    },

    async getBranchPerformance(startDate: string, endDate: string): Promise<ServiceResponse<any[]>> {
        return { data: [], error: null };
    }
};
