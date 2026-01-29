export type ServiceResponse<T> = {
    data: T | null;
    error: Error | null;
};
