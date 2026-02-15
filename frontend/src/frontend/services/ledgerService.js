import { fetchApi, parseError } from './base';
export const ledgerService = {
    async getDailyStats(branchId, date) {
        try {
            const res = await fetchApi(`/ledger?branchId=${branchId}&date=${date}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return {
                data: data.stats,
                error: null
            };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async getBranchPerformance(startDate, endDate) {
        return { data: null, error: null };
    },
    async addTransaction(transaction) {
        try {
            const res = await fetchApi('/ledger', {
                method: 'POST',
                body: JSON.stringify(transaction),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data: data.transaction, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    }
};
