import { create } from 'zustand';
import { User, Branch } from '@/shared/types';
import { authService } from '@/frontend/services/authService';

interface BranchState {
    // 1. Global App State
    currentUser: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // 2. UI State
    searchQuery: string;
    isMobileMenuOpen: boolean;

    // 3. Actions (Delegated to Services where possible)
    setCurrentUser: (user: User | null) => void;
    setSearchQuery: (query: string) => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useBranchStore = create<BranchState>((set, get) => ({
    currentUser: null,
    isLoading: false,
    isAuthenticated: false,
    searchQuery: "",
    isMobileMenuOpen: false,

    setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user, isLoading: false }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),

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

