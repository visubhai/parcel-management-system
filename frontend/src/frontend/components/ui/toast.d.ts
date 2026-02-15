import { ReactNode } from 'react';
type ToastType = 'success' | 'error' | 'info';
interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}
export declare function useToast(): ToastContextType;
export declare function ToastProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
