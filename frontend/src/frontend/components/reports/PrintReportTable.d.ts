import { Booking } from "@/shared/types";
interface PrintReportTableProps {
    data: Booking[];
    dateRange?: string;
}
export declare function PrintReportTable({ data, dateRange }: PrintReportTableProps): import("react/jsx-runtime").JSX.Element;
export {};
