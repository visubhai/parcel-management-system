export type ServiceResponse<T> = {
    data: T | null;
    error: Error | null;
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const res = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store'
    });
    return res;
};
