import { InboundTable } from "@/components/inbound/InboundTable";
import { PackageCheck } from "lucide-react";

export default function InboundPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inbound & Collection</h1>
                    <p className="text-slate-500 text-sm">Manage incoming parcels and payment collection</p>
                </div>

                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <PackageCheck className="w-4 h-4" />
                    Collection Counter Active
                </div>
            </div>

            <InboundTable />
        </div>
    );
}
