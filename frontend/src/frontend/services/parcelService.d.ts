import { Booking, ParcelStatus, IncomingParcel } from "@/shared/types";
import { ServiceResponse } from "./base";
export declare const parcelService: {
    createBooking(booking: Booking, userId: string): Promise<ServiceResponse<{
        id: string;
        lr_number: string;
    }>>;
    getIncomingParcels(branchId: string): Promise<ServiceResponse<IncomingParcel[]>>;
    getIncomingParcelsByName(branchName: string): Promise<ServiceResponse<IncomingParcel[]>>;
    getOutgoingParcels(branchId: string): Promise<ServiceResponse<any[]>>;
    updateParcelStatus(parcelId: string, status: ParcelStatus, deliveredRemark?: string, collectedBy?: string, collectedByMobile?: string): Promise<ServiceResponse<null>>;
    getParcelByLR(lrNumber: string): Promise<ServiceResponse<any>>;
    getBookingsForReports(startDate?: string, endDate?: string, lrNumber?: string): Promise<ServiceResponse<any[]>>;
    updateBooking(id: string, booking: Booking): Promise<ServiceResponse<Booking>>;
    getNextLR(branchId: string): Promise<ServiceResponse<{
        nextLR: string;
    }>>;
};
