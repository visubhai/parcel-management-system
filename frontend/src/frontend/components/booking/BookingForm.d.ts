import { BranchObj } from "@/frontend/hooks/useBranches";
interface ContactFormProps {
    title: string;
    type: "sender" | "receiver";
    values: {
        name: string;
        mobile: string;
    };
    onChange: (field: string, value: string) => void;
    onNext?: () => void;
    disabled?: boolean;
    branch?: string;
    onBranchChange?: (branchId: string) => void;
    branchLabel?: string;
    availableBranches?: BranchObj[];
    inputRef?: React.Ref<HTMLInputElement>;
    variant?: 'default' | 'minimal';
}
export declare function BookingForm({ title, type, values, onChange, onNext, disabled, branch, onBranchChange, branchLabel, availableBranches, inputRef, variant }: ContactFormProps): import("react/jsx-runtime").JSX.Element;
export {};
