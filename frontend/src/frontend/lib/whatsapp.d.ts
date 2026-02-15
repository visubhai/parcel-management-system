/**
 * Utility to generate WhatsApp click-to-chat links (wa.me)
 * This is a zero-RAM, zero-cost solution for sending notifications.
 */
export interface WhatsAppMessageData {
    mobile: string;
    lrNumber: string;
    status: string;
    fromBranch: string;
    toBranch: string;
    receiverName: string;
    amount?: number;
    paymentStatus?: string;
}
export declare function generateWhatsAppMessage(data: WhatsAppMessageData): string;
export declare function openWhatsApp(data: WhatsAppMessageData, addToast?: (msg: string, type: 'success' | 'error' | 'info') => void): Promise<void>;
