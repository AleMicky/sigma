import axios from "axios";

import { apiConfig } from "@/app/config/api.config";

const normalizedBaseUrl = apiConfig.baseUrl.replace(/\/$/, "");

export const axiosInstance = axios.create({
    baseURL: `${normalizedBaseUrl}${apiConfig.apiPrefix}`,
    timeout: apiConfig.timeout,

    headers: {
        Accept: apiConfig.headers.accept,
        "Content-Type": apiConfig.headers.contentType,
    },

    transitional: {
        clarifyTimeoutError: true,
    },
});

declare module "axios" {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
        /** Marca un reintento tras refresh para evitar bucles 401. */
        _retry?: boolean;
    }
}
