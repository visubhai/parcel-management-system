interface BranchSelectProps {
    value?: string;
    onSelect: (branchId: string) => void;
    className?: string;
    placeholder?: string;
}
export declare function BranchSelect({ value, onSelect, className, placeholder }: BranchSelectProps): import("react/jsx-runtime").JSX.Element;
export {};
