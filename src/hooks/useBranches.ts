import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

// Generic Fetcher
const fetcher = async (url: string) => {
    const { data, error } = await supabase.from(url).select('name');
    if (error) throw error;
    return data;
};

export function useBranches() {
    // We only fetch name for dropdowns. 
    // RLS ensures Admins can only verify branches if we added the "SELECT TRUE" policy for Admins.
    const { data, error, isLoading } = useSWR('branches', fetcher);

    return {
        branches: data?.map((b: any) => b.name) || [],
        isLoading,
        error
    };
}
