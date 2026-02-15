import { User } from '@/shared/types';
interface BranchState {
    currentUser: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    searchQuery: string;
    isMobileMenuOpen: boolean;
    setCurrentUser: (user: User | null) => void;
    setSearchQuery: (query: string) => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}
export declare const useBranchStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BranchState>>;
export {};
