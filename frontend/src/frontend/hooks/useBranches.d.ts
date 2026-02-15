export interface BranchObj {
    _id: string;
    name: string;
    branchCode: string;
}
export declare function useBranches(scope?: string): {
    branches: string[];
    branchObjects: BranchObj[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};
