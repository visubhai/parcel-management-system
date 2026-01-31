import { Booking, Parcel, ParcelStatus, IncomingParcel } from "@/shared/types";
import { ServiceResponse, fetchApi } from "./base";

export const parcelService = {
    async createBooking(booking: Booking, userId: string): Promise<ServiceResponse<{ id: string, lr_number: string }>> {
        try {
            const res = await fetchApi('/bookings', {
                method: 'POST',
                body: JSON.stringify(booking),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create booking');

            return {
                data: { id: data.booking._id, lr_number: data.booking.lrNumber },
                error: null
            };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getIncomingParcels(branchId: string): Promise<ServiceResponse<IncomingParcel[]>> {
        try {
            const res = await fetchApi(`/bookings?toBranch=${branchId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Filter for Incoming Table (Exclude Delivered/Cancelled?)
            const parcels = data
                .filter((p: any) => p.status !== 'Delivered' && p.status !== 'Cancelled')
                .map((p: any) => ({
                    id: p._id,
                    lrNumber: p.lrNumber || p.lr_number,
                    senderName: p.sender.name,
                    receiverName: p.receiver.name,
                    fromBranch: p.fromBranch.name,
                    toBranch: p.toBranch.name,
                    status: p.status,
                    paymentStatus: p.paymentType,
                    totalAmount: p.costs.total
                }));

            return { data: parcels, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },

    async getIncomingParcelsByName(branchName: string): Promise<ServiceResponse<IncomingParcel[]>> {
        console.warn("getIncomingParcelsByName is deprecated. Use ID based fetching.");
        return { data: [], error: new Error("Method deprecated. Use ID.") };
    },

    async getOutgoingParcels(branchId: string): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetchApi(`/bookings?fromBranch=${branchId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },

    async updateParcelStatus(parcelId: string, status: ParcelStatus): Promise<ServiceResponse<null>> {
        try {
            const res = await fetchApi(`/bookings/${parcelId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getParcelByLR(lrNumber: string): Promise<ServiceResponse<any>> {
        return { data: null, error: new Error("Search not implemented yet") };
    },

    async getBookingsForReports(startDate: string, endDate: string): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetchApi(`/bookings?startDate=${startDate}&endDate=${endDate}&_t=${Date.now()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    }
};
