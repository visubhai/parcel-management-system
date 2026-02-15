import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InboundTable } from "@/frontend/components/inbound/InboundTable";
import { PackageCheck } from "lucide-react";
export default function InboundPage() {
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "Inbound & Collection" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Manage incoming parcels and payment collection" })] }), _jsxs("div", { className: "bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2", children: [_jsx(PackageCheck, { className: "w-4 h-4" }), "Collection Counter Active"] })] }), _jsx(InboundTable, {})] }));
}
