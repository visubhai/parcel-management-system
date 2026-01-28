import { Booking } from "@/lib/types";
import { Download, Printer, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportButtonsProps {
    data: Booking[];
}

export function ExportButtons({ data }: ExportButtonsProps) {

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("ABCD Logistics", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 26);

        // Table
        const tableData = data.map(row => [
            row.lrNumber,
            new Date(row.date).toLocaleDateString(),
            row.fromBranch,
            row.toBranch,
            row.sender.name,
            row.receiver.name,
            row.costs.total.toLocaleString(),
            row.paymentType,
            row.status
        ]);

        autoTable(doc, {
            head: [['LR No', 'Date', 'From', 'To', 'Sender', 'Receiver', 'Amount', 'Pay Type', 'Status']],
            body: tableData,
            startY: 35,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [51, 65, 85] }
        });

        doc.save("parcel-report.pdf");
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
            'LR Number': row.lrNumber,
            'Date': new Date(row.date).toLocaleDateString(),
            'From Branch': row.fromBranch,
            'To Branch': row.toBranch,
            'Sender': row.sender.name,
            'Receiver': row.receiver.name,
            'Quantity': row.parcels.reduce((s, p) => s + p.quantity, 0),
            'Amount': row.costs.total,
            'Payment Type': row.paymentType,
            'Status': row.status
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
        XLSX.writeFile(workbook, "parcel-report.xlsx");
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <Printer className="w-4 h-4" /> Print
            </button>
            <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
            >
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
            </button>
            <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition-colors shadow-sm"
            >
                <Download className="w-4 h-4" /> PDF
            </button>
        </div>
    );
}
