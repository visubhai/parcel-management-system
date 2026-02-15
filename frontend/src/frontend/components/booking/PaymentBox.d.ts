import { PaymentStatus } from "@/shared/types";
interface PaymentBoxProps {
    costs: {
        freight: number;
        handling: number;
        hamali: number;
        total: number;
    };
    paymentType: PaymentStatus;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    isLocked: boolean;
    onWhatsApp?: () => void;
    onReset?: () => void;
    saveLabel?: string;
    onPrint?: () => void;
    currentStatus?: string;
}
export declare function PaymentBox({ costs, paymentType, onChange, onSave, isLocked, onWhatsApp, onReset, saveLabel, onPrint, currentStatus }: PaymentBoxProps): import("react/jsx-runtime").JSX.Element;
export {};
