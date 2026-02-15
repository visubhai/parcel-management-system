import * as React from "react";
import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
declare const badgeVariants: (variant?: string) => string;
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}
declare function Badge({ className, variant, ...props }: BadgeProps): import("react/jsx-runtime").JSX.Element;
export { Badge, badgeVariants };
