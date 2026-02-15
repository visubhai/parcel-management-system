export type Option = {
    label: string;
    value: string;
};
interface SingleSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchable?: boolean;
    id?: string;
}
export declare function SingleSelect({ options, value, onChange, placeholder, className, disabled, searchable, id }: SingleSelectProps): import("react/jsx-runtime").JSX.Element;
export {};
