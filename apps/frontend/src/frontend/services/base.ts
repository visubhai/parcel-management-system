import { getSession } from 'next-auth/react';

export type ServiceResponse<T> = {
    data: T | null;
    error: Error | null;
};

const getBaseUrl = () => {
    // If on server, use internal absolute URL
    if (typeof window === 'undefined') {
        return process.env.INTERNAL_API_URL || 'http://localhost:3001/api';
    }
    // If on client, use relative URL (proxied by Next.js) or env var
    return process.env.NEXT_PUBLIC_API_URL || '/api';
};

export const API_URL = getBaseUrl();

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

    // Handle Zod errors from validate middleware (data.errors array)
    if (Array.isArray(data.errors)) {
        return data.errors.map((err: any) => err.message).join(', ');
    }

    // Handle legacy Zod errors where message itself is array
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
