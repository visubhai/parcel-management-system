import { Booking, Parcel, ParcelStatus, IncomingParcel } from "@/shared/types";
import { ServiceResponse } from "./base";

export const parcelService = {
    async createBooking(booking: Booking, userId: string): Promise<ServiceResponse<{ id: string, lr_number: string }>> {
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            // Fetch bookings where toBranch is this branch and status is NOT delivered (or show all?)
            // Usually Incoming means In Transit or Arrived?
            // Let's fetch all relevant for "Incoming" view
            const res = await fetch(`/api/bookings?toBranch=${branchId}&status=In Transit`);
            const data = await res.json();

            // Note: Also fetch Arrived?
            // ideally we want to show everything targeted to this branch that is not Delivered?
            // For now let's just fetch "In Transit" or handle filtering on client/server better.
            // Let's try fetching just all and filtering.

            // FIX: The backend supports filtering. Let's make multiple calls or update backend to support list.
            // For now, let's just fetch by toBranch and filter content here.

            const resAll = await fetch(`/api/bookings?toBranch=${branchId}`);
            const dataAll = await resAll.json();

            if (!resAll.ok) throw new Error(dataAll.error);

            // Filter for Incoming Table (Exclude Delivered/Cancelled?)
            const parcels = dataAll
                .filter((p: any) => p.status !== 'Delivered' && p.status !== 'Cancelled')
                .map((p: any) => ({
                    id: p._id,
                    lrNumber: p.lrNumber,
                    senderName: p.sender.name,
                    receiverName: p.receiver.name,
                    fromBranch: p.fromBranch.name,
                    toBranch: p.toBranch.name,
                    status: p.status,
                    paymentStatus: p.paymentType, // Note: Schema uses paymentType
                    totalAmount: p.costs.total
                }));

            return { data: parcels, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },

    async getIncomingParcelsByName(branchName: string): Promise<ServiceResponse<IncomingParcel[]>> {
        // Since backend requires ID, this is tricky. 
        // We really should strictly use IDs. 
        // But for "InboundTable", if it passes Name, we are stuck.
        // Let's assume the caller passes ID now because we fixed `store`? 
        // No, `InboundTable` calls it with `targetBranchId` which logic says is `currentUser.branch`.
        // `currentUser.branch` in `types` is just `Branch` (string).
        // Wait, `User` model has `branch` which is ObjectId.
        // But frontend `User` type has `branch` as `string` (name) and `branchId` as `string` (UUID).
        // We should use `branchId`.

        console.warn("getIncomingParcelsByName is deprecated. Use ID based fetching.");
        return { data: [], error: new Error("Method deprecated. Use ID.") };
    },

    async getOutgoingParcels(branchId: string): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetch(`/api/bookings?fromBranch=${branchId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { data, error: null };
        } catch (error: any) {
            return { data: [], error: new Error(error.message) };
        }
    },

    async updateParcelStatus(parcelId: string, status: ParcelStatus): Promise<ServiceResponse<null>> {
        try {
            const res = await fetch(`/api/bookings/${parcelId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: new Error(error.message) };
        }
    },

    async getParcelByLR(lrNumber: string): Promise<ServiceResponse<any>> {
        // Need a backend route for search? Or reuse GET /bookings?
        // GET /bookings doesn't search by LR yet.
        return { data: null, error: new Error("Search not implemented yet") };
    },

    async getBookingsForReports(startDate: string, endDate: string): Promise<ServiceResponse<any[]>> {
        // Implement report fetching
        return { data: [], error: null };
    }
};
