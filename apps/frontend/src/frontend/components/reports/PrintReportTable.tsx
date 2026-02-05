import { Booking } from "@/shared/types";

interface PrintReportTableProps {
    data: Booking[];
    dateRange?: string; // e.g. "27-01-2026 - 27-01-2026"
}

export function PrintReportTable({ data, dateRange }: PrintReportTableProps) {
    // Calculate Summary Stats
    const totalAmount = data.reduce((sum, row) => sum + (row.costs?.total || 0), 0);
    const grandTotalParcels = data.reduce((sum, row) => {
        const rowQty = row.parcels?.reduce((pSum, p) => pSum + p.quantity, 0) || 0;
        return sum + rowQty;
    }, 0);

    // Calculate "Online" vs "Manual"
    const onlinePaid = data
        .filter(r => r.paymentType === 'Paid')
        .reduce((sum, r) => sum + (r.costs?.total || 0), 0);

    const onlineToPay = data
        .filter(r => r.paymentType === 'To Pay')
        .reduce((sum, r) => sum + (r.costs?.total || 0), 0);

    const onlineTotal = onlinePaid + onlineToPay;

    return (
        <div className="w-full text-black font-sans text-[10px]">
            {/* Report Header Date Line */}
            <div className="mb-1 font-bold">
                Date: {dateRange || new Date().toLocaleDateString()}
            </div>

            <table className="w-full border-collapse border border-black mb-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-black px-1 py-1 text-left w-8">SR...</th>
                        <th className="border border-black px-1 py-1 text-left">LR NUM...</th>
                        <th className="border border-black px-1 py-1 text-left">B. Branch</th>
                        <th className="border border-black px-1 py-1 text-left">Dest</th>
                        <th className="border border-black px-1 py-1 text-left">Sender</th>
                        <th className="border border-black px-1 py-1 text-left">Reciever</th>
                        <th className="border border-black px-1 py-1 text-left">Reciever No.</th>
                        <th className="border border-black px-1 py-1 text-left w-8">Art</th>
                        <th className="border border-black px-1 py-1 text-left">Art Type</th>
                        <th className="border border-black px-1 py-1 text-left">LR Type</th>
                        <th className="border border-black px-1 py-1 text-left">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        // Calculate total Art (quantity)
                        const totalQty = row.parcels?.reduce((sum, p) => sum + p.quantity, 0) || 0;
                        // Main Art Type (first one or joined)
                        const artType = row.parcels?.[0]?.itemType || "-";

                        return (
                            <tr key={row.id || index}>
                                <td className="border border-black px-1 py-0.5">{index + 1}</td>
                                <td className="border border-black px-1 py-0.5">{row.lrNumber}</td>
                                <td className="border border-black px-1 py-0.5 truncate max-w-[100px]">{row.fromBranch}</td>
                                <td className="border border-black px-1 py-0.5 truncate max-w-[100px]">{row.toBranch}</td>
                                <td className="border border-black px-1 py-0.5 truncate max-w-[120px]">{row.sender.name}</td>
                                <td className="border border-black px-1 py-0.5 truncate max-w-[120px]">{row.receiver.name}</td>
                                <td className="border border-black px-1 py-0.5">{row.receiver.mobile}</td>
                                <td className="border border-black px-1 py-0.5">{totalQty}</td>
                                <td className="border border-black px-1 py-0.5 truncate max-w-[100px]">{artType}</td>
                                <td className="border border-black px-1 py-0.5">{row.paymentType}</td>
                                <td className="border border-black px-1 py-0.5">{row.costs?.total || 0}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Summary Table */}
            <div className="w-[400px]">
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-left">Type</th>
                            <th className="border border-black px-2 py-1 text-left">Paid</th>
                            <th className="border border-black px-2 py-1 text-left">To Pay</th>
                            <th className="border border-black px-2 py-1 text-left">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black px-2 py-1">Online</td>
                            <td className="border border-black px-2 py-1">{onlinePaid}</td>
                            <td className="border border-black px-2 py-1">{onlineToPay}</td>
                            <td className="border border-black px-2 py-1 font-bold">{onlineTotal}</td>
                        </tr>
                        <tr>
                            <td className="border border-black px-2 py-1">Manual</td>
                            <td className="border border-black px-2 py-1">0</td>
                            <td className="border border-black px-2 py-1">0</td>
                            <td className="border border-black px-2 py-1">0</td>
                        </tr>
                        <tr className="bg-gray-100 font-bold">
                            <td className="border border-black px-2 py-1">Total</td>
                            <td className="border border-black px-2 py-1">{onlinePaid}</td>
                            <td className="border border-black px-2 py-1">{onlineToPay}</td>
                            <td className="border border-black px-2 py-1">{totalAmount}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-1 text-[10px] font-bold text-right border border-black p-1 bg-gray-100">
                    Total Parcels : {grandTotalParcels} | Paid : {onlinePaid} | To Pay : {onlineToPay}
                </div>
            </div>
        </div>
    );
}
