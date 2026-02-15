import { Branch } from "@/shared/types";
interface FilterBarProps {
    fromBranch: Branch | "All";
    toBranch: Branch | "All";
    startDate: string;
    endDate: string;
    onFromBranchChange: (b: Branch | "All") => void;
    onToBranchChange: (b: Branch | "All") => void;
    onDateRangeChange: (start: string, end: string) => void;
    isBranchRestricted?: boolean;
    availableBranches?: Branch[];
}
export declare function FilterBar({ fromBranch, toBranch, startDate, endDate, onFromBranchChange, onToBranchChange, onDateRangeChange, isBranchRestricted, availableBranches }: FilterBarProps): import("react/jsx-runtime").JSX.Element;
export {};
