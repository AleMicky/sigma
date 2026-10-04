import axios from "axios";
import { API_CONFIG } from "@/config/api.config";
import { storageService } from "@/services/storage.service";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { api } from "@/api/axios-client";

export interface ServerConnectionTestResult {
  success: boolean;
  message: string;
  responseTimeMs?: number;
  status?: number;
}

export const apiConfigService = {
  /**
   * Get the default built-in API URL
   */
  getDefaultUrl(): string {
    return API_CONFIG.API_URL;
  },

  /**
   * Get current active API URL (from SecureStore if set, otherwise default)
   */
  async getActiveUrl(): Promise<string> {
    const customUrl = await storageService.get(STORAGE_KEYS.API_BASE_URL);
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim();
    }
    return API_CONFIG.API_URL;
  },

  /**
   * Normalize and save new API URL, and update Axios client baseURL immediately
   */
  async setApiUrl(rawUrl: string): Promise<string> {
    let normalized = rawUrl.trim();

    // Ensure protocol
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = `http://${normalized}`;
    }

    // Remove any trailing slashes before checking paths
    normalized = normalized.replace(/\/+$/, "");

    // Automatically append /api/v1/ if user only provided host/port
    if (!normalized.includes("/api")) {
      normalized = `${normalized}/api/v1/`;
    } else {
      normalized = `${normalized}/`;
    }

    // Clean any accidental duplicate slashes (except after protocol http:// or https://)
    normalized = normalized.replace(/([^:]\/)\/+/g, "$1");

    await storageService.set(STORAGE_KEYS.API_BASE_URL, normalized);
    api.defaults.baseURL = normalized;
    return normalized;
  },

  /**
   * Parse a raw URL into protocol, host, and port components
   */
  parseUrlToParts(rawUrl: string): { protocol: "http" | "https"; host: string; port: string } {
    let url = rawUrl.trim();
    let protocol: "http" | "https" = "http";

    if (url.startsWith("https://")) {
      protocol = "https";
      url = url.replace(/^https:\/\//i, "");
    } else if (url.startsWith("http://")) {
      protocol = "http";
      url = url.replace(/^http:\/\//i, "");
    }

    // Extract host and port before any path like /api/v1/
    const hostAndPort = url.split("/")[0] || "";
    let host = hostAndPort;
    let port = "";

    if (hostAndPort.includes(":")) {
      const parts = hostAndPort.split(":");
      host = parts[0];
      port = parts[1] || "";
    }

    return { protocol, host, port };
  },

  /**
   * Build complete API URL from protocol, host, and port
   */
  buildUrlFromParts(parts: { protocol: "http" | "https"; host: string; port?: string }): string {
    const cleanHost = (parts.host || "").trim().replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
    const cleanPort = (parts.port || "").trim();

    if (!cleanHost) return "";

    const hostWithPort = cleanPort ? `${cleanHost}:${cleanPort}` : cleanHost;
    return `${parts.protocol}://${hostWithPort}/api/v1/`;
  },

  /**
   * Reset API URL to default
   */
  async resetToDefault(): Promise<string> {
    await storageService.remove(STORAGE_KEYS.API_BASE_URL);
    api.defaults.baseURL = API_CONFIG.API_URL;
    return API_CONFIG.API_URL;
  },

  /**
   * Initialize API client with persisted URL on app launch
   */
  async init(): Promise<string> {
    const activeUrl = await this.getActiveUrl();
    api.defaults.baseURL = activeUrl;
    return activeUrl;
  },

  /**
   * Test connection to a given server URL
   */
  async testConnection(targetUrl: string): Promise<ServerConnectionTestResult> {
    let url = targetUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `http://${url}`;
    }

    const startTime = Date.now();
    try {
      const response = await axios.get(url, {
        timeout: 6000,
        validateStatus: (status) => status < 500, // accept 2xx, 3xx, 4xx (server responded)
      });

      const responseTimeMs = Date.now() - startTime;
      return {
        success: true,
        message: `Conexión exitosa (${responseTimeMs} ms)`,
        responseTimeMs,
        status: response.status,
      };
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");

      return {
        success: false,
        message: isTimeout
          ? "Tiempo de espera agotado. El servidor no responde."
          : "No se pudo conectar con el servidor. Verifica la dirección IP y el puerto.",
        responseTimeMs,
      };
    }
  },
};
