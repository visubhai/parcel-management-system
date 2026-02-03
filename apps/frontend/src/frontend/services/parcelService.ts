import { Booking, Parcel, ParcelStatus, IncomingParcel } from "@/shared/types";
import { ServiceResponse, fetchApi, parseError } from "./base";

export const parcelService = {
    async createBooking(booking: Booking, userId: string): Promise<ServiceResponse<{ id: string, lr_number: string }>> {
        try {
            const res = await fetchApi('/bookings', {
                method: 'POST',
                body: JSON.stringify(booking),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));

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

            if (!res.ok) throw new Error(parseError(data));

            // Map with safety checks
            const parcels: IncomingParcel[] = data
                .filter((p: any) => p.status !== 'DELIVERED' && p.status !== 'CANCELLED')
                .map((p: any) => ({
                    id: p._id,
                    lrNumber: p.lrNumber,
                    senderName: p.sender?.name || 'N/A',
                    senderMobile: p.sender?.mobile || '',
                    receiverName: p.receiver?.name || 'N/A',
                    receiverMobile: p.receiver?.mobile || '',
                    fromBranch: p.fromBranch?.name || 'Unknown',
                    toBranch: p.toBranch?.name || 'Unknown',
                    status: p.status,
                    paymentStatus: p.paymentType,
                    totalAmount: p.costs?.total || 0,
                    remarks: p.remarks || ''
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
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },

    async updateParcelStatus(parcelId: string, status: ParcelStatus, deliveredRemark?: string): Promise<ServiceResponse<null>> {
        try {
            const res = await fetchApi(`/bookings/${parcelId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, deliveredRemark }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getParcelByLR(lrNumber: string): Promise<ServiceResponse<any>> {
        return { data: null, error: new Error("Search not implemented yet") };
    },

    async getBookingsForReports(startDate?: string, endDate?: string, lrNumber?: string): Promise<ServiceResponse<any[]>> {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (lrNumber) params.append('lrNumber', lrNumber);

            const res = await fetchApi(`/bookings?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },
    async updateBooking(id: string, booking: Booking): Promise<ServiceResponse<Booking>> {
        try {
            const res = await fetchApi(`/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify(booking),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(parseError(data));
            return { data: data.booking, error: null };
        } catch (error: any) {
            return { data: null as any, error: new Error(error.message) };
        }
    }
};

