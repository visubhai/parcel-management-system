import { FilterState } from "@/frontend/hooks/useReports";
import { Branch } from "@/shared/types";
interface ReportFiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    branches: Branch[];
    isBranchRestricted?: boolean;
    userBranch?: string;
}
export declare function ReportFilters({ filters, setFilters, branches, isBranchRestricted, userBranch }: ReportFiltersProps): import("react/jsx-runtime").JSX.Element;
export {};
