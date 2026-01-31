import { getSession } from 'next-auth/react';

export type ServiceResponse<T> = {
    data: T | null;
    error: Error | null;
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const session = await getSession();
    const token = (session as any)?.accessToken;

    const url = `${API_URL}${endpoint}`;
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store'
    });
    return res;
};

export const parseError = (data: any): string => {
    if (!data) return 'An unknown error occurred';

    // Handle Zod errors (array of objects)
    if (Array.isArray(data.message)) {
        return data.message.map((err: any) => err.message).join(', ');
    }

    // Handle standard string messages
    if (typeof data.message === 'string') {
        return data.message;
    }

    // Fallback for legacy format
    if (data.error && typeof data.error === 'string') {
        return data.error;
    }

    return data.message || 'An unknown error occurred';
};
