"use client";

import { Plus, Trash2 } from "lucide-react";
import { ItemType, Parcel } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

interface ParcelListProps {
    parcels: Parcel[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (id: string, field: keyof Parcel, value: any) => void;
    disabled?: boolean;
}

export function ParcelList({ parcels, onAdd, onRemove, onChange, disabled }: ParcelListProps) {
    return (
        <Card className="mt-4 hover:shadow-md transition-all border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    📦 Parcel Details
                </CardTitle>
                <Button
                    onClick={onAdd}
                    disabled={disabled}
                    variant="secondary"
                    size="sm"
                    className="gap-2 font-bold"
                >
                    <Plus className="w-3.5 h-3.5" /> ADD ROW
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">
                {parcels.map((parcel) => (
                    <div key={parcel.id} className="grid grid-cols-12 gap-4 items-end bg-muted/30 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                        {/* Quantity */}
                        <div className="col-span-2 space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Qty</Label>
                            <Input
                                type="number"
                                min="1"
                                value={parcel.quantity}
                                disabled={disabled}
                                onChange={(e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0)}
                                className="font-bold text-center bg-background"
                            />
                        </div>

                        {/* Item Type - Expanded to 6 cols */}
                        <div className="col-span-6 space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Type</Label>
                            <select
                                value={parcel.itemType}
                                disabled={disabled}
                                onChange={(e) => onChange(parcel.id, "itemType", e.target.value as ItemType)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                            >
                                <option value="White Sack">White Sack</option>
                                <option value="Carton">Carton</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>

                        {/* Rate */}
                        <div className="col-span-2 space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Rate</Label>
                            <Input
                                type="number"
                                min="0"
                                value={parcel.rate}
                                disabled={disabled}
                                onChange={(e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0)}
                                className="font-bold text-right bg-background"
                            />
                        </div>

                        {/* Remove Button */}
                        <div className="col-span-2 flex justify-end pb-1">
                            {parcels.length > 1 && (
                                <Button
                                    onClick={() => onRemove(parcel.id)}
                                    disabled={disabled}
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    title="Remove Row"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
