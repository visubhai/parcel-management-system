export type Branch = string;
export type PaymentStatus = "Paid" | "To Pay";
export type ParcelStatus = "BOOKED" | "PENDING" | "DELIVERED" | "CANCELLED";
export type ItemType = string;
export interface Parcel {
    id: string;
    quantity: number;
    itemType: ItemType;
    weight: number;
    rate: number;
}
export interface Booking {
    id: string;
    lrNumber: string;
    fromBranch: Branch;
    toBranch: Branch;
    date: string;
    sender: {
        name: string;
        mobile: string;
        email?: string;
    };
    receiver: {
        name: string;
        mobile: string;
        email?: string;
    };
    parcels: Parcel[];
    costs: {
        freight: number;
        handling: number;
        hamali: number;
        total: number;
    };
    paymentType: PaymentStatus;
    remarks?: string;
    deliveredRemark?: string;
    collectedBy?: string;
    collectedByMobile?: string;
    deliveredAt?: string;
    status: ParcelStatus;
    editHistory?: EditHistoryEntry[];
}
export type Role = "SUPER_ADMIN" | "BRANCH";
export type ReportType = "DAILY_REPORT" | "DELIVERY_REPORT" | "LEDGER_REPORT" | "SUMMARY_REPORT" | "BOOKING_REPORT" | "Payment";
export interface User {
    id: string;
    name: string;
    email?: string;
    username: string;
    password?: string;
    role: Role;
    branch?: Branch;
    branchId?: string;
    allowedBranches: Branch[];
    allowedReports: ReportType[];
    isActive: boolean;
}
export interface IncomingParcel {
    id: string;
    lrNumber: string;
    senderName: string;
    senderMobile?: string;
    receiverName: string;
    receiverMobile?: string;
    fromBranch: Branch;
    toBranch: Branch;
    status: ParcelStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    remarks?: string;
    date?: string;
}
export interface ReportPermission {
    id: string;
    branchId: string;
    allowedReports: ReportType[];
    createdBy: string;
    updatedAt: string;
}
export interface EditHistoryEntry {
    oldRemark?: string;
    newRemark: string;
    editedBy: string;
    editedAt: string;
}
