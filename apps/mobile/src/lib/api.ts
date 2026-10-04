import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/src/config/app.config";
import { serverConfigService } from "@/src/features/settings/services/server-config.service";

declare module "axios" {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
        _retry?: boolean;
    }
}

let getAccessToken: (() => string | null) | null = null;
let refreshAccessToken: (() => Promise<string | null>) | null = null;

export function setupApiAuth(
    tokenGetter: () => string | null,
    tokenRefresher?: () => Promise<string | null>
) {
    getAccessToken = tokenGetter;
    if (tokenRefresher) {
        refreshAccessToken = tokenRefresher;
    }
}

export const api = axios.create({
    timeout: APP_CONFIG.api.timeout,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

function isPublicAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    return (
        url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout") ||
        url.includes("/health")
    );
}

// Request interceptor: Dynamic BaseURL & Bearer token attachment
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // 1. Attach base URL dynamically
    const serverUrl = await serverConfigService.getApiUrl();
    const normalizedServerUrl = serverUrl.replace(/\/+$/, "");
    config.baseURL = `${normalizedServerUrl}${APP_CONFIG.api.prefix}`;

    // 2. Attach Authorization header only if not skipped and not a public endpoint
    const isPublic = config.skipAuth || isPublicAuthEndpoint(config.url);
    if (!isPublic && getAccessToken) {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } else {
        // Ensure no Authorization header is accidentally sent to public endpoints
        config.headers.delete("Authorization");
    }

    return config;
});

// Response interceptor: Unwrap API envelope & handle 401 token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Unwrap backend ApiResponse { success: true, message: "...", data: { ... } }
        if (
            response.data &&
            typeof response.data === "object" &&
            response.data.success === true &&
            "data" in response.data
        ) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isPublicAuthEndpoint(originalRequest.url) &&
            refreshAccessToken
        ) {
            originalRequest._retry = true;

            const newToken = await refreshAccessToken();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);