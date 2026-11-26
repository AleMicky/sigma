import type { DefaultOptions } from "@tanstack/react-query";

import { isApiError } from "@/shared/api";

export const queryDefaultOptions: DefaultOptions = {
    queries: {
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error) =>
            !(isApiError(error) && error.status !== undefined && error.status < 500) &&
            failureCount < 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    },

    mutations: {
        retry: 0,
    },
};