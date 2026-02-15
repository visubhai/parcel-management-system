import { Booking, Branch } from "@/shared/types";
interface EditBookingModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedBooking: Booking) => void;
    availableBranches: Branch[];
}
export declare function EditBookingModal({ booking, isOpen, onClose, onSave, availableBranches }: EditBookingModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
