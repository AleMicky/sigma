import type {
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";

import { axiosInstance } from "./axios";
import { registerInterceptors } from "./interceptors";

registerInterceptors();

export interface HttpClient {
    get<TResponse>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<TResponse>;

    post<TResponse, TBody = unknown>(
        url: string,
        body?: TBody,
        config?: AxiosRequestConfig,
    ): Promise<TResponse>;

    put<TResponse, TBody = unknown>(
        url: string,
        body?: TBody,
        config?: AxiosRequestConfig,
    ): Promise<TResponse>;

    patch<TResponse, TBody = unknown>(
        url: string,
        body?: TBody,
        config?: AxiosRequestConfig,
    ): Promise<TResponse>;

    delete<TResponse>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<TResponse>;
}

function extractData<T>(
    response: AxiosResponse<T>,
): T {
    return response.data;
}

export const http: HttpClient = {
    async get<TResponse>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response =
            await axiosInstance.get<TResponse>(
                url,
                config,
            );

        return extractData(response);
    },

    async post<TResponse, TBody = unknown>(
        url: string,
        body?: TBody,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response =
            await axiosInstance.post<
                TResponse,
                AxiosResponse<TResponse>,
                TBody
            >(url, body, config);

        return extractData(response);
    },

    async put<TResponse, TBody = unknown>(
        url: string,
        body?: TBody,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response =
            await axiosInstance.put<
                TResponse,
                AxiosResponse<TResponse>,
                TBody
            >(url, body, config);

        return extractData(response);
    },

    async patch<TResponse, TBody = unknown>(
        url: string,
        body?: TBody,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response =
            await axiosInstance.patch<
                TResponse,
                AxiosResponse<TResponse>,
                TBody
            >(url, body, config);

        return extractData(response);
    },

    async delete<TResponse>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response =
            await axiosInstance.delete<TResponse>(
                url,
                config,
            );

        return extractData(response);
    },
};