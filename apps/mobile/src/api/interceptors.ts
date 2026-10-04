import axios from "axios";

import { api } from "@/api/axios-client";
import { ApiError } from "@/api/api-error";
import { sessionService } from "@/services/session.service";

export function setupApiInterceptors() {
  api.interceptors.request.use(
    async (config) => {
      const token =
        await sessionService.getAccessToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      if (!error.response) {
        return Promise.reject(
          new ApiError(
            "No se pudo conectar con el servidor."
          )
        );
      }

      const status =
        error.response.status;

      const data = error.response.data;

      const message =
        typeof data?.message === "string"
          ? data.message
          : Array.isArray(data?.message)
            ? data.message.join(", ")
            : "Ocurrió un error en la solicitud.";

      return Promise.reject(
        new ApiError(message, {
          status,
          code: data?.code,
          errors: data?.errors,
        })
      );
    }
  );
}