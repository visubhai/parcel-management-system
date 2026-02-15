import { Parcel } from "@/shared/types";
interface ParcelListProps {
    parcels: Parcel[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (id: string, field: keyof Parcel, value: any) => void;
    onNext?: () => void;
    disabled?: boolean;
}
export declare function ParcelList({ parcels, onAdd, onRemove, onChange, onNext, disabled }: ParcelListProps): import("react/jsx-runtime").JSX.Element;
export {};
