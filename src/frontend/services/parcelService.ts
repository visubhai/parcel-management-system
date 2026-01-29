// MOCKED PARCEL SERVICE
import { Booking, Parcel, ParcelStatus, IncomingParcel } from "@/shared/types";
import { ServiceResponse } from "./base";

export const parcelService = {
    async createBooking(booking: Booking, userId: string): Promise<ServiceResponse<{ id: string, lr_number: string }>> {
        console.log("Mock Booking Created", booking);
        return {
            data: { id: "mock-booking-id", lr_number: "LR-MOCK-" + Math.floor(Math.random() * 1000) },
            error: null
        };
    },

    async getIncomingParcels(branchId: string): Promise<ServiceResponse<IncomingParcel[]>> {
        return { data: [], error: null }; // Return empty list for now
    },

    async getOutgoingParcels(branchId: string): Promise<ServiceResponse<any[]>> {
        return { data: [], error: null };
    },

    async updateParcelStatus(parcelId: string, status: ParcelStatus): Promise<ServiceResponse<null>> {
        return { data: null, error: null };
    },

    async getParcelByLR(lrNumber: string): Promise<ServiceResponse<any>> {
        return { data: null, error: null };
    },

    async getBookingsForReports(startDate: string, endDate: string): Promise<ServiceResponse<any[]>> {
        // Mock Data for Reports
        const mockData = [
            {
                id: '1', lr_number: 'LR001', created_at: '2025-01-20T10:00:00Z',
                from_branch: { name: 'Main Branch' }, to_branch: { name: 'Surat Hub' },
                sender_name: 'John Doe', sender_mobile: '1234567890', sender_email: 'john@example.com',
                receiver_name: 'Jane Smith', receiver_mobile: '0987654321', receiver_email: 'jane@example.com',
                freight_charge: 100, handling_charge: 10, hamali_charge: 5, total_amount: 115,
                payment_type: 'PAID', status: 'DELIVERED'
            },
            {
                id: '2', lr_number: 'LR002', created_at: '2025-01-21T11:00:00Z',
                from_branch: { name: 'Surat Hub' }, to_branch: { name: 'Mumbai Gateway' },
                sender_name: 'Alice', sender_mobile: '1111111111',
                receiver_name: 'Bob', receiver_mobile: '2222222222',
                freight_charge: 200, handling_charge: 20, hamali_charge: 10, total_amount: 230,
                payment_type: 'TO_PAY', status: 'ARRIVED'
            },
            {
                id: '3', lr_number: 'LR003', created_at: '2025-01-22T14:30:00Z',
                from_branch: { name: 'Mumbai Gateway' }, to_branch: { name: 'Main Branch' },
                sender_name: 'Charlie', sender_mobile: '333',
                receiver_name: 'David', receiver_mobile: '444',
                freight_charge: 150, handling_charge: 15, hamali_charge: 5, total_amount: 170,
                payment_type: 'PAID', status: 'BOOKED'
            }
        ];
        return { data: mockData, error: null };
    }
};
