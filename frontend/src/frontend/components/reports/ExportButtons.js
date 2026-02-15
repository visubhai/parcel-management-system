import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download, Printer, FileSpreadsheet, Loader2 } from "lucide-react";
import { fetchApi } from "@/frontend/services/base";
import { useState } from "react";
import { useToast } from "@/frontend/components/ui/toast";
export function ExportButtons({ data, filters }) {
    const [exporting, setExporting] = useState(null);
    const { addToast } = useToast();
    const handlePrint = () => {
        window.print();
    };
    const triggerDownload = async (type) => {
        try {
            setExporting(type);
            // Build query params from filters
            const params = new URLSearchParams();
            params.append('export', type);
            if (filters.startDate)
                params.append('startDate', filters.startDate);
            if (filters.endDate)
                params.append('endDate', filters.endDate);
            if (filters.fromBranch !== 'All')
                params.append('fromBranch', filters.fromBranch);
            if (filters.toBranch !== 'All')
                params.append('toBranch', filters.toBranch);
            if (filters.status !== 'All')
                params.append('status', filters.status);
            // For now default to BOOKING_REPORT, but can be dynamic later
            params.append('reportType', 'BOOKING_REPORT');
            const response = await fetchApi(`/bookings?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parcel-report-${new Date().getTime()}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (error) {
            console.error(`${type.toUpperCase()} Export Error:`, error);
            addToast(`Failed to export ${type.toUpperCase()}: ${error.message}`, "error");
        }
        finally {
            setExporting(null);
        }
    };
    const handleExportPDF = () => triggerDownload('pdf');
    const handleExportExcel = () => triggerDownload('excel');
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: handlePrint, className: "flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors", children: [_jsx(Printer, { className: "w-4 h-4" }), " Print"] }), _jsxs("button", { disabled: exporting !== null, onClick: handleExportExcel, className: "flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors disabled:opacity-50", children: [exporting === 'excel' ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(FileSpreadsheet, { className: "w-4 h-4 text-green-600" }), "Excel"] }), _jsxs("button", { disabled: exporting !== null, onClick: handleExportPDF, className: "flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition-colors shadow-sm disabled:opacity-50", children: [exporting === 'pdf' ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(Download, { className: "w-4 h-4" }), "PDF"] })] }));
}
