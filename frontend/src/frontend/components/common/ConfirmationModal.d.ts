interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}
export declare function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger }: ConfirmationModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
