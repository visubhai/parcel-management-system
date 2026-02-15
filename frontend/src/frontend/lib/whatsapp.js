/**
 * Utility to generate WhatsApp click-to-chat links (wa.me)
 * This is a zero-RAM, zero-cost solution for sending notifications.
 */
import { fetchApi } from "@/frontend/services/base";
export function generateWhatsAppMessage(data) {
    const { lrNumber, status, fromBranch, toBranch, receiverName, amount, paymentStatus } = data;
    const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return `📦 *PARCEL NOTIFICATION*\n` +
        `*SAVAN LOGISTICS*\n\n` +
        `Hello *${receiverName}*,\n\n` +
        `Your parcel status has been updated.\n\n` +
        `📄 *LR No:* ${lrNumber}\n` +
        `📍 *Status:* ${status}\n` +
        `🚚 *Route:* ${fromBranch} ➡️ ${toBranch}\n` +
        (amount ? `💰 *Amount:* ₹${amount.toFixed(2)} (${paymentStatus})\n` : "") +
        `📅 *Date:* ${dateStr}\n\n` +
        `_Thank you for shipping with us!_`;
}
export async function openWhatsApp(data, addToast) {
    const message = generateWhatsAppMessage(data);
    addToast === null || addToast === void 0 ? void 0 : addToast("Sending WhatsApp...", "info");
    try {
        // Attempt Direct Send (Background Bot)
        const res = await fetchApi('/whatsapp/direct-send', {
            method: 'POST',
            body: JSON.stringify({ mobile: data.mobile, message })
        });
        if (res.ok) {
            const result = await res.json();
            if (result.success) {
                addToast === null || addToast === void 0 ? void 0 : addToast("WhatsApp Sent Directly! ✅", "success");
                return;
            }
        }
        // Fallback to Click-to-chat if bot is not linked or fails
        const sanitizedMobile = data.mobile.replace(/\D/g, "");
        const phone = sanitizedMobile.length === 10 ? "91" + sanitizedMobile : sanitizedMobile;
        const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        addToast === null || addToast === void 0 ? void 0 : addToast("Bot not linked. Opening WhatsApp Web...", "info");
        window.open(link, "_blank");
    }
    catch (e) {
        // Ultimate fallback
        const sanitizedMobile = data.mobile.replace(/\D/g, "");
        const phone = sanitizedMobile.length === 10 ? "91" + sanitizedMobile : sanitizedMobile;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    }
}
