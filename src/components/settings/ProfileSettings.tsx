import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { User, Lock, Save, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileSettings() {
    const { currentUser } = useBranchStore();
    const [name, setName] = useState(currentUser?.name || "");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateProfile = () => {
        setMessage({ type: 'error', text: 'Profile updates are disabled in this version.' });
    };

    const handleChangePassword = () => {
        setMessage({ type: 'error', text: 'Please contact Super Admin to reset password.' });
    };

    if (!currentUser) return null;

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                    <UserCircle className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                    <p className="text-slate-500">Manage your personal details and security</p>
                </div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-center gap-3",
                    message.type === 'success' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                )}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Personal Information
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Username (Read Only)</label>
                            <input
                                type="text"
                                value={currentUser.username}
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleUpdateProfile}
                                disabled
                                className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Change - Super Admin Only */}
                {currentUser.role === 'SUPER_ADMIN' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-indigo-500" />
                            Security
                        </h3>
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                            Password changes are currently managed via Supabase Admin Console.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
