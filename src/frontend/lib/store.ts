import { create } from 'zustand';
import { User, Branch } from './types';
import { authService } from '@/frontend/services/authService';

interface BranchState {
    // 1. Global App State
    currentUser: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // 2. UI State (Persist search query across views)
    searchQuery: string;

    // 3. Actions (Delegated to Services where possible)
    setCurrentUser: (user: User | null) => void;
    setSearchQuery: (query: string) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useBranchStore = create<BranchState>((set, get) => ({
    currentUser: {
        id: 'mock-admin-id',
        name: 'Test Admin',
        username: 'admin',
        role: 'SUPER_ADMIN',
        branch: 'Main Branch',
        branchId: 'B001',
        isActive: true, // @ts-ignore
        allowedBranches: ['Main Branch', 'Surat Hub', 'Mumbai Gateway'],
        allowedReports: ['Daily', 'Revenue', 'Branch-wise']
    }, // Default to logged in
    isLoading: false,
    isAuthenticated: true,
    searchQuery: "",

    setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user, isLoading: false }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        set({ currentUser: null, isAuthenticated: false, isLoading: false });
    },

    checkSession: async () => {
        set({ isLoading: true });
        const { data: { session } } = await authService.getSession();
        if (session) {
            const user = await authService.getCurrentUser();
            set({ currentUser: user, isAuthenticated: !!user, isLoading: false });
        } else {
            set({ currentUser: null, isAuthenticated: false, isLoading: false });
        }
    }
}));

