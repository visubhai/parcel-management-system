import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center", children: [_jsx("div", { className: cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"), children: _jsx(AlertTriangle, { className: "w-6 h-6" }) }), _jsx("h3", { className: "text-xl font-bold text-slate-900 mb-2", children: title }), _jsx("p", { className: "text-slate-500 mb-8", children: message }), _jsxs("div", { className: "flex gap-3 w-full", children: [_jsx("button", { onClick: onClose, className: "flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors", children: cancelText }), _jsx("button", { onClick: onConfirm, className: cn("flex-1 py-2.5 text-white font-bold rounded-xl transition-colors shadow-lg", isDanger
                                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"), children: confirmText })] })] }) }));
}
