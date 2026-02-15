'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
const ToastContext = createContext(undefined);
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((message, type) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { addToast, removeToast }, children: [children, _jsx("div", { className: "fixed bottom-4 right-4 z-50 flex flex-col gap-2", children: toasts.map(toast => (_jsxs("div", { className: `
                            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-4 fade-in duration-300
                            ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : ''}
                            ${toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
                            ${toast.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
                        `, children: [toast.type === 'success' && _jsx(CheckCircle, { className: "w-5 h-5 text-emerald-500" }), toast.type === 'error' && _jsx(AlertCircle, { className: "w-5 h-5 text-red-500" }), toast.type === 'info' && _jsx(Info, { className: "w-5 h-5 text-blue-500" }), _jsx("span", { children: toast.message }), _jsx("button", { onClick: () => removeToast(toast.id), className: "ml-2 hover:opacity-70", children: _jsx(X, { className: "w-4 h-4" }) })] }, toast.id))) })] }));
}
