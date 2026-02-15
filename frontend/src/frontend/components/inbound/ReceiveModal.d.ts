import { IncomingParcel } from "@/shared/types";
interface ReceiveModalProps {
    parcel: IncomingParcel;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (remark?: string, collectedBy?: string, collectedByMobile?: string) => void;
}
export declare function ReceiveModal({ parcel, isOpen, onClose, onConfirm }: ReceiveModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
