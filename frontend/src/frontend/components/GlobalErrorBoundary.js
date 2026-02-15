'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export class GlobalErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Ideally log this to Audit Logs here if possible, 
        // but triggered from client side it requires careful API handling.
    }
    render() {
        var _a;
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 p-4", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200", children: [_jsx("div", { className: "h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-500" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-800 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-slate-500 mb-6", children: "We've encountered an unexpected error. Our team has been notified." }), _jsx("div", { className: "bg-slate-100 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32", children: _jsx("p", { className: "text-xs font-mono text-slate-600 break-all", children: (_a = this.state.error) === null || _a === void 0 ? void 0 : _a.toString() }) }), _jsxs("button", { onClick: () => window.location.reload(), className: "w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Reload Application"] })] }) }));
        }
        return this.props.children;
    }
}
