import { useState, useEffect } from 'react';
import { Branch } from '@/shared/types'; // This is string type

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
            const res = await fetch('/api/branches');
            if (!res.ok) throw new Error('Failed to fetch branches');
            const data = await res.json();

            setBranchObjects(data);
            setBranches(data.map((b: BranchObj) => b.name));
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            // Fallback to empty or mock if critical? No, better to show error.
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
