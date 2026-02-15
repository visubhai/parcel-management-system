export type ServiceResponse<T> = {
    data: T | null;
    error: Error | null;
};
export declare const API_URL: string;
export declare const fetchApi: (endpoint: string, options?: RequestInit) => Promise<Response>;
export declare const parseError: (data: any) => string;
