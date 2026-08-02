import { env } from "./env";

export const apiConfig = {
    baseUrl: env.apiUrl,
    apiPrefix: "/api/v1",

    timeout: 30_000,

    headers: {
        contentType: "application/json",
        accept: "application/json",
    },
} as const;
