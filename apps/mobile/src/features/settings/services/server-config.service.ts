import * as SecureStore from "expo-secure-store";

import { APP_CONFIG } from "@/src/config/app.config";

const API_URL_KEY = "sigma_api_url";

export const serverConfigService = {
    async getApiUrl(): Promise<string> {
        const storedUrl = await SecureStore.getItemAsync(API_URL_KEY);
        return storedUrl ?? APP_CONFIG.api.defaultUrl;
    },

    async setApiUrl(url: string): Promise<void> {
        const normalizedUrl = url.trim().replace(/\/+$/, "");

        await SecureStore.setItemAsync(
            API_URL_KEY,
            normalizedUrl
        );
    },

    getDefaultUrl(): string {
        return APP_CONFIG.api.defaultUrl;
    },

    async testConnection(
        url: string
    ): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
        const normalizedUrl = url.trim().replace(/\/+$/, "");
        if (!normalizedUrl) {
            return {
                success: false,
                message: "Por favor ingresa una URL válida.",
            };
        }

        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            // Attempt to hit health check or base endpoint
            const res = await fetch(`${normalizedUrl}${APP_CONFIG.api.prefix}/health`, {
                method: "GET",
                signal: controller.signal,
            }).catch(async () => {
                return await fetch(normalizedUrl, {
                    method: "GET",
                    signal: controller.signal,
                });
            });

            clearTimeout(timeoutId);
            const latencyMs = Date.now() - startTime;

            if (res && (res.status < 500 || res.ok)) {
                return {
                    success: true,
                    latencyMs,
                    message: `Servidor conectado exitosamente (${latencyMs}ms)`,
                };
            }

            return {
                success: true,
                latencyMs,
                message: `Servidor detectado con código ${res.status} (${latencyMs}ms)`,
            };
        } catch (err: any) {
            clearTimeout(timeoutId);
            const latencyMs = Date.now() - startTime;

            if (err?.name === "AbortError") {
                return {
                    success: false,
                    latencyMs,
                    message: "Tiempo de espera agotado (>6s). Verifica que el servidor esté activo.",
                };
            }

            return {
                success: false,
                latencyMs,
                message: "No se pudo conectar. Verifica la dirección IP y que estés en la misma red.",
            };
        }
    },
};