import { useState, useEffect } from 'react';
import { adminService } from '@/frontend/services/adminService';
export function useBranches(scope) {
    const [branches, setBranches] = useState([]);
    const [branchObjects, setBranchObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchBranches = async () => {
        setLoading(true);
        try {
            const { data, error: apiError } = await adminService.getAllBranches(scope);
            if (apiError || !data)
                throw new Error((apiError === null || apiError === void 0 ? void 0 : apiError.message) || 'Failed to fetch branches');
            // Map data to BranchObj if response structure differs, 
            // but adminService mock returns {id, name, ...} vs BranchObj { _id...}
            // backend branchRoutes returns mongoose docs which have _id. 
            // adminService mock returns id. We should handle both.
            setBranchObjects(data);
            setBranches(data.map((b) => b.name));
            setError(null);
        }
        catch (err) {
            console.error(err);
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBranches();
    }, [scope]);
    return {
        branches, // Names for UI
        branchObjects, // Full objects for Logic
        loading,
        error,
        refresh: fetchBranches
    };
}
