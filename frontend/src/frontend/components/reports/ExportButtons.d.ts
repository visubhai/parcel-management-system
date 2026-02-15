import { Booking } from "@/shared/types";
import { FilterState } from "@/frontend/hooks/useReports";
interface ExportButtonsProps {
    data: Booking[];
    filters: FilterState;
}
export declare function ExportButtons({ data, filters }: ExportButtonsProps): import("react/jsx-runtime").JSX.Element;
export {};
