import { env } from "./env";

export const apiConfig = {
    baseUrl: env.apiUrl,
    apiPrefix: "/api/v1",

    timeout: 30_000,

    headers: {
        contentType: "application/json",
        accept: "application/json",
    },

    endpoints: {
        auth: {
            login: "/auth/login",
            refresh: "/auth/refresh",
            me: "/auth/me",
        },

        activos: {
            root: "/activos",
            detail: (activoId: string) =>
                `/activos/${activoId}`,
            historial: (activoId: string) =>
                `/activos/${activoId}/historial`,
        },
    },
} as const;
