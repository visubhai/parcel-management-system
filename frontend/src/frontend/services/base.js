import { getSession } from 'next-auth/react';
const getBaseUrl = () => {
    // If on server, use internal absolute URL
    if (typeof window === 'undefined') {
        const base = process.env.INTERNAL_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
        return base.endsWith('/api') ? base : `${base}/api`;
    }
    // If on client, use relative URL (proxied by Next.js) or env var
    return process.env.NEXT_PUBLIC_API_URL || '/api';
};
export const API_URL = getBaseUrl();
export const fetchApi = async (endpoint, options = {}) => {
    const session = await getSession();
    const token = session === null || session === void 0 ? void 0 : session.accessToken;
    const url = `${API_URL}${endpoint}`;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const res = await fetch(url, Object.assign(Object.assign({}, options), { headers, credentials: 'include', cache: 'no-store' }));
        return res;
    }
    catch (err) {
        console.error(`🌐 Fetch Error at ${url}:`, err.message);
        throw err;
    }
};
export const parseError = (data) => {
    if (!data)
        return 'An unknown error occurred';
    // Handle Zod errors from validate middleware (data.errors array)
    if (Array.isArray(data.errors)) {
        return data.errors.map((err) => err.message).join(', ');
    }
    // Handle legacy Zod errors where message itself is array
    if (Array.isArray(data.message)) {
        return data.message.map((err) => err.message).join(', ');
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
