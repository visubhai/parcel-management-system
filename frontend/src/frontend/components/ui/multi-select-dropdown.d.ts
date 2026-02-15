export type Option = {
    label: string;
    value: string;
};
interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}
export declare function MultiSelect({ options, selected, onChange, placeholder, className, disabled }: MultiSelectProps): import("react/jsx-runtime").JSX.Element;
export {};
