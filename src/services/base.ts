import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export type ServiceResponse<T> = {
    data: T | null;
    error: PostgrestError | Error | null;
};

export async function handleSupabaseRequest<T>(
    request: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<ServiceResponse<T>> {
    try {
        const { data, error } = await request;
        if (error) {
            console.error("Supabase Request Failed:", error);
            // standardized error logging or reporting here
        }
        return { data, error };
    } catch (err) {
        console.error("Unexpected Service Error:", err);
        return { data: null, error: err as Error };
    }
}
