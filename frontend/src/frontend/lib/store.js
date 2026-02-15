import { create } from 'zustand';
import { authService } from '@/frontend/services/authService';
export const useBranchStore = create((set, get) => ({
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
        }
        else {
            set({ currentUser: null, isAuthenticated: false, isLoading: false });
        }
    }
}));
