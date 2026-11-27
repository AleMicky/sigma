import type {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import { appConfig } from "@/app/config/app.config";
import { routes } from "@/app/config/routes";
import type { AuthUser } from "@/app/router/router.context";
import { useAuthStore } from "@/app/store/auth.store";
import { authEndpoints } from "@/modules/auth/api/auth.endpoints";
import { authKeys } from "@/modules/auth/api/auth.keys";
import { menuKeys } from "@/modules/seguridad/menu/api/menu.keys";

import { queryClient } from "@/app/query/queryClient";
import { authRedirectState } from "./auth-redirect-state";
import { axiosInstance } from "./axios";
import { parseApiError } from "./errors";
import { navigateToExternalUrl } from "./navigation";

type ApiSuccessEnvelope<T> = {
    success: true;
    message: string;
    data: T;
    timestamp: string;
};

type RefreshTokenResponse = {
    accessToken: string;
    refreshToken: string | null;
    expiresIn?: number | null;
    user: AuthUser;
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

    // Deja que el navegador defina el boundary de multipart.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        config.headers.delete("Content-Type");
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

function redirectToLogin(): void {
    // La limpieza no depende de la deduplicación: cada 401 definitivo cierra la
    // sesión (y la suscripción de REQ-112 vacía la caché) aunque ya se esté
    // navegando. No se llama a queryClient.clear() aquí para no duplicarla.
    useAuthStore.getState().clearSession();

    if (authRedirectState.isRedirecting) {
        return;
    }

    const currentPath = window.location.pathname;

    if (currentPath !== routes.login) {
        authRedirectState.isRedirecting = true;
        const relativePath = `${window.location.pathname}${window.location.search}`;
        const redirectUrl = encodeURIComponent(relativePath);
        const loginUrl = `${routes.login}?redirect=${redirectUrl}`;

        // Se programa en un microtask para que los 401 concurrentes compartan
        // el intento; al terminar (éxito o fallo) se libera la bandera y un
        // 401 posterior puede volver a intentar la navegación.
        const attempt = Promise.resolve().then(() => {
            navigateToExternalUrl(loginUrl);
        });
        authRedirectState.redirectPromise = attempt;
        void attempt
            .catch(() => undefined)
            .finally(() => {
                if (authRedirectState.redirectPromise === attempt) {
                    authRedirectState.redirectPromise = null;
                    authRedirectState.isRedirecting = false;
                }
            });
    }
}

async function refreshAccessToken(): Promise<string> {
    if (authRedirectState.refreshPromise) {
        return authRedirectState.refreshPromise;
    }

    authRedirectState.refreshPromise = (async () => {
        const refreshToken =
            useAuthStore.getState().refreshToken;

        if (!refreshToken) {
            throw new Error("No hay refresh token");
        }

        const response = await axiosInstance.post<
            RefreshTokenResponse
        >(
            authEndpoints.refresh,
            { refreshToken },
            { skipAuth: true },
        );

        const session = response.data;

        if (!session?.accessToken || !session.user) {
            throw new Error("Refresh incompleto");
        }

        useAuthStore.getState().setSession({
            user: session.user,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresIn: session.expiresIn,
        });

        // Un refresh puede traer roles distintos: /auth/me y mis-menus dejan
        // de ser válidos en cuanto cambia la identidad autorizada.
        void queryClient.invalidateQueries({ queryKey: authKeys.me() });
        void queryClient.invalidateQueries({ queryKey: menuKeys.misMenus() });

        return session.accessToken;
    })().finally(() => {
        authRedirectState.refreshPromise = null;
    });

    return authRedirectState.refreshPromise;
}

async function normalizeBlobErrorResponse(
    error: AxiosError,
): Promise<void> {
    const response = error.response;
    if (!response || typeof Blob === "undefined" || !(response.data instanceof Blob)) {
        return;
    }

    const blob = response.data;
    const headerContentType =
        typeof response.headers?.["content-type"] === "string"
            ? response.headers["content-type"]
            : "";
    const contentType = (blob.type || headerContentType).toLowerCase();
    const isJsonOrText =
        contentType.includes("application/json") ||
        contentType.includes("+json") ||
        contentType.startsWith("text/") ||
        contentType === "";

    if (!isJsonOrText) {
        return;
    }

    try {
        const text = await blob.text();
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }

        try {
            response.data = JSON.parse(trimmed);
        } catch {
            if (contentType.startsWith("text/")) {
                response.data = { message: trimmed };
            }
        }
    } catch {
        // Fallback al mensaje por defecto según el código HTTP
    }
}

async function handleResponseError(
    error: AxiosError,
): Promise<AxiosResponse | never> {
    await normalizeBlobErrorResponse(error);

    const apiError = parseApiError(error);
    const config = error.config;

    if (apiError.status !== 401 || !config) {
        return Promise.reject(apiError);
    }

    // Login/logout/refresh u otras llamadas públicas: solo rechazar.
    // Si /auth/refresh falla, el catch de refreshAccessToken() ejecuta una única redirección.
    if (config.skipAuth) {
        return Promise.reject(apiError);
    }

    // Ya se reintentó tras refresh y sigue 401.
    if (config._retry) {
        redirectToLogin();
        return Promise.reject(apiError);
    }

    try {
        const accessToken = await refreshAccessToken();
        config._retry = true;
        config.headers.Authorization =
            `Bearer ${accessToken}`;

        return axiosInstance.request(config);
    } catch {
        redirectToLogin();
        return Promise.reject(apiError);
    }
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
