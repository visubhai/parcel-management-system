import { useState, useEffect } from "react";
import { adminService } from "@/super-admin/services/adminService";
import { useToast } from "@/frontend/components/ui/toast";
import { RefreshCcw, Save, AlertTriangle, Hash } from "lucide-react";

export function SettingsManager() {
    const [counters, setCounters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState<string | null>(null);

    const fetchCounters = async () => {
        setLoading(true);
        const { data, error } = await adminService.getCounters();
        if (data) {
            setCounters(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCounters();
    }, []);

    const handleUpdateCounter = async (id: string, newCount: number) => {
        setIsSaving(id);
        const { error } = await adminService.updateCounter(id, newCount);
        if (error) {
            addToast(error.message, "error");
        } else {
            addToast("Counter updated successfully", "success");
            fetchCounters();
        }
        setIsSaving(null);
    };

    if (loading && counters.length === 0) return <div className="p-8 text-center text-slate-500">Loading system settings...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
                <p className="text-slate-500 text-sm">Manage sequential numbering and global system behavior</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 font-medium">
                    <strong className="block mb-1">Warning: Sequential Numbers</strong>
                    Adjusting counters directly will change the next generated LR Number. Values should only be increased to avoid duplicate numbering unless you are resolving a specific conflict.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Hash className="w-4 h-4" /> LR Number Counters
                    </h3>
                    <div className="space-y-3">
                        {counters.map((counter) => (
                            <div key={counter._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                                <div>
                                    <div className="text-xs font-black text-blue-600 uppercase mb-1">{counter.branchId?.branchCode || 'Global'}</div>
                                    <h4 className="font-bold text-slate-800">{counter.branchId?.name}</h4>
                                    <p className="text-xs text-slate-500">{counter.entity} - {counter.field}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        defaultValue={counter.count}
                                        id={`counter-${counter._id}`}
                                        className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button
                                        disabled={isSaving === counter._id}
                                        onClick={() => {
                                            const input = document.getElementById(`counter-${counter._id}`) as HTMLInputElement;
                                            handleUpdateCounter(counter._id, parseInt(input.value));
                                        }}
                                        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {isSaving === counter._id ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {counters.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                                No counters initialized. They will appear once each branch makes its first booking.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">General Behavior</h3>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm opacity-60 grayscale cursor-not-allowed">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Sms Notifications</h4>
                                <p className="text-xs text-slate-500">Auto-send SMS on booking</p>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Auto Printing</h4>
                                <p className="text-xs text-slate-500">Open print dialog after save</p>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center font-bold">Additional system flags will be available in the next version.</p>
                </div>
            </div>
        </div>
    );
}
