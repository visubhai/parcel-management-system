export declare function useUsers(): {
    users: import("@/shared/types").User[];
    isLoading: boolean;
    error: any;
    mutate: import("swr").KeyedMutator<import("@/shared/types").User[] | null>;
};
