"use client";

import { useState } from "react";
import { User, Phone, MapPin, Star } from "lucide-react";
import { BranchObj } from "@/frontend/hooks/useBranches";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

interface ContactFormProps {
    title: string;
    type: "sender" | "receiver";
    values: { name: string; mobile: string };
    onChange: (field: string, value: string) => void;
    onNext?: () => void;
    disabled?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
}

export function BookingForm({
    title,
    type,
    values,
    onChange,
    onNext,
    disabled,
    inputRef,
}: ContactFormProps) {
    const handleNameChange = (val: string) => {
        onChange("name", val);
    };

    const handleMobileChange = (val: string) => {
        const numericVal = val.replace(/\D/g, "");
        if (numericVal.length <= 10) {
            onChange("mobile", numericVal);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: "name" | "mobile") => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (field === "name") {
                const mobileInput = e.currentTarget.closest('div')?.parentElement?.parentElement?.querySelector('input[type="tel"]') as HTMLInputElement;
                mobileInput?.focus();
            } else if (field === "mobile") {
                onNext?.();
            }
        }
    };

    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all focus-within:border-blue-500/50">
            <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Input */}
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {type === 'sender' ? 'SENDER NAME' : 'RECEIVER NAME'}
                    </Label>
                    <Input
                        type="text"
                        id={`${type === 'sender' ? 'sender' : 'receiver'}-name`}
                        ref={inputRef}
                        value={values.name}
                        disabled={disabled}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "name")}
                        className="h-9 text-sm font-medium bg-white border-gray-200 focus:border-blue-500 transition-all rounded-md w-full px-3 shadow-none placeholder:text-gray-300"
                        placeholder="Enter Name"
                    />
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MOBILE NUMBER</Label>
                    <Input
                        type="tel"
                        id={`${type === 'sender' ? 'sender' : 'receiver'}-mobile`}
                        value={values.mobile}
                        disabled={disabled}
                        onKeyDown={(e) => handleKeyDown(e, "mobile")}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        className="h-9 text-sm font-medium bg-white border-gray-200 focus:border-blue-500 transition-all rounded-md w-full shadow-none placeholder:text-gray-300"
                        placeholder="10-digit Mobile"
                    />
                </div>
            </div>
        </div>
    );
}
