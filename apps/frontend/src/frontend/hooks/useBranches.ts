import { useState, useEffect } from 'react';
import { Branch } from '@/shared/types'; // This is string type
import { adminService } from '@/frontend/services/adminService';

// We need an interface for the Object
export interface BranchObj {
    _id: string;
    name: string;
    branchCode: string;
}

export function useBranches() {
    const [branches, setBranches] = useState<string[]>([]);
    const [branchObjects, setBranchObjects] = useState<BranchObj[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const { data, error: apiError } = await adminService.getAllBranches();

            if (apiError || !data) throw new Error(apiError?.message || 'Failed to fetch branches');

            // Map data to BranchObj if response structure differs, 
            // but adminService mock returns {id, name, ...} vs BranchObj { _id...}
            // backend branchRoutes returns mongoose docs which have _id. 
            // adminService mock returns id. We should handle both.

            setBranchObjects(data as unknown as BranchObj[]);
            setBranches(data.map((b: any) => b.name));
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    return {
        branches, // Names for UI
        branchObjects, // Full objects for Logic
        loading,
        error,
        refresh: fetchBranches
    };
}
