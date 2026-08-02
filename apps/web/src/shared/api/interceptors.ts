import type {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import { appConfig } from "@/app/config/app.config";
import { routes } from "@/app/config/routes";
import { useAuthStore } from "@/app/store/auth.store";

import { axiosInstance } from "./axios";
import { parseApiError } from "./errors";

type ApiSuccessEnvelope<T> = {
    success: true;
    message: string;
    data: T;
    timestamp: string;
};

function isSuccessEnvelope(
    payload: unknown,
): payload is ApiSuccessEnvelope<unknown> {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "success" in payload &&
        (payload as { success: unknown }).success === true &&
        "data" in payload
    );
}

function addAuthorizationHeader(
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
    if (!config.skipAuth) {
        const accessToken =
            useAuthStore.getState().accessToken;

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }
    }

    config.headers["Accept-Language"] =
        appConfig.locale;
    config.headers["X-Timezone"] =
        appConfig.timezone;

    return config;
}

function unwrapSuccessEnvelope(
    response: AxiosResponse,
): AxiosResponse {
    if (isSuccessEnvelope(response.data)) {
        response.data = response.data.data;
    }

    return response;
}

function handleRequestError(
    error: unknown,
): Promise<never> {
    return Promise.reject(parseApiError(error));
}

function handleResponseError(
    error: AxiosError,
): Promise<never> {
    const apiError = parseApiError(error);

    if (apiError.status === 401) {
        useAuthStore.getState().clearSession();

        const currentPath =
            window.location.pathname;

        if (currentPath !== routes.login) {
            const redirectUrl = encodeURIComponent(
                window.location.href,
            );

            window.location.href =
                `${routes.login}?redirect=${redirectUrl}`;
        }
    }

    return Promise.reject(apiError);
}

let interceptorsRegistered = false;

export function registerInterceptors(): void {
    if (interceptorsRegistered) {
        return;
    }

    axiosInstance.interceptors.request.use(
        addAuthorizationHeader,
        handleRequestError,
    );

    axiosInstance.interceptors.response.use(
        unwrapSuccessEnvelope,
        handleResponseError,
    );

    interceptorsRegistered = true;
}
