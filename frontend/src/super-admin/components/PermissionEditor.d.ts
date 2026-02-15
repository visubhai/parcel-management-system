import { User } from "@/shared/types";
interface PermissionEditorProps {
    user: Partial<User> | null;
    isOpen: boolean;
    onClose: () => void;
}
export declare function PermissionEditor({ user, isOpen, onClose }: PermissionEditorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
