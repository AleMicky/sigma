import type { DefaultOptions } from "@tanstack/react-query";

export const queryDefaultOptions: DefaultOptions = {
    queries: {
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    },

    mutations: {
        retry: 0,
    },
};