import { fetchApi, parseError } from "./base";
export const parcelService = {
    async createBooking(booking, userId) {
        try {
            const res = await fetchApi('/bookings', {
                method: 'POST',
                body: JSON.stringify(booking),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return {
                data: { id: data.booking._id, lr_number: data.booking.lrNumber },
                error: null
            };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async getIncomingParcels(branchId) {
        try {
            const res = await fetchApi(`/bookings?toBranch=${branchId}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            // Map with safety checks
            const parcels = data
                .filter((p) => p.status !== 'DELIVERED' && p.status !== 'CANCELLED')
                .map((p) => {
                var _a, _b, _c, _d, _e, _f, _g;
                return ({
                    id: p._id,
                    lrNumber: p.lrNumber,
                    senderName: ((_a = p.sender) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                    senderMobile: ((_b = p.sender) === null || _b === void 0 ? void 0 : _b.mobile) || '',
                    receiverName: ((_c = p.receiver) === null || _c === void 0 ? void 0 : _c.name) || 'N/A',
                    receiverMobile: ((_d = p.receiver) === null || _d === void 0 ? void 0 : _d.mobile) || '',
                    fromBranch: ((_e = p.fromBranch) === null || _e === void 0 ? void 0 : _e.name) || 'Unknown',
                    toBranch: ((_f = p.toBranch) === null || _f === void 0 ? void 0 : _f.name) || 'Unknown',
                    status: p.status,
                    paymentStatus: p.paymentType,
                    totalAmount: ((_g = p.costs) === null || _g === void 0 ? void 0 : _g.total) || 0,
                    remarks: p.remarks || '',
                    date: p.createdAt
                });
            });
            return { data: parcels, error: null };
        }
        catch (error) {
            return { data: [], error: new Error(error.message) };
        }
    },
    async getIncomingParcelsByName(branchName) {
        console.warn("getIncomingParcelsByName is deprecated. Use ID based fetching.");
        return { data: [], error: new Error("Method deprecated. Use ID.") };
    },
    async getOutgoingParcels(branchId) {
        try {
            const res = await fetchApi(`/bookings?fromBranch=${branchId}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: [], error: new Error(error.message) };
        }
    },
    async updateParcelStatus(parcelId, status, deliveredRemark, collectedBy, collectedByMobile) {
        try {
            const res = await fetchApi(`/bookings/${parcelId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, deliveredRemark, collectedBy, collectedByMobile }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data: null, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async getParcelByLR(lrNumber) {
        return { data: null, error: new Error("Search not implemented yet") };
    },
    async getBookingsForReports(startDate, endDate, lrNumber) {
        try {
            const params = new URLSearchParams();
            if (startDate)
                params.append('startDate', startDate);
            if (endDate)
                params.append('endDate', endDate);
            if (lrNumber)
                params.append('lrNumber', lrNumber);
            const res = await fetchApi(`/bookings?${params.toString()}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: [], error: new Error(error.message) };
        }
    },
    async updateBooking(id, booking) {
        try {
            const res = await fetchApi(`/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify(booking),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data: data.booking, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    },
    async getNextLR(branchId) {
        try {
            const res = await fetchApi(`/bookings/next-lr?branchId=${branchId}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(parseError(data));
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error: new Error(error.message) };
        }
    }
};
