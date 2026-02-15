import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/frontend/lib/utils";
export function Skeleton({ className }) {
    return (_jsx("div", { className: cn("animate-pulse bg-slate-200 rounded-md", className) }));
}
export function TableRowSkeleton({ columns }) {
    return (_jsx("tr", { className: "animate-pulse", children: Array.from({ length: columns }).map((_, i) => (_jsx("td", { className: "px-6 py-4", children: _jsx(Skeleton, { className: "h-4 w-full" }) }, i))) }));
}
